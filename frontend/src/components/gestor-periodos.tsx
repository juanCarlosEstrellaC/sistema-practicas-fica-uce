'use client';

import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import {
  obtenerPeriodosPaginadosAccion,
  crearPeriodoAccion,
  actualizarPeriodoAccion,
  eliminarPeriodoAccion,
} from '@/lib/acciones/periodo-academico.acciones'
import { validarFechas } from '@/lib/utilidades/fechas'
import { PeriodoAcademico, RespuestaPaginada } from '@/lib/tipos/general'
import { PeriodoAcademicoDto } from '@/lib/tipos/pp/general-pp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Paginador } from '@/components/paginador'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Search, CheckCircle2, X, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CabeceraListado } from '@/components/comunes/cabecera-listado'
import { EsqueletoFilasTablaPeriodos, EsqueletoTarjetasPeriodos } from '@/components/esqueletos/esqueleto-tabla'
import { cn } from '@/lib/utils'

export interface GestorPeriodosProps {
  periodosIniciales?: RespuestaPaginada<PeriodoAcademico | PeriodoAcademicoDto>;
}

export function GestorPeriodos({ periodosIniciales }: GestorPeriodosProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [periodoEnEdicion, setPeriodoEnEdicion] = useState<PeriodoAcademicoDto | null>(null)
  const [fechaInicioValor, setFechaInicioValor] = useState<string>('')
  const [pagina, setPagina] = useState(0)
  const [elementosPorPagina, setElementosPorPagina] = useState(10)
  const [idParaEliminar, setIdParaEliminar] = useState<string | number | null>(null)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('all')
  const esPrimerMontaje = useRef(true)

  const [periodosDatos, setPeriodosDatos] = useState<RespuestaPaginada<any>>(() => {
    if (periodosIniciales) return periodosIniciales;
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    };
  })
  const [cargando, setCargando] = useState(!periodosIniciales)
  const [estaPendiente, empezarTransicion] = useTransition()

  const cargarPeriodos = useCallback(async (
    paginaActual: number,
    tamanioActual: number,
    busquedaActual: string,
    estadoActual: string
  ) => {
    setCargando(true)
    try {
      const respuesta = await obtenerPeriodosPaginadosAccion(
        paginaActual,
        tamanioActual,
        busquedaActual,
        estadoActual
      )
      setPeriodosDatos(respuesta)
    } catch (error) {
      toast.error('Error al cargar periodos académicos')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (esPrimerMontaje.current) {
      esPrimerMontaje.current = false
      if (periodosIniciales) return
    }
    cargarPeriodos(pagina, elementosPorPagina, textoBusqueda, filtroEstado)
  }, [pagina, elementosPorPagina, textoBusqueda, filtroEstado, cargarPeriodos, periodosIniciales])

  const periodosPaginados = (periodosDatos?.content || []) as any[]
  const totalPaginas = periodosDatos?.totalPages || 0
  const totalPeriodos = periodosDatos?.totalElements || 0
  const activos = periodosPaginados.filter((p: any) => p.estado === 'ACTIVO').length

  const [campoOrden, setCampoOrden] = useState<'nombre' | 'fechaInicio' | 'fechaFin' | 'estado'>('nombre');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: 'nombre' | 'fechaInicio' | 'fechaFin' | 'estado') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'nombre' | 'fechaInicio' | 'fechaFin' | 'estado') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const periodosOrdenados = useMemo(() => {
    const lista = (periodosDatos?.content || []) as any[];
    return [...lista].sort((a: any, b: any) => {
      let valA = '';
      let valB = '';
      if (campoOrden === 'nombre') {
        valA = (a.nombre || '').toLowerCase();
        valB = (b.nombre || '').toLowerCase();
      } else if (campoOrden === 'fechaInicio') {
        valA = a.fechaInicio || '';
        valB = b.fechaInicio || '';
      } else if (campoOrden === 'fechaFin') {
        valA = a.fechaFin || '';
        valB = b.fechaFin || '';
      } else {
        valA = (a.estado || '').toLowerCase();
        valB = (b.estado || '').toLowerCase();
      }
      return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [periodosDatos?.content, campoOrden, direccionOrden]);

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const fechaInicio = formData.get('fechaInicio') as string
    const fechaFin = formData.get('fechaFin') as string

    const errorFecha = validarFechas(fechaInicio, fechaFin)
    if (errorFecha) {
      toast.error(errorFecha)
      return
    }

    const datosPeriodo = {
      nombre: (formData.get('nombre') as string)?.trim(),
      fechaInicio,
      fechaFin,
      estado: formData.get('estado') as string,
    }

    empezarTransicion(async () => {
      if (periodoEnEdicion) {
        const resultado = await actualizarPeriodoAccion(periodoEnEdicion.id, datosPeriodo)
        if (resultado.exito) {
          toast.success('Periodo actualizado')
          setModalAbierto(false)
          cargarPeriodos(pagina, elementosPorPagina, textoBusqueda, filtroEstado)
        } else {
          toast.error(resultado.mensaje || 'Error al guardar')
        }
      } else {
        const resultado = await crearPeriodoAccion(datosPeriodo)
        if (resultado.exito) {
          toast.success('Periodo creado')
          setModalAbierto(false)
          cargarPeriodos(pagina, elementosPorPagina, textoBusqueda, filtroEstado)
        } else {
          toast.error(resultado.mensaje || 'Error al guardar')
        }
      }
    })
  }

  const manejarEliminacion = async () => {
    if (!idParaEliminar) return
    empezarTransicion(async () => {
      const resultado = await eliminarPeriodoAccion(idParaEliminar)
      if (resultado.exito) {
        toast.success('Periodo eliminado')
        cargarPeriodos(pagina, elementosPorPagina, textoBusqueda, filtroEstado)
      } else {
        toast.error(resultado.mensaje || 'Error al eliminar')
      }
      setIdParaEliminar(null)
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabecera de Listado con Métrica Compacta */}
      <CabeceraListado
        titulo="Periodos Académicos"
        total={totalPeriodos}
        etiquetaTotal="Total de periodos registrados"
        metricasExtra={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activos} Activos</span>
          </span>
        }
        accion={
          <Button
            onClick={() => {
              setPeriodoEnEdicion(null)
              setFechaInicioValor('')
              setModalAbierto(true)
            }}
            className="h-9 font-semibold shadow-xs w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" />
            Nuevo Periodo
          </Button>
        }
      />

      {/* Barra de Filtros en Servidor */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between min-w-0">
          <div className="relative w-full sm:flex-1 min-w-0 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary shrink-0 pointer-events-none transition-colors" />
            <Input
              placeholder="Buscar por nombre de periodo..."
              className="pl-9 pr-9 h-9 w-full bg-background border-border placeholder:truncate text-xs sm:text-sm"
              value={textoBusqueda}
              onChange={(e) => {
                setTextoBusqueda(e.target.value)
                setPagina(0)
              }}
            />
            {textoBusqueda && (
              <button
                type="button"
                onClick={() => {
                  setTextoBusqueda('')
                  setPagina(0)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/80 transition-all rounded-md"
                title="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end min-w-0">
            <div className="w-full sm:w-[170px] min-w-0">
              <Select
                value={filtroEstado}
                onValueChange={(val) => {
                  setFiltroEstado(val)
                  setPagina(0)
                }}
              >
                <SelectTrigger className="w-full h-9 bg-background border-border min-w-0">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="INACTIVO">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(textoBusqueda || filtroEstado !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTextoBusqueda('')
                  setFiltroEstado('all')
                  setPagina(0)
                }}
                className="h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0 w-full sm:w-auto justify-center"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 1. VISTA MÓVIL: Tarjetas Modulares (md:hidden) */}
      {cargando ? (
        <EsqueletoTarjetasPeriodos tarjetas={elementosPorPagina ? Math.min(elementosPorPagina, 5) : 3} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {periodosPaginados.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-card p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center opacity-60">
              <Search className="w-8 h-8 mb-2" />
              <p className="font-medium">No se encontraron periodos.</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                Intente ajustar los filtros de búsqueda.
              </p>
            </div>
          </div>
        ) : (
          periodosOrdenados.map((periodo: any) => (
            <div
              key={periodo.id}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
            >
              {/* Cabecera: Nombre y Estado */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-foreground truncate" title={periodo.nombre}>
                  {periodo.nombre}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shrink-0",
                    periodo.estado === 'ACTIVO'
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {periodo.estado}
                </Badge>
              </div>

              {/* Rango de Fechas Seguro */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs border-t border-b border-border/40 py-2.5">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="text-muted-foreground text-[11px] font-medium">Inicio:</span>
                  <span className="font-semibold text-foreground tabular-nums text-xs">{periodo.fechaInicio}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="text-muted-foreground text-[11px] font-medium">Fin:</span>
                  <span className="font-semibold text-foreground tabular-nums text-xs">{periodo.fechaFin}</span>
                </div>
              </div>

              {/* Acciones Táctiles Balanceadas */}
              <div className="grid grid-cols-2 gap-2 pt-1 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-xs font-medium text-primary hover:bg-primary/10 justify-center"
                  onClick={() => {
                    setPeriodoEnEdicion(periodo)
                    setFechaInicioValor(periodo.fechaInicio)
                    setModalAbierto(true)
                  }}
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-xs font-medium text-destructive hover:bg-destructive/10 justify-center"
                  onClick={() => setIdParaEliminar(periodo.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>Eliminar</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* 2. VISTA ESCRITORIO: Tabla Unificada con Datos de Servidor (hidden md:block) */}
      <div className="hidden md:block rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => alternarOrden('nombre')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('nombre');
                  }
                }}
                tabIndex={0}
                role="columnheader"
                aria-sort={campoOrden === 'nombre' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Nombre"
              >
                <div className="inline-flex items-center gap-1.5 group">
                  <span>Nombre</span>
                  {renderIconoOrden('nombre')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => alternarOrden('fechaInicio')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('fechaInicio');
                  }
                }}
                tabIndex={0}
                role="columnheader"
                aria-sort={campoOrden === 'fechaInicio' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Fecha Inicio"
              >
                <div className="inline-flex items-center justify-center gap-1.5 group">
                  <span>Fecha Inicio</span>
                  {renderIconoOrden('fechaInicio')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => alternarOrden('fechaFin')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('fechaFin');
                  }
                }}
                tabIndex={0}
                role="columnheader"
                aria-sort={campoOrden === 'fechaFin' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Fecha Fin"
              >
                <div className="inline-flex items-center justify-center gap-1.5 group">
                  <span>Fecha Fin</span>
                  {renderIconoOrden('fechaFin')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => alternarOrden('estado')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('estado');
                  }
                }}
                tabIndex={0}
                role="columnheader"
                aria-sort={campoOrden === 'estado' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Estado"
              >
                <div className="inline-flex items-center justify-center gap-1.5 group">
                  <span>Estado</span>
                  {renderIconoOrden('estado')}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <EsqueletoFilasTablaPeriodos filas={elementosPorPagina || 5} />
            ) : periodosOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <Search className="w-8 h-8 mb-2" />
                    <p className="font-medium">No se encontraron periodos.</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      Intente ajustar los filtros de búsqueda.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              periodosOrdenados.map((periodo: any) => (
                <TableRow key={periodo.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-semibold text-sm text-foreground">
                    {periodo.nombre}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm text-muted-foreground">
                    {periodo.fechaInicio}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-sm text-muted-foreground">
                    {periodo.fechaFin}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                        periodo.estado === 'ACTIVO'
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {periodo.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar periodo"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => {
                          setPeriodoEnEdicion(periodo)
                          setFechaInicioValor(periodo.fechaInicio)
                          setModalAbierto(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar periodo"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setIdParaEliminar(periodo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Paginador
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onCambioPagina={setPagina}
        elementosPorPagina={elementosPorPagina}
        onCambioElementosPorPagina={(elementos) => {
          setElementosPorPagina(elementos)
          setPagina(0)
        }}
      />

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>{periodoEnEdicion ? 'Editar Periodo' : 'Nuevo Periodo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={manejarEnvio} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input name="nombre" defaultValue={periodoEnEdicion?.nombre} required placeholder="2026-2027" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <Input
                  type="date"
                  name="fechaInicio"
                  value={fechaInicioValor}
                  onChange={(e) => setFechaInicioValor(e.target.value)}
                  className="w-full min-w-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <Input
                  type="date"
                  name="fechaFin"
                  defaultValue={periodoEnEdicion?.fechaFin}
                  min={fechaInicioValor || new Date().toISOString().split('T')[0]}
                  className="w-full min-w-0"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select name="estado" defaultValue={periodoEnEdicion?.estado || 'ACTIVO'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button type="submit" disabled={estaPendiente}>
                {estaPendiente ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!idParaEliminar} onOpenChange={(abierto) => !abierto && setIdParaEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar periodo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={manejarEliminacion}
              disabled={estaPendiente}
            >
              {estaPendiente ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
