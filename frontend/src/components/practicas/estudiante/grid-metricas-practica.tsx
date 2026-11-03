import { Clock, CheckCircle2, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridMetricasPracticaProps {
  horasAsignadas: number;
  horasValidadas: number;
  tutorNombreCompleto: string;
  correoTutor?: string;
  esAprobado?: boolean;
  fase?: string;
  validadoCpp?: boolean;
}

export function GridMetricasPractica({
  horasAsignadas,
  horasValidadas,
  tutorNombreCompleto,
  correoTutor,
  esAprobado = false,
  fase,
  validadoCpp = false,
}: GridMetricasPracticaProps) {
  const esFinalizacion = fase === 'FINALIZACION';

  const tituloHoras = esAprobado
    ? 'Horas Aprobadas'
    : esFinalizacion
    ? 'Horas en Validación'
    : 'Horas Registradas';

  const subtituloHoras = esAprobado
    ? 'Validadas y acreditadas con Aval'
    : esFinalizacion
    ? validadoCpp
      ? 'Validadas por CPP • Esperando Aval'
      : 'En revisión por CPP • Aval pendiente'
    : fase === 'DESARROLLO'
    ? 'En desarrollo de actividades'
    : 'Pendiente inicio de prácticas';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl border border-border bg-muted/15 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Horas Asignadas</span>
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-black text-foreground mt-2">{horasAsignadas}h</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Meta para esta práctica</p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-muted/15 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">{tituloHoras}</span>
          {esAprobado ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Clock
              className={cn(
                'h-4 w-4',
                esFinalizacion
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-sky-600 dark:text-sky-400'
              )}
            />
          )}
        </div>
        <p
          className={cn(
            'text-2xl font-black mt-2',
            esAprobado
              ? 'text-emerald-600 dark:text-emerald-400'
              : esFinalizacion
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-foreground'
          )}
        >
          {horasValidadas}h
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtituloHoras}</p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-muted/15 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Tutor Académico</span>
          <UserCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <p className="text-sm font-bold text-foreground mt-2 truncate">
          {tutorNombreCompleto}
        </p>
        {correoTutor && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {correoTutor}
          </p>
        )}
      </div>
    </div>
  );
}
