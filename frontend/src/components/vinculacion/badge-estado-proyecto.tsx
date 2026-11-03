import { Badge } from '@/components/ui/badge';
import { EstadoProyectoComunitario } from '@/lib/tipos/vcs/proyecto-comunitario';

interface BadgeEstadoProyectoProps {
  estado: EstadoProyectoComunitario | string;
}

export function BadgeEstadoProyecto({ estado }: BadgeEstadoProyectoProps) {
  switch (estado) {
    case 'ACTIVO':
      return (
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200">
          Activo
        </Badge>
      );
    case 'FINALIZADO':
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200">
          Finalizado
        </Badge>
      );
    case 'CANCELADO':
      return <Badge variant="destructive">Cancelado</Badge>;
    case 'INACTIVO':
      return <Badge variant="outline" className="text-muted-foreground border-muted">Inactivo</Badge>;
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
}
