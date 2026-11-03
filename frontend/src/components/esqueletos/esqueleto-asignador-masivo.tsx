import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

/**
 * Esqueleto fiel para la pantalla de Asignacion Masiva de Practicas Preprofesionales (3 columnas)
 */
export function EsqueletoAsignadorMasivoPracticas() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Cabecera */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Asignación de Carrera - Prácticas Preprofesionales
        </h1>
        <p className="text-sm text-muted-foreground">
          Seleccione los estudiantes disponibles, la empresa receptora con cupos y el tutor académico para completar la asignación.
        </p>
      </div>

      {/* 2. Grid de 3 Columnas: Estudiantes, Convenios y Tutores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start">
        {/* Columna 1: Estudiantes */}
        <Card className="flex flex-col h-[520px] border-border shadow-xs">
          <CardHeader className="p-3.5 sm:p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardHeader>
          <CardContent className="flex-1 p-3 space-y-2.5 overflow-hidden">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={`skel-est-${item}`}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <Skeleton className="h-4 w-4 rounded-sm mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Columna 2: Convenios */}
        <Card className="flex flex-col h-[520px] border-border shadow-xs">
          <CardHeader className="p-3.5 sm:p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardHeader>
          <CardContent className="flex-1 p-3 space-y-2.5 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={`skel-conv-${item}`}
                className="p-3 rounded-lg border border-border space-y-2"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Columna 3: Tutores */}
        <Card className="flex flex-col h-[520px] border-border shadow-xs">
          <CardHeader className="p-3.5 sm:p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardHeader>
          <CardContent className="flex-1 p-3 space-y-2.5 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={`skel-tut-${item}`}
                className="p-3 rounded-lg border border-border space-y-2"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 3. Barra Inferior de Accion */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-9 w-full sm:w-56 rounded-md" />
      </div>
    </div>
  )
}

/**
 * Esqueleto fiel para la pantalla de Asignacion Masiva a Proyectos de VCS (2 columnas)
 */
export function EsqueletoAsignadorMasivoVcs() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Cabecera */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Asignación a Proyectos Comunitarios
        </h1>
        <p className="text-sm text-muted-foreground">
          Seleccione los estudiantes disponibles y el proyecto comunitario al que serán asignados.
        </p>
      </div>

      {/* 2. Grid de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Columna Izquierda: Estudiantes Disponibles */}
        <Card className="flex flex-col h-[520px] border-border shadow-xs">
          <CardHeader className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardHeader>
          <CardContent className="flex-1 p-3 space-y-2.5 overflow-hidden">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={`skel-est-vcs-${item}`}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
              >
                <Skeleton className="h-4 w-4 rounded-sm mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Columna Derecha: Seleccion de Proyecto */}
        <Card className="flex flex-col h-[520px] border-border shadow-xs">
          <CardHeader className="p-4 border-b border-border">
            <Skeleton className="h-5 w-56" />
          </CardHeader>
          <CardContent className="p-4 space-y-4 flex-1 overflow-hidden">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            <div className="pt-4 mt-auto">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
