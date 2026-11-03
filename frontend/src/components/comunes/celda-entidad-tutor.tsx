import React from 'react';
import { Building } from 'lucide-react';

export interface CeldaEntidadTutorProps {
  titulo: string;
  nombreTutor?: string | null;
}

export function CeldaEntidadTutor({
  titulo,
  nombreTutor,
}: CeldaEntidadTutorProps) {
  return (
    <div className="space-y-1 min-w-0">
      <div className="font-medium text-sm text-foreground leading-tight truncate">
        {titulo || '-'}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
        <span className="truncate">
          {nombreTutor ? `Tutor: ${nombreTutor}` : 'Sin tutor asignado'}
        </span>
      </div>
    </div>
  );
}
