'use server';

import { revalidatePath } from 'next/cache';
import {
  ProyectoComunitarioDto,
  NuevoProyectoComunitarioDto,
  ActualizarProyectoComunitarioDto,
  FiltrosProyectoComunitario,
} from '@/lib/tipos/vcs/proyecto-comunitario';
import { RespuestaPaginada, RespuestaApi } from '@/lib/tipos/general';
import { esquemaProyectoComunitario } from '@/lib/esquemas/vcs/proyecto-comunitario.esquema';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export async function obtenerProyectosComunitariosAccion(filtros: FiltrosProyectoComunitario = {})
  : Promise<RespuestaPaginada<ProyectoComunitarioDto>> {
  const params = new URLSearchParams();
  params.set('page', (filtros.page ?? 0).toString());
  params.set('size', (filtros.size ?? 10).toString());
  params.set('sort', filtros.sort || 'fechaCreacion,desc');

  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    params.set('busqueda', filtros.busqueda.trim());
  }
  if (filtros.carreraId) {
    params.set('carreraId', filtros.carreraId.toString());
  }
  if (filtros.tutorId) {
    params.set('tutorId', filtros.tutorId.toString());
  }
  if (filtros.estado) {
    params.set('estado', filtros.estado);
  }
  if (filtros.periodoId) {
    params.set('periodoId', filtros.periodoId.toString());
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/proyectos-comunitarios?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401 || respuesta.status === 403) {
        console.warn(`[obtenerProyectosComunitariosAccion] Acceso no autorizado (${respuesta.status}).`);
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
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener proyectos comunitarios`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<ProyectoComunitarioDto>;
    
  } catch (error: any) {
    console.error('Error en obtenerProyectosComunitariosAccion:', error);
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

export async function obtenerProyectoComunitarioPorIdAccion(id: number, periodoId?: number): Promise<ProyectoComunitarioDto | null> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const query = periodoId ? `?periodoId=${periodoId}` : '';
    const respuesta = await fetch(`${URL_BACKEND}/proyectos-comunitarios/${id}${query}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });
    if (!respuesta.ok) return null;
    const resultado = await respuesta.json();
    return (resultado.data as ProyectoComunitarioDto) || null;
  } catch (error) {
    console.error('Error en obtenerProyectoComunitarioPorIdAccion:', error);
    return null;
  }
}

export async function crearProyectoComunitarioAccion(datos: NuevoProyectoComunitarioDto)
  : Promise<RespuestaApi<ProyectoComunitarioDto>> {
  const validacion = esquemaProyectoComunitario.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos del formulario inválidos';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/proyectos-comunitarios`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(validacion.data),
    });

    // .catch(() => null) maneja tanto el error 204 (No content) el body de la petición esté vacío o regrese texto plano o html (error 502 o 504).
    // si no usamos .catch(() => null), nos dará un error al intentar convertir el body en json.
    const resultado = await respuesta.json().catch(() => null); 

    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al crear el proyecto comunitario',
      };
    }

    revalidatePath('/dashboard/vinculacion');
    return {
      exito: true,
      mensaje: resultado?.mensaje || 'Proyecto comunitario creado con éxito',
      data: resultado?.data,
    };
  } catch (error: any) {
    console.error('Error en crearProyectoComunitarioAccion:', error);
    return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
  }
}

export async function actualizarProyectoComunitarioAccion(id: number, datos: ActualizarProyectoComunitarioDto)
  : Promise<RespuestaApi<ProyectoComunitarioDto>> {
  const validacion = esquemaProyectoComunitario.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos del formulario inválidos';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/proyectos-comunitarios/${id}`, {
      method: 'PUT',
      headers: cabeceras,
      body: JSON.stringify(validacion.data),
    });

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al actualizar el proyecto comunitario',
      };
    }

    revalidatePath('/dashboard/vinculacion');
    return {
      exito: true,
      mensaje: resultado?.mensaje || 'Proyecto comunitario actualizado con éxito',
      data: resultado?.data,
    };
  } catch (error: any) {
    console.error('Error en actualizarProyectoComunitarioAccion:', error);
    return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
  }
}

export async function eliminarProyectoComunitarioAccion(id: number)
  : Promise<RespuestaApi> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/proyectos-comunitarios/${id}`, {
      method: 'DELETE',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al eliminar el proyecto comunitario',
      };
    }

    revalidatePath('/dashboard/vinculacion');
    return {
      exito: true,
      mensaje: resultado?.mensaje || 'Proyecto comunitario eliminado con éxito',
    };
  } catch (error: any) {
    console.error('Error en eliminarProyectoComunitarioAccion:', error);
    return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
  }
}

export async function iniciarProyectoComunitarioAccion(proyectoId: number, periodoId?: number): Promise<RespuestaApi<number>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const query = periodoId ? `?periodoId=${periodoId}` : '';
    const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/proyectos/${proyectoId}/iniciar${query}`, {
      method: 'PATCH',
      headers: cabeceras,
    });

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || 'Error al iniciar el proyecto comunitario',
      };
    }

    revalidatePath('/dashboard/vinculacion');
    revalidatePath('/dashboard/vinculacion/proyectos-comunitarios');
    revalidatePath('/dashboard/vinculacion/asignaciones-existentes');

    return {
      exito: true,
      mensaje: resultado?.mensaje || 'Proyecto iniciado con éxito',
      data: resultado?.data,
    };
  } catch (error: any) {
    console.error('Error en iniciarProyectoComunitarioAccion:', error);
    return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
  }
}
