import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function EsqueletoDocumentosPortafolio({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div className="space-y-3 pr-1 animate-in fade-in duration-200">
      {Array.from({ length: cantidad }).map((_, indice) => (
        <div
          key={`esqueleto-doc-${indice}`}
          className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <Skeleton className="w-9 h-9 rounded-lg shrink-0 hidden md:block" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-md md:hidden shrink-0" />
                <Skeleton className="h-4 w-44 sm:w-64" />
              </div>
              <Skeleton className="h-3 w-full max-w-md" />
              <Skeleton className="h-2.5 w-28" />
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EsqueletoPortafolioEstudiante({ esVinculacion = false }: { esVinculacion?: boolean }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Cabecera */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-7 w-64 sm:w-80" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* 2. Tarjeta Resumen de la Asignación y Avance de Horas */}
      <Card className="border border-border/70 bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-5 w-48 sm:w-64" />
              </div>
              <Skeleton className="h-3.5 w-40" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          {/* Barra de progreso de horas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Documentos y Evidencias Requeridas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={`esqueleto-doc-${item}`}
              className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-48 sm:w-64" />
                  <Skeleton className="h-3 w-full max-w-md" />
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
