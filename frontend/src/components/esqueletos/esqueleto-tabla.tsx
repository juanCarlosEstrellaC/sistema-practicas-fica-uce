import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { TableRow, TableCell } from '@/components/ui/table'

/**
 * Esqueleto para filas de la tabla de usuarios en vista de escritorio
 */
export function EsqueletoFilasTablaUsuarios({ filas = 5 }: { filas?: number }) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-usuario-${indiceFila}`} className="hover:bg-transparent">
          {/* Columna Usuario (Avatar + Nombre y Correo) */}
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-32 sm:w-40" />
                <Skeleton className="h-3 w-44 sm:w-52" />
              </div>
            </div>
          </TableCell>

          {/* Columna Carrera */}
          <TableCell className="py-3">
            <Skeleton className="h-3.5 w-36 sm:w-44" />
          </TableCell>

          {/* Columna Rol */}
          <TableCell className="py-3">
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>

          {/* Columna Estado */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </TableCell>

          {/* Columna Acciones */}
          <TableCell className="py-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas de usuarios en vista móvil
 */
export function EsqueletoTarjetasUsuarios({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-usuario-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>

          <div className="border-t border-border/40 pt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de la tabla de carreras en vista de escritorio
 */
export function EsqueletoFilasTablaCarreras({ filas = 5 }: { filas?: number }) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-carrera-${indiceFila}`} className="hover:bg-transparent">
          {/* Carrera */}
          <TableCell className="py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-44 sm:w-56" />
              <Skeleton className="h-3 w-28" />
            </div>
          </TableCell>

          {/* Código */}
          <TableCell className="py-3">
            <Skeleton className="h-5 w-16 rounded-md font-mono" />
          </TableCell>

          {/* Horas Prácticas */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-4 w-12" />
            </div>
          </TableCell>

          {/* Horas Vinculación */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-4 w-12" />
            </div>
          </TableCell>

          {/* Director */}
          <TableCell className="py-3">
            <Skeleton className="h-3.5 w-32" />
          </TableCell>

          {/* Coordinador */}
          <TableCell className="py-3">
            <Skeleton className="h-3.5 w-32" />
          </TableCell>

          {/* Acciones */}
          <TableCell className="py-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas de carreras en vista móvil
 */
export function EsqueletoTarjetasCarreras({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-carrera-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-b border-border/40 py-2">
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3.5 w-12" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de la tabla de periodos en vista de escritorio
 */
export function EsqueletoFilasTablaPeriodos({ filas = 5 }: { filas?: number }) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-periodo-${indiceFila}`} className="hover:bg-transparent">
          {/* Periodo Académico */}
          <TableCell className="py-3">
            <Skeleton className="h-4 w-36 sm:w-48" />
          </TableCell>

          {/* Fecha Inicio */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-3.5 w-24" />
            </div>
          </TableCell>

          {/* Fecha Fin */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-3.5 w-24" />
            </div>
          </TableCell>

          {/* Estado */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </TableCell>

          {/* Acciones */}
          <TableCell className="py-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas de periodos en vista móvil
 */
export function EsqueletoTarjetasPeriodos({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-periodo-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="flex justify-between border-t border-b border-border/40 py-2.5">
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de la tabla de estudiantes con asignación (PP)
 */
export function EsqueletoFilasTablaEstudiantes({
  filas = 5,
  mostrarColumnaCarrera = false,
  mostrarColumnaAcciones = true,
}: {
  filas?: number
  mostrarColumnaCarrera?: boolean
  mostrarColumnaAcciones?: boolean
}) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-estudiante-${indiceFila}`} className="hover:bg-transparent">
          {/* Estudiante (Avatar + Nombre y Correo) */}
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-32 sm:w-44" />
                <Skeleton className="h-3 w-40 sm:w-48" />
              </div>
            </div>
          </TableCell>

          {/* Carrera (Opcional) */}
          {mostrarColumnaCarrera && (
            <TableCell className="py-3">
              <Skeleton className="h-3.5 w-36" />
            </TableCell>
          )}

          {/* Institución y Tutor */}
          <TableCell className="py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36 sm:w-44" />
              <Skeleton className="h-3 w-28 sm:w-32" />
            </div>
          </TableCell>

          {/* Horas y Barra de Progreso */}
          <TableCell className="py-3">
            <div className="space-y-1.5 w-28">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </TableCell>

          {/* Fase */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </TableCell>

          {/* Estado */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </TableCell>

          {/* Acciones */}
          {mostrarColumnaAcciones && (
            <TableCell className="py-3 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas móviles de estudiantes con asignación
 */
export function EsqueletoTarjetasEstudiantes({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-estudiante-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
          </div>

          <div className="border-t border-b border-border/40 py-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de la tabla de convenios
 */
export function EsqueletoFilasTablaConvenios({
  filas = 5,
  mostrarColumnaAcciones = true,
}: {
  filas?: number
  mostrarColumnaAcciones?: boolean
}) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-convenio-${indiceFila}`} className="hover:bg-transparent">
          {/* Institución y detalles */}
          <TableCell className="py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44 sm:w-60" />
              <Skeleton className="h-3 w-32" />
            </div>
          </TableCell>

          {/* Fechas / Vigencia */}
          <TableCell className="py-3 text-center">
            <div className="space-y-1 flex flex-col items-center">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>

          {/* Cupos */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-4 w-12" />
            </div>
          </TableCell>

          {/* Estado */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </TableCell>

          {/* Acciones */}
          {mostrarColumnaAcciones && (
            <TableCell className="py-3 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas de convenios en vista móvil
 */
export function EsqueletoTarjetasConvenios({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-convenio-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-40 sm:w-56" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
          </div>

          <Skeleton className="h-3.5 w-36" />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de la tabla de proyectos comunitarios (VCS)
 */
export function EsqueletoFilasTablaProyectos({
  filas = 5,
  puedeVerAcciones = true,
}: {
  filas?: number
  puedeVerAcciones?: boolean
}) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-proyecto-${indiceFila}`} className="hover:bg-transparent">
          {/* Nombre y tutor */}
          <TableCell className="py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48 sm:w-64" />
              <Skeleton className="h-3 w-36" />
            </div>
          </TableCell>

          {/* Beneficiarios y Horas */}
          <TableCell className="py-3">
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>

          {/* Fechas */}
          <TableCell className="py-3 text-center">
            <div className="space-y-1 flex flex-col items-center">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>

          {/* Estado */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </TableCell>

          {/* Acciones */}
          {puedeVerAcciones && (
            <TableCell className="py-3 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas de proyectos comunitarios en vista móvil
 */
export function EsqueletoTarjetasProyectos({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-proyecto-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-48 sm:w-60" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-32" />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de la tabla de matriz CACES
 */
export function EsqueletoFilasTablaMatrizCaces({ filas = 5 }: { filas?: number }) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-caces-${indiceFila}`} className="hover:bg-transparent">
          <TableCell className="py-3"><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell className="py-3 text-center"><Skeleton className="h-5 w-20 rounded-full mx-auto" /></TableCell>
          <TableCell className="py-3 text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
          <TableCell className="py-3 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="py-3 text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell className="py-3 text-right">
            <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para filas de la tabla de Tutores de Practicas (PP)
 */
export function EsqueletoFilasTablaTutoresPracticas({ filas = 5 }: { filas?: number }) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-tutor-pp-${indiceFila}`} className="hover:bg-transparent">
          {/* Docente / Tutor */}
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-36 sm:w-48" />
                <Skeleton className="h-3 w-40 sm:w-52" />
              </div>
            </div>
          </TableCell>

          {/* Estudiantes Asignados */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </TableCell>

          {/* Carga y Asignaciones */}
          <TableCell className="py-3">
            <div className="space-y-1.5 max-w-xs">
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </TableCell>

          {/* Acciones */}
          <TableCell className="py-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas de Tutores de Practicas en vista movil
 */
export function EsqueletoTarjetasTutoresPracticas({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-tutor-pp-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>

          <div className="border-t border-b border-border/40 py-2.5 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de la tabla de Carga Academica de Tutores (VCS)
 */
export function EsqueletoFilasTablaTutoresVcs({ filas = 5 }: { filas?: number }) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-tutor-vcs-${indiceFila}`} className="hover:bg-transparent">
          {/* Tutor Academico */}
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-36 sm:w-48" />
                <Skeleton className="h-3 w-40 sm:w-52" />
              </div>
            </div>
          </TableCell>

          {/* Asignados */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </TableCell>

          {/* Proyectos Asignados */}
          <TableCell className="py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-52 sm:w-64" />
              <Skeleton className="h-3 w-36" />
            </div>
          </TableCell>

          {/* Acciones */}
          <TableCell className="py-3 text-right">
            <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/**
 * Esqueleto para tarjetas de Tutores de VCS en vista movil
 */
export function EsqueletoTarjetasTutoresVcs({ tarjetas = 3 }: { tarjetas?: number }) {
  const listaTarjetas = Array.from({ length: tarjetas }, (_, indice) => indice)

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {listaTarjetas.map((indiceTarjeta) => (
        <div
          key={`esqueleto-tarjeta-tutor-vcs-${indiceTarjeta}`}
          className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-5 w-14 rounded-full shrink-0" />
          </div>

          <div className="border-t border-border/40 pt-2 space-y-1.5">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Esqueleto para filas de Asignaciones de Proyectos Comunitarios (VCS)
 */
export function EsqueletoFilasTablaAsignacionesVcs({ filas = 5 }: { filas?: number }) {
  const listaFilas = Array.from({ length: filas }, (_, indice) => indice)

  return (
    <>
      {listaFilas.map((indiceFila) => (
        <TableRow key={`esqueleto-asig-vcs-${indiceFila}`} className="hover:bg-transparent">
          {/* Estudiante */}
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-36 sm:w-44" />
                <Skeleton className="h-3 w-40 sm:w-48" />
              </div>
            </div>
          </TableCell>

          {/* Proyecto y Tutor */}
          <TableCell className="py-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-44 sm:w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
          </TableCell>

          {/* Horas / Avance */}
          <TableCell className="py-3">
            <div className="space-y-1.5 w-28">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          </TableCell>

          {/* Fase */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </TableCell>

          {/* Estado */}
          <TableCell className="py-3 text-center">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </TableCell>

          {/* Acciones */}
          <TableCell className="py-3 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

