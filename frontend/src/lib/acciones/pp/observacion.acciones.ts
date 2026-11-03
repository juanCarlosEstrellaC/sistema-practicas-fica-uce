'use server';

import { revalidatePath } from 'next/cache';
import { ObservacionDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada, RespuestaApi } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export interface FiltrosObservacion {
  page?: number;
  size?: number;
  search?: string;
  remitenteId?: number;
  tipo?: string;
  estado?: string;
}

export interface PayloadNuevaObservacion {
  tipo: 'NUEVA' | 'ANULACION';
  remitenteId: string;
  carreraId?: string;
  convenioId?: string;
  empresa: string;
  contacto?: string;
  correo?: string;
  descripcion: string;
}

export async function obtenerObservacionesAccion(
  filtros: FiltrosObservacion = {}
): Promise<RespuestaPaginada<ObservacionDto>> {
  const params = new URLSearchParams();
  params.set('page', (filtros.page ?? 0).toString());
  params.set('size', (filtros.size ?? 10).toString());
  params.set('sort', 'id,desc');

  if (filtros.search && filtros.search.trim() !== '') {
    params.set('search', filtros.search.trim());
  }
  if (filtros.remitenteId) {
    params.set('remitenteId', filtros.remitenteId.toString());
  }
  if (filtros.tipo && filtros.tipo !== 'all') {
    params.set('tipo', filtros.tipo);
  }
  if (filtros.estado && filtros.estado !== 'all') {
    params.set('estado', filtros.estado);
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/observaciones?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401 || respuesta.status === 403) {
        console.warn(`[obtenerObservacionesAccion] Sesión no autorizada o token expirado (${respuesta.status}).`);
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
      throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener observaciones`);
    }

    const resultado = await respuesta.json();
    return (resultado.data || resultado) as RespuestaPaginada<ObservacionDto>;
  } catch (error: any) {
    console.error('Error en obtenerObservacionesAccion:', error);
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

export async function obtenerObservacionPorIdAccion(id: number | string): Promise<ObservacionDto | null> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/observaciones/${id}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) return null;
    const resultado = await respuesta.json();
    return (resultado.data || resultado) as ObservacionDto;
  } catch (error) {
    console.error('Error en obtenerObservacionPorIdAccion:', error);
    return null;
  }
}

export async function crearObservacionAccion(
  payload: PayloadNuevaObservacion
): Promise<RespuestaApi<ObservacionDto>> {
  if (!payload.empresa?.trim()) {
    return { exito: false, mensaje: 'El nombre de la empresa o institucion es obligatorio' };
  }
  if (!payload.descripcion?.trim()) {
    return { exito: false, mensaje: 'El motivo o descripcion es obligatorio' };
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/observaciones`, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(payload),
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || resultado.exito === false) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al enviar la observacion`,
      };
    }

    revalidatePath('/dashboard/practicas/convenios');
    revalidatePath('/dashboard');
    return {
      exito: true,
      mensaje: 'Observacion enviada correctamente',
      data: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en crearObservacionAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion al enviar la observacion',
    };
  }
}

export async function procesarObservacionAccion(
  id: string | number,
  aprobado: boolean,
  motivoRechazo?: string
): Promise<RespuestaApi<void>> {
  const params = new URLSearchParams();
  params.set('estado', aprobado ? 'APROBADA' : 'RECHAZADA');
  if (motivoRechazo) {
    params.set('motivoRechazo', motivoRechazo);
  }

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/observaciones/${id}/estado?${params.toString()}`, {
      method: 'PATCH',
      headers: cabeceras,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok || resultado.exito === false) {
      return {
        exito: false,
        mensaje: resultado?.mensaje || `Error ${respuesta.status}: al procesar la observacion`,
      };
    }

    revalidatePath('/dashboard/practicas/convenios');
    revalidatePath('/dashboard');
    return {
      exito: true,
      mensaje: aprobado ? 'Observacion aprobada exitosamente' : 'Observacion rechazada',
    };
  } catch (error: any) {
    console.error('Error en procesarObservacionAccion:', error);
    return {
      exito: false,
      mensaje: error?.message || 'Error de conexion al procesar observacion',
    };
  }
}
