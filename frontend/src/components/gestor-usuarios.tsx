'use client';

import { useState, useEffect, useRef, useCallback, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  obtenerUsuariosPaginadosAccion,
  obtenerEstadisticasUsuariosAccion,
  crearUsuarioAccion,
  actualizarUsuarioAccion,
  eliminarUsuarioAccion,
  cargaMasivaUsuariosAccion,
  reenviarActivacionUsuarioAccion,
} from '@/lib/acciones/usuario.acciones'
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones'
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion'
import { UsuarioDto, CarreraDto } from '@/lib/tipos/pp/general-pp'
import { RespuestaPaginada } from '@/lib/tipos/general'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Paginador } from '@/components/paginador'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Plus, Edit, Trash2, UploadCloud, Search, CheckCircle2, X, GraduationCap, Loader2, Mail, ArrowUpDown, ArrowUp, ArrowDown, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CabeceraListado } from '@/components/comunes/cabecera-listado'
import { CeldaUsuarioTabla } from '@/components/comunes/celda-usuario-tabla'
import { EsqueletoFilasTablaUsuarios, EsqueletoTarjetasUsuarios } from '@/components/esqueletos/esqueleto-tabla'
import { cn } from '@/lib/utils'

export interface GestorUsuariosProps {
  usuariosIniciales?: RespuestaPaginada<UsuarioDto>;
  estadisticasIniciales?: { total: number; estudiantes: number; personalAcademico: number };
  carrerasIniciales?: CarreraDto[];
  usuarioIdActual?: string | number;
}

