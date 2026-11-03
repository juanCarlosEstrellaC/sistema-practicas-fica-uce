import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table'
import { EsqueletoFilasTablaUsuarios, EsqueletoTarjetasUsuarios } from './esqueleto-tabla'

export function EsqueletoIngresoDatos() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Cabecera con título y selector horizontal exacto */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-64 sm:w-80" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>

        {/* Selector horizontal idéntico al TabsList */}
        <div className="bg-muted/60 p-1 sm:p-1.5 rounded-xl border border-border/80 grid grid-cols-3 gap-1 sm:gap-1.5 w-full lg:w-auto h-auto min-w-0">
          <Skeleton className="h-9 w-full sm:w-28 rounded-lg" />
          <Skeleton className="h-9 w-full sm:w-28 rounded-lg" />
          <Skeleton className="h-9 w-full sm:w-36 rounded-lg" />
        </div>
      </div>

      {/* 2. Barra de Estadísticas y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full sm:w-36 rounded-lg" />
      </div>

      {/* 3. Barra de Búsqueda y Filtros */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3 min-w-0">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 justify-end">
            <Skeleton className="h-9 w-full sm:w-[160px] rounded-md" />
            <Skeleton className="h-9 w-full sm:w-[200px] rounded-md" />
            <Skeleton className="h-9 w-full sm:w-[130px] rounded-md" />
          </div>
        </div>
      </div>

      {/* 4. Vista Móvil de Tarjetas Esqueleto */}
      <EsqueletoTarjetasUsuarios tarjetas={3} />

      {/* 5. Vista Escritorio de Tabla Esqueleto */}
      <div className="hidden md:block rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground">Usuario</TableHead>
              <TableHead className="font-semibold text-foreground">Carrera</TableHead>
              <TableHead className="font-semibold text-foreground">Rol</TableHead>
              <TableHead className="text-center font-semibold text-foreground">Estado</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <EsqueletoFilasTablaUsuarios filas={5} />
          </TableBody>
        </Table>
      </div>

      {/* 6. Barra de Paginación Esqueleto */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-44 rounded-md" />
      </div>
    </div>
  )
}
