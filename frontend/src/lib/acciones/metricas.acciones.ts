'use server';

import { URL_BACKEND, obtenerCabecerasAutenticacion } from './cliente-servidor';
import { obtenerAsignacionesProyectosComunitariosAccion, obtenerEstudiantesDisponiblesAccion } from './vcs/asignacion-proyecto.acciones';
import { obtenerProyectosComunitariosAccion } from './vcs/proyecto-comunitario.acciones';
import { obtenerAsignacionesPracticasAccion } from './pp/asignacion-practica.acciones';
import { obtenerCarrerasAccion, obtenerCarreraPorIdAccion } from './carrera.acciones';
import { obtenerPeriodosAcademicosAccion } from './periodo-academico.acciones';
import { obtenerUsuarioPorIdAccion } from './usuario.acciones';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';

export interface MetricasPpDto {
  totalEstudiantes: number;
  estudiantesAsignados: number;
  estudiantesEnCurso: number;
  estudiantesCompletados: number;
  totalConvenios: number;
  conveniosPorExpirar: number;
  conveniosExpirados: number;
  totalTutores: number;
  reportesPendientes: number;
}

export interface MetricasVcsDto {
  totalAsignaciones: number;
  asignacionesEnCurso: number;
  asignacionesCompletadas: number;
  totalProyectos: number;
  proyectosEnDesarrollo: number;
  proyectosFinalizados: number;
  proyectosActivos: number;
  estudiantesPendientesAsignacion: number;
}

export interface MetricasDesgloseCarreraDto {
  carreraId: number;
  carreraNombre: string;
  // Practicas
  ppTotalEstudiantes: number;
  ppSinAsignacion: number;
  ppEnDesarrollo: number;
  ppFinalizados: number;
  ppConveniosActivos: number;
  // Vinculacion
  vcsProyectosActuales: number;
  vcsProyectosEnDesarrollo: number;
  vcsProyectosFinalizados: number;
  vcsEstudiantesParticipando: number;
  vcsProyectosActivos: number;
}

export interface MetricasGlobalesFacultadDto {
  totalCarreras: number;
  totalPeriodos: number;
  desgloseCarreras: MetricasDesgloseCarreraDto[];
}

export interface ResumenEstudianteDashboardDto {
  tienePractica: boolean;
  horasPracticaCompletadas: number;
  horasPracticaAsignadas: number;
  estadoPractica?: string;
  fasePractica?: string;
  institucionPractica?: string;
  tieneVinculacion: boolean;
  horasVinculacionCompletadas: number;
  horasVinculacionAsignadas: number;
  estadoVinculacion?: string;
  faseVinculacion?: string;
  proyectoVinculacion?: string;
}

export interface MetricasDashboardGeneralDto {
  pp: MetricasPpDto;
  vcs: MetricasVcsDto;
  estudiante?: ResumenEstudianteDashboardDto;
  subdecano?: MetricasGlobalesFacultadDto;
}

export interface FiltrosDashboardGeneral {
  periodoId?: number;
  carreraId?: number;
  tutorId?: number;
  rol?: string;
  estudianteId?: number;
  identificacionEstudiante?: string;
}

/**
 * Obtiene métricas reales de Prácticas Preprofesionales desde el backend.
 */
