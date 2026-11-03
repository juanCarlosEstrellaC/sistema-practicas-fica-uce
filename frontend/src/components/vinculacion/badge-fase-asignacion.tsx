import { Badge } from '@/components/ui/badge';
import { FaseActualAsignacion } from '@/lib/tipos/vcs/asignacion-proyecto';

interface BadgeFaseAsignacionProps {
  fase: FaseActualAsignacion | string;
}

export function BadgeFaseAsignacion({ fase }: BadgeFaseAsignacionProps) {
  switch (fase) {
    case 'ASIGNACION':
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
          Asignación
        </Badge>
      );
    case 'DESARROLLO':
      return (
        <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200">
          Desarrollo
        </Badge>
      );
    case 'FINALIZACION':
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200">
          Finalización
        </Badge>
      );
    case 'EVALUACION':
      return (
        <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200">
          Evaluación
        </Badge>
      );
    case 'FINALIZADO':
      return (
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200">
          Finalizado
        </Badge>
      );
    default:
      return <Badge variant="outline">{fase}</Badge>;
  }
}
