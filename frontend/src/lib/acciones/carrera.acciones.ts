'use server';

import { revalidatePath } from 'next/cache';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export async function obtenerCarrerasAccion(pagina: number = 0, tamanio: number = 100)
  : Promise<RespuestaPaginada<CarreraDto>> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/carreras?page=${pagina}&size=${tamanio}&sort=nombre,asc`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: al obtener carreras`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<CarreraDto>;
  } catch (error: any) {
    console.error('Error en obtenerCarrerasAccion:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: tamanio,
      first: true,
      last: true,
      empty: true,
    };
  }
}

export async function obtenerCarrerasPaginadasAccion(
  pagina: number = 0,
  tamanio: number = 10,
  busqueda?: string
): Promise<RespuestaPaginada<CarreraDto>> {
  const params = new URLSearchParams();
  params.set('page', pagina.toString());
  params.set('size', tamanio.toString());
  params.set('sort', 'nombre,asc');
  if (busqueda && busqueda.trim()) params.set('search', busqueda.trim());

  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/carreras?${params.toString()}`, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: al obtener carreras paginadas`);
    }

    const resultado = await respuesta.json();
    return resultado.data as RespuestaPaginada<CarreraDto>;
  } catch (error: any) {
    console.error('Error en obtenerCarrerasPaginadasAccion:', error);
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

export async function crearCarreraAccion(datos: {
  nombre: string;
  codigoCarrera?: string;
  ciudadCarrera?: string;
  horasPractica?: number;
  horasProyectosComunitarios?: number;
  directorId?: string | null;
  coordinadorId?: string | null;
}): Promise<{ exito: boolean; mensaje: string; datos?: CarreraDto }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/carreras`, {
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
        mensaje: resultado.mensaje || resultado.message || 'Error al crear la carrera',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Carrera creada exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en crearCarreraAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function actualizarCarreraAccion(
  id: number | string,
  datos: {
    nombre: string;
    codigoCarrera?: string;
    ciudadCarrera?: string;
    horasPractica?: number;
    horasProyectosComunitarios?: number;
    directorId?: string | null;
    coordinadorId?: string | null;
  }
): Promise<{ exito: boolean; mensaje: string; datos?: CarreraDto }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/carreras/${id}`, {
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
        mensaje: resultado.mensaje || resultado.message || 'Error al actualizar la carrera',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Carrera actualizada exitosamente',
      datos: resultado.data,
    };
  } catch (error: any) {
    console.error('Error en actualizarCarreraAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}

export async function eliminarCarreraAccion(
  id: number | string
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    const respuesta = await fetch(`${URL_BACKEND}/carreras/${id}`, {
      method: 'DELETE',
      headers: cabeceras,
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: resultado.message || 'Error al eliminar la carrera',
      };
    }

    revalidatePath('/dashboard/administracion/ingreso-datos');
    return {
      exito: true,
      mensaje: 'Carrera eliminada exitosamente',
    };
  } catch (error: any) {
    console.error('Error en eliminarCarreraAccion:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al procesar la solicitud',
    };
  }
}
