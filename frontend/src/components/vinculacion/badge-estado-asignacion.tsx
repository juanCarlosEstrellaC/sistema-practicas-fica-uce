import { Badge } from '@/components/ui/badge';
import { EstadoAsignacionVcs } from '@/lib/tipos/vcs/asignacion-proyecto';

interface BadgeEstadoAsignacionProps {
  estado: EstadoAsignacionVcs | string;
}

export function BadgeEstadoAsignacion({ estado }: BadgeEstadoAsignacionProps) {
  switch (estado) {
    case 'EN_CURSO':
      return (
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200">
          En Curso
        </Badge>
      );
    case 'APROBADO':
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        >
          Aprobado
        </Badge>
      );
    case 'CANCELADO':
      return <Badge variant="destructive">Cancelado</Badge>;
    case 'REPROBADO':
      return (
        <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200">
          Reprobado
        </Badge>
      );
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
}
