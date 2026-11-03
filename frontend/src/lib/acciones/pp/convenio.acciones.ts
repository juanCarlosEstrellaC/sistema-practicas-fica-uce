'use server';

import { revalidatePath } from 'next/cache';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada, RespuestaApi } from '@/lib/tipos/general';
import { esquemaConvenio, FormularioConvenio } from '@/lib/esquemas/pp/convenio.esquema';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export interface FiltrosConvenio {
  page?: number;
  size?: number;
  search?: string;
  estado?: string;
  sort?: string;
}

export async function obtenerConveniosAccion(
  filtros: FiltrosConvenio = {}
): Promise<RespuestaPaginada<ConvenioDto>> {
  const params = new URLSearchParams();
  params.set('page', (filtros.page ?? 0).toString());
  params.set('size', (filtros.size ?? 10).toString());
  params.set('sort', filtros.sort || 'id,asc');

  if (filtros.search && filtros.search.trim() !== '') {
    params.set('search', filtros.search.trim());
  }
  if (filtros.estado && filtros.estado !== 'TODOS') {
    params.set('estado', filtros.estado);
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/convenios?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401 || respuesta.status === 403) {
        console.warn(`[obtenerConveniosAccion] Sesión no autorizada o token expirado (${respuesta.status}).`);
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
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener convenios`);
    }

    const resultado = await respuesta.json();
    const datosNormalizados = {
      ...resultado.data,
      content: (resultado.data.content || []).map((c: any) => ({
        ...c,
        cuposTotales: c.cuposTotales ?? c.cuposDisponibles ?? 0,
        cuposDisponibles: c.cuposDisponibles ?? c.cuposTotales ?? 0,
      })),
    };
    return datosNormalizados as RespuestaPaginada<ConvenioDto>;
  } catch (error: any) {
    console.error('Error en obtenerConveniosAccion:', error);
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

export async function obtenerConvenioPorIdAccion(id: number): Promise<ConvenioDto | null> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/convenios/${id}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) return null;
    const resultado = await respuesta.json();
    const c = resultado.data;
    if (!c) return null;
    return {
      ...c,
      cuposTotales: c.cuposTotales ?? c.cuposDisponibles ?? 0,
      cuposDisponibles: c.cuposDisponibles ?? c.cuposTotales ?? 0,
    } as ConvenioDto;
  } catch (error) {
    console.error('Error en obtenerConvenioPorIdAccion:', error);
    return null;
  }
}

export async function crearConvenioAccion(
  datos: FormularioConvenio
): Promise<RespuestaApi<ConvenioDto>> {
  const validacion = esquemaConvenio.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos invalidos en el formulario';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const cargaUtil = {
      ...validacion.data,
      cuposDisponibles: validacion.data.cuposTotales,
    };
    const respuesta = await fetch(`${URL_BACKEND}/convenios`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(cargaUtil),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al crear el convenio`,
      };
    }

    revalidatePath('/dashboard/convenios');
    return {
      exito: true,
      mensaje: 'Convenio creado con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en crearConvenioAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}

export async function actualizarConvenioAccion(
  id: number,
  datos: FormularioConvenio
): Promise<RespuestaApi<ConvenioDto>> {
  const validacion = esquemaConvenio.safeParse(datos);
  if (!validacion.success) {
    const primerError = validacion.error.errors[0]?.message || 'Datos invalidos en el formulario';
    return { exito: false, mensaje: primerError };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const cargaUtil = {
      ...validacion.data,
      cuposDisponibles: validacion.data.cuposTotales,
    };
    const respuesta = await fetch(`${URL_BACKEND}/convenios/${id}`, {
      method: 'PUT',
      headers: cabeceras,
      body: JSON.stringify(cargaUtil),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al actualizar el convenio`,
      };
    }

    revalidatePath('/dashboard/convenios');
    return {
      exito: true,
      mensaje: 'Convenio actualizado con exito',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en actualizarConvenioAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}

export async function eliminarConvenioAccion(id: number): Promise<RespuestaApi<void>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/convenios/${id}`, {
      method: 'DELETE',
      headers: cabeceras,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al eliminar el convenio`,
      };
    }

    revalidatePath('/dashboard/convenios');
    return {
      exito: true,
      mensaje: 'Convenio eliminado con exito',
    };
  } catch (error: any) {
    console.error('Error en eliminarConvenioAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion con el servidor backend',
    };
  }
}
