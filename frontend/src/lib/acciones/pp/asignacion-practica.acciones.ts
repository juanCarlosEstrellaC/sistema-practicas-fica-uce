'use server';

import { revalidatePath } from 'next/cache';
import { AsignacionDto, AsignacionPracticaDetalleDto, UsuarioDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada, RespuestaApi } from '@/lib/tipos/general';
import {
  esquemaAsignacionPractica,
  esquemaAsignacionMasivaPractica,
  esquemaActualizarAsignacionPractica,
  FormularioAsignacionPractica,
  FormularioAsignacionMasivaPractica,
  FormularioActualizarAsignacionPractica,
} from '@/lib/esquemas/pp/asignacion-practica.esquema';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export interface FiltrosAsignacionPractica {
  page?: number;
  size?: number;
  search?: string;
  estado?: string;
  fase?: string;
  carreraId?: number;
  periodoId?: number;
  tutorId?: number;
  estudianteId?: number;
  requiereCarta?: boolean;
  sort?: string;
}

export async function obtenerAsignacionesPracticasAccion(
  filtros: FiltrosAsignacionPractica = {}
): Promise<RespuestaPaginada<AsignacionDto>> {
  const params = new URLSearchParams();
  params.set('page', (filtros.page ?? 0).toString());
  params.set('size', (filtros.size ?? 10).toString());
  params.set('sort', filtros.sort || 'id,desc');

  if (filtros.search && filtros.search.trim() !== '') {
    params.set('search', filtros.search.trim());
  }
  if (filtros.estado && filtros.estado !== 'TODOS') {
    params.set('estado', filtros.estado);
  }
  if (filtros.fase && filtros.fase !== 'TODOS') {
    params.set('fase', filtros.fase);
  }
  if (filtros.carreraId) {
    params.set('carreraId', filtros.carreraId.toString());
  }
  if (filtros.periodoId) {
    params.set('periodoId', filtros.periodoId.toString());
  }
  if (filtros.tutorId) {
    params.set('tutorId', filtros.tutorId.toString());
  }
  if (filtros.estudianteId) {
    params.set('estudianteId', filtros.estudianteId.toString());
  }
  if (filtros.requiereCarta !== undefined) {
    params.set('requiereCarta', filtros.requiereCarta.toString());
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(
        errorJson?.mensaje || `Error ${respuesta.status}: al obtener asignaciones de practicas`
      );
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<AsignacionDto>;
  } catch (error: any) {
    console.error('Error en obtenerAsignacionesPracticasAccion:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: filtros.page ?? 0,
      size: filtros.size ?? 10,
      first: true,
      last: true,
      empty: true,
    };
  }
}

export async function obtenerAsignacionPracticaPorIdAccion(
  id: number
): Promise<AsignacionDto | null> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) return null;
    const resultado = await respuesta.json();
    return resultado.data as AsignacionDto;
  } catch (error) {
    console.error('Error en obtenerAsignacionPracticaPorIdAccion:', error);
    return null;
  }
}

