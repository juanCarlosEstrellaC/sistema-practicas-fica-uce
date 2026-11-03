import { Badge } from '@/components/ui/badge';
import { FaseActualPractica } from '@/lib/tipos/pp/general-pp';

interface BadgeFasePracticaProps {
  fase: FaseActualPractica | string;
}

export function BadgeFasePractica({ fase }: BadgeFasePracticaProps) {
  switch (fase) {
    case 'CONVOCATORIA':
      return (
        <Badge
          variant="secondary"
          className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
        >
          Convocatoria
        </Badge>
      );
    case 'ASIGNACION':
      return (
        <Badge
          variant="secondary"
          className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
        >
          Asignación
        </Badge>
      );
    case 'DESARROLLO':
      return (
        <Badge
          variant="secondary"
          className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800"
        >
          Desarrollo
        </Badge>
      );
    case 'FINALIZACION':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
        >
          Finalización
        </Badge>
      );
    default:
      return <Badge variant="outline">{fase || 'Sin fase'}</Badge>;
  }
}
