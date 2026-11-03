"use client"

import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  GraduationCap,
  Briefcase,
  Users,
  LayoutDashboard,
  Database,
  Sun,
  Moon,
  LogOut,
  X,
  Pin,
  Building2,
  Award,
  ClipboardCheck,
  UserPlus,
  UserCog,
  TrendingUp,
  FolderKanban,
  FolderHeart,
  FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatearNombreCorto } from '@/lib/utilidades/formato-texto'
import { type Usuario, type RolUsuario } from '@/lib/tipos/general'
import { Button } from '@/components/ui/button'
import { AvatarUsuario } from '@/components/comunes/avatar-usuario'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ElementoNavegacion {
  titulo: string
  ruta: string
  icono: React.ComponentType<{ className?: string }>
}

interface SeccionNavegacion {
  identificador: string
  titulo: string
  elementos: ElementoNavegacion[]
}

interface SidebarDashboardProps {
  colapsado: boolean
  alCambiarColapsado: (estado: boolean) => void
  menuMovilAbierto?: boolean
  alCerrarMenuMovil?: () => void
  usuario: Usuario
  tema: 'claro' | 'oscuro' | 'sistema'
  alAlternarTema: () => void
  alCambiarRol: (rol: RolUsuario) => void
  alRestablecerSimulacion: () => void
  alCerrarSesion: () => void
}