export async function asignarTutorYConvenioAccion(
  datos: FormularioAsignacionPractica
): Promise<RespuestaApi<AsignacionDto>> {
  const validacion = esquemaAsignacionPractica.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos invalidos en la asignacion';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const cuerpoPeticion = {
      estudianteId: validacion.data.estudianteId,
      convenioId: validacion.data.convenioId,
      tutorId: validacion.data.tutorAcademicoId || null,
      tutorInstitucional: '',
      horas: validacion.data.horasAsignadas,
      periodoAcademicoId: validacion.data.periodoAcademicoId,
    };

    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/asignar`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(cuerpoPeticion),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al crear la asignacion`,
      };
    }

    revalidatePath('/dashboard/estudiantes');
    revalidatePath('/dashboard/asignaciones');
    return {
      exito: true,
      mensaje: 'Estudiante asignado con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en asignarTutorYConvenioAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}

export async function actualizarAsignacionPracticaAccion(
  id: number,
  datos: FormularioActualizarAsignacionPractica
): Promise<RespuestaApi<AsignacionDto>> {
  const validacion = esquemaActualizarAsignacionPractica.safeParse(datos);
  if (!validacion.success) {
    const errorMsg = validacion.error.errors[0]?.message || 'Datos invalidos al actualizar la asignacion';
    return { exito: false, mensaje: errorMsg };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}`, {
      method: 'PUT',
      headers: cabeceras,
      body: JSON.stringify(validacion.data),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al actualizar la asignacion`,
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/estudiantes');
    return {
      exito: true,
      mensaje: 'Asignacion actualizada con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en actualizarAsignacionPracticaAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}

export async function eliminarAsignacionPracticaAccion(id: number): Promise<RespuestaApi<void>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}`, {
      method: 'DELETE',
      headers: cabeceras,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al eliminar la asignacion`,
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/estudiantes');
    return {
      exito: true,
      mensaje: 'Asignacion eliminada con exito',
    };
  } catch (error: any) {
    console.error('Error en eliminarAsignacionPracticaAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}

export async function cancelarAsignacionPracticaAccion(
  id: number | string
): Promise<RespuestaApi<AsignacionDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/cancelar`, {
      method: 'PATCH',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al cancelar la asignación de prácticas',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: resultado?.mensaje || 'Práctica preprofesional cancelada con éxito',
      data: resultado?.data,
    };
  } catch (error: any) {
    console.error('Error en cancelarAsignacionPracticaAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexión con el servidor backend',
    };
  }
}

export async function reprobarAsignacionPracticaAccion(
  id: number | string
): Promise<RespuestaApi<AsignacionDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/reprobar`, {
      method: 'PATCH',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al reprobar la práctica preprofesional',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: resultado?.mensaje || 'Práctica preprofesional reprobada con éxito',
      data: resultado?.data,
    };
  } catch (error: any) {
    console.error('Error en reprobarAsignacionPracticaAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexión con el servidor backend',
    };
  }
}

export async function avanzarHorasAccion(
  id: number | string,
  horas: number
): Promise<RespuestaApi<AsignacionDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/avanzar-horas`, {
      method: 'PATCH',
      headers: cabeceras,
      body: JSON.stringify({ horas }),
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al actualizar horas de la practica',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: 'Horas actualizadas exitosamente',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error inesperado al avanzar horas' };
  }
}

export async function emitirCartaAsignacionAccion(
  id: number | string,
  urlCarta?: string
): Promise<RespuestaApi<AsignacionPracticaDetalleDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const cuerpoPeticion = urlCarta ? { urlCarta } : {};
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/emitir-carta`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(cuerpoPeticion),
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al emitir la carta de asignacion',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: 'Carta de asignacion emitida exitosamente',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error de conexion al emitir la carta' };
  }
}

export async function reenviarCartaAsignacionAccion(id: number | string): Promise<RespuestaApi<void>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/reenviar-carta`, {
      method: 'POST',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al reenviar la carta de asignacion',
      };
    }

    return {
      exito: true,
      mensaje: resultado.mensaje || 'Carta de asignacion reenviada exitosamente',
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error inesperado al reenviar la carta' };
  }
}

export async function iniciarDesarrolloAccion(
  id: number | string
): Promise<RespuestaApi<AsignacionPracticaDetalleDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/iniciar-desarrollo`, {
      method: 'POST',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al iniciar la fase de desarrollo',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: 'Fase de desarrollo iniciada exitosamente',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error de conexion al iniciar desarrollo' };
  }
}

export async function firmarRegistroAccion(
  id: number | string,
  datos?: {
    urlInforme?: string;
    urlCertificado?: string;
    urlSeguimiento?: string;
    fechaFin?: string;
  }
): Promise<RespuestaApi<AsignacionPracticaDetalleDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/firmar-registro`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(datos || {}),
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al firmar y enviar registro de practicas',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: 'Registro firmado y enviado a revision',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error de conexion al firmar registro' };
  }
}

export async function validarCppAccion(
  id: number | string
): Promise<RespuestaApi<AsignacionPracticaDetalleDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/validar-cpp`, {
      method: 'POST',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al realizar validación de Coordinación de Prácticas',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: 'Validación de Coordinador de Prácticas exitosa',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error de conexión al validar por Coordinador de Prácticas' };
  }
}

export async function generarAvalAccion(
  id: number | string,
  urlAval?: string
): Promise<RespuestaApi<AsignacionPracticaDetalleDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const cuerpoPeticion = urlAval ? { urlAval } : {};
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/generar-aval`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(cuerpoPeticion),
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al generar el aval de cumplimiento',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: 'Aval de cumplimiento generado exitosamente',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error de conexion al generar aval' };
  }
}

export async function actualizarDatosCacesAccion(
  id: number | string,
  observacionesCaces?: string
): Promise<RespuestaApi<AsignacionPracticaDetalleDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/datos-caces`, {
      method: 'PATCH',
      headers: cabeceras,
      body: JSON.stringify({ observacionesCaces }),
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al actualizar observaciones CACES',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/matriz-caces');
    return {
      exito: true,
      mensaje: 'Datos CACES actualizados correctamente',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error al actualizar datos CACES' };
  }
}

