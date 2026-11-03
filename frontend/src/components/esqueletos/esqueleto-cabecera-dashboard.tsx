import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface EsqueletoCabeceraDashboardProps {
  anchoRol?: string
  mostrarPeriodo?: boolean
}

/**
 * Esqueleto unificado para el encabezado principal de bienvenida de los dashboards,
 * idéntico al renderizado por VistaDashboardGeneral.
 */
export function EsqueletoCabeceraDashboard({
  anchoRol = 'w-24',
  mostrarPeriodo = true,
}: EsqueletoCabeceraDashboardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Skeleton className={cn('h-5 rounded-full', anchoRol)} />
        {mostrarPeriodo && <Skeleton className="h-4 w-44 sm:w-52" />}
      </div>
      <Skeleton className="h-8 w-64 sm:w-80" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  )
}
