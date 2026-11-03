import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { EsqueletoCabeceraDashboard } from './esqueleto-cabecera-dashboard'

interface EsqueletoDashboardEstudianteProps {
  mostrarCabecera?: boolean
}

/**
 * Esqueleto idéntico a la vista final del Estudiante (DisenioEstudianteProceso):
 * - Tira de 4 KPIs con divisor vertical
 * - 2 Paneles maestros en split (Prácticas y Vinculación) con barra de horas e hitos de flujo
 * - Barra inferior de accesos directos frecuentes
 */
export function EsqueletoDashboardEstudiante({
  mostrarCabecera = true,
}: EsqueletoDashboardEstudianteProps) {
  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* 1. Encabezado de Bienvenida */}
      {mostrarCabecera && <EsqueletoCabeceraDashboard anchoRol="w-28" />}

      {/* 2. Tira Horizontal de 4 KPIs Consolidados */}
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-border/60">
          {/* KPI 1: Avance Prácticas */}
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-md shrink-0" />
              <Skeleton className="h-3 w-36 max-w-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 max-w-full" />
          </div>

          {/* KPI 2: Horas Validadas Prácticas */}
          <div className="space-y-2 min-w-0 md:pl-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-md shrink-0" />
              <Skeleton className="h-3 w-36 max-w-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-40 max-w-full" />
          </div>

          {/* KPI 3: Avance Vinculación */}
          <div className="space-y-2 min-w-0 md:pl-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-md shrink-0" />
              <Skeleton className="h-3 w-36 max-w-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 max-w-full" />
          </div>

          {/* KPI 4: Horas Validadas Vinculación */}
          <div className="space-y-2 min-w-0 md:pl-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-md shrink-0" />
              <Skeleton className="h-3 w-36 max-w-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-40 max-w-full" />
          </div>
        </div>
      </div>

      {/* 3. Dos Paneles Maestros en Split (Prácticas y Vinculación) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PANEL DE PRÁCTICAS PREPROFESIONALES */}
        <div className="rounded-2xl border border-sky-500/20 bg-card p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-36 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-28 rounded-md shrink-0" />
            </div>

            {/* Barra de Progreso y Balance de Horas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3.5 w-10" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>

            {/* 4 Hitos del Flujo de Prácticas */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              {[1, 2, 3, 4].map((indice) => (
                <div
                  key={`skel-est-pp-hito-${indice}`}
                  className="p-2 rounded-lg border bg-muted/30 border-border/40 space-y-1 text-center"
                >
                  <Skeleton className="h-2.5 w-12 sm:w-14 mx-auto" />
                  <Skeleton className="h-4 w-8 sm:w-10 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Pie del Panel */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* PANEL DE VINCULACIÓN CON LA SOCIEDAD */}
        <div className="rounded-2xl border border-emerald-500/20 bg-card p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-40 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-28 rounded-md shrink-0" />
            </div>

            {/* Barra de Progreso y Balance de Horas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3.5 w-10" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>

            {/* 4 Hitos del Flujo de Vinculación */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              {[1, 2, 3, 4].map((indice) => (
                <div
                  key={`skel-est-vcs-hito-${indice}`}
                  className="p-2 rounded-lg border bg-muted/30 border-border/40 space-y-1 text-center"
                >
                  <Skeleton className="h-2.5 w-12 sm:w-14 mx-auto" />
                  <Skeleton className="h-4 w-8 sm:w-10 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Pie del Panel */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* 4. Accesos Directos Frecuentes */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card">
        <Skeleton className="h-3.5 w-28" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-28 sm:w-32 rounded-lg" />
          <Skeleton className="h-8 w-36 sm:w-44 rounded-lg" />
          <Skeleton className="h-8 w-32 sm:w-36 rounded-lg" />
        </div>
      </div>

      <span className="sr-only">Cargando dashboard del estudiante...</span>
    </div>
  )
}
