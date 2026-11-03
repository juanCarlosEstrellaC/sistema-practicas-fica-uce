'use server';

import { revalidatePath } from 'next/cache';
import {
    AsignacionProyectoComunitarioDto,
    FiltrosAsignacionProyectoComunitario,
    ProyectoResumenDto,
    TutorResumenVcsDto,
} from "@/lib/tipos/vcs/asignacion-proyecto";
import { UsuarioResumenDto, EstudianteResumenDto, RespuestaPaginada, RespuestaApi } from "@/lib/tipos/general";
import {
    esquemaAsignacionProyectoComunitario,
    esquemaAsignacionProyectoComunitarioActualizar,
    type FormularioAsignacionMasiva,
    type FormularioAsignacionActualizar,
} from "@/lib/esquemas/vcs/asignacion-proyecto.esquema";
import { obtenerCabecerasAutenticacion, URL_BACKEND } from "../cliente-servidor";

export async function obtenerAsignacionesProyectosComunitariosAccion(filtros: FiltrosAsignacionProyectoComunitario = {})
    : Promise<RespuestaPaginada<AsignacionProyectoComunitarioDto>> {
    const params = new URLSearchParams();
    params.set('page', (filtros.page ?? 0).toString());
    params.set('size', (filtros.size ?? 10).toString());
    params.set('sort', filtros.sort || 'fechaCreacion,desc');
    if (filtros.carreraId) params.set('carreraId', filtros.carreraId.toString());
    if (filtros.tutorId) params.set('tutorId', filtros.tutorId.toString());
    if (filtros.estudianteId) params.set('estudianteId', filtros.estudianteId.toString());
    if (filtros.periodoAcademicoId) {
        params.set('periodoAcademicoId', filtros.periodoAcademicoId.toString());
        params.set('periodoId', filtros.periodoAcademicoId.toString());
    }
    if (filtros.proyectoId) params.set('proyectoId', filtros.proyectoId.toString());
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.faseActual) params.set('faseActual', filtros.faseActual);
    if (filtros.busqueda && filtros.busqueda.trim() !== '') params.set('busqueda', filtros.busqueda.trim());

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios?${params.toString()}`,
            {
                method: 'GET',
                headers: cabeceras,
                cache: 'no-store'
            }
        );

        if (!respuesta.ok) {
            const errorJson = await respuesta.json().catch(() => null);
            throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener asignaciones de proyectos comunitarios`);
        }

        const resultado = await respuesta.json();
        return resultado.data as RespuestaPaginada<AsignacionProyectoComunitarioDto>;

    } catch (error) {
        console.error('Error en obtenerAsignacionesProyectosComunitariosAccion:', error);
        return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: filtros.page ?? 0,
            size: filtros.size ?? 10,
            first: true,
            last: true,
            empty: true

        };
    }
}

