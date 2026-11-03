import { Badge } from '@/components/ui/badge';
import { EstadoDocumento } from '@/lib/tipos/pp/general-pp';

interface BadgeEstadoDocumentoPpProps {
  estado: EstadoDocumento | string;
}

export function BadgeEstadoDocumentoPp({ estado }: BadgeEstadoDocumentoPpProps) {
  switch (estado) {
    case 'APROBADO':
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        >
          Aprobado
        </Badge>
      );
    case 'RECHAZADO':
      return (
        <Badge
          variant="secondary"
          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
        >
          Observado / Rechazado
        </Badge>
      );
    case 'PENDIENTE_REVISION':
    default:
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
        >
          Pendiente de Revision
        </Badge>
      );
  }
}
