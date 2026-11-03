import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { EsqueletoTarjetaMetricaWireframe } from './esqueleto-tarjeta-metrica'
import { EsqueletoCabeceraDashboard } from './esqueleto-cabecera-dashboard'

interface EsqueletoDashboardSubdecanoProps {
  mostrarCabecera?: boolean
}

/**
 * Esqueleto idéntico a la vista final del Dashboard de Subdecano (DisenioSubdecano):
 * - 4 Tarjetas métricas superiores consolidadas de la facultad
 * - Panel maestro de Prácticas Preprofesionales (4 tarjetas, barra de convenios y tabla comparativa de carreras)
 * - Panel maestro de Vinculación con la Sociedad (4 tarjetas, barra de proyectos y tabla comparativa de carreras)
 */
export function EsqueletoDashboardSubdecano({
  mostrarCabecera = true,
}: EsqueletoDashboardSubdecanoProps) {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* 1. Encabezado de Bienvenida */}
      {mostrarCabecera && <EsqueletoCabeceraDashboard anchoRol="w-24" />}

      {/* 2. Tarjetas Globales Superiores (4 columnas) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((indice) => (
          <EsqueletoTarjetaMetricaWireframe key={`skel-sub-top-${indice}`} />
        ))}
      </div>

      {/* 3. Panel de Prácticas Preprofesionales */}
      <div className="rounded-3xl border border-sky-500/20 bg-card p-4 sm:p-6 space-y-5 shadow-xs">
        {/* Cabecera del Panel */}
        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0" />
          <div className="space-y-1 min-w-0">
            <Skeleton className="h-5 w-48 sm:w-56" />
            <Skeleton className="h-3.5 w-64 sm:w-80 max-w-full" />
          </div>
        </div>

        {/* 4 Tarjetas de Métricas de PP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((indice) => (
            <EsqueletoTarjetaMetricaWireframe key={`skel-sub-pp-${indice}`} />
          ))}
        </div>

        {/* Barra de Convenios Activos */}
        <div className="p-3 rounded-2xl bg-sky-500/5 border border-sky-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-48 hidden md:block" />
          </div>
          <Skeleton className="h-3.5 w-36" />
        </div>

        {/* Desglose Comparativo por Carreras (PP) */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3.5 w-56" />
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 scrollbar-none">
            <table className="w-full text-xs text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/50">
                  <th className="py-2.5 px-4 w-1/3">
                    <Skeleton className="h-3.5 w-24" />
                  </th>
                  {[1, 2, 3, 4, 5].map((columna) => (
                    <th key={`skel-sub-pp-th-${columna}`} className="py-2.5 px-4 text-center">
                      <Skeleton className="h-5 w-20 mx-auto rounded-md" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[1, 2, 3, 4, 5].map((fila) => (
                  <tr key={`skel-sub-pp-tr-${fila}`} className="hover:bg-muted/30">
                    <td className="py-2.5 px-4">
                      <Skeleton className="h-3.5 w-36" />
                    </td>
                    {[1, 2, 3, 4, 5].map((columna) => (
                      <td key={`skel-sub-pp-td-${fila}-${columna}`} className="py-2.5 px-4 text-center">
                        <Skeleton className="h-3.5 w-10 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Panel de Vinculación con la Sociedad */}
      <div className="rounded-3xl border border-emerald-500/20 bg-card p-4 sm:p-6 space-y-5 shadow-xs">
        {/* Cabecera del Panel */}
        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0" />
          <div className="space-y-1 min-w-0">
            <Skeleton className="h-5 w-52 sm:w-60" />
            <Skeleton className="h-3.5 w-64 sm:w-80 max-w-full" />
          </div>
        </div>

        {/* 4 Tarjetas de Métricas de VCS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((indice) => (
            <EsqueletoTarjetaMetricaWireframe key={`skel-sub-vcs-${indice}`} />
          ))}
        </div>

        {/* Barra de Proyectos Activos */}
        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-48 hidden md:block" />
          </div>
          <Skeleton className="h-3.5 w-36" />
        </div>

        {/* Desglose Comparativo por Carreras (VCS) */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3.5 w-56" />
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 scrollbar-none">
            <table className="w-full text-xs text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/50">
                  <th className="py-2.5 px-4 w-1/3">
                    <Skeleton className="h-3.5 w-24" />
                  </th>
                  {[1, 2, 3, 4, 5].map((columna) => (
                    <th key={`skel-sub-vcs-th-${columna}`} className="py-2.5 px-4 text-center">
                      <Skeleton className="h-5 w-20 mx-auto rounded-md" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[1, 2, 3, 4, 5].map((fila) => (
                  <tr key={`skel-sub-vcs-tr-${fila}`} className="hover:bg-muted/30">
                    <td className="py-2.5 px-4">
                      <Skeleton className="h-3.5 w-36" />
                    </td>
                    {[1, 2, 3, 4, 5].map((columna) => (
                      <td key={`skel-sub-vcs-td-${fila}-${columna}`} className="py-2.5 px-4 text-center">
                        <Skeleton className="h-3.5 w-10 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <span className="sr-only">Cargando dashboard de subdecano...</span>
    </div>
  )
}