export async function obtenerMetricasPpAccion(filtros: FiltrosDashboardGeneral = {}): Promise<MetricasPpDto> {
  try {
    const cabeceras = await obtenerCabecerasAutenticacion();
    let url: string;

    const params = new URLSearchParams();
    if (filtros.periodoId) params.set('periodoId', filtros.periodoId.toString());

    if (filtros.rol === 'SUBDECANO' || !filtros.carreraId) {
      url = `${URL_BACKEND}/metricas/globales?${params.toString()}`;
    } else {
      if (filtros.tutorId) params.set('tutorId', filtros.tutorId.toString());
      url = `${URL_BACKEND}/metricas/carrera/${filtros.carreraId}?${params.toString()}`;
    }

    const respuesta = await fetch(url, {
      method: 'GET',
      headers: cabeceras,
      cache: 'no-store',
    });

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: al consultar métricas de PP`);
    }

    const json = await respuesta.json();
    return json.data as MetricasPpDto;
  } catch (error) {
    console.error('Error al obtener métricas de PP:', error);
    return {
      totalEstudiantes: 0,
      estudiantesAsignados: 0,
      estudiantesEnCurso: 0,
      estudiantesCompletados: 0,
      totalConvenios: 0,
      conveniosPorExpirar: 0,
      conveniosExpirados: 0,
      totalTutores: 0,
      reportesPendientes: 0,
    };
  }
}

/**
 * Obtiene métricas reales de Vinculación con la Sociedad en paralelo.
 */
export async function obtenerMetricasVcsAccion(filtros: FiltrosDashboardGeneral = {}): Promise<MetricasVcsDto> {
  try {
    const [asigTotal, asigEnCurso, asigCompletadas, proyectosTotal, proyectosActivos, proyectosFinalizados, pendientes] = await Promise.all([
      obtenerAsignacionesProyectosComunitariosAccion({
        periodoAcademicoId: filtros.periodoId,
        carreraId: filtros.carreraId,
        tutorId: filtros.tutorId,
        size: 1,
      }),
      obtenerAsignacionesProyectosComunitariosAccion({
        periodoAcademicoId: filtros.periodoId,
        carreraId: filtros.carreraId,
        tutorId: filtros.tutorId,
        estado: 'EN_CURSO',
        size: 1,
      }),
      obtenerAsignacionesProyectosComunitariosAccion({
        periodoAcademicoId: filtros.periodoId,
        carreraId: filtros.carreraId,
        tutorId: filtros.tutorId,
        estado: 'APROBADO',
        size: 1,
      }),
      obtenerProyectosComunitariosAccion({
        carreraId: filtros.carreraId,
        tutorId: filtros.tutorId,
        size: 1,
      }),
      obtenerProyectosComunitariosAccion({
        carreraId: filtros.carreraId,
        tutorId: filtros.tutorId,
        estado: 'ACTIVO',
        size: 1,
      }),
      obtenerProyectosComunitariosAccion({
        carreraId: filtros.carreraId,
        tutorId: filtros.tutorId,
        estado: 'FINALIZADO',
        size: 1,
      }),
      filtros.rol === 'DIRECTOR_CARRERA' && filtros.carreraId && filtros.periodoId
        ? obtenerEstudiantesDisponiblesAccion(filtros.carreraId, filtros.periodoId)
        : Promise.resolve([]),
    ]);

    const numActivos = proyectosActivos.totalElements || 0;
    const numFinalizados = proyectosFinalizados.totalElements || 0;
    const numTotales = proyectosTotal.totalElements || (numActivos + numFinalizados);

    return {
      totalAsignaciones: asigTotal.totalElements || 0,
      asignacionesEnCurso: asigEnCurso.totalElements || 0,
      asignacionesCompletadas: asigCompletadas.totalElements || 0,
      totalProyectos: numTotales,
      proyectosEnDesarrollo: numActivos,
      proyectosFinalizados: numFinalizados,
      proyectosActivos: numActivos,
      estudiantesPendientesAsignacion: pendientes.length || 0,
    };
  } catch (error) {
    console.error('Error al obtener métricas de VCS:', error);
    return {
      totalAsignaciones: 0,
      asignacionesEnCurso: 0,
      asignacionesCompletadas: 0,
      totalProyectos: 0,
      proyectosEnDesarrollo: 0,
      proyectosFinalizados: 0,
      proyectosActivos: 0,
      estudiantesPendientesAsignacion: 0,
    };
  }
}

/**
 * Orquestador principal de métricas para el Dashboard General de PP y VCS.
 */
export async function obtenerMetricasDashboardGeneralAccion(
  filtros: FiltrosDashboardGeneral = {}
): Promise<MetricasDashboardGeneralDto> {
  if (filtros.rol === 'ESTUDIANTE') {
    const [resPp, resVcs, usuarioEstudiante, carreraEstudiante] = await Promise.all([
      obtenerAsignacionesPracticasAccion({
        estudianteId: filtros.estudianteId,
        requiereCarta: true,
        size: 100,
      }),
      obtenerAsignacionesProyectosComunitariosAccion({
        estudianteId: filtros.estudianteId,
        size: 100,
      }),
      filtros.estudianteId ? obtenerUsuarioPorIdAccion(filtros.estudianteId) : Promise.resolve(null),
      filtros.carreraId ? obtenerCarreraPorIdAccion(filtros.carreraId) : Promise.resolve(null),
    ]);

    const asignacionesPp = (resPp?.content || []) as any[];
    const asignacionesPpVisibles = asignacionesPp.filter(
      (a) => a.cartaAsignacionEnviada !== false
    );
    const asigPp =
      asignacionesPpVisibles.find(
        (a) =>
          (!filtros.periodoId || Number(a.periodoAcademicoId) === Number(filtros.periodoId)) &&
          a.estado !== 'CANCELADO' &&
          a.estado !== 'REPROBADO'
      ) ??
      asignacionesPpVisibles.find(
        (a) => a.estado !== 'CANCELADO' && a.estado !== 'REPROBADO'
      ) ??
      asignacionesPpVisibles[0];

    const asignacionesVcs = (resVcs?.content || []) as any[];
    const asigVcs =
      asignacionesVcs.find(
        (a) =>
          (!filtros.periodoId || Number(a.periodoAcademicoId) === Number(filtros.periodoId)) &&
          a.estado !== 'CANCELADO' &&
          a.estado !== 'REPROBADO'
      ) ??
      asignacionesVcs.find(
        (a) => a.estado !== 'CANCELADO' && a.estado !== 'REPROBADO'
      ) ??
      asignacionesVcs[0];

    // UNICAMENTE cuando se envie la carta de asignacion ahi el estudiante recien puede ver la asignacion de pp, antes no.
    const tienePracticaVisible = Boolean(asigPp && asigPp.cartaAsignacionEnviada !== false);
    const asigPpVisible = tienePracticaVisible ? asigPp : undefined;

    // Unicamente cuando el Subdecanato emite el aval/certificado (estado APROBADO/COMPLETADO) se acreditan horas validadas.
    const practicaAprobada =
      asigPpVisible?.estado === 'APROBADO' || asigPpVisible?.estado === 'COMPLETADO';
    const vinculacionAprobada =
      asigVcs?.estado === 'APROBADO' || asigVcs?.estado === 'COMPLETADO';

    const horasPpSumadas = asignacionesPpVisibles.reduce((acumulado, a) => {
      if (a.estado === 'APROBADO' || a.estado === 'COMPLETADO') {
        return acumulado + (a.horasCompletadas || a.horasAsignadas || 0);
      }
      return acumulado;
    }, 0);
    const horasPracticaCompletadas = Math.max(
      usuarioEstudiante?.horasAcumuladas || 0,
      horasPpSumadas
    );
    const horasPracticaRequeridas =
      usuarioEstudiante?.horasRequeridas ||
      carreraEstudiante?.horasPractica ||
      240;

    const horasVcsSumadas = asignacionesVcs.reduce((acumulado, a) => {
      if (a.estado === 'APROBADO' || a.estado === 'COMPLETADO') {
        return acumulado + (a.horasCompletadas || a.horasAsignadas || 0);
      }
      return acumulado;
    }, 0);
    const horasVinculacionCompletadas = Math.max(
      asigVcs?.horasAcumuladasEstudiante || 0,
      horasVcsSumadas
    );
    const horasVinculacionRequeridas =
      asigVcs?.horasRequeridasEstudiante ||
      carreraEstudiante?.horasProyectosComunitarios ||
      160;

    return {
      pp: {
        totalEstudiantes: 1,
        estudiantesAsignados: asigPpVisible ? 1 : 0,
        estudiantesEnCurso: asigPpVisible?.estado === 'EN_CURSO' ? 1 : 0,
        estudiantesCompletados: practicaAprobada ? 1 : 0,
        totalConvenios: asigPpVisible?.convenioId ? 1 : 0,
        conveniosPorExpirar: 0,
        conveniosExpirados: 0,
        totalTutores: asigPpVisible?.tutorAcademico ? 1 : 0,
        reportesPendientes: 0,
      },
      vcs: {
        totalAsignaciones: asigVcs ? 1 : 0,
        asignacionesEnCurso: asigVcs?.estado === 'EN_CURSO' ? 1 : 0,
        asignacionesCompletadas: vinculacionAprobada ? 1 : 0,
        totalProyectos: (asigVcs?.proyectoId || asigVcs?.proyectoComunitario) ? 1 : 0,
        proyectosEnDesarrollo: asigVcs?.estado === 'EN_CURSO' ? 1 : 0,
        proyectosFinalizados: vinculacionAprobada ? 1 : 0,
        proyectosActivos: asigVcs?.estado === 'EN_CURSO' ? 1 : 0,
        estudiantesPendientesAsignacion: 0,
      },
      estudiante: {
        tienePractica: tienePracticaVisible,
        horasPracticaCompletadas,
        horasPracticaAsignadas: horasPracticaRequeridas,
        estadoPractica: asigPpVisible?.estado,
        fasePractica: asigPpVisible?.fase,
        institucionPractica: asigPpVisible?.institucion || asigPpVisible?.convenioInstitucion,
        tieneVinculacion: Boolean(asigVcs),
        horasVinculacionCompletadas,
        horasVinculacionAsignadas: horasVinculacionRequeridas,
        estadoVinculacion: asigVcs?.estado,
        faseVinculacion: asigVcs?.faseActual,
        proyectoVinculacion: asigVcs?.nombreProyecto,
      },
    };
  }

  if (filtros.rol === 'SUBDECANO') {
    const [metricasPp, metricasVcs, carrerasRes, periodosRes] = await Promise.all([
      obtenerMetricasPpAccion(filtros),
      obtenerMetricasVcsAccion(filtros),
      obtenerCarrerasAccion(0, 100),
      obtenerPeriodosAcademicosAccion(),
    ]);

    let desgloseCarreras: MetricasDesgloseCarreraDto[] = [];
    if (carrerasRes?.content && carrerasRes.content.length > 0) {
      desgloseCarreras = await Promise.all(
        carrerasRes.content.map(async (carr: CarreraDto) => {
          const cId = Number(carr.id);
          try {
            const [ppCar, vcsCar] = await Promise.all([
              obtenerMetricasPpAccion({ carreraId: cId, periodoId: filtros.periodoId }),
              obtenerMetricasVcsAccion({ carreraId: cId, periodoId: filtros.periodoId }),
            ]);
            return {
              carreraId: cId,
              carreraNombre: carr.nombre,
              ppTotalEstudiantes: ppCar.totalEstudiantes,
              ppSinAsignacion: Math.max(0, ppCar.totalEstudiantes - ppCar.estudiantesAsignados),
              ppEnDesarrollo: ppCar.estudiantesEnCurso,
              ppFinalizados: ppCar.estudiantesCompletados,
              ppConveniosActivos: ppCar.totalConvenios,
              vcsProyectosActuales: vcsCar.totalProyectos,
              vcsProyectosEnDesarrollo: vcsCar.proyectosEnDesarrollo,
              vcsProyectosFinalizados: vcsCar.proyectosFinalizados,
              vcsEstudiantesParticipando: vcsCar.totalAsignaciones,
              vcsProyectosActivos: vcsCar.proyectosActivos,
            };
          } catch {
            return {
              carreraId: cId,
              carreraNombre: carr.nombre,
              ppTotalEstudiantes: 0,
              ppSinAsignacion: 0,
              ppEnDesarrollo: 0,
              ppFinalizados: 0,
              ppConveniosActivos: 0,
              vcsProyectosActuales: 0,
              vcsProyectosEnDesarrollo: 0,
              vcsProyectosFinalizados: 0,
              vcsEstudiantesParticipando: 0,
              vcsProyectosActivos: 0,
            };
          }
        })
      );
    }

    return {
      pp: metricasPp,
      vcs: metricasVcs,
      subdecano: {
        totalCarreras: carrerasRes.totalElements || (carrerasRes.content?.length ?? 0),
        totalPeriodos: periodosRes.totalElements || (periodosRes.content?.length ?? 0),
        desgloseCarreras,
      },
    };
  }

  if (filtros.rol === 'TUTOR_ACADEMICO') {
    const [metricasPpBase, metricasVcs, resAsigPp] = await Promise.all([
      obtenerMetricasPpAccion(filtros),
      obtenerMetricasVcsAccion(filtros),
      obtenerAsignacionesPracticasAccion({
        carreraId: filtros.carreraId,
        periodoId: filtros.periodoId,
        tutorId: filtros.tutorId,
        requiereCarta: true,
        page: 0,
        size: 100,
      }),
    ]);

    // Unicamente cuando el DC envie la carta de asignacion al TA deben aparecer sus asignaciones y metricas
    const asignacionesConCarta = (resAsigPp?.content || []).filter(
      (asig: any) => asig.cartaAsignacionEnviada !== false
    );

    return {
      pp: {
        ...metricasPpBase,
        estudiantesAsignados: asignacionesConCarta.length,
        estudiantesEnCurso: asignacionesConCarta.filter((a: any) => a.estado === 'EN_CURSO').length,
        estudiantesCompletados: asignacionesConCarta.filter(
          (a: any) => a.estado === 'APROBADO' || a.estado === 'COMPLETADO'
        ).length,
      },
      vcs: metricasVcs,
    };
  }

  const [metricasPp, metricasVcs] = await Promise.all([
    obtenerMetricasPpAccion(filtros),
    obtenerMetricasVcsAccion(filtros),
  ]);

  return {
    pp: metricasPp,
    vcs: metricasVcs,
  };
}