export async function obtenerAsignacionProyectoPorIdAccion(id: number): Promise<AsignacionProyectoComunitarioDto | null> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${id}`, {
            method: 'GET',
            headers: cabeceras,
            cache: 'no-store',
        });
        if (!respuesta.ok) return null;
        const resultado = await respuesta.json();
        return (resultado.data as AsignacionProyectoComunitarioDto) || null;
    } catch (error) {
        console.error('Error en obtenerAsignacionProyectoPorIdAccion:', error);
        return null;
    }
}

export async function obtenerEstudiantesDisponiblesAccion(carreraId?: number, periodoId?: number, busqueda?: string)
    : Promise<EstudianteResumenDto[]> {
    const params = new URLSearchParams();
    if (carreraId) params.set('carreraId', carreraId.toString());
    if (periodoId) params.set('periodoId', periodoId.toString());
    if (busqueda && busqueda.trim() !== '') params.set('busqueda', busqueda.trim());

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/estudiantes-disponibles?${params.toString()}`,
            {
                method: 'GET',
                headers: cabeceras,
                cache: 'no-store'
            }
        );

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                console.warn(`[obtenerEstudiantesDisponiblesAccion] Acceso no autorizado (${respuesta.status}).`);
                return [];
            }
            const errorJson = await respuesta.json().catch(() => null);
            throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener estudiantes disponibles`);
        }
        const resultado = await respuesta.json();
        return (resultado.data || []) as EstudianteResumenDto[];

    } catch (error) {
        console.error('Error en obtenerEstudiantesDisponiblesAccion:', error);
        return [];
    }
}

export async function obtenerProyectosDisponiblesAccion(carreraId?: number, periodoId?: number, busqueda?: string)
    : Promise<ProyectoResumenDto[]> {
    const params = new URLSearchParams();
    if (carreraId) params.set('carreraId', carreraId.toString());
    if (periodoId) params.set('periodoId', periodoId.toString());
    if (busqueda && busqueda.trim() !== '') params.set('busqueda', busqueda.trim());

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/proyectos-disponibles?${params.toString()}`,
            {
                method: 'GET',
                headers: cabeceras,
                cache: 'no-store'
            }
        );

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                console.warn(`[obtenerProyectosDisponiblesAccion] Acceso no autorizado (${respuesta.status}).`);
                return [];
            }
            const errorJson = await respuesta.json().catch(() => null);
            throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener proyectos disponibles`);
        }
        const resultado = await respuesta.json();
        return resultado.data as ProyectoResumenDto[];

    } catch (error) {
        console.error('Error en obtenerProyectosDisponiblesAccion:', error);
        return [];
    }
}

export async function obtenerTutoresDisponiblesAccion(
    carreraId?: number,
    periodoId?: number,
    busqueda?: string,
    proyectoId?: number,
    conAsignaciones?: string
): Promise<TutorResumenVcsDto[]> {
    const params = new URLSearchParams();
    if (carreraId) params.set('carreraId', carreraId.toString());
    if (periodoId) params.set('periodoId', periodoId.toString());
    if (busqueda && busqueda.trim() !== '') params.set('busqueda', busqueda.trim());
    if (proyectoId) params.set('proyectoId', proyectoId.toString());
    if (conAsignaciones && conAsignaciones.trim() !== '' && conAsignaciones !== 'TODOS') {
        params.set('conAsignaciones', conAsignaciones.trim());
    }

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/tutores-disponibles?${params.toString()}`,
            {
                method: 'GET',
                headers: cabeceras,
                cache: 'no-store'
            }
        );

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                console.warn(`[obtenerTutoresDisponiblesAccion] Acceso no autorizado (${respuesta.status}).`);
                return [];
            }
            const errorJson = await respuesta.json().catch(() => null);
            throw new Error(errorJson?.mensaje || `Error ${respuesta.status}: al obtener tutores disponibles`);
        }
        const resultado = await respuesta.json();
        return resultado.data as TutorResumenVcsDto[];

    } catch (error) {
        console.error('Error en obtenerTutoresDisponiblesAccion:', error);
        return [];
    }
}

