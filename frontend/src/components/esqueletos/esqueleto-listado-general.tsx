import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table'
import {
  EsqueletoFilasTablaEstudiantes,
  EsqueletoFilasTablaConvenios,
  EsqueletoFilasTablaProyectos,
  EsqueletoFilasTablaTutoresPracticas,
  EsqueletoFilasTablaTutoresVcs,
  EsqueletoFilasTablaAsignacionesVcs,
  EsqueletoFilasTablaMatrizCaces,
  EsqueletoTarjetasEstudiantes,
  EsqueletoTarjetasConvenios,
  EsqueletoTarjetasProyectos,
  EsqueletoTarjetasTutoresPracticas,
  EsqueletoTarjetasTutoresVcs,
} from './esqueleto-tabla'

export interface EsqueletoListadoGeneralProps {
  titulo: string
  subtitulo?: string
  tipo?:
    | 'estudiantes'
    | 'convenios'
    | 'proyectos'
    | 'tutores-practicas'
    | 'tutores-vcs'
    | 'asignaciones-vcs'
    | 'matriz-caces'
    | 'general'
  columnas?: string[]
  mostrarCabeceraPagina?: boolean
  mostrarBotonCabecera?: boolean
  pestaniasCabecera?: boolean
  mostrarFiltros?: boolean
  cantidadFiltros?: number
  mostrarCabeceraListado?: boolean
  tituloListado?: string
  etiquetaTotal?: string
  mostrarBotonListado?: boolean
  mostrarBadgesListado?: boolean
}

export function EsqueletoListadoGeneral({
  titulo,
  subtitulo,
  tipo = 'general',
  columnas = ['Nombre / Registro', 'Entidad / Institución', 'Fechas / Periodo', 'Estado', 'Acciones'],
  mostrarCabeceraPagina = true,
  mostrarBotonCabecera = false,
  pestaniasCabecera = false,
  mostrarFiltros = true,
  cantidadFiltros = 2,
  mostrarCabeceraListado = true,
  tituloListado,
  etiquetaTotal = 'Total registrado',
  mostrarBotonListado = false,
  mostrarBadgesListado = false,
}: EsqueletoListadoGeneralProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Cabecera Principal de Pagina */}
      {mostrarCabeceraPagina && (
        <>
          {pestaniasCabecera ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-md shrink-0" />
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{titulo}</h1>
                </div>
                {subtitulo ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">{subtitulo}</p>
                ) : (
                  <Skeleton className="h-4 w-72 sm:w-96" />
                )}
              </div>
              <div className="bg-muted/60 p-1 sm:p-1.5 rounded-xl border border-border/60 grid grid-cols-2 gap-1 w-full sm:w-auto">
                <Skeleton className="h-8 w-28 sm:w-36 rounded-lg" />
                <Skeleton className="h-8 w-28 sm:w-36 rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{titulo}</h1>
                {subtitulo ? (
                  <p className="text-sm text-muted-foreground">{subtitulo}</p>
                ) : (
                  <Skeleton className="h-4 w-72 sm:w-96" />
                )}
              </div>
              {mostrarBotonCabecera && (
                <Skeleton className="h-9 w-full sm:w-36 rounded-lg shrink-0" />
              )}
            </div>
          )}
        </>
      )}

      {/* 2. Barra de Filtros */}
      {mostrarFiltros && (
        <div className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-sm space-y-3 min-w-0">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 justify-end">
              {Array.from({ length: cantidadFiltros }).map((_, idx) => (
                <Skeleton
                  key={`filtro-skel-${idx}`}
                  className="h-9 w-full sm:w-[155px] rounded-md"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Cabecera del Listado (CabeceraListado: Titulo de seccion, conteo y boton de accion) */}
      {mostrarCabeceraListado && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {tituloListado || titulo}
              </h2>
              {mostrarBadgesListado && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-32 rounded-full" />
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{etiquetaTotal}:</span>
              <Skeleton className="h-3.5 w-10 rounded-sm" />
            </div>
          </div>
          {mostrarBotonListado && (
            <Skeleton className="h-9 w-full sm:w-36 rounded-lg shrink-0" />
          )}
        </div>
      )}

      {/* 4. Vista Movil (Tarjetas) */}
      {tipo === 'convenios' ? (
        <EsqueletoTarjetasConvenios tarjetas={3} />
      ) : tipo === 'proyectos' ? (
        <EsqueletoTarjetasProyectos tarjetas={3} />
      ) : tipo === 'tutores-practicas' ? (
        <EsqueletoTarjetasTutoresPracticas tarjetas={3} />
      ) : tipo === 'tutores-vcs' ? (
        <EsqueletoTarjetasTutoresVcs tarjetas={3} />
      ) : (
        <EsqueletoTarjetasEstudiantes tarjetas={3} />
      )}

      {/* 5. Vista Escritorio (Tabla) */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columnas.map((col, idx) => (
                <TableHead
                  key={`th-${idx}`}
                  className={`font-semibold text-foreground ${
                    idx === columnas.length - 1 ? 'text-right' : idx === columnas.length - 2 ? 'text-center' : ''
                  }`}
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipo === 'estudiantes' ? (
              <EsqueletoFilasTablaEstudiantes filas={5} mostrarColumnaCarrera={false} />
            ) : tipo === 'convenios' ? (
              <EsqueletoFilasTablaConvenios filas={5} />
            ) : tipo === 'proyectos' ? (
              <EsqueletoFilasTablaProyectos filas={5} />
            ) : tipo === 'tutores-practicas' ? (
              <EsqueletoFilasTablaTutoresPracticas filas={5} />
            ) : tipo === 'tutores-vcs' ? (
              <EsqueletoFilasTablaTutoresVcs filas={5} />
            ) : tipo === 'asignaciones-vcs' ? (
              <EsqueletoFilasTablaAsignacionesVcs filas={5} />
            ) : tipo === 'matriz-caces' ? (
              <EsqueletoFilasTablaMatrizCaces filas={5} />
            ) : (
              <EsqueletoFilasTablaEstudiantes filas={5} />
            )}
          </TableBody>
        </Table>
      </div>

      {/* 6. Paginador */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-44 rounded-md" />
      </div>
    </div>
  )
}

