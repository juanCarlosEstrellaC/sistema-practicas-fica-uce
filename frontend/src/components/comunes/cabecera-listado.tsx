import React from 'react';

export interface CabeceraListadoProps {
  titulo: string;
  total: number;
  etiquetaTotal?: string;
  accion?: React.ReactNode;
  metricasExtra?: React.ReactNode;
}

export function CabeceraListado({
  titulo,
  total,
  etiquetaTotal = 'Total de asignaciones registradas',
  accion,
  metricasExtra,
}: CabeceraListadoProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {titulo}
          </h2>
          {metricasExtra}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {etiquetaTotal}:{' '}
          <span className="font-semibold text-foreground">{total}</span>
        </p>
      </div>
      {accion}
    </div>
  );
}
