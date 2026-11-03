import { Info, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { FaseActualPractica, EstadoAsignacionPractica } from '@/lib/tipos/pp/general-pp';
import { cn } from '@/lib/utils';

export interface AlertaEstadoProcesoProps {
  fase?: FaseActualPractica | string;
  estado?: EstadoAsignacionPractica | string;
  validadoCpp?: boolean;
  tieneCarta?: boolean;
  estudianteNombre?: string;
  rol?: string;
  className?: string;
}

interface DatosMensajeEstado {
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
  if (limpio === 'SUBDECANATO') return 'SUBDECANO';
  return limpio;
}

function obtenerMensajeEstadoPorPerfil({
  fase,
  estado,
  validadoCpp,
  tieneCarta,
  rol,
}: {
  fase?: string;
  estado?: string;
  validadoCpp: boolean;
  tieneCarta: boolean;
  rol: string;
}): DatosMensajeEstado {
  // PROCESO CULMINADO (APROBADO / COMPLETADO)
  if (estado === 'APROBADO' || estado === 'COMPLETADO') {
    if (rol === 'SUBDECANO') {
      return {
        mensaje: 'Prácticas preprofesionales culminadas',
        descripcion:
          'El estudiante completó todas las etapas del proceso. El Aval de Culminación de Prácticas ha sido emitido y debidamente registrado en el portafolio.',
        esAccionPropia: false,
      };
    }
    if (rol === 'COORDINADOR_PRACTICAS') {
      return {
        mensaje: 'Prácticas preprofesionales culminadas',
        descripcion:
          'El estudiante culminó satisfactoriamente sus prácticas preprofesionales y cuenta con el Aval de Culminación oficial emitido por Subdecanato.',
        esAccionPropia: false,
      };
    }
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Prácticas preprofesionales culminadas',
        descripcion:
          'El proceso de prácticas preprofesionales ha concluido con éxito. El expediente cuenta con la documentación requerida y el aval institucional.',
        esAccionPropia: false,
      };
    }
    if (rol === 'DIRECTOR_CARRERA') {
      return {
        mensaje: 'Prácticas preprofesionales culminadas',
        descripcion:
          'El estudiante ha finalizado satisfactoriamente su práctica preprofesional reglamentaria con el aval de culminación oficial emitido.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Prácticas preprofesionales culminadas',
        descripcion:
          'Ha completado con éxito todas las etapas de sus prácticas preprofesionales. Su Aval de Culminación está emitido y disponible para consulta y descarga.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Prácticas preprofesionales culminadas',
      descripcion:
        'El estudiante ha concluido satisfactoriamente todas las etapas de sus prácticas preprofesionales con el aval institucional correspondiente.',
      esAccionPropia: false,
    };
  }

  // FASE: CONVOCATORIA
  if (fase === 'CONVOCATORIA') {
    if (rol === 'COORDINADOR_PRACTICAS') {
      return {
        mensaje: 'Fase de Convocatoria',
        descripcion: 'Le corresponde coordinar la asignación de tutores e instituciones para los estudiantes postulantes de su carrera.',
        esAccionPropia: true,
      };
    }
    if (rol === 'DIRECTOR_CARRERA') {
      return {
        mensaje: 'Fase de Convocatoria',
        descripcion: 'Esperando que la Coordinación de Prácticas realice la asignación preliminar de tutor académico e institución.',
        esAccionPropia: false,
      };
    }
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Fase de Convocatoria',
        descripcion: 'Estudiante en etapa de postulación. Esperando confirmación de la asignación preliminar por parte de la Coordinación de Prácticas.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Fase de Convocatoria',
        descripcion: 'Su postulación está registrada. Esperando la confirmación de la institución receptora y tutor asignado.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Fase de Convocatoria',
      descripcion: 'Esperando asignación formal de institución y tutores para iniciar el proceso.',
      esAccionPropia: false,
    };
  }

  // FASE: ASIGNACION
  if (fase === 'ASIGNACION') {
    if (!tieneCarta) {
      if (rol === 'DIRECTOR_CARRERA') {
        return {
          mensaje: 'Carta de Asignación pendiente',
          descripcion: 'Esperando emisión y envío por su parte de la carta de asignación para formalizar el inicio de la práctica.',
          esAccionPropia: true,
        };
      }
      if (rol === 'TUTOR_ACADEMICO') {
        return {
          mensaje: 'Carta de Asignación pendiente',
          descripcion: 'Esperando que la Dirección de Carrera emita y remita la carta de asignación al tutor institucional.',
          esAccionPropia: false,
        };
      }
      if (rol === 'SUBDECANO' || rol === 'COORDINADOR_PRACTICAS') {
        return {
          mensaje: 'Carta de Asignación pendiente',
          descripcion: 'Esperando la emisión y remisión de la carta de asignación por parte de la Dirección de Carrera.',
          esAccionPropia: false,
        };
      }
      if (rol === 'ESTUDIANTE') {
        return {
          mensaje: 'Carta de Asignación pendiente',
          descripcion: 'Asignación realizada. Esperando que la Dirección de Carrera remita su carta de asignación oficial.',
          esAccionPropia: false,
        };
      }
      return {
        mensaje: 'Carta de Asignación pendiente',
        descripcion: 'Esperando la emisión y envío de la carta de asignación por parte de la Dirección de Carrera.',
        esAccionPropia: false,
      };
    }

    // Tiene carta emitida -> Esperando reunión de inicio del Tutor Académico
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Carta de Asignación emitida',
        descripcion: 'La carta ha sido entregada. Por favor, realice la reunión inicial de coordinación y confirme el inicio de desarrollo.',
        esAccionPropia: true,
      };
    }
    if (rol === 'DIRECTOR_CARRERA') {
      return {
        mensaje: 'Carta de Asignación remitida',
        descripcion: 'Ha enviado la carta exitosamente. Esperando que el Tutor Académico realice la reunión inicial y dé inicio al desarrollo.',
        esAccionPropia: false,
      };
    }
    if (rol === 'SUBDECANO' || rol === 'COORDINADOR_PRACTICAS') {
      return {
        mensaje: 'Carta de Asignación emitida',
        descripcion: 'Carta remitida al tutor institucional. Esperando que el Tutor Académico concrete la reunión inicial y active el desarrollo.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Carta de Asignación emitida',
        descripcion: 'Su carta oficial ha sido emitida. Esperando que su Tutor Académico realice la reunión inicial para dar inicio a sus horas.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Carta de Asignación emitida',
      descripcion: 'Esperando que el Tutor Académico realice la reunión inicial y confirme el inicio de desarrollo.',
      esAccionPropia: false,
    };
  }

  // FASE: DESARROLLO
  if (fase === 'DESARROLLO') {
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Prácticas en Desarrollo',
        descripcion: 'El estudiante se encuentra cumpliendo sus horas. Al culminar las actividades, le corresponde cargar los 3 documentos de cierre requeridos.',
        esAccionPropia: false,
      };
    }
    if (rol === 'COORDINADOR_PRACTICAS') {
      return {
        mensaje: 'Prácticas en Desarrollo',
        descripcion: 'El estudiante se encuentra ejecutando sus horas. Al completar las horas reglamentarias, el Tutor Académico remitirá los documentos de cierre.',
        esAccionPropia: false,
      };
    }
    if (rol === 'SUBDECANO' || rol === 'DIRECTOR_CARRERA') {
      return {
        mensaje: 'Prácticas en Desarrollo',
        descripcion: 'Prácticas en ejecución en la institución receptora. Al culminar las horas, el Tutor Académico subirá la documentación de finalización.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Prácticas en Desarrollo',
        descripcion: 'Se encuentra desarrollando sus actividades prácticas. Recuerde registrar su asistencia y cumplir las horas asignadas.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Prácticas en Desarrollo',
      descripcion: 'El estudiante se encuentra desarrollando sus actividades prácticas. Al culminar las horas, el Tutor Académico cargará los documentos de cierre.',
      esAccionPropia: false,
    };
  }

  // FASE: FINALIZACION
  if (fase === 'FINALIZACION') {
    if (!validadoCpp) {
      if (rol === 'COORDINADOR_PRACTICAS') {
        return {
          mensaje: 'Documentos de cierre entregados',
          descripcion: 'Los documentos de finalización están listos. Esperando revisión y validación por su parte para dar paso al aval de Subdecanato.',
          esAccionPropia: true,
        };
      }
      if (rol === 'TUTOR_ACADEMICO') {
        return {
          mensaje: 'Documentos de cierre entregados',
          descripcion: 'Ha remitido los documentos de cierre exitosamente. Esperando la revisión y validación de la documentación por parte del Coordinador de Prácticas.',
          esAccionPropia: false,
        };
      }
      if (rol === 'SUBDECANO' || rol === 'DIRECTOR_CARRERA') {
        return {
          mensaje: 'Documentos de cierre entregados',
          descripcion: 'Documentación de finalización cargada. Esperando que el Coordinador de Prácticas revise y valide el portafolio.',
          esAccionPropia: false,
        };
      }
      if (rol === 'ESTUDIANTE') {
        return {
          mensaje: 'Documentos de cierre entregados',
          descripcion: 'Sus documentos de finalización están en revisión por parte de la Coordinación de Prácticas.',
          esAccionPropia: false,
        };
      }
      return {
        mensaje: 'Documentos de cierre cargados',
        descripcion: 'Esperando la revisión y validación de documentos por parte del Coordinador de Prácticas.',
        esAccionPropia: false,
      };
    }

    // Validado por CPP -> Esperando Aval de Subdecanato
    if (rol === 'SUBDECANO') {
      return {
        mensaje: 'Portafolio validado por Coordinación',
        descripcion: 'Portafolio verificado. Esperando generación, firma y emisión por su parte del Aval de Culminación de Prácticas.',
        esAccionPropia: true,
      };
    }
    if (rol === 'COORDINADOR_PRACTICAS') {
      return {
        mensaje: 'Portafolio validado por su parte',
        descripcion: 'Ha validado los documentos de cierre. Esperando que Subdecanato genere, firme y emita el Aval de Culminación.',
        esAccionPropia: false,
      };
    }
    if (rol === 'TUTOR_ACADEMICO') {
      return {
        mensaje: 'Portafolio validado por Coordinación',
        descripcion: 'El portafolio cuenta con la validación de Coordinación. Esperando la emisión y firma final del Aval de Culminación por parte de Subdecanato.',
        esAccionPropia: false,
      };
    }
    if (rol === 'DIRECTOR_CARRERA') {
      return {
        mensaje: 'Portafolio validado por Coordinación',
        descripcion: 'Validación técnica completada por Coordinación. Esperando que Subdecanato emita y firme el Aval de Culminación de Prácticas.',
        esAccionPropia: false,
      };
    }
    if (rol === 'ESTUDIANTE') {
      return {
        mensaje: 'Portafolio validado por Coordinación',
        descripcion: 'Su portafolio ha sido validado. Esperando que Subdecanato firme y emita su Aval de Culminación de Prácticas.',
        esAccionPropia: false,
      };
    }
    return {
      mensaje: 'Documentos validados por Coordinación',
      descripcion: 'Esperando que el Subdecanato genere, firme y emita el Aval de Culminación de Prácticas.',
      esAccionPropia: false,
    };
  }

  // ESTADO INICIAL
  return {
    mensaje: 'Proceso en estado inicial',
    descripcion: 'Esperando asignación y configuración de la práctica preprofesional.',
    esAccionPropia: false,
  };
}

export function AlertaEstadoProceso({
  fase,
  estado,
  validadoCpp = false,
  tieneCarta = false,
  rol,
  className,
}: AlertaEstadoProcesoProps) {
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
            {estado === 'CANCELADO' ? 'Prácticas canceladas' : 'Prácticas reprobadas'}
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">
            El proceso de prácticas no continúa en el periodo académico vigente.
          </p>
        </div>
      </div>
    );
  }

  const rolLimpio = normalizarRol(rol);
  const infoEstado = obtenerMensajeEstadoPorPerfil({
    fase,
    estado,
    validadoCpp,
    tieneCarta,
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
