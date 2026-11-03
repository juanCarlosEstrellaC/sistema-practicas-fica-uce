import { Info, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import {
  FaseActualAsignacion,
  EstadoAsignacionVcs,
} from '@/lib/tipos/vcs/asignacion-proyecto';
import { cn } from '@/lib/utils';

export interface AlertaEstadoProcesoVcsProps {
  fase?: FaseActualAsignacion | string;
  estado?: EstadoAsignacionVcs | string;
  documentosValidados?: boolean;
  rol?: string;
  className?: string;
}

interface DatosMensajeEstadoVcs {
  mensaje: string;
  descripcion: string;
  esAccionPropia: boolean;
}

function normalizarRol(rol?: string): string {
  if (!rol) return '';
  const limpio = rol.trim().toUpperCase();
  if (limpio === 'CPP' || limpio === 'COORDINADOR') return 'COORDINADOR_PRACTICAS';
  if (limpio === 'TA' || limpio === 'TUTOR') return 'TUTOR_ACADEMICO';
  if (limpio === 'DC' || limpio === 'DIRECTOR') return 'DIRECTOR_CARRERA';
  if (limpio === 'SUB' || limpio === 'SUBDECANATO') return 'SUBDECANO';
  return limpio;
}

function obtenerMensajeEstadoVcsPorPerfil({
  fase,
  estado,
  documentosValidados,
  rol,
}: {
  fase?: string;
  estado?: string;
  documentosValidados: boolean;
  rol: string;
}): DatosMensajeEstadoVcs {
  // PROCESO CULMINADO (APROBADO / COMPLETADO)
  if (estado === 'APROBADO' || estado === 'COMPLETADO') {
    if (rol === 'SUBDECANO') {
      return {
        mensaje: 'Proyecto de vinculación culminado',
        descripcion:
          'El estudiante completó las etapas del proyecto. Las horas han sido convalidadas y el Certificado Oficial de Acreditación fue emitido en el portafolio.',
        esAccionPropia: false,
      };
    }
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Proyecto de vinculación culminado',
        descripcion:
          'La participación del estudiante en el proyecto comunitario ha concluido con éxito y cuenta con el certificado de horas emitido por Subdecanato.',
        esAccionPropia: false,
      };
    }
    if (rol === 'DIRECTOR_CARRERA' || rol === 'COORDINADOR_PRACTICAS') {
      return {
        mensaje: 'Proyecto de vinculación culminado',
        descripcion:
          'El estudiante ha finalizado satisfactoriamente sus actividades en el proyecto comunitario con el certificado de acreditación oficial emitido.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Proyecto de vinculación culminado',
        descripcion:
          'Ha completado con éxito su participación en el proyecto comunitario. Su Certificado de Acreditación de Horas está disponible para consulta y descarga.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Proyecto de vinculación culminado',
      descripcion:
        'El estudiante ha concluido satisfactoriamente las etapas del proyecto comunitario con el certificado institucional correspondiente.',
      esAccionPropia: false,
    };
  }

  // FASE: ASIGNACION
  if (fase === 'ASIGNACION') {
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Inicio de Proyecto pendiente',
        descripcion:
          'El estudiante se encuentra asignado a este proyecto comunitario. Para habilitar la carga de evidencias de los estudiantes, debe iniciar el proyecto de forma global desde la sección de Proyectos Comunitarios.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Inicio de Proyecto pendiente',
        descripcion:
          'Su asignación al proyecto comunitario está registrada. Podrá registrar sus bitácoras y evidencias una vez que el Tutor Académico dé inicio oficial al proyecto comunitario.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Inicio de Proyecto pendiente',
      descripcion:
        'Estudiante asignado al proyecto comunitario. Esperando que el Tutor Académico dé inicio oficial al proyecto desde la sección de Proyectos Comunitarios.',
      esAccionPropia: false,
    };
  }

  // FASE: DESARROLLO
  if (fase === 'DESARROLLO') {
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Proyecto en Desarrollo',
        descripcion:
          'El estudiante se encuentra ejecutando sus horas comunitarias y debe cargar su Bitácora de Actividades e Informe Final para pasar a Finalización.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Proyecto en Desarrollo',
        descripcion:
          'Se encuentra ejecutando sus actividades comunitarias. Recuerde subir su Bitácora de Actividades e Informe Final en formato PDF.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Proyecto en Desarrollo',
      descripcion:
        'Actividades comunitarias en ejecución. Al completar la carga de la Bitácora e Informe Final, el Tutor Académico validará el portafolio.',
      esAccionPropia: false,
    };
  }

  // FASE: FINALIZACION / EVALUACION / FINALIZADO
  if (fase === 'FINALIZACION' || fase === 'EVALUACION' || fase === 'FINALIZADO') {
    if (!documentosValidados) {
      if (rol === 'TUTOR_ACADEMICO') {
        return {
          mensaje: 'Evidencias de cierre entregadas',
          descripcion:
            'El estudiante ha cargado su Bitácora e Informe Final. Esperando revisión y aprobación por su parte para dar paso a la acreditación de Subdecanato.',
          esAccionPropia: true,
        };
      }
      if (rol === 'ESTUDIANTE') {
        return {
          mensaje: 'Evidencias de cierre entregadas',
          descripcion:
            'Su Bitácora de Actividades e Informe Final se encuentran en revisión por parte de su Tutor Académico.',
          esAccionPropia: false,
        };
      }
      return {
        mensaje: 'Evidencias de cierre entregadas',
        descripcion:
          'Bitácora e Informe Final cargados por el estudiante. Esperando que el Tutor Académico revise y apruebe los documentos del portafolio.',
        esAccionPropia: false,
      };
    }

    // Documentos validados por Tutor -> Esperando aprobación de horas y certificado por Subdecanato
    if (rol === 'SUBDECANO') {
      return {
        mensaje: 'Portafolio validado por Tutor Académico',
        descripcion:
          'Evidencias verificadas y aprobadas. Esperando convalidación de horas y emisión por su parte del Certificado de Vinculación con la Sociedad.',
        esAccionPropia: true,
      };
    }
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Portafolio validado por su parte',
        descripcion:
          'Ha aprobado la Bitácora e Informe Final del estudiante. Esperando que Subdecanato convalide las horas y emita el Certificado de Vinculación.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Portafolio validado por Tutor Académico',
        descripcion:
          'Sus evidencias han sido aprobadas. Esperando que Subdecanato convalide sus horas y emita su Certificado de Acreditación.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Portafolio validado por Tutor Académico',
      descripcion:
        'Validación académica completada. Esperando que Subdecanato convalide las horas y emita el Certificado de Vinculación con la Sociedad.',
      esAccionPropia: false,
    };
  }

  return {
    mensaje: 'Proceso en estado inicial',
    descripcion: 'Esperando configuración e inicio del proyecto comunitario de vinculación.',
    esAccionPropia: false,
  };
}

