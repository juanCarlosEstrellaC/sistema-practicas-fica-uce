import { Badge } from '@/components/ui/badge';
import { EstadoConvenio } from '@/lib/tipos/pp/general-pp';

interface BadgeEstadoConvenioProps {
  estado: EstadoConvenio | string;
}

export function BadgeEstadoConvenio({ estado }: BadgeEstadoConvenioProps) {
  switch (estado) {
    case 'ACTIVO':
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        >
          Activo
        </Badge>
      );
    case 'POR_EXPIRAR':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
        >
          Por Expirar
        </Badge>
      );
    case 'EXPIRADO':
      return (
        <Badge
          variant="secondary"
          className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
        >
          Expirado
        </Badge>
      );
    case 'ANULADO':
      return <Badge variant="destructive">Anulado</Badge>;
    default:
      return <Badge variant="outline">{estado || 'Sin estado'}</Badge>;
  }
}
