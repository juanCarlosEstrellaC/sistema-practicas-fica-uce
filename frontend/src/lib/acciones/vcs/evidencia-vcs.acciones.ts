'use server';

import { revalidatePath } from 'next/cache';
import {
    EvidenciaVcs,
    EvidenciaVcsNuevo,
    EvidenciaRevisionTutor,
    FiltrosEvidenciasVcs,
    AprobarHorasSubdecanato,
    ResultadoAprobacionHoras,
} from '@/lib/tipos/vcs/evidencia-vcs';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { RespuestaPaginada, RespuestaApi } from '@/lib/tipos/general';
import { URL_BACKEND, obtenerCabecerasAutenticacion } from '@/lib/acciones/cliente-servidor';

export async function obtenerEvidenciasPaginadasAccion(
    filtros: FiltrosEvidenciasVcs = {}
): Promise<RespuestaPaginada<EvidenciaVcs>> {
    const params = new URLSearchParams();
    params.set('page', (filtros.pagina ?? 0).toString());
    params.set('size', (filtros.tamanio ?? 10).toString());
    params.set('sort', 'fechaSubida,desc');

    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
        params.set('busqueda', filtros.busqueda.trim());
    }
    if (filtros.asignacionId) {
        params.set('asignacionId', filtros.asignacionId.toString());
    }
    if (filtros.estudianteId) {
        params.set('estudianteId', filtros.estudianteId.toString());
    }
    if (filtros.tutorId) {
        params.set('tutorId', filtros.tutorId.toString());
    }
    if (filtros.estadoTutor) {
        params.set('estadoTutor', filtros.estadoTutor);
    }

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/evidencias-vcs?${params.toString()}`, {
            method: 'GET',
            headers: cabeceras,
            cache: 'no-store',
        });

        if (!respuesta.ok) {
            const errorJson = await respuesta.json().catch(() => null);
            throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener evidencias`);
        }

        const resultado = await respuesta.json();
        return resultado.data as RespuestaPaginada<EvidenciaVcs>;
    } catch (error: any) {
        console.error('Error en obtenerEvidenciasPaginadasAccion:', error);
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

export async function obtenerEvidenciasPorAsignacionAccion(
    asignacionId: number
): Promise<RespuestaApi<EvidenciaVcs[]>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/evidencias-vcs/asignacion/${asignacionId}`, {
            method: 'GET',
            headers: cabeceras,
            cache: 'no-store',
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al obtener evidencias de la asignación',
                data: [],
            };
        }

        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Evidencias obtenidas con éxito',
            data: resultado?.data || [],
        };
    } catch (error: any) {
        console.error('Error en obtenerEvidenciasPorAsignacionAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor', data: [] };
    }
}

export async function subirEvidenciaAccion(
    datos: EvidenciaVcsNuevo
): Promise<RespuestaApi<EvidenciaVcs>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/evidencias-vcs`, {
            method: 'POST',
            headers: cabeceras,
            body: JSON.stringify(datos),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al subir la evidencia',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Evidencia subida con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en subirEvidenciaAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function revisarEvidenciaTutorAccion(
    id: number,
    datos: EvidenciaRevisionTutor
): Promise<RespuestaApi<EvidenciaVcs>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/evidencias-vcs/${id}/revision-tutor`, {
            method: 'PATCH',
            headers: cabeceras,
            body: JSON.stringify(datos),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al revisar la evidencia',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Revisión de evidencia guardada con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en revisarEvidenciaTutorAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function iniciarDesarrolloAccion(
    asignacionId: number
): Promise<RespuestaApi<AsignacionProyectoDto>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${asignacionId}/iniciar-desarrollo`, {
            method: 'PATCH',
            headers: cabeceras,
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al iniciar el desarrollo del proyecto',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Proyecto iniciado con éxito. Fase actualizada a Desarrollo.',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en iniciarDesarrolloAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function aprobarHorasSubdecanatoAccion(
    asignacionId: number,
    datos: AprobarHorasSubdecanato
): Promise<RespuestaApi<ResultadoAprobacionHoras>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${asignacionId}/aprobar-horas-subdecanato`, {
            method: 'PATCH',
            headers: cabeceras,
            body: JSON.stringify(datos),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al aprobar las horas de vinculación',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Horas de vinculación validadas y aprobadas con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en aprobarHorasSubdecanatoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function obtenerAsignacionesPorEstudianteAccion(
    estudianteId: number
): Promise<RespuestaApi<AsignacionProyectoDto[]>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/estudiante/${estudianteId}`, {
            method: 'GET',
            headers: cabeceras,
            cache: 'no-store',
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al obtener asignaciones del estudiante',
                data: [],
            };
        }

        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Asignaciones obtenidas con éxito',
            data: resultado?.data || [],
        };
    } catch (error: any) {
        console.error('Error en obtenerAsignacionesPorEstudianteAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor', data: [] };
    }
}

export async function obtenerAsignacionesPorTutorAccion(
    tutorId: number
): Promise<RespuestaApi<AsignacionProyectoDto[]>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/tutor/${tutorId}`, {
            method: 'GET',
            headers: cabeceras,
            cache: 'no-store',
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al obtener asignaciones del tutor',
                data: [],
            };
        }

        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Asignaciones obtenidas con éxito',
            data: resultado?.data || [],
        };
    } catch (error: any) {
        console.error('Error en obtenerAsignacionesPorTutorAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor', data: [] };
    }
}
