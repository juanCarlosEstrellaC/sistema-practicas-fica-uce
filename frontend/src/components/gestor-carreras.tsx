'use client';

import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import {
  obtenerCarrerasPaginadasAccion,
  obtenerCarrerasAccion,
  crearCarreraAccion,
  actualizarCarreraAccion,
  eliminarCarreraAccion,
} from '@/lib/acciones/carrera.acciones'
import { obtenerUsuariosPaginadosAccion } from '@/lib/acciones/usuario.acciones'
import { CarreraDto, UsuarioDto } from '@/lib/tipos/pp/general-pp'
import { RespuestaPaginada } from '@/lib/tipos/general'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Paginador } from '@/components/paginador'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Search, X, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CabeceraListado } from '@/components/comunes/cabecera-listado'
import { EsqueletoFilasTablaCarreras, EsqueletoTarjetasCarreras } from '@/components/esqueletos/esqueleto-tabla'

export interface GestorCarrerasProps {
  carrerasIniciales?: RespuestaPaginada<CarreraDto>;
}

export function GestorCarreras({ carrerasIniciales }: GestorCarrerasProps) {
  const [pagina, setPagina] = useState(0)
  const [elementosPorPagina, setElementosPorPagina] = useState(10)
  const [idParaEliminar, setIdParaEliminar] = useState<string | number | null>(null)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [carreraEnEdicion, setCarreraEnEdicion] = useState<CarreraDto | null>(null)

  const [directores, setDirectores] = useState<UsuarioDto[]>([])
  const [coordinadores, setCoordinadores] = useState<UsuarioDto[]>([])
  const [todasLasCarreras, setTodasLasCarreras] = useState<CarreraDto[]>([])

  const esPrimerMontaje = useRef(true)
  const [carrerasDatos, setCarrerasDatos] = useState<RespuestaPaginada<CarreraDto>>(() => {
    if (carrerasIniciales) return carrerasIniciales;
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
  const [cargando, setCargando] = useState(!carrerasIniciales)
  const [estaPendiente, empezarTransicion] = useTransition()

  const cargarCarreras = useCallback(async (
    paginaActual: number,
    tamanioActual: number,
    busquedaActual: string
  ) => {
    setCargando(true)
    try {
      const respuesta = await obtenerCarrerasPaginadasAccion(
        paginaActual,
        tamanioActual,
        busquedaActual
      )
      setCarrerasDatos(respuesta)
    } catch (error) {
      toast.error('Error al cargar carreras')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarUsuariosYCatalogos()
  }, [])

  useEffect(() => {
    if (esPrimerMontaje.current) {
      esPrimerMontaje.current = false
      if (carrerasIniciales) return
    }
    cargarCarreras(pagina, elementosPorPagina, textoBusqueda)
  }, [pagina, elementosPorPagina, textoBusqueda, cargarCarreras, carrerasIniciales])

  const cargarUsuariosYCatalogos = async () => {
    try {
      const [resDirectores, resCoordinadores, resCarrerasGlobales] = await Promise.all([
        obtenerUsuariosPaginadosAccion({ rol: 'DIRECTOR_CARRERA', tamanio: 100 }),
        obtenerUsuariosPaginadosAccion({ rol: 'COORDINADOR_PRACTICAS', tamanio: 100 }),
        obtenerCarrerasAccion(0, 100),
      ])
      setDirectores(resDirectores.content || [])
      setCoordinadores(resCoordinadores.content || [])
      setTodasLasCarreras(resCarrerasGlobales.content || [])
    } catch (error) {
      console.error('Error al cargar directores o coordinadores:', error)
    }
  }

  const obtenerNombreDirector = useCallback(
    (carrera: any) => {
      const nombreDirecto = (carrera.directorNombre || carrera.director)?.trim()
      if (nombreDirecto) return nombreDirecto
      if (carrera.directorId && directores.length > 0) {
        const dir = directores.find((d: any) => String(d.id) === String(carrera.directorId))
        if (dir) return `${dir.nombres || ''} ${dir.apellidos || ''}`.trim() || null
      }
      return null
    },
    [directores]
  )

  const obtenerNombreCoordinador = useCallback(
    (carrera: any) => {
      const nombreDirecto = (carrera.coordinadorNombre || carrera.coordinador)?.trim()
      if (nombreDirecto) return nombreDirecto
      if (carrera.coordinadorId && coordinadores.length > 0) {
        const coo = coordinadores.find((c: any) => String(c.id) === String(carrera.coordinadorId))
        if (coo) return `${coo.nombres || ''} ${coo.apellidos || ''}`.trim() || null
      }
      return null
    },
    [coordinadores]
  )

  const [campoOrden, setCampoOrden] = useState<'nombre' | 'codigo' | 'horas' | 'horasVinculacion' | 'director' | 'coordinador'>('nombre');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: 'nombre' | 'codigo' | 'horas' | 'horasVinculacion' | 'director' | 'coordinador') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'nombre' | 'codigo' | 'horas' | 'horasVinculacion' | 'director' | 'coordinador') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const carrerasOrdenadas = useMemo(() => {
    const lista = carrerasDatos?.content || [];
    return [...lista].sort((a: any, b: any) => {
      if (campoOrden === 'nombre') {
        const nomA = (a.nombre || '').toLowerCase();
        const nomB = (b.nombre || '').toLowerCase();
        return direccionOrden === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      } else if (campoOrden === 'codigo') {
        const codA = (a.codigoCarrera || '').toLowerCase();
        const codB = (b.codigoCarrera || '').toLowerCase();
        return direccionOrden === 'asc' ? codA.localeCompare(codB) : codB.localeCompare(codA);
      } else if (campoOrden === 'horas') {
        const horA = a.horasPractica || 0;
        const horB = b.horasPractica || 0;
        return direccionOrden === 'asc' ? horA - horB : horB - horA;
      } else if (campoOrden === 'horasVinculacion') {
        const horA = a.horasProyectosComunitarios || 0;
        const horB = b.horasProyectosComunitarios || 0;
        return direccionOrden === 'asc' ? horA - horB : horB - horA;
      } else if (campoOrden === 'director') {
        const nomA = (obtenerNombreDirector(a) || '').toLowerCase();
        const nomB = (obtenerNombreDirector(b) || '').toLowerCase();
        return direccionOrden === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      } else {
        const nomA = (obtenerNombreCoordinador(a) || '').toLowerCase();
        const nomB = (obtenerNombreCoordinador(b) || '').toLowerCase();
        return direccionOrden === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      }
    });
  }, [carrerasDatos, campoOrden, direccionOrden, obtenerNombreDirector, obtenerNombreCoordinador]);

  const totalPaginas = carrerasDatos?.totalPages || 0
  const totalCarreras = carrerasDatos?.totalElements || 0

  const directoresAsignados = todasLasCarreras
    .map((c: any) => String(c.directorId))
    .filter((id: string) => id && id !== 'undefined' && id !== 'null')

  const directoresDisponibles = directores.filter((u: any) => {
    if (carreraEnEdicion && String(carreraEnEdicion.directorId) === String(u.id)) return true
    if (directoresAsignados.includes(String(u.id))) return false
    return true
  })

  const coordinadoresAsignados = todasLasCarreras
    .map((c: any) => String(c.coordinadorId))
    .filter((id: string) => id && id !== 'undefined' && id !== 'null')

  const coordinadoresDisponibles = coordinadores.filter((u: any) => {
    if (carreraEnEdicion && String(carreraEnEdicion.coordinadorId) === String(u.id)) return true
    if (coordinadoresAsignados.includes(String(u.id))) return false
    return true
  })

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const rawDirectorId = formData.get('directorId')
    const rawCoordinadorId = formData.get('coordinadorId')

    const datosCarrera: any = {
      nombre: (formData.get('nombre') as string)?.trim(),
      codigoCarrera: (formData.get('codigoCarrera') as string)?.trim(),
      ciudadCarrera: (formData.get('ciudadCarrera') as string)?.trim(),
      horasPractica: Number(formData.get('horasPractica')),
      horasProyectosComunitarios: Number(formData.get('horasProyectosComunitarios')) || 160,
    }

    if (datosCarrera.horasPractica <= 0 || datosCarrera.horasProyectosComunitarios <= 0) {
      setErrorServidor('Las horas de prácticas y vinculación deben ser mayores a cero.');
      return;
    }
    if (datosCarrera.horasPractica > 500 || datosCarrera.horasProyectosComunitarios > 500) {
      setErrorServidor('Las horas de prácticas y vinculación no pueden exceder las 500 horas.');
      return;
    }

    if (rawDirectorId && rawDirectorId !== 'none' && rawDirectorId !== 'null') {
      datosCarrera.directorId = String(rawDirectorId)
    } else {
      datosCarrera.directorId = null
    }

    if (rawCoordinadorId && rawCoordinadorId !== 'none' && rawCoordinadorId !== 'null') {
      datosCarrera.coordinadorId = String(rawCoordinadorId)
    } else {
      datosCarrera.coordinadorId = null
    }

    empezarTransicion(async () => {
      setErrorServidor(null)
      if (carreraEnEdicion) {
        const resultado = await actualizarCarreraAccion(carreraEnEdicion.id, datosCarrera)
        if (resultado.exito) {
          toast.success('Carrera actualizada')
          setModalAbierto(false)
          cargarCarreras(pagina, elementosPorPagina, textoBusqueda)
          cargarUsuariosYCatalogos()
        } else {
          const mensaje = resultado.mensaje || ''
          const mensajeMin = mensaje.toLowerCase()
          if (mensajeMin.includes('codigo') && (mensajeMin.includes('duplicat') || mensajeMin.includes('unique') || mensajeMin.includes('duplicad') || mensajeMin.includes('registrado'))) {
            setErrorServidor('El código de carrera ingresado ya se encuentra registrado.')
          } else {
            setErrorServidor(mensaje || 'Error al guardar la carrera: revisa que el código no esté duplicado.')
          }
        }
      } else {
        const resultado = await crearCarreraAccion(datosCarrera)
        if (resultado.exito) {
          toast.success('Carrera creada')
          setModalAbierto(false)
          cargarCarreras(pagina, elementosPorPagina, textoBusqueda)
          cargarUsuariosYCatalogos()
        } else {
          const mensaje = resultado.mensaje || ''
          const mensajeMin = mensaje.toLowerCase()
          if (mensajeMin.includes('codigo') && (mensajeMin.includes('duplicat') || mensajeMin.includes('unique') || mensajeMin.includes('duplicad') || mensajeMin.includes('registrado'))) {
            setErrorServidor('El código de carrera ingresado ya se encuentra registrado.')
          } else {
            setErrorServidor(mensaje || 'Error al guardar la carrera: revisa que el código no esté duplicado.')
          }
        }
      }
    })
  }

  const manejarEliminacion = async () => {
    if (!idParaEliminar) return
    empezarTransicion(async () => {
      const resultado = await eliminarCarreraAccion(idParaEliminar)
      if (resultado.exito) {
        toast.success('Carrera eliminada')
        cargarCarreras(pagina, elementosPorPagina, textoBusqueda)
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
        titulo="Directorio de Carreras"
        total={totalCarreras}
        etiquetaTotal="Total de carreras registradas"
        accion={
          <Button
            onClick={() => {
              setCarreraEnEdicion(null)
              setErrorServidor(null)
              cargarUsuariosYCatalogos()
              setModalAbierto(true)
            }}
            className="h-9 font-semibold shadow-xs w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" />
            Nueva Carrera
          </Button>
        }
      />

      {/* Barra de Filtros */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 shadow-xs min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between min-w-0">
          <div className="relative w-full sm:flex-1 min-w-0 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary shrink-0 pointer-events-none transition-colors" />
            <Input
              placeholder="Buscar por nombre o código de carrera..."
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
          {textoBusqueda && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTextoBusqueda('')
                setPagina(0)
              }}
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0 w-full sm:w-auto justify-center"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* 1. VISTA MÓVIL: Tarjetas Modulares (md:hidden) */}
      {cargando ? (
        <EsqueletoTarjetasCarreras tarjetas={elementosPorPagina ? Math.min(elementosPorPagina, 5) : 3} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {carrerasOrdenadas.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-card p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center opacity-60">
              <Search className="w-8 h-8 mb-2" />
              <p className="font-medium">No se encontraron carreras.</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                Intente ajustar los términos de búsqueda.
              </p>
            </div>
          </div>
        ) : (
          carrerasOrdenadas.map((carrera: any) => (
            <div
              key={carrera.id}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
            >
              {/* Cabecera Tarjeta: Nombre y Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-foreground leading-snug break-words">
                    {carrera.nombre}
                  </h3>
                  {carrera.ciudadCarrera && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {carrera.ciudadCarrera}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
                    {carrera.codigoCarrera || 'S/C'}
                  </Badge>
                  <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md" title="Horas de Prácticas Preprofesionales">
                    {carrera.horasPractica}h Prácticas
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md" title="Horas de Vinculación con la Sociedad">
                    {carrera.horasProyectosComunitarios ?? 160}h Vinculación
                  </span>
                </div>
              </div>

              {/* Roles Asignados (Director y Coordinador) */}
              <div className="grid grid-cols-1 gap-1.5 text-xs border-t border-b border-border/40 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Director:</span>
                  <span className="font-medium text-foreground truncate text-right">
                    {obtenerNombreDirector(carrera) || (
                      <span className="text-muted-foreground italic">No asignado</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Coordinador:</span>
                  <span className="font-medium text-foreground truncate text-right">
                    {obtenerNombreCoordinador(carrera) || (
                      <span className="text-muted-foreground italic">No asignado</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Acciones Táctiles */}
              <div className="grid grid-cols-2 gap-2 pt-1 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-xs font-medium text-primary hover:bg-primary/10 justify-center"
                  onClick={() => {
                    setCarreraEnEdicion(carrera)
                    setErrorServidor(null)
                    cargarUsuariosYCatalogos()
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
                  onClick={() => setIdParaEliminar(carrera.id)}
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

      {/* 2. VISTA ESCRITORIO: Tabla Unificada (hidden md:block) */}
      <div className="hidden md:block rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('nombre')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('nombre');
                  }
                }}
                aria-sort={campoOrden === 'nombre' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Carrera"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Carrera</span>
                  {renderIconoOrden('nombre')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('codigo')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('codigo');
                  }
                }}
                aria-sort={campoOrden === 'codigo' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Código"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Código</span>
                  {renderIconoOrden('codigo')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('horas')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('horas');
                  }
                }}
                aria-sort={campoOrden === 'horas' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Horas Prácticas"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Horas Prácticas</span>
                  {renderIconoOrden('horas')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('horasVinculacion')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('horasVinculacion');
                  }
                }}
                aria-sort={campoOrden === 'horasVinculacion' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Horas de Vinculación"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Horas Vinculación</span>
                  {renderIconoOrden('horasVinculacion')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('director')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('director');
                  }
                }}
                aria-sort={campoOrden === 'director' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Director de Carrera"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Director de Carrera</span>
                  {renderIconoOrden('director')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('coordinador')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('coordinador');
                  }
                }}
                aria-sort={campoOrden === 'coordinador' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Coordinador de Prácticas"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Coordinador de Prácticas</span>
                  {renderIconoOrden('coordinador')}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <EsqueletoFilasTablaCarreras filas={elementosPorPagina || 5} />
            ) : carrerasOrdenadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <Search className="w-8 h-8 mb-2" />
                    <p className="font-medium">No se encontraron carreras.</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      Intente ajustar los términos de búsqueda.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              carrerasOrdenadas.map((carrera: any) => (
                <TableRow key={carrera.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-snug">
                        {carrera.nombre}
                      </p>
                      {carrera.ciudadCarrera && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {carrera.ciudadCarrera}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                      {carrera.codigoCarrera || 'S/C'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold text-foreground">
                    {carrera.horasPractica}h
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold text-foreground">
                    {carrera.horasProyectosComunitarios ?? 160}h
                  </TableCell>
                  <TableCell>
                    {obtenerNombreDirector(carrera) ? (
                      <span className="text-sm font-medium text-foreground">
                        {obtenerNombreDirector(carrera)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No asignado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {obtenerNombreCoordinador(carrera) ? (
                      <span className="text-sm font-medium text-foreground">
                        {obtenerNombreCoordinador(carrera)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No asignado
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar carrera"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => {
                          setCarreraEnEdicion(carrera)
                          setErrorServidor(null)
                          cargarUsuariosYCatalogos()
                          setModalAbierto(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar carrera"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setIdParaEliminar(carrera.id)}
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

      <Dialog open={modalAbierto} onOpenChange={(abierto) => {
        if (!abierto) {
          setErrorServidor(null)
        }
        setModalAbierto(abierto)
      }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>{carreraEnEdicion ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={manejarEnvio} className="space-y-4">
            {errorServidor && (
              <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive rounded-md">
                {errorServidor}
              </div>
            )}
            <div className="space-y-2">
              <Label>Nombre de Carrera</Label>
              <Input name="nombre" defaultValue={carreraEnEdicion?.nombre} placeholder="Ej. Ingeniería en Computación" required />
            </div>
            <div className="space-y-2">
              <Label>Código de Carrera</Label>
              <Input name="codigoCarrera" defaultValue={carreraEnEdicion?.codigoCarrera} placeholder="Ej. 650611A02" />
            </div>
            <div className="space-y-2">
              <Label>Ciudad de Carrera</Label>
              <Input name="ciudadCarrera" defaultValue={carreraEnEdicion?.ciudadCarrera} placeholder="Ej. Distrito Metropolitano de Quito" />
            </div>
            <div className="space-y-2">
              <Label>Horas de Prácticas Requeridas</Label>
              <Input
                type="number"
                min={1}
                max={500}
                step={1}
                name="horasPractica"
                defaultValue={carreraEnEdicion?.horasPractica || 240}
                placeholder="Ej. 240"
                onKeyDown={(e) => {
                  if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Horas de Vinculación Requeridas</Label>
              <Input
                type="number"
                min={1}
                max={500}
                step={1}
                name="horasProyectosComunitarios"
                defaultValue={carreraEnEdicion?.horasProyectosComunitarios ?? 160}
                placeholder="Ej. 160"
                onKeyDown={(e) => {
                  if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Director de Carrera</Label>
              <Select name="directorId" defaultValue={carreraEnEdicion?.directorId ? String(carreraEnEdicion.directorId) : "none"}>
                <SelectTrigger><SelectValue placeholder="Seleccione un director" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {directoresDisponibles.map((d: any) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.nombres} {d.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Coordinador de Prácticas</Label>
              <Select name="coordinadorId" defaultValue={carreraEnEdicion?.coordinadorId ? String(carreraEnEdicion.coordinadorId) : "none"}>
                <SelectTrigger><SelectValue placeholder="Seleccione un coordinador" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {coordinadoresDisponibles.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombres} {c.apellidos}</SelectItem>
                  ))}
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
            <AlertDialogTitle>¿Eliminar carrera?</AlertDialogTitle>
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
