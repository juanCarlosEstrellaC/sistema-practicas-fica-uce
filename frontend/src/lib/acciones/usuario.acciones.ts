'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { UsuarioDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion, obtenerCabecerasSubidaArchivo, obtenerUsuarioServidor } from './cliente-servidor';

export interface FiltrosUsuariosAccion {
  pagina?: number;
  tamanio?: number;
  busqueda?: string;
  rol?: string;
  carreraId?: number;
  sinAsignacionEnPeriodoId?: number;
  estado?: string;
}

export async function obtenerUsuariosPaginadosAccion({
  pagina = 0,
  tamanio = 10,
  busqueda,
  rol,
  carreraId,
  sinAsignacionEnPeriodoId,
  estado,
}: FiltrosUsuariosAccion = {}): Promise<RespuestaPaginada<UsuarioDto>> {
  const params = new URLSearchParams();
  params.set('page', pagina.toString());
  params.set('size', tamanio.toString());
  params.set('sort', 'id,desc');

  if (busqueda && busqueda.trim()) params.set('search', busqueda.trim());
  if (rol && rol !== 'all') params.set('rol', rol);
  if (carreraId) params.set('carreraId', carreraId.toString());
  if (sinAsignacionEnPeriodoId) params.set('sinAsignacionEnPeriodoId', sinAsignacionEnPeriodoId.toString());
  if (estado && estado !== 'all') params.set('estado', estado);

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: al obtener usuarios paginados`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<UsuarioDto>;
  } catch (error: any) {
    console.error('Error en obtenerUsuariosPaginadosAccion:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: pagina,
      size: tamanio,
      first: pagina === 0,
      last: true,
      empty: true,
    };
  }
}

export async function obtenerUsuarioPorIdAccion(
  id: number | string
): Promise<UsuarioDto | null> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${id}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      return null;
    }

    const resultado = await respuesta.json();
    return (resultado.data as UsuarioDto) || null;
  } catch (error) {
    console.error('Error en obtenerUsuarioPorIdAccion:', error);
    return null;
  }
}

export async function obtenerEstadisticasUsuariosAccion(): Promise<{
  total: number;
  estudiantes: number;
  personalAcademico: number;
}> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();

    const [respTotal, respEstudiantes, respTutores] = await Promise.all([
      fetch(`${URL_BACKEND}/usuarios?page=0&size=1`, {
        method: 'GET',
        headers: cabeceras,
        cache: 'no-store',
      }),
      fetch(`${URL_BACKEND}/usuarios?page=0&size=1&rol=ESTUDIANTE`, {
        method: 'GET',
        headers: cabeceras,
        cache: 'no-store',
      }),
      fetch(`${URL_BACKEND}/usuarios?page=0&size=1&rol=TUTOR_ACADEMICO`, {
        method: 'GET',
        headers: cabeceras,
        cache: 'no-store',
      }),
    ]);

    const datosTotal = respTotal.ok ? await respTotal.json() : null;
    const datosEstudiantes = respEstudiantes.ok ? await respEstudiantes.json() : null;
    const datosTutores = respTutores.ok ? await respTutores.json() : null;

    const total = datosTotal?.data?.totalElements || 0;
    const estudiantes = datosEstudiantes?.data?.totalElements || 0;
    const personalAcademico = (total > estudiantes) ? total - estudiantes : (datosTutores?.data?.totalElements || 0);

    return {
      total,
      estudiantes,
      personalAcademico,
    };
  } catch (error) {
    console.error('Error en obtenerEstadisticasUsuariosAccion:', error);
    return {
      total: 0,
      estudiantes: 0,
      personalAcademico: 0,
    };
  }
}

export async function crearUsuarioAccion(
  datos: Partial<UsuarioDto>
): Promise<{ exito: boolean; mensaje: string; datos?: UsuarioDto }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios`, {
      method: 'POST',
      headers: {
        ...cabeceras,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al crear el usuario',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Usuario registrado exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en crearUsuarioAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function actualizarUsuarioAccion(
  id: number | string,
  datos: Partial<UsuarioDto>,
  omitirRevalidacion: boolean = false
): Promise<{ exito: boolean; mensaje: string; datos?: UsuarioDto }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        ...cabeceras,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al actualizar el usuario',
      };
    }

    if (!omitirRevalidacion) {
      revalidatePath('/dashboard/administracion/ingreso-datos');
    } else {
      try {
        const almacenCookies = await cookies();
        almacenCookies.delete('token');
        almacenCookies.delete('usuario');
      } catch {
        // Ignorar fuera de contexto HTTP
      }
    }
    return {
      exito: true,
      mensaje: 'Usuario actualizado exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en actualizarUsuarioAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function eliminarUsuarioAccion(
  id: number | string
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${id}`, {
      method: 'DELETE',
      headers: cabeceras,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al eliminar el usuario',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Usuario eliminado exitosamente',
    };
  } catch (error: any) {
    console.error('Error en eliminarUsuarioAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function cargaMasivaUsuariosAccion(
  formData: FormData
): Promise<{ exito: boolean; mensaje: string; datos?: any }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const { 'Content-Type': _, ...cabecerasSinContentType } = cabeceras;

    const respuesta = await fetch(`${URL_BACKEND}/usuarios/carga-masiva`, {
      method: 'POST',
      headers: cabecerasSinContentType,
      body: formData,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error en la carga masiva de usuarios',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Carga masiva completada exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en cargaMasivaUsuariosAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la carga masiva',
    };
  }
}

export async function cambiarMiContraseniaAccion(
  contraseniaActual: string,
  nuevaContrasenia: string
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const usuario = await obtenerUsuarioServidor();
    if (!usuario) {
      return { exito: false, mensaje: 'Sesión expirada o no válida' };
    }

    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${usuario.id}/cambiar-contrasenia`, {
      method: 'PUT',
      headers: cabeceras,
      body: JSON.stringify({ contraseniaActual, nuevaContrasenia }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al cambiar la contraseña',
      };
    }

    return {
      exito: true,
      mensaje: 'Contraseña actualizada correctamente',
    };
  } catch (error: any) {
    console.error('Error en cambiarMiContraseniaAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function validarMiContraseniaAccion(
  contrasenia: string
): Promise<{ exito: boolean; esValida: boolean; mensaje?: string }> {
  try {
    const usuario = await obtenerUsuarioServidor();
    if (!usuario) {
      return { exito: false, esValida: false, mensaje: 'Sesión no válida' };
    }

    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${usuario.id}/validar-contrasenia`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({ contrasenia }),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        esValida: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al validar contraseña',
      };
    }

    return {
      exito: true,
      esValida: Boolean(resultado.data),
    };
  } catch (error: any) {
    console.error('Error en validarMiContraseniaAccion:', error);
    return {
      exito: false,
      esValida: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function actualizarMiPerfilAccion(
  datos: { telefono?: string }
): Promise<{ exito: boolean; mensaje: string; datos?: UsuarioDto }> {
  try {
    const usuario = await obtenerUsuarioServidor();
    if (!usuario) {
      return { exito: false, mensaje: 'Sesión no válida' };
    }

    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${usuario.id}/perfil`, {
      method: 'PATCH',
      headers: {
        ...cabeceras,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al actualizar el perfil',
      };
    }

    revalidatePath('/dashboard/configuracion');
    return {
      exito: true,
      mensaje: resultado.mensaje || 'Perfil actualizado exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en actualizarMiPerfilAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function subirMiAvatarAccion(
  formData: FormData
): Promise<{ exito: boolean; mensaje: string; urlAvatar?: string }> {
  try {
    const usuario = await obtenerUsuarioServidor();
    if (!usuario) {
      return { exito: false, mensaje: 'Sesión no válida' };
    }

    const cabeceras = await obtenerCabecerasSubidaArchivo();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${usuario.id}/avatar`, {
      method: 'POST',
      headers: cabeceras,
      body: formData,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al subir avatar',
      };
    }

    revalidatePath('/dashboard/configuracion');
    return {
      exito: true,
      mensaje: 'Avatar actualizado exitosamente',
      urlAvatar: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en subirMiAvatarAccion:', error);
    const mensajeOriginal = error?.message || '';
    const esErrorLimiteTamano =
      mensajeOriginal.includes('Body exceeded') ||
      mensajeOriginal.includes('limit') ||
      mensajeOriginal.includes('SizeLimit') ||
      mensajeOriginal.includes('PayloadTooLarge');

    return {
      exito: false,
      mensaje: esErrorLimiteTamano
        ? 'La imagen supera el tamaño máximo permitido por el servidor (máximo 5 MB)'
        : error.message || 'Error al procesar la subida del avatar',
    };
  }
}

export async function reenviarActivacionUsuarioAccion(
  id: number | string
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${id}/reenviar-activacion`, {
      method: 'POST',
      headers: {
        ...cabeceras,
        'Content-Type': 'application/json',
      },
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al reenviar el correo de activación',
      };
    }

    return {
      exito: true,
      mensaje: resultado.mensaje || resultado.message || 'Correo de activación reenviado exitosamente',
    };
  } catch (error: any) {
    console.error('Error en reenviarActivacionUsuarioAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud de reenvío',
    };
  }
}

export async function transferirSubdecanatoAccion(
  id: number | string
): Promise<{ exito: boolean; mensaje: string; datos?: UsuarioDto }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/${id}/transferir-subdecanato`, {
      method: 'POST',
      headers: {
        ...cabeceras,
        'Content-Type': 'application/json',
      },
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.mensaje || resultado.message || 'Error al transferir el cargo de Subdecano',
      };
    }

    try {
      const almacenCookies = await cookies();
      almacenCookies.delete('token');
      almacenCookies.delete('usuario');
    } catch {
      // Ignorar fuera de contexto HTTP
    }

    return {
      exito: true,
      mensaje: resultado.mensaje || resultado.message || 'Cargo de Subdecano transferido exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en transferirSubdecanatoAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la transferencia del cargo',
    };
  }
}


