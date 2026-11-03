'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PeriodoAcademico, RespuestaPaginada } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from './cliente-servidor';

export async function obtenerPeriodosAcademicosAccion(estado?: 'ACTIVO' | 'INACTIVO')
  : Promise<RespuestaPaginada<PeriodoAcademico>> {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  params.set('page', '0');
  params.set('size', '50');

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/periodos-academicos?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: al obtener periodos`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<PeriodoAcademico>;
  } catch (error) {
    console.error('Error en obtenerPeriodosAcademicosAccion:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 50,
      first: true,
      last: true,
      empty: true,
    };
  }
}

export const obtenerPeriodosAccion = obtenerPeriodosAcademicosAccion;

export async function obtenerPeriodosPaginadosAccion(
  pagina: number = 0,
  tamanio: number = 10,
  busqueda?: string,
  estado?: string,
  orden?: string
): Promise<RespuestaPaginada<PeriodoAcademico>> {
  const params = new URLSearchParams();
  params.set('page', pagina.toString());
  params.set('size', tamanio.toString());
  params.set('sort', orden || 'id,desc');
  if (busqueda && busqueda.trim()) params.set('search', busqueda.trim());
  if (estado && estado !== 'all') params.set('estado', estado);

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/periodos-academicos?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: al obtener periodos paginados`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<PeriodoAcademico>;
  } catch (error) {
    console.error('Error en obtenerPeriodosPaginadosAccion:', error);
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

export async function crearPeriodoAccion(datos: {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}): Promise<{ exito: boolean; mensaje: string; datos?: PeriodoAcademico }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/periodos-academicos`, {
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
        mensaje: resultado.message || 'Error al crear el periodo académico',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Periodo académico creado exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en crearPeriodoAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function actualizarPeriodoAccion(
  id: number | string,
  datos: {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
  }
): Promise<{ exito: boolean; mensaje: string; datos?: PeriodoAcademico }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/periodos-academicos/${id}`, {
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
        mensaje: resultado.message || 'Error al actualizar el periodo académico',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Periodo académico actualizado exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en actualizarPeriodoAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function eliminarPeriodoAccion(
  id: number | string
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/periodos-academicos/${id}`, {
      method: 'DELETE',
      headers: cabeceras,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.message || 'Error al eliminar el periodo académico',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Periodo académico eliminado exitosamente',
    };
  } catch (error: any) {
    console.error('Error en eliminarPeriodoAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function obtenerPeriodoAcademicoPorIdAccion(id: number): Promise<PeriodoAcademico | null> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/periodos-academicos/${id}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      return null;
    }

    const resultado = await respuesta.json();
    return (resultado.data as PeriodoAcademico) || null;
  } catch (error) {
    console.error('Error en obtenerPeriodoAcademicoPorIdAccion:', error);
    return null;
  }
}

export async function resolverPeriodoAcademicoServidor(
  periodoIdParam?: string,
  rutaRedireccion?: string
): Promise<{
  periodoActual: PeriodoAcademico | null;
  periodoAcademicoId: number;
  esInactivo: boolean;
}> {
  let periodoAcademicoId = periodoIdParam ? Number(periodoIdParam) : undefined;
  let periodoActual: PeriodoAcademico | null = null;

  if (periodoAcademicoId) {
    periodoActual = await obtenerPeriodoAcademicoPorIdAccion(periodoAcademicoId);
    if (!periodoActual && rutaRedireccion) {
      redirect(rutaRedireccion);
    }
  }

  if (!periodoActual) {
    const respuestaPeriodos = await obtenerPeriodosAcademicosAccion('ACTIVO');
    periodoActual = respuestaPeriodos.content[0] || null;
    if (periodoActual) {
      periodoAcademicoId = Number(periodoActual.id);
    }
  }

  return {
    periodoActual,
    periodoAcademicoId: periodoAcademicoId || 1,
    esInactivo: periodoActual?.estado === 'INACTIVO',
  };
}
