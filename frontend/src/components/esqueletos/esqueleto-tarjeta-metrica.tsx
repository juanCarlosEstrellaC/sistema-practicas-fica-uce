import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface EsqueletoTarjetaMetricaProps {
  className?: string
  mostrarDescripcion?: boolean
}

/**
 * Esqueleto que replica 1:1 la apariencia y dimensiones de TarjetaMetricaWireframe
 * utilizada en los dashboards para Subdecano, Director/Coordinador y Tutor Académico.
 */
export function EsqueletoTarjetaMetricaWireframe({
  className,
  mostrarDescripcion = true,
}: EsqueletoTarjetaMetricaProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 flex items-center gap-3 sm:gap-3.5 shadow-xs overflow-hidden h-full min-w-0',
        className
      )}
    >
      {/* Contenedor del icono temático */}
      <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl shrink-0" />

      {/* Contenido derecho: Métrica numérica, título y descripción opcional */}
      <div className="flex flex-col justify-center min-w-0 flex-1 space-y-1 sm:space-y-1.5">
        <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
        <Skeleton className="h-3.5 sm:h-4 w-28 sm:w-36 max-w-full" />
        {mostrarDescripcion && (
          <Skeleton className="h-2.5 sm:h-3 w-36 sm:w-44 max-w-full" />
        )}
      </div>
    </div>
  )
}