export function GestorUsuarios({
  usuariosIniciales,
  estadisticasIniciales,
  carrerasIniciales,
  usuarioIdActual,
}: GestorUsuariosProps) {
  const router = useRouter()
  const { cerrarSesion } = useAutenticacion()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<UsuarioDto | null>(null)
  const [datosPendientesTransferencia, setDatosPendientesTransferencia] = useState<Partial<UsuarioDto> | null>(null)
  const [reenviandoId, setReenviandoId] = useState<number | null>(null)
  const [pagina, setPagina] = useState(0)
  const [elementosPorPagina, setElementosPorPagina] = useState(10)
  const [idParaEliminar, setIdParaEliminar] = useState<string | number | null>(null)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('all')
  const [filtroCarrera, setFiltroCarrera] = useState('all')
  const [filtroEstado, setFiltroEstado] = useState('ACTIVO')
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  // Carga CSV
  const [archivoCsv, setArchivoCsv] = useState<File | null>(null)
  const [arrastrandoCsv, setArrastrandoCsv] = useState(false)
  const [estaSubiendoCsv, setEstaSubiendoCsv] = useState(false)
  const [progresoCsv, setProgresoCsv] = useState(0)
  const referenciaArchivoCsv = useRef<HTMLInputElement>(null)

  const esPrimerMontaje = useRef(true)
  const [usuariosDatos, setUsuariosDatos] = useState<RespuestaPaginada<UsuarioDto>>(() => {
    if (usuariosIniciales) return usuariosIniciales;
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
  const [estadisticas, setEstadisticas] = useState(estadisticasIniciales || { total: 0, estudiantes: 0, personalAcademico: 0 })
  const [carreras, setCarreras] = useState<CarreraDto[]>(carrerasIniciales || [])
  const [cargando, setCargando] = useState(!usuariosIniciales)
  const [estaPendiente, empezarTransicion] = useTransition()

  const cargarUsuarios = useCallback(async (
    paginaActual: number,
    tamanioActual: number,
    busquedaActual: string,
    rolActual: string,
    carreraIdActual: string,
    estadoActual: string
  ) => {
    setCargando(true)
    try {
      const carreraNum = carreraIdActual !== 'all' ? parseInt(carreraIdActual, 10) : undefined
      const respuesta = await obtenerUsuariosPaginadosAccion({
        pagina: paginaActual,
        tamanio: tamanioActual,
        busqueda: busquedaActual,
        rol: rolActual,
        carreraId: carreraNum,
        estado: estadoActual,
      })
      setUsuariosDatos(respuesta)
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarEstadisticasYCatalogos = useCallback(async () => {
    try {
      const [resStats, resCarreras] = await Promise.all([
        obtenerEstadisticasUsuariosAccion(),
        obtenerCarrerasAccion(0, 100),
      ])
      setEstadisticas(resStats)
      setCarreras(resCarreras.content || [])
    } catch (error) {
      console.error('Error al cargar estadisticas y catalogos:', error)
    }
  }, [])

  useEffect(() => {
    if (esPrimerMontaje.current) {
      esPrimerMontaje.current = false
      if (!estadisticasIniciales || !carrerasIniciales) {
        cargarEstadisticasYCatalogos()
      }
      if (usuariosIniciales) return
    }
    cargarUsuarios(pagina, elementosPorPagina, textoBusqueda, filtroRol, filtroCarrera, filtroEstado)
  }, [
    pagina,
    elementosPorPagina,
    textoBusqueda,
    filtroRol,
    filtroCarrera,
    filtroEstado,
    cargarUsuarios,
    cargarEstadisticasYCatalogos,
    usuariosIniciales,
    estadisticasIniciales,
    carrerasIniciales,
  ])

  const [campoOrden, setCampoOrden] = useState<'usuario' | 'carrera' | 'rol' | 'estado'>('usuario');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: 'usuario' | 'carrera' | 'rol' | 'estado') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'usuario' | 'carrera' | 'rol' | 'estado') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const usuariosOrdenados = useMemo(() => {
    const lista = usuariosDatos?.content || [];
    return [...lista].sort((a: any, b: any) => {
      if (campoOrden === 'usuario') {
        const nomA = `${a.nombres || ''} ${a.apellidos || ''}`.toLowerCase();
        const nomB = `${b.nombres || ''} ${b.apellidos || ''}`.toLowerCase();
        return direccionOrden === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      } else if (campoOrden === 'carrera') {
        const carA = (carreras.find((c: any) => c.id === a.carreraId)?.nombre || '').toLowerCase();
        const carB = (carreras.find((c: any) => c.id === b.carreraId)?.nombre || '').toLowerCase();
        return direccionOrden === 'asc' ? carA.localeCompare(carB) : carB.localeCompare(carA);
      } else if (campoOrden === 'rol') {
        const rolA = (a.rol || '').toLowerCase();
        const rolB = (b.rol || '').toLowerCase();
        return direccionOrden === 'asc' ? rolA.localeCompare(rolB) : rolB.localeCompare(rolA);
      } else {
        const estA = (a.estado || '').toLowerCase();
        const estB = (b.estado || '').toLowerCase();
        return direccionOrden === 'asc' ? estA.localeCompare(estB) : estB.localeCompare(estA);
      }
    });
  }, [usuariosDatos, carreras, campoOrden, direccionOrden]);

  const totalPaginas = usuariosDatos?.totalPages || 0
  const totalUsuarios = usuariosDatos?.totalElements ?? estadisticas.total
  const totalEstudiantes = estadisticas.estudiantes
  const personalAcademico = estadisticas.personalAcademico

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const datosUsuario: Partial<UsuarioDto> = {
      nombres: (formData.get('nombres') as string)?.trim(),
      apellidos: (formData.get('apellidos') as string)?.trim(),
      correo: (formData.get('correo') as string)?.trim(),
      identificacion: (formData.get('identificacion') as string)?.trim(),
      tipoIdentificacion: (formData.get('tipoIdentificacion') as 'CEDULA' | 'PASAPORTE') || 'CEDULA',
      rol: (formData.get('rol') as string) || (usuarioEnEdicion ? usuarioEnEdicion.rol : 'ESTUDIANTE'),
      estado: (formData.get('estado') as 'ACTIVO' | 'INACTIVO') || (usuarioEnEdicion ? (usuarioEnEdicion.estado as 'ACTIVO' | 'INACTIVO') : 'ACTIVO'),
      telefono: (formData.get('telefono') as string)?.trim(),
      carreraId: formData.get('carreraId') === 'none' ? undefined : ((formData.get('carreraId') as string) || undefined),
    }

    if (datosUsuario.correo && !datosUsuario.correo.endsWith('@uce.edu.ec')) {
      setErrorServidor('El correo debe pertenecer al dominio institucional @uce.edu.ec')
      return
    }

    if (
      usuarioEnEdicion &&
      datosUsuario.rol === 'SUBDECANO' &&
      usuarioEnEdicion.rol !== 'SUBDECANO'
    ) {
      setDatosPendientesTransferencia(datosUsuario)
      return
    }

    ejecutarGuardadoUsuario(datosUsuario)
  }

  const ejecutarGuardadoUsuario = (datosUsuario: Partial<UsuarioDto>) => {
    empezarTransicion(async () => {
      setErrorServidor(null)
      if (usuarioEnEdicion) {
        const esTransferenciaSubdecano =
          datosUsuario.rol === 'SUBDECANO' &&
          usuarioEnEdicion.rol !== 'SUBDECANO' &&
          (datosUsuario.estado || usuarioEnEdicion.estado) !== 'INACTIVO'

        const resultado = await actualizarUsuarioAccion(
          usuarioEnEdicion.id,
          datosUsuario,
          esTransferenciaSubdecano
        )
        if (resultado.exito) {
          setDatosPendientesTransferencia(null)
          setModalAbierto(false)
          if (esTransferenciaSubdecano) {
            toast.success('Subdecanato transferido exitosamente. Cerrando su sesión actual...')
            await cerrarSesion()
            window.location.href = '/'
            return
          }
          toast.success('Usuario actualizado')
          cargarUsuarios(pagina, elementosPorPagina, textoBusqueda, filtroRol, filtroCarrera, filtroEstado)
          cargarEstadisticasYCatalogos()
        } else {
          setDatosPendientesTransferencia(null)
          procesarError(resultado.mensaje)
        }
      } else {
        const resultado = await crearUsuarioAccion(datosUsuario)
        if (resultado.exito) {
          toast.success('Usuario creado. Se ha enviado el correo de activación institucional.')
          setModalAbierto(false)
          cargarUsuarios(pagina, elementosPorPagina, textoBusqueda, filtroRol, filtroCarrera, filtroEstado)
          cargarEstadisticasYCatalogos()
        } else {
          procesarError(resultado.mensaje)
        }
      }
    })
  }

  const procesarError = (mensajeOriginal?: string) => {
    const msg = (mensajeOriginal || '').toLowerCase()
    const esDuplicado = msg.includes('duplicat') || msg.includes('unique') || msg.includes('duplicad') || msg.includes('llave duplicada') || msg.includes('conflicto de integridad')
    if (esDuplicado) {
      if (msg.includes('identificacion') || msg.includes('cédula') || msg.includes('cedula')) {
        setErrorServidor('La identificación ingresada ya se encuentra registrada.')
      } else if (msg.includes('correo') || msg.includes('email')) {
        setErrorServidor('El correo ingresado ya se encuentra registrado.')
      } else {
        setErrorServidor('El correo o la identificación ingresados ya se encuentran registrados.')
      }
    } else {
      setErrorServidor(mensajeOriginal || 'Error al guardar el usuario. Revisa los datos.')
    }
  }

  const manejarEliminacion = async () => {
    if (!idParaEliminar) return
    if (usuarioIdActual !== undefined && String(idParaEliminar) === String(usuarioIdActual)) {
      toast.error('No puedes eliminar tu propia cuenta en sesión')
      setIdParaEliminar(null)
      return
    }
    empezarTransicion(async () => {
      const resultado = await eliminarUsuarioAccion(idParaEliminar)
      if (resultado.exito) {
        toast.success('Usuario eliminado')
        cargarUsuarios(pagina, elementosPorPagina, textoBusqueda, filtroRol, filtroCarrera, filtroEstado)
        cargarEstadisticasYCatalogos()
      } else {
        toast.error(resultado.mensaje || 'Error al eliminar')
      }
      setIdParaEliminar(null)
    })
  }

  const manejarReenvioActivacion = async (id: number, nombre: string) => {
    setReenviandoId(id)
    try {
      const resultado = await reenviarActivacionUsuarioAccion(id)
      if (resultado.exito) {
        toast.success(`Correo de activación reenviado a ${nombre}`)
      } else {
        toast.error(resultado.mensaje || 'Error al reenviar activación')
      }
    } catch {
      toast.error('Error al solicitar reenvío de activación')
    } finally {
      setReenviandoId(null)
    }
  }

  const manejarSubidaCsv = async () => {
    if (!archivoCsv) {
      toast.error('Por favor, selecciona un archivo CSV primero.')
      return
    }
    setEstaSubiendoCsv(true)
    setProgresoCsv(15)

    const intervaloProgreso = setInterval(() => {
      setProgresoCsv((anterior) => {
        if (anterior >= 85) {
          return 85
        }
        return anterior + 15
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('archivo', archivoCsv)
      const resultado = await cargaMasivaUsuariosAccion(formData)
      clearInterval(intervaloProgreso)

      if (resultado.exito) {
        setProgresoCsv(100)
        toast.success('Usuarios cargados exitosamente.')
        setTimeout(() => {
          setArchivoCsv(null)
          setModalAbierto(false)
          setProgresoCsv(0)
          setEstaSubiendoCsv(false)
          cargarUsuarios(pagina, elementosPorPagina, textoBusqueda, filtroRol, filtroCarrera, filtroEstado)
          cargarEstadisticasYCatalogos()
        }, 400)
      } else {
        clearInterval(intervaloProgreso)
        setProgresoCsv(0)
        setEstaSubiendoCsv(false)
        toast.error(resultado.mensaje || 'Hubo un error al cargar los usuarios.')
      }
    } catch (error) {
      clearInterval(intervaloProgreso)
      setProgresoCsv(0)
      setEstaSubiendoCsv(false)
      console.error(error)
      toast.error('Hubo un error al cargar los usuarios.')
    }
  }

  const rolAMostrar = (rol: string) => {
    switch (rol) {
      case 'COORDINADOR_PRACTICAS':
        return 'Coord. Prácticas'
      case 'DIRECTOR_CARRERA':
        return 'Dir. Carrera'
      case 'TUTOR_ACADEMICO':
        return 'Tutor Académico'
      case 'SUBDECANO':
        return 'Subdecano'
      case 'ESTUDIANTE':
        return 'Estudiante'
      default:
        return rol
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabecera de Listado con Métricas Compactas */}
      <CabeceraListado
        titulo="Directorio de Usuarios"
        total={totalUsuarios}
        etiquetaTotal="Total de usuarios registrados"
        metricasExtra={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{totalEstudiantes} Estudiantes</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{personalAcademico} Personal Académico</span>
            </span>
          </div>
        }
        accion={
          <Button
            onClick={() => {
              setUsuarioEnEdicion(null)
              setErrorServidor(null)
              setModalAbierto(true)
            }}
            className="h-9 font-semibold shadow-xs w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" />
            Cargar Usuarios
          </Button>
        }
      />

      {/* Barra de Filtros */}
      <div className="bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3 min-w-0">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0">
          <div className="relative w-full md:flex-1 min-w-0 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary shrink-0 pointer-events-none transition-colors" />
            <Input
              placeholder="Buscar por nombre, cédula o correo..."
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0 justify-end min-w-0">
            <div className="w-full sm:w-[160px] min-w-0">
              <Select
                value={filtroRol}
                onValueChange={(val) => {
                  setFiltroRol(val)
                  setPagina(0)
                }}
              >
                <SelectTrigger className="w-full h-9 bg-background border-border min-w-0">
                  <SelectValue placeholder="Rol" className="truncate text-left block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                  <SelectItem value="TUTOR_ACADEMICO">Tutor Académico</SelectItem>
                  <SelectItem value="DIRECTOR_CARRERA">Director de Carrera</SelectItem>
                  <SelectItem value="COORDINADOR_PRACTICAS">Coordinador Prácticas</SelectItem>
                  <SelectItem value="SUBDECANO">Subdecano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[200px] min-w-0">
              <Select
                value={filtroCarrera}
                onValueChange={(val) => {
                  setFiltroCarrera(val)
                  setPagina(0)
                }}
              >
                <SelectTrigger className="w-full h-9 bg-background border-border min-w-0">
                  <SelectValue placeholder="Carrera" className="truncate text-left block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las carreras</SelectItem>
                  {carreras.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[130px] min-w-0">
              <Select
                value={filtroEstado}
                onValueChange={(val) => {
                  setFiltroEstado(val)
                  setPagina(0)
                }}
              >
                <SelectTrigger className="w-full h-9 bg-background border-border min-w-0">
                  <SelectValue placeholder="Estado" className="truncate text-left block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="INACTIVO">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(textoBusqueda || filtroRol !== 'all' || filtroCarrera !== 'all' || filtroEstado !== 'ACTIVO') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTextoBusqueda('')
                  setFiltroRol('all')
                  setFiltroCarrera('all')
                  setFiltroEstado('ACTIVO')
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
        <EsqueletoTarjetasUsuarios tarjetas={elementosPorPagina ? Math.min(elementosPorPagina, 5) : 3} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {usuariosOrdenados.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-card p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center opacity-60">
              <Search className="w-8 h-8 mb-2" />
              <p className="font-medium">No se encontraron usuarios.</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                Intente ajustar los filtros de búsqueda.
              </p>
            </div>
          </div>
        ) : (
          usuariosOrdenados.map((usuario: any) => {
            const nombreCompleto = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || 'Usuario'
            const carreraAsignada = carreras.find((c: any) => c.id === usuario.carreraId)?.nombre || 'Sin asignar'
            const esElMismoUsuario = usuarioIdActual !== undefined && String(usuario.id) === String(usuarioIdActual)

            return (
              <div
                key={usuario.id}
                className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3"
              >
                {/* Cabecera Tarjeta: Usuario y Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CeldaUsuarioTabla
                      nombre={nombreCompleto}
                      identificacion={usuario.identificacion}
                      correo={usuario.correo}
                      urlAvatar={usuario.urlAvatar}
                    />
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "shrink-0 text-[10px]",
                      usuario.estado?.toUpperCase() === 'INACTIVO'
                        ? "bg-muted text-muted-foreground border-border"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    )}
                  >
                    {usuario.estado?.toUpperCase() === 'INACTIVO' ? 'Inactivo' : 'Activo'}
                  </Badge>
                </div>

                {/* Detalles: Carrera y Rol */}
                <div className="grid grid-cols-1 gap-1.5 text-xs border-t border-b border-border/40 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-[11px]">Rol:</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px]",
                        usuario.rol === 'COORDINADOR_PRACTICAS' && "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800",
                        usuario.rol === 'DIRECTOR_CARRERA' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                        usuario.rol === 'TUTOR_ACADEMICO' && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
                        usuario.rol === 'SUBDECANO' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                        usuario.rol === 'ESTUDIANTE' && "bg-primary/10 text-primary border-primary/20"
                      )}
                    >
                      {rolAMostrar(usuario.rol)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-[11px]">Carrera:</span>
                    <span className="font-medium text-foreground truncate text-right max-w-[200px]" title={carreraAsignada}>
                      {carreraAsignada}
                    </span>
                  </div>
                </div>

                {/* Acciones Táctiles */}
                <div className="flex items-center gap-2 pt-1 w-full">
                  {usuario.rol?.toUpperCase() !== 'SUBDECANO' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Reenviar activación"
                      className="h-9 w-9 text-sky-600 hover:bg-sky-500/10 dark:text-sky-400 shrink-0"
                      onClick={() => manejarReenvioActivacion(usuario.id, nombreCompleto)}
                      disabled={reenviandoId === usuario.id}
                    >
                      {reenviandoId === usuario.id ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : (
                        <Mail className="w-4 h-4 shrink-0" />
                      )}
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 text-xs font-medium text-primary hover:bg-primary/10 justify-center"
                      onClick={() => {
                        setUsuarioEnEdicion(usuario)
                        setErrorServidor(null)
                        setModalAbierto(true)
                      }}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full h-9 text-xs font-medium justify-center",
                        esElMismoUsuario
                          ? "text-muted-foreground/30 cursor-not-allowed hover:bg-transparent"
                          : "text-destructive hover:bg-destructive/10"
                      )}
                      disabled={esElMismoUsuario}
                      onClick={() => {
                        if (!esElMismoUsuario) {
                          setIdParaEliminar(usuario.id)
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
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
                onClick={() => alternarOrden('usuario')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('usuario');
                  }
                }}
                aria-sort={campoOrden === 'usuario' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Usuario"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Usuario</span>
                  {renderIconoOrden('usuario')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('carrera')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('carrera');
                  }
                }}
                aria-sort={campoOrden === 'carrera' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Carrera"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Carrera</span>
                  {renderIconoOrden('carrera')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('rol')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('rol');
                  }
                }}
                aria-sort={campoOrden === 'rol' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Rol"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Rol</span>
                  {renderIconoOrden('rol')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('estado')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('estado');
                  }
                }}
                aria-sort={campoOrden === 'estado' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Estado"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Estado</span>
                  {renderIconoOrden('estado')}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <EsqueletoFilasTablaUsuarios filas={elementosPorPagina || 5} />
            ) : usuariosOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <Search className="w-8 h-8 mb-2" />
                    <p className="font-medium">No se encontraron usuarios.</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      Intente ajustar los filtros de búsqueda.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              usuariosOrdenados.map((usuario: any) => {
                const nombreCompleto = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || 'Usuario'
                const carreraAsignada = carreras.find((c: any) => c.id === usuario.carreraId)?.nombre || 'Sin asignar'
                const esElMismoUsuario = usuarioIdActual !== undefined && String(usuario.id) === String(usuarioIdActual)

                return (
                  <TableRow key={usuario.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <CeldaUsuarioTabla
                        nombre={nombreCompleto}
                        identificacion={usuario.identificacion}
                        correo={usuario.correo}
                        urlAvatar={usuario.urlAvatar}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium max-w-[220px] truncate">
                      {carreraAsignada}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={cn(
                          usuario.rol === 'COORDINADOR_PRACTICAS' && "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800",
                          usuario.rol === 'DIRECTOR_CARRERA' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                          usuario.rol === 'TUTOR_ACADEMICO' && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
                          usuario.rol === 'SUBDECANO' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                          usuario.rol === 'ESTUDIANTE' && "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        {rolAMostrar(usuario.rol)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={cn(
                          usuario.estado?.toUpperCase() === 'INACTIVO'
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        )}
                      >
                        {usuario.estado?.toUpperCase() === 'INACTIVO' ? 'Inactivo' : 'Activo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {usuario.rol?.toUpperCase() !== 'SUBDECANO' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Reenviar correo de activación"
                            className="h-8 w-8 text-sky-600 hover:bg-sky-500/10 dark:text-sky-400"
                            onClick={() => manejarReenvioActivacion(usuario.id, nombreCompleto)}
                            disabled={reenviandoId === usuario.id}
                          >
                            {reenviandoId === usuario.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar usuario"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => {
                            setUsuarioEnEdicion(usuario)
                            setErrorServidor(null)
                            setModalAbierto(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={esElMismoUsuario ? "No puedes eliminar tu propia cuenta en sesión" : "Eliminar usuario"}
                          className={cn(
                            "h-8 w-8",
                            esElMismoUsuario
                              ? "text-muted-foreground/30 cursor-not-allowed hover:bg-transparent"
                              : "text-destructive hover:bg-destructive/10"
                          )}
                          disabled={esElMismoUsuario}
                          onClick={() => {
                            if (!esElMismoUsuario) {
                              setIdParaEliminar(usuario.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
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
          setArchivoCsv(null)
          setErrorServidor(null)
          setDatosPendientesTransferencia(null)
        }
        setModalAbierto(abierto)
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{usuarioEnEdicion ? 'Editar Usuario' : 'Cargar Usuarios'}</DialogTitle>
          </DialogHeader>

          {usuarioEnEdicion ? (
            <UsuarioFormulario
              usuarioEnEdicion={usuarioEnEdicion}
              carreras={carreras}
              manejarEnvio={manejarEnvio}
              alCancelar={() => setModalAbierto(false)}
              error={errorServidor}
              estaPendiente={estaPendiente}
              esMismoUsuario={usuarioIdActual !== undefined && String(usuarioEnEdicion.id) === String(usuarioIdActual)}
            />
          ) : (
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="masiva">Masiva (CSV)</TabsTrigger>
              </TabsList>
              <TabsContent value="individual" className="pt-4">
                <UsuarioFormulario
                  usuarioEnEdicion={usuarioEnEdicion}
                  carreras={carreras}
                  manejarEnvio={manejarEnvio}
                  alCancelar={() => setModalAbierto(false)}
                  error={errorServidor}
                  estaPendiente={estaPendiente}
                />
              </TabsContent>
              <TabsContent value="masiva" className="pt-2">
                <CardDescription className="mb-4">
                  Sube un archivo CSV con el formato: nombres, apellidos, correo, identificacion, rol, carrera_id
                </CardDescription>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={referenciaArchivoCsv}
                    disabled={estaSubiendoCsv}
                    onChange={(e) => {
                      const archivo = e.target.files?.[0]
                      if (archivo) {
                        setArchivoCsv(archivo)
                        toast.success("Archivo CSV preparado.")
                      }
                    }}
                  />
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-all cursor-pointer w-full overflow-hidden min-h-[120px] select-none",
                      arrastrandoCsv
                        ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/20 scale-[1.01]"
                        : archivoCsv
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-border hover:border-green-500/50 hover:bg-muted/30"
                    )}
                    onClick={() => !archivoCsv && !estaSubiendoCsv && referenciaArchivoCsv.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!archivoCsv && !estaSubiendoCsv) {
                        setArrastrandoCsv(true)
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return
                      setArrastrandoCsv(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setArrastrandoCsv(false)
                      if (!archivoCsv && !estaSubiendoCsv && e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const archivo = e.dataTransfer.files[0]
                        if (archivo.name.toLowerCase().endsWith('.csv')) {
                          setArchivoCsv(archivo)
                          toast.success(`Archivo CSV preparado: ${archivo.name}`)
                        } else {
                          toast.error("Solo se permiten archivos CSV")
                        }
                      }
                    }}
                  >
                    {archivoCsv ? (
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 items-center w-full text-green-600 dark:text-green-500 text-left">
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="text-sm font-medium truncate">{archivoCsv.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          disabled={estaSubiendoCsv}
                          onClick={(e) => {
                            e.stopPropagation()
                            setArchivoCsv(null)
                            if (referenciaArchivoCsv.current) referenciaArchivoCsv.current.value = ''
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 w-full text-center">
                        <UploadCloud
                          className={cn(
                            "w-8 h-8 shrink-0 mb-1 transition-all",
                            arrastrandoCsv ? "text-green-600 dark:text-green-400 scale-110" : "text-muted-foreground"
                          )}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {arrastrandoCsv ? "Suelta el archivo CSV aquí" : "Arrastra tu CSV aquí"}
                        </span>
                        <span className="text-xs text-muted-foreground">o haz clic para explorar en tus archivos</span>
                      </div>
                    )}
                  </div>

                  {estaSubiendoCsv && (
                    <div className="space-y-2 p-3.5 rounded-lg border border-primary/20 bg-primary/5 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-primary">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Procesando archivo CSV...
                        </span>
                        <span className="text-muted-foreground font-mono">{progresoCsv}%</span>
                      </div>
                      <Progress value={progresoCsv} className="h-2 w-full transition-all duration-300" />
                      <p className="text-[11px] text-muted-foreground text-center">
                        Registrando usuarios y despachando correos de activación en segundo plano
                      </p>
                    </div>
                  )}

                  <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" onClick={() => setModalAbierto(false)} disabled={estaSubiendoCsv}>
                      Cancelar
                    </Button>
                    <Button onClick={manejarSubidaCsv} disabled={estaSubiendoCsv || !archivoCsv} className="shadow-md">
                      {estaSubiendoCsv ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        'Procesar CSV'
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!idParaEliminar} onOpenChange={(abierto) => !abierto && setIdParaEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará al usuario permanentemente.</AlertDialogDescription>
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

      <AlertDialog
        open={!!datosPendientesTransferencia}
        onOpenChange={(abierto) => !abierto && setDatosPendientesTransferencia(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Transferir el cargo de Subdecano?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción promoverá a{' '}
              <span className="font-semibold text-foreground">
                {datosPendientesTransferencia?.nombres || usuarioEnEdicion?.nombres}{' '}
                {datosPendientesTransferencia?.apellidos || usuarioEnEdicion?.apellidos}
              </span>{' '}
              como nuevo Subdecano de la facultad, cambiará su cuenta actual al rol de Tutor Académico y cerrará su sesión inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={estaPendiente}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                if (datosPendientesTransferencia) {
                  ejecutarGuardadoUsuario(datosPendientesTransferencia)
                }
              }}
              disabled={estaPendiente}
            >
              {estaPendiente ? 'Transfiriendo...' : 'Confirmar transferencia'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface UsuarioFormularioProps {
  usuarioEnEdicion: UsuarioDto | null;
  carreras: CarreraDto[];
  manejarEnvio: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  alCancelar: () => void;
  error: string | null;
  estaPendiente: boolean;
  esMismoUsuario?: boolean;
}

function UsuarioFormulario({
  usuarioEnEdicion,
  carreras,
  manejarEnvio,
  alCancelar,
  error,
  estaPendiente,
  esMismoUsuario = false,
}: UsuarioFormularioProps) {
  const [rol, setRol] = useState(usuarioEnEdicion?.rol || 'ESTUDIANTE')

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {error && (
        <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive rounded-md">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombres</Label>
          <Input name="nombres" defaultValue={usuarioEnEdicion?.nombres} placeholder="Ej. Juan Andrés" required />
        </div>
        <div className="space-y-2">
          <Label>Apellidos</Label>
          <Input name="apellidos" defaultValue={usuarioEnEdicion?.apellidos} placeholder="Ej. Montero Lopez" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Correo</Label>
        <Input type="email" name="correo" defaultValue={usuarioEnEdicion?.correo} placeholder="ejemplo@uce.edu.ec" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo Documento</Label>
          <Select name="tipoIdentificacion" defaultValue={usuarioEnEdicion?.tipoIdentificacion || 'CEDULA'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CEDULA">Cédula</SelectItem>
              <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Identificación</Label>
          <Input name="identificacion" defaultValue={usuarioEnEdicion?.identificacion} placeholder="Ej. 1712345678" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input name="telefono" defaultValue={usuarioEnEdicion?.telefono} placeholder="Ej. 099 123 4567" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Rol</Label>
            {esMismoUsuario && (
              <span className="text-[11px] text-muted-foreground italic">No puede cambiar su propio rol</span>
            )}
          </div>
          {esMismoUsuario && <input type="hidden" name="rol" value={usuarioEnEdicion?.rol || 'SUBDECANO'} />}
          <Select name="rol" value={rol} onValueChange={setRol} disabled={esMismoUsuario}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
              <SelectItem value="TUTOR_ACADEMICO">Tutor Académico</SelectItem>
              <SelectItem value="DIRECTOR_CARRERA">Director de Carrera</SelectItem>
              <SelectItem value="COORDINADOR_PRACTICAS">Coordinador de Prácticas</SelectItem>
              <SelectItem value="SUBDECANO">Subdecano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Carrera Asociada</Label>
          <Select name="carreraId" defaultValue={usuarioEnEdicion?.carreraId ? String(usuarioEnEdicion.carreraId) : undefined} disabled={rol === 'SUBDECANO'}>
            <SelectTrigger><SelectValue placeholder="Seleccione una carrera" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin Asignar</SelectItem>
              {carreras.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Estado</Label>
            {esMismoUsuario && (
              <span className="text-[11px] text-muted-foreground italic">No puede desactivar su propia cuenta</span>
            )}
          </div>
          {esMismoUsuario && <input type="hidden" name="estado" value={usuarioEnEdicion?.estado || 'ACTIVO'} />}
          <Select name="estado" defaultValue={usuarioEnEdicion?.estado || 'ACTIVO'} disabled={esMismoUsuario}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {rol === 'SUBDECANO' && (!usuarioEnEdicion || usuarioEnEdicion.rol !== 'SUBDECANO') && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs animate-in fade-in duration-200">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
          <div className="space-y-0.5">
            <p className="font-semibold">Transferencia de Subdecanato</p>
            <p className="text-purple-700/90 dark:text-purple-300/90 leading-relaxed">
              {usuarioEnEdicion
                ? 'Al guardar este cambio de rol, este usuario asumirá el cargo de Subdecano, su cuenta actual pasará a Tutor Académico y su sesión se cerrará automáticamente.'
                : 'Al crear un nuevo usuario con rol Subdecano, se le enviará un enlace de activación institucional.'}
            </p>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={alCancelar}>Cancelar</Button>
        <Button type="submit" disabled={estaPendiente}>
          {estaPendiente ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogFooter>
    </form>
  )
}