export function SidebarDashboard({
  colapsado,
  alCambiarColapsado,
  menuMovilAbierto = false,
  alCerrarMenuMovil,
  usuario,
  tema,
  alAlternarTema,
  alCambiarRol,
  alRestablecerSimulacion,
  alCerrarSesion,
}: SidebarDashboardProps) {
  const rutaActual = usePathname()
  const parametrosBusqueda = useSearchParams()
  const moduloActual = parametrosBusqueda.get('modulo')

  // Estado local para expansión al pasar el mouse (cuando el sidebar no está fijado)
  const [estaFlotandoHover, setEstaFlotandoHover] = useState(false)

  // El sidebar se muestra expandido si está fijado (!colapsado) o si el usuario pasa el mouse por encima (o en móvil cuando el menú está abierto)
  const estaExpandido = !colapsado || estaFlotandoHover || menuMovilAbierto

  // Definición de secciones y elementos con sus respectivos iconos dedicados
  const obtenerSeccionesPorRol = (rol: RolUsuario): SeccionNavegacion[] => {
    const seccionGeneral: SeccionNavegacion = {
      identificador: 'general',
      titulo: 'General',
      elementos: [
        { titulo: 'Dashboard General', ruta: '/dashboard', icono: LayoutDashboard },
      ],
    }

    switch (rol) {
      case 'SUBDECANO':
        return [
          seccionGeneral,
          {
            identificador: 'ppp',
            titulo: 'Prácticas Preprofesionales',
            elementos: [
              { titulo: 'Prácticas Asignadas', ruta: '/dashboard/practicas/estudiantes', icono: Users },
              { titulo: 'Tutores Académicos', ruta: '/dashboard/practicas/tutores', icono: UserCog },
              { titulo: 'Gestión de Convenios', ruta: '/dashboard/practicas/convenios', icono: Building2 },
              { titulo: 'Matriz CACES', ruta: '/dashboard/practicas/matriz-caces', icono: FileSpreadsheet },
            ],
          },
          {
            identificador: 'vcs',
            titulo: 'Vinculación con la Sociedad',
            elementos: [
              { titulo: 'Proyectos Asignados', ruta: '/dashboard/vinculacion/asignaciones-existentes', icono: ClipboardCheck },
              { titulo: 'Tutores Académicos', ruta: '/dashboard/vinculacion/tutores', icono: UserCog },
              { titulo: 'Gestión de Proyectos', ruta: '/dashboard/vinculacion/proyectos-comunitarios', icono: FolderKanban },
            ],
          },
          {
            identificador: 'administracion',
            titulo: 'Administración',
            elementos: [
              { titulo: 'Ingreso de datos', ruta: '/dashboard/administracion/ingreso-datos', icono: Database },
            ],
          },
        ]

      case 'DIRECTOR_CARRERA':
        return [
          seccionGeneral,
          {
            identificador: 'ppp',
            titulo: 'Prácticas Preprofesionales',
            elementos: [
              { titulo: 'Prácticas Asignadas', ruta: '/dashboard/practicas/estudiantes', icono: ClipboardCheck },
              { titulo: 'Tutores Académicos', ruta: '/dashboard/practicas/tutores', icono: UserCog },
              { titulo: 'Gestión de Convenios', ruta: '/dashboard/practicas/convenios', icono: Building2 },
              { titulo: 'Matriz CACES', ruta: '/dashboard/practicas/matriz-caces', icono: FileSpreadsheet },
            ],
          },
          {
            identificador: 'vcs',
            titulo: 'Vinculación con la Sociedad',
            elementos: [
              { titulo: 'Proyectos Asignados', ruta: '/dashboard/vinculacion/asignaciones-existentes', icono: ClipboardCheck },
              { titulo: 'Tutores Académicos', ruta: '/dashboard/vinculacion/tutores', icono: UserCog },
              { titulo: 'Gestión de Proyectos', ruta: '/dashboard/vinculacion/proyectos-comunitarios', icono: FolderKanban },
            ],
          },
        ]

      case 'COORDINADOR_PRACTICAS':
        return [
          seccionGeneral,
          {
            identificador: 'ppp',
            titulo: 'Prácticas Preprofesionales',
            elementos: [
              { titulo: 'Asignar Prácticas', ruta: '/dashboard/practicas/asignaciones', icono: UserPlus },
              { titulo: 'Prácticas Asignadas', ruta: '/dashboard/practicas/estudiantes', icono: Users },
              { titulo: 'Tutores Académicos', ruta: '/dashboard/practicas/tutores', icono: UserCog },
              { titulo: 'Gestión de Convenios', ruta: '/dashboard/practicas/convenios', icono: Building2 },
              { titulo: 'Matriz CACES', ruta: '/dashboard/practicas/matriz-caces', icono: FileSpreadsheet },
            ],
          },
          {
            identificador: 'vcs',
            titulo: 'Vinculación con la Sociedad',
            elementos: [
              { titulo: 'Asignar Proyectos', ruta: '/dashboard/vinculacion/asignaciones', icono: UserPlus },
              { titulo: 'Proyectos Asignados', ruta: '/dashboard/vinculacion/asignaciones-existentes', icono: ClipboardCheck },
              { titulo: 'Tutores Académicos', ruta: '/dashboard/vinculacion/tutores', icono: UserCog },
              { titulo: 'Gestión de Proyectos', ruta: '/dashboard/vinculacion/proyectos-comunitarios', icono: FolderKanban },
            ],
          },
        ]

      case 'TUTOR_ACADEMICO':
        return [
          seccionGeneral,
          {
            identificador: 'ppp',
            titulo: 'Prácticas Preprofesionales',
            elementos: [
              { titulo: 'Prácticas Asignadas', ruta: '/dashboard/practicas/estudiantes', icono: Users },
              { titulo: 'Gestión de Convenios', ruta: '/dashboard/practicas/convenios', icono: Building2 },
            ],
          },
          {
            identificador: 'vcs',
            titulo: 'Vinculación con la Sociedad',
            elementos: [
              { titulo: 'Proyectos Asignados', ruta: '/dashboard/vinculacion/asignaciones-existentes', icono: ClipboardCheck },
              { titulo: 'Gestión de Proyectos', ruta: '/dashboard/vinculacion/proyectos-comunitarios', icono: FolderKanban },
            ],
          },
        ]

      case 'ESTUDIANTE':
      default:
        return [
          seccionGeneral,
          {
            identificador: 'ppp',
            titulo: 'Prácticas Preprofesionales',
            elementos: [
              { titulo: 'Proceso General', ruta: '/dashboard/practicas/progreso-general', icono: TrendingUp },
              { titulo: 'Mis Prácticas', ruta: '/dashboard/practicas/mi-practica', icono: Briefcase },
            ],
          },
          {
            identificador: 'vcs',
            titulo: 'Vinculación con la Sociedad',
            elementos: [
              { titulo: 'Proceso General', ruta: '/dashboard/vinculacion/progreso-general', icono: TrendingUp },
              { titulo: 'Mis Proyectos', ruta: '/dashboard/vinculacion/mi-proyecto', icono: FolderHeart },
            ],
          },
        ]
    }
  }

  const secciones = obtenerSeccionesPorRol(usuario.rol)

  const verificarElementoActivo = (ruta: string): boolean => {
    if (ruta.includes('?modulo=')) {
      const [rutaBase, consulta] = ruta.split('?modulo=')
      return rutaActual === rutaBase && moduloActual === consulta
    }
    if (ruta === '/dashboard') {
      return rutaActual === '/dashboard' && !moduloActual
    }
    return rutaActual === ruta || rutaActual.startsWith(`${ruta}/`)
  }

  return (
    <>
      {/* 1. Backdrop móvil cuando el menú está abierto */}
      {menuMovilAbierto && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={alCerrarMenuMovil}
          aria-hidden="true"
        />
      )}

      {/* 2. Espaciador en Desktop: Mantiene el ancho reservado fijo en el layout */}
      <div
        className={cn(
          "hidden md:block shrink-0 transition-all duration-300 ease-in-out",
          colapsado ? "w-16" : "w-64"
        )}
        aria-hidden="true"
      />

      {/* 3. Barra lateral: En móvil es un Drawer deslizante; en desktop es fijo con expansión flotante en hover si no está fijado */}
      <TooltipProvider delayDuration={150}>
        <aside
          onMouseEnter={() => colapsado && setEstaFlotandoHover(true)}
          onMouseLeave={() => colapsado && setEstaFlotandoHover(false)}
          className={cn(
            "flex flex-col justify-between border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none transition-all duration-300 ease-in-out",
            // Desktop:
            "md:fixed md:top-0 md:left-0 md:h-screen md:translate-x-0",
            estaExpandido ? "md:w-64 md:p-3" : "md:w-16 md:py-3 md:px-2",
            colapsado && estaFlotandoHover ? "md:z-50 md:shadow-2xl" : "md:z-30",
            // Móvil: Drawer superpuesto fijo (SÓLO con sombra cuando está abierto para que no proyecte un degradado oscuro en el fondo)
            "fixed inset-y-0 left-0 z-50 h-screen w-64 p-3 md:shadow-none",
            menuMovilAbierto
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full shadow-none pointer-events-none md:pointer-events-auto"
          )}
        >
          {/* Cabecera / Marca institucional (alineada a h-10) */}
          <div className="flex items-center justify-between gap-2 h-10 shrink-0">
            <Link
              href="/dashboard"
              onClick={() => {
                setEstaFlotandoHover(false)
                alCerrarMenuMovil?.()
              }}
              className={cn(
                "flex items-center gap-2.5 overflow-hidden transition-all",
                !estaExpandido ? "md:justify-center md:w-full" : "justify-start"
              )}
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs shrink-0">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className={cn("flex flex-col truncate", !estaExpandido && "md:hidden")}>
                <span className="font-bold text-xs tracking-tight text-sidebar-foreground leading-tight">
                  Gestión de Prácticas
                </span>
                <span className="text-[9px] uppercase font-semibold text-sidebar-foreground/60 tracking-wider leading-none">
                  FICA - UCE
                </span>
              </div>
            </Link>

            {/* Botón Cerrar en móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-7 w-7 text-sidebar-foreground/70 hover:text-sidebar-foreground shrink-0 rounded-md"
              onClick={alCerrarMenuMovil}
              title="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Botón Fijar en Desktop (Estilo Mailtrap) */}
            {estaExpandido && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg shrink-0 transition-colors"
                    onClick={() => alCambiarColapsado(!colapsado)}
                    title={colapsado ? "Fijar menú lateral" : "Desfijar menú lateral"}
                  >
                    <Pin
                      className={cn(
                        "h-4 w-4 transition-all duration-200",
                        !colapsado
                          ? "fill-primary text-primary -rotate-45"
                          : "text-sidebar-foreground/60 rotate-0 hover:rotate-12"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">
                  {colapsado ? "Fijar barra lateral" : "Desfijar barra lateral"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Navegación Modular (con scroll independiente para no ocultar el pie) */}
          <nav className="flex-1 overflow-y-auto pr-0.5 my-2 flex flex-col gap-2 scrollbar-thin">
            {secciones.map((seccion, indice) => (
              <div key={seccion.identificador} className="flex flex-col gap-0.5">
                {/* Cabecera de la sección con altura uniforme (h-7 = 28px) colapsado y expandido para evitar desplazamiento vertical de los submenús */}
                {estaExpandido ? (
                  <div className="h-7 flex items-center px-3 text-[10px] font-bold text-sidebar-foreground/50 tracking-wider uppercase truncate">
                    {seccion.titulo}
                  </div>
                ) : (
                  <div className="h-7 flex items-center justify-center" aria-hidden="true">
                    {indice > 0 && <div className="w-8 h-px bg-sidebar-border/60" />}
                  </div>
                )}

                {/* Elementos con sus iconos dedicados */}
                <div className="flex flex-col gap-0.5">
                  {seccion.elementos.map((elemento) => {
                    const activo = verificarElementoActivo(elemento.ruta)
                    const IconoElemento = elemento.icono

                    return (
                      <div key={elemento.ruta}>
                        {/* Modo Colapsado (Rail de iconos estilo Mailtrap) */}
                        {!estaExpandido && (
                          <div className="hidden md:block">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={elemento.ruta}
                                  aria-label={elemento.titulo}
                                  onClick={() => {
                                    setEstaFlotandoHover(false)
                                    alCerrarMenuMovil?.()
                                  }}
                                  className={cn(
                                    "flex items-center justify-center h-9 w-9 mx-auto rounded-lg text-xs transition-all duration-200",
                                    activo
                                      ? "bg-primary/15 text-primary font-bold shadow-2xs"
                                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                  )}
                                >
                                  <IconoElemento className="h-4 w-4 shrink-0" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs font-semibold">
                                {elemento.titulo}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}

                        {/* Modo Expandido (Visible en móvil o en desktop expandido) */}
                        <div className={cn(!estaExpandido ? "md:hidden" : "block")}>
                          <Link
                            href={elemento.ruta}
                            onClick={() => {
                              setEstaFlotandoHover(false)
                              alCerrarMenuMovil?.()
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 h-9 rounded-lg text-xs font-medium transition-all duration-200 group",
                              activo
                                ? "bg-primary/15 text-primary font-bold shadow-2xs"
                                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <IconoElemento
                              className={cn(
                                "h-4 w-4 shrink-0 transition-transform duration-200",
                                activo
                                  ? "text-primary"
                                  : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground group-hover:scale-110"
                              )}
                            />
                            <span className="truncate">{elemento.titulo}</span>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Pie de la Barra Lateral: Siempre Visible (shrink-0) */}
          <div className="shrink-0 pt-2.5 border-t border-sidebar-border mt-auto flex flex-col gap-2">
            {/* Modo Expandido: Visible en móvil siempre, o en desktop si está expandido */}
            <div className={cn(!estaExpandido ? "md:hidden" : "block", "space-y-2")}>
              {/* Selector de rol y botón de restablecer */}
              <div className="flex items-center gap-1.5">
                <Select
                  value={usuario.rol}
                  onValueChange={(valor) => alCambiarRol(valor as RolUsuario)}
                >
                  <SelectTrigger className="h-8 text-xs bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground flex-1 truncate">
                    <SelectValue placeholder="Rol de simulación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUBDECANO">Subdecano</SelectItem>
                    <SelectItem value="DIRECTOR_CARRERA">Director de Carrera</SelectItem>
                    <SelectItem value="COORDINADOR_PRACTICAS">Coordinador Prácticas</SelectItem>
                    <SelectItem value="TUTOR_ACADEMICO">Tutor Académico</SelectItem>
                    <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                  </SelectContent>
                </Select>
{/* 
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-[11px] font-bold px-2.5 shrink-0 bg-red-600 hover:bg-red-700 active:scale-95"
                  onClick={alRestablecerSimulacion}
                  title="Restablecer datos de simulación"
                >
                  Restablecer
                </Button> */}
              </div>

              {/* Tarjeta de Usuario */}
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-sidebar-accent/40 border border-sidebar-border/70">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-left truncate flex-1 hover:opacity-80 transition-opacity p-0.5 outline-hidden">
                      <AvatarUsuario
                        nombre={usuario.nombre}
                        urlFoto={usuario.avatar}
                        tamano="xs"
                        className="border border-sidebar-border"
                      />
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-sidebar-foreground leading-tight truncate">
                          {formatearNombreCorto(usuario.nombre)}
                        </span>
                        <span className="text-[9px] font-medium text-sidebar-foreground/60 uppercase tracking-tight truncate">
                          {usuario.rol.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel className="text-xs">
                      <p className="font-bold text-foreground">{usuario.nombre}</p>
                      <p className="text-[10px] text-muted-foreground font-normal truncate">{usuario.correo}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/configuracion"
                        onClick={() => {
                          setEstaFlotandoHover(false)
                          alCerrarMenuMovil?.()
                        }}
                        className="text-xs cursor-pointer"
                      >
                        Configuración de cuenta
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={alCerrarSesion}
                      className="text-xs text-destructive focus:bg-destructive/10 cursor-pointer font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Alternador de Tema Claro / Oscuro */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md shrink-0"
                      onClick={alAlternarTema}
                      title="Cambiar tema"
                    >
                      {tema === 'oscuro' ? (
                        <Sun className="h-4 w-4 text-amber-400" />
                      ) : (
                        <Moon className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Alternar tema
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Modo Colapsado: Solo visible en Desktop si NO está expandido */}
            {!estaExpandido && (
              <div className="hidden md:flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md"
                      onClick={alAlternarTema}
                    >
                      {tema === 'oscuro' ? (
                        <Sun className="h-4 w-4 text-amber-400" />
                      ) : (
                        <Moon className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    Alternar tema
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full outline-hidden hover:ring-2 hover:ring-primary/40 transition-all">
                      <AvatarUsuario
                        nombre={usuario.nombre}
                        urlFoto={usuario.avatar}
                        tamano="sm"
                        className="border border-sidebar-border"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="right" className="w-56">
                    <DropdownMenuLabel className="text-xs">
                      <p className="font-bold text-foreground">{usuario.nombre}</p>
                      <p className="text-[10px] text-muted-foreground font-normal truncate">{usuario.correo}</p>
                      <p className="text-[10px] font-bold text-primary mt-1 uppercase">{usuario.rol.replace(/_/g, ' ')}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/configuracion"
                        onClick={() => alCerrarMenuMovil?.()}
                        className="text-xs cursor-pointer"
                      >
                        Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={alCerrarSesion}
                      className="text-xs text-destructive focus:bg-destructive/10 cursor-pointer font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </aside>
      </TooltipProvider>
    </>
  )
}