export async function asignarEstudiantesMasivoAccion(datos: FormularioAsignacionMasiva)
    : Promise<RespuestaApi<AsignacionProyectoComunitarioDto[]>> {
    const validacion = esquemaAsignacionProyectoComunitario.safeParse(datos);
    if (!validacion.success) {
        const primerError = validacion.error.issues[0]?.message || 'Datos de asignación inválidos';
        return { exito: false, mensaje: primerError };
    }

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios`, {
            method: 'POST',
            headers: cabeceras,
            body: JSON.stringify(validacion.data),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al asignar estudiantes al proyecto',
            };
        }

        revalidatePath('/dashboard/vinculacion/asignaciones');
        revalidatePath('/dashboard/vinculacion/asignaciones-existentes');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Estudiantes asignados correctamente',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en asignarEstudiantesMasivoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function actualizarAsignacionProyectoAccion(id: number, datos: FormularioAsignacionActualizar)
    : Promise<RespuestaApi<AsignacionProyectoComunitarioDto>> {
    const validacion = esquemaAsignacionProyectoComunitarioActualizar.safeParse(datos);
    if (!validacion.success) {
        const primerError = validacion.error.issues[0]?.message || 'Datos de actualización inválidos';
        return { exito: false, mensaje: primerError };
    }

    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${id}`, {
            method: 'PUT',
            headers: cabeceras,
            body: JSON.stringify(validacion.data),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al actualizar la asignación',
            };
        }

        revalidatePath('/dashboard/vinculacion/asignaciones');
        revalidatePath('/dashboard/vinculacion/asignaciones-existentes');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Asignación actualizada correctamente',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en actualizarAsignacionProyectoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function eliminarAsignacionProyectoAccion(id: number)
    : Promise<RespuestaApi> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${id}`, {
            method: 'DELETE',
            headers: cabeceras,
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al eliminar la asignación',
            };
        }

        revalidatePath('/dashboard/vinculacion/asignaciones');
        revalidatePath('/dashboard/vinculacion/asignaciones-existentes');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Asignación eliminada correctamente',
        };
    } catch (error: any) {
        console.error('Error en eliminarAsignacionProyectoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function asociarProyectosATutorAccion(tutorId: number, proyectoIds: number[])
    : Promise<RespuestaApi> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/tutores/${tutorId}/proyectos`, {
            method: 'PUT',
            headers: cabeceras,
            body: JSON.stringify(proyectoIds),
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al asociar los proyectos al tutor académico',
            };
        }

        revalidatePath('/dashboard/vinculacion/tutores');
        revalidatePath('/dashboard/vinculacion/proyectos-comunitarios');
        revalidatePath('/dashboard/vinculacion/asignaciones-existentes');
        revalidatePath('/dashboard/vinculacion/asignaciones');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Proyectos asociados al tutor académico con éxito',
        };
    } catch (error: any) {
        console.error('Error en asociarProyectosATutorAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function reprobarAsignacionProyectoAccion(id: number)
    : Promise<RespuestaApi<AsignacionProyectoComunitarioDto>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${id}/reprobar`, {
            method: 'PATCH',
            headers: cabeceras,
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al reprobar la asignación',
            };
        }

        revalidatePath('/dashboard/vinculacion/asignaciones-existentes');
        revalidatePath('/dashboard/vinculacion/asignaciones');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Asignación reprobada con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en reprobarAsignacionProyectoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function cancelarAsignacionProyectoAccion(id: number)
    : Promise<RespuestaApi<AsignacionProyectoComunitarioDto>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${id}/cancelar`, {
            method: 'PATCH',
            headers: cabeceras,
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al cancelar la asignación',
            };
        }

        revalidatePath('/dashboard/vinculacion/asignaciones-existentes');
        revalidatePath('/dashboard/vinculacion/asignaciones');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Asignación cancelada con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en cancelarAsignacionProyectoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}

export async function enviarASubdecanatoAccion(id: number)
    : Promise<RespuestaApi<AsignacionProyectoComunitarioDto>> {
    try {
        const cabeceras = await obtenerCabecerasAutenticacion();
        const respuesta = await fetch(`${URL_BACKEND}/asignaciones-proyectos-comunitarios/${id}/enviar-subdecanato`, {
            method: 'PATCH',
            headers: cabeceras,
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            return {
                exito: false,
                mensaje: resultado?.mensaje || 'Error al enviar la validación a Subdecanato',
            };
        }

        revalidatePath('/dashboard/vinculacion');
        revalidatePath('/dashboard/vinculacion/asignaciones-existentes');
        revalidatePath('/dashboard/vinculacion/asignaciones');
        return {
            exito: true,
            mensaje: resultado?.mensaje || 'Documentos validados y enviados a Subdecanato con éxito',
            data: resultado?.data,
        };
    } catch (error: any) {
        console.error('Error en enviarASubdecanatoAccion:', error);
        return { exito: false, mensaje: error.message || 'Error de conexión con el servidor' };
    }
}
