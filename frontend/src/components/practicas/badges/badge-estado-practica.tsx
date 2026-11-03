import { Badge } from '@/components/ui/badge';
import { EstadoAsignacionPractica } from '@/lib/tipos/pp/general-pp';

interface BadgeEstadoPracticaProps {
  estado: EstadoAsignacionPractica | string;
}

export function BadgeEstadoPractica({ estado }: BadgeEstadoPracticaProps) {
  switch (estado) {
    case 'EN_CURSO':
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        >
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
    case 'COMPLETADO':
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        >
          Completado
        </Badge>
      );
    case 'REPROBADO':
      return <Badge variant="destructive">Reprobado</Badge>;
    case 'CANCELADO':
      return <Badge variant="destructive">Cancelado</Badge>;
    default:
      return <Badge variant="outline">{estado || 'Sin estado'}</Badge>;
  }
}
