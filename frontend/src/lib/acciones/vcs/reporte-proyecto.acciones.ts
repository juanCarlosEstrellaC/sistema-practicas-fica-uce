'use server';

import { revalidatePath } from 'next/cache';
import {
    ReporteProyecto,
    ReporteProyectoNuevo,
    ReporteRevisionSubdecanato,
    FiltrosReportesVcs,
} from '@/lib/tipos/vcs/reporte-proyecto';
import { RespuestaPaginada, RespuestaApi } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export async function obtenerReportesProyectoPaginadosAccion(
    filtros: FiltrosReportesVcs = {}
): Promise<RespuestaPaginada<ReporteProyecto>> {
    const params = new URLSearchParams();
    params.set('page', (filtros.pagina ?? 0).toString());
    params.set('size', (filtros.tamanio ?? 10).toString());
    params.set('sort', 'fechaSubida,desc');

    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
        params.set('busqueda', filtros.busqueda.trim());
    }
    if (filtros.proyectoId) {
        params.set('proyectoId', filtros.proyectoId.toString());
    }
    if (filtros.periodoId) {
        params.set('periodoId', filtros.periodoId.toString());
    }
    if (filtros.tipo) {
        params.set('tipo', filtros.tipo);
    }
    if (filtros.estadoSubdecanato) {
        params.set('estadoSubdecanato', filtros.estadoSubdecanato);
    }

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/reportes-proyectos-vcs?${params.toString()}`, {
            method: 'GET',
            headers: cabeceras,
            cache: 'no-store',
        });

        if (!respuesta.ok) {
            const errorJson = await respuesta.json().catch(() => null);
            throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener reportes`);
        }

        const resultado = await respuesta.json();
        return resultado.data as RespuestaPaginada<ReporteProyecto>;
    } catch (error: any) {
        console.error('Error en obtenerReportesProyectoPaginadosAccion:', error);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: filtros.pagina ?? 0,
            size: filtros.tamanio ?? 10,
            first: true,
            last: true,
            empty: true,
        };
    }
}

export async function obtenerReportesPorProyectoAccion(
    proyectoId: number,
    periodoId?: number
): Promise<RespuestaApi<ReporteProyecto[]>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const query = periodoId ? `?periodoId=${periodoId}` : '';
        const respuesta = await fetch(`${URL_BACKEND}/reportes-proyectos-vcs/proyecto/${proyectoId}${query}`, {
            method: 'GET',
            headers: cabeceras,
            cache: 'no-store',
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al obtener reportes del proyecto',
                data: [],
            };
        }

        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Reportes obtenidos con éxito',
            data: resultado?.data || [],
        };
    } catch (error: any) {
        console.error('Error en obtenerReportesPorProyectoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor', data: [] };
    }
}

export async function subirReporteProyectoAccion(
    datos: ReporteProyectoNuevo
): Promise<RespuestaApi<ReporteProyecto>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/reportes-proyectos-vcs`, {
            method: 'POST',
            headers: cabeceras,
            body: JSON.stringify(datos),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al registrar el reporte del proyecto',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Reporte registrado y enviado a revisión con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en subirReporteProyectoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function revisarReporteSubdecanatoAccion(
    id: number,
    datos: ReporteRevisionSubdecanato
): Promise<RespuestaApi<ReporteProyecto>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/reportes-proyectos-vcs/${id}/revision`, {
            method: 'PATCH',
            headers: cabeceras,
            body: JSON.stringify(datos),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al calificar el reporte',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Calificación del reporte registrada con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en revisarReporteSubdecanatoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function eliminarReporteProyectoAccion(id: number): Promise<RespuestaApi<void>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/reportes-proyectos-vcs/${id}`, {
            method: 'DELETE',
            headers: cabeceras,
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al eliminar el reporte',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Reporte eliminado con éxito',
        };
    } catch (error: any) {
        console.error('Error en eliminarReporteProyectoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}
