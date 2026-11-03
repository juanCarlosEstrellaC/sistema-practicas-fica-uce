import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { EsqueletoTarjetaMetricaWireframe } from './esqueleto-tarjeta-metrica'
import { EsqueletoCabeceraDashboard } from './esqueleto-cabecera-dashboard'

interface EsqueletoDashboardDirectorCoordinadorProps {
  mostrarCabecera?: boolean
}

/**
 * Esqueleto idéntico a la vista final para Director de Carrera y Coordinador de Prácticas
 * (DisenioDirectorCoordinador):
 * - 2 Tarjetas superiores alineadas en cuadrícula
 * - 2 Paneles simétricos (Prácticas y Vinculación) con barra de progreso, 4 métricas en 2x2 y barra inferior
 */
export function EsqueletoDashboardDirectorCoordinador({
  mostrarCabecera = true,
}: EsqueletoDashboardDirectorCoordinadorProps) {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* 1. Encabezado de Bienvenida */}
      {mostrarCabecera && <EsqueletoCabeceraDashboard anchoRol="w-44" />}

      {/* 2. Tarjetas Globales Superiores (2 columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
        <EsqueletoTarjetaMetricaWireframe />
        <EsqueletoTarjetaMetricaWireframe />
      </div>

      {/* 3. Disposición Horizontal Armoniosa en 2 Paneles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* PANEL DE PRÁCTICAS PREPROFESIONALES */}
        <div className="rounded-3xl border border-sky-500/20 bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs">
          <div className="space-y-3">
            {/* Cabecera del Panel */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-border/60">
              <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-60 max-w-full" />
              </div>
            </div>

            {/* Barra de progreso de culminación */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3.5 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Cuadrícula 2x2 de tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[1, 2, 3, 4].map((indice) => (
                <EsqueletoTarjetaMetricaWireframe key={`skel-dir-pp-${indice}`} />
              ))}
            </div>
          </div>

          {/* Barra inferior de Convenios Activos */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-sky-500/5 border border-sky-500/15 flex items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-2 min-w-0">
              <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-3.5 w-20 shrink-0" />
          </div>
        </div>

        {/* PANEL DE VINCULACIÓN CON LA SOCIEDAD */}
        <div className="rounded-3xl border border-emerald-500/20 bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs">
          <div className="space-y-3">
            {/* Cabecera del Panel */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-border/60">
              <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-3.5 w-60 max-w-full" />
              </div>
            </div>

            {/* Barra de progreso de proyectos finalizados */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3.5 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Cuadrícula 2x2 de tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[1, 2, 3, 4].map((indice) => (
                <EsqueletoTarjetaMetricaWireframe key={`skel-dir-vcs-${indice}`} />
              ))}
            </div>
          </div>

          {/* Barra inferior de Proyectos Activos */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-2 min-w-0">
              <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-3.5 w-20 shrink-0" />
          </div>
        </div>
      </div>

      <span className="sr-only">Cargando dashboard de carrera...</span>
    </div>
  )
}
