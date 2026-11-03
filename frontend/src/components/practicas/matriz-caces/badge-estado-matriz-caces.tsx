import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EstadoMatrizCaces } from '@/lib/tipos/pp/general-pp';

interface BadgeEstadoMatrizCacesProps {
  estado: EstadoMatrizCaces | string;
}

export function BadgeEstadoMatrizCaces({ estado }: BadgeEstadoMatrizCacesProps) {
  switch (estado) {
    case 'PENDIENTE':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
        >
          Pendiente
        </Badge>
      );
    case 'ENVIADA_A_DC':
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        >
          Enviada a Dirección
        </Badge>
      );
    case 'FIRMADA_POR_DC':
      return (
        <Badge
          variant="secondary"
          className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
        >
          Firmada por Dirección
        </Badge>
      );
    case 'ENVIADA_A_SUBDECANO':
      return (
        <Badge
          variant="secondary"
          className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
        >
          En Revisión (Subdecanato)
        </Badge>
      );
    case 'FIRMADA_POR_SUBDECANO':
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        >
          Oficializada
        </Badge>
      );
    case 'RECHAZADA':
      return (
        <Badge
          variant="secondary"
          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
        >
          Rechazada con Observaciones
        </Badge>
      );
    default:
      return <Badge variant="outline">{estado || 'Sin estado'}</Badge>;
  }
}