export async function validarSiiuAccion(
  id: number | string
): Promise<RespuestaApi<AsignacionPracticaDetalleDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/${id}/validar-siiu`, {
      method: 'POST',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !resultado?.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al validar en SIIU',
      };
    }

    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/mi-practica');
    revalidatePath('/dashboard/practicas');
    return {
      exito: true,
      mensaje: 'Validacion SIIU completada con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    return { exito: false, mensaje: error?.message || 'Error de conexion al validar SIIU' };
  }
}

export async function obtenerEstudiantesDisponiblesPracticasAccion(
  carreraId?: number,
  periodoId?: number,
  busqueda?: string
): Promise<UsuarioDto[]> {
  const params = new URLSearchParams();
  params.set('rol', 'ESTUDIANTE');
  params.set('estado', 'ACTIVO');
  params.set('size', '100');
  params.set('page', '0');

  if (carreraId) params.set('carreraId', carreraId.toString());
  if (periodoId) params.set('sinAsignacionEnPeriodoId', periodoId.toString());
  if (busqueda && busqueda.trim() !== '') params.set('search', busqueda.trim());

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(
        errorJson?.mensaje || `Error ${respuesta.status}: al obtener estudiantes disponibles`
      );
    }

    const resultado = await respuesta.json();
    const pagina = resultado.data as RespuestaPaginada<UsuarioDto>;
    return pagina?.content || [];
  } catch (error) {
    console.error('Error en obtenerEstudiantesDisponiblesPracticasAccion:', error);
    return [];
  }
}

export async function obtenerTutoresResumenAccion(
  carreraId?: number,
  periodoId?: number,
  busqueda?: string
): Promise<TutorResumenDto[]> {
  const params = new URLSearchParams();
  if (carreraId) params.set('carreraId', carreraId.toString());
  if (periodoId) params.set('periodoId', periodoId.toString());
  if (busqueda && busqueda.trim() !== '') params.set('search', busqueda.trim());

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/usuarios/tutores/resumen?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(
        errorJson?.mensaje || `Error ${respuesta.status}: al obtener resumen de tutores`
      );
    }

    const resultado = await respuesta.json();
    return (resultado.data as TutorResumenDto[]) || [];
  } catch (error) {
    console.error('Error en obtenerTutoresResumenAccion:', error);
    return [];
  }
}

export async function asignarEstudiantesPracticasMasivoAccion(
  datos: FormularioAsignacionMasivaPractica
): Promise<RespuestaApi<{ exitosos: number; errores: number }>> {
  const validacion = esquemaAsignacionMasivaPractica.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos invalidos para la asignacion masiva';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    let exitosos = 0;
    let errores = 0;

    for (const estudianteId of validacion.data.estudianteIds) {
      try {
        const cuerpoPeticion = {
          estudianteId,
          convenioId: validacion.data.convenioId,
          tutorId: validacion.data.tutorAcademicoId || null,
          tutorInstitucional: '',
          horas: validacion.data.horasAsignadas,
          periodoAcademicoId: validacion.data.periodoAcademicoId,
        };

        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-practicas/asignar`, {
          method: 'POST',
          headers: cabeceras,
          body: JSON.stringify(cuerpoPeticion),
        });

        if (respuesta.ok) {
          const resultado = await respuesta.json().catch(() => null);
          if (resultado?.exito !== false) {
            exitosos++;
          } else {
            errores++;
          }
        } else {
          errores++;
        }
      } catch (e) {
        console.error(`Error al asignar estudiante ID ${estudianteId}:`, e);
        errores++;
      }
    }

    revalidatePath('/dashboard/practicas/asignaciones');
    revalidatePath('/dashboard/practicas/estudiantes');
    revalidatePath('/dashboard/practicas/tutores');

    if (exitosos === 0 && errores > 0) {
      return {
        exito: false,
        mensaje: 'No se pudo realizar ninguna asignacion. Verifique cupos y disponibilidad.',
        data: { exitosos, errores },
      };
    }

    const mensajeExito =
      exitosos === 1
        ? 'Se asigno exitosamente 1 estudiante'
        : `Se asignaron exitosamente ${exitosos} estudiantes`;

    return {
      exito: true,
      mensaje: errores > 0 ? `${mensajeExito}. (${errores} no pudieron asignarse).` : mensajeExito,
      data: { exitosos, errores },
    };
  } catch (error: any) {
    console.error('Error en asignarEstudiantesPracticasMasivoAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion al procesar asignacion masiva',
    };
  }
}



