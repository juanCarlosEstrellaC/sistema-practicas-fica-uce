'use server';

import { revalidatePath } from 'next/cache';
import { MatrizCacesDto, EstadoMatrizCaces } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada, RespuestaApi } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export interface FiltrosMatrizCacesPeriodo {
  periodoId: number | string;
  page?: number;
  size?: number;
  estado?: string;
  search?: string;
}

export interface FiltrosMatrizCacesCarrera {
  carreraId: number | string;
  page?: number;
  size?: number;
}

/**
 * Obtiene las matrices CACES por periodo académico (usado principalmente por Subdecano).
 */
export async function obtenerMatricesCacesPorPeriodoAccion(
  filtros: FiltrosMatrizCacesPeriodo
): Promise<RespuestaPaginada<MatrizCacesDto>> {
  const params = new URLSearchParams();
  params.set('page', (filtros.page ?? 0).toString());
  params.set('size', (filtros.size ?? 10).toString());

  if (filtros.estado && filtros.estado !== 'all' && filtros.estado !== 'TODOS') {
    params.set('estado', filtros.estado);
  }
  if (filtros.search && filtros.search.trim() !== '') {
    params.set('search', filtros.search.trim());
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(
      `${URL_BACKEND}/matrices-caces/periodo/${filtros.periodoId}?${params.toString()}`,
      {
        method: 'GET',
        headers: cabeceras,
        cache: 'no-store',
      }
    );

    if (!respuesta.ok) {
      if (respuesta.status === 401 || respuesta.status === 403) {
        console.warn(`[obtenerMatricesCacesPorPeriodoAccion] Sesión no autorizada (${respuesta.status}).`);
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
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener matrices CACES por periodo`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<MatrizCacesDto>;
  } catch (error: any) {
    console.error('Error en obtenerMatricesCacesPorPeriodoAccion:', error);
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

/**
 * Obtiene las matrices CACES históricas de una carrera específica.
 */
export async function obtenerMatricesCacesPorCarreraAccion(
  filtros: FiltrosMatrizCacesCarrera
): Promise<RespuestaPaginada<MatrizCacesDto>> {
  const params = new URLSearchParams();
  params.set('page', (filtros.page ?? 0).toString());
  params.set('size', (filtros.size ?? 10).toString());

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(
      `${URL_BACKEND}/matrices-caces/carrera/${filtros.carreraId}?${params.toString()}`,
      {
        method: 'GET',
        headers: cabeceras,
        cache: 'no-store',
      }
    );

    if (!respuesta.ok) {
      if (respuesta.status === 401 || respuesta.status === 403) {
        console.warn(`[obtenerMatricesCacesPorCarreraAccion] Sesión no autorizada (${respuesta.status}).`);
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
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener matrices CACES por carrera`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<MatrizCacesDto>;
  } catch (error: any) {
    console.error('Error en obtenerMatricesCacesPorCarreraAccion:', error);
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

/**
 * Obtiene la matriz CACES específica de un periodo académico y carrera.
 */
export async function obtenerMatrizPorPeriodoYCarreraAccion(
  periodoId: number | string,
  carreraId: number | string
): Promise<MatrizCacesDto | null> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(
      `${URL_BACKEND}/matrices-caces/periodo/${periodoId}/carrera/${carreraId}`,
      {
        method: 'GET',
        headers: cabeceras,
        cache: 'no-store',
      }
    );

    if (!respuesta.ok) {
      if (respuesta.status === 404) return null;
      if (respuesta.status === 401 || respuesta.status === 403) {
        console.warn(`[obtenerMatrizPorPeriodoYCarreraAccion] Sesión no autorizada (${respuesta.status}).`);
        return null;
      }
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener matriz CACES`);
    }

    const resultado = await respuesta.json();
    return resultado.data as MatrizCacesDto;
  } catch (error: any) {
    console.error('Error en obtenerMatrizPorPeriodoYCarreraAccion:', error);
    return null;
  }
}

/**
 * Registra o regenera la matriz CACES para un periodo académico y carrera.
 */
export async function crearOActualizarMatrizCacesAccion(
  periodoAcademicoId: number | string,
  carreraId: number | string
): Promise<RespuestaApi<MatrizCacesDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(
      `${URL_BACKEND}/matrices-caces?periodoAcademicoId=${periodoAcademicoId}&carreraId=${carreraId}`,
      {
        method: 'POST',
        headers: cabeceras,
      }
    );

    if (!respuesta.ok) {
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al registrar matriz CACES`);
    }

    const resultado = await respuesta.json();
    revalidatePath('/dashboard/practicas/matriz-caces');
    return {
      exito: true,
      mensaje: 'Matriz CACES generada correctamente',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en crearOActualizarMatrizCacesAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al generar la matriz CACES',
    };
  }
}

/**
 * Cambia el estado de una matriz CACES con observación opcional (aprobaciones, firmas, rechazos).
 */
export async function cambiarEstadoMatrizCacesAccion(
  id: number | string,
  estado: EstadoMatrizCaces,
  observacion?: string
): Promise<RespuestaApi<MatrizCacesDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    let url = `${URL_BACKEND}/matrices-caces/${id}/estado?estado=${estado}`;
    if (observacion) {
      url += `&observacion=${encodeURIComponent(observacion)}`;
    }

    const respuesta = await fetch(url, {
      method: 'PATCH',
      headers: cabeceras,
    });

    if (!respuesta.ok) {
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al cambiar estado de matriz CACES`);
    }

    const resultado = await respuesta.json();
    revalidatePath('/dashboard/practicas/matriz-caces');
    return {
      exito: true,
      mensaje: 'Estado de la matriz CACES actualizado correctamente',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en cambiarEstadoMatrizCacesAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al actualizar el estado de la matriz CACES',
    };
  }
}

/**
 * Guarda la URL del archivo oficial firmado de la matriz CACES.
 */
export async function subirArchivoFirmadoMatrizCacesAccion(
  id: number | string,
  urlArchivo: string
): Promise<RespuestaApi<MatrizCacesDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(
      `${URL_BACKEND}/matrices-caces/${id}/archivo-firmado?urlArchivo=${encodeURIComponent(urlArchivo)}`,
      {
        method: 'PATCH',
        headers: cabeceras,
      }
    );

    if (!respuesta.ok) {
      const errorJson = await respuesta.json().catch(() => null);
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al asociar archivo firmado`);
    }

    const resultado = await respuesta.json();
    revalidatePath('/dashboard/practicas/matriz-caces');
    return {
      exito: true,
      mensaje: 'Archivo firmado de la matriz CACES registrado correctamente',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en subirArchivoFirmadoMatrizCacesAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al guardar el archivo firmado de la matriz CACES',
    };
  }
}