export function AlertaEstadoProcesoVcs({
  fase,
  estado,
  documentosValidados = false,
  rol,
  className,
}: AlertaEstadoProcesoVcsProps) {
  const esCulminado = estado === 'APROBADO' || estado === 'COMPLETADO';

  if (estado === 'CANCELADO' || estado === 'REPROBADO') {
    return (
      <div
        className={cn(
          'bg-destructive/10 border border-destructive/20 text-destructive p-3.5 rounded-xl flex items-start gap-3',
          className
        )}
      >
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold">
            {estado === 'CANCELADO' ? 'Asignación cancelada' : 'Asignación reprobada'}
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">
            La participación del estudiante en este proyecto comunitario no continúa en el periodo académico vigente.
          </p>
        </div>
      </div>
    );
  }

  const rolLimpio = normalizarRol(rol);
  const infoEstado = obtenerMensajeEstadoVcsPorPerfil({
    fase,
    estado,
    documentosValidados,
    rol: rolLimpio,
  });

  return (
    <div
      className={cn(
        'p-3.5 rounded-xl flex items-start gap-3 border transition-colors',
        esCulminado
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
          : infoEstado.esAccionPropia
          ? 'bg-primary/10 border-primary/25 text-primary'
          : 'bg-sky-500/10 border-sky-500/20 text-sky-800 dark:text-sky-300',
        className
      )}
    >
      {esCulminado ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
      ) : infoEstado.esAccionPropia ? (
        <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0 animate-pulse" />
      ) : (
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
      )}

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground">
            {infoEstado.mensaje}
          </h4>
          {esCulminado ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
              Proceso completado
            </span>
          ) : infoEstado.esAccionPropia ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25">
              Acción requerida
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {infoEstado.descripcion}
        </p>
      </div>
    </div>
  );
}
