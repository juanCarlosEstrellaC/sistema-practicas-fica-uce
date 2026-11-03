"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SelectorPeriodo } from '@/components/selector-periodo'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PeriodoAcademico } from '@/lib/tipos/general'
import { PeriodoAcademicoDto } from '@/lib/tipos/pp/general-pp'
import { obtenerPeriodosAcademicosAccion } from '@/lib/acciones/periodo-academico.acciones'
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion'
import { useEffect, useState } from 'react'
import { PanelNotificaciones, type NotificacionItem } from './panel-notificaciones'

interface CabeceraDashboardProps {
  notificaciones: NotificacionItem[]
  alHacerClickNotificacion: (notif: NotificacionItem) => void
  alMarcarTodasComoLeidas?: () => void
  alAlternarMenuMovil?: () => void
  periodosIniciales?: (PeriodoAcademico | PeriodoAcademicoDto)[]
}

export function CabeceraDashboard({
  notificaciones,
  alHacerClickNotificacion,
  alMarcarTodasComoLeidas = () => { },
  alAlternarMenuMovil,
  periodosIniciales,
}: CabeceraDashboardProps) {
  const rutaActual = usePathname()
  const parametrosBusqueda = useSearchParams()
  const router = useRouter()
  const periodoIdUrl = parametrosBusqueda.get('periodoId')
  const [periodos, setPeriodos] = useState<(PeriodoAcademico | PeriodoAcademicoDto)[]>(periodosIniciales || [])
  const { usuario } = useAutenticacion()

  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('')

  useEffect(() => {
    if (periodosIniciales && periodosIniciales.length > 0) {
      setPeriodos(periodosIniciales)
      return
    }

    let cancelado = false
    obtenerPeriodosAcademicosAccion()
      .then((res) => {
        if (!cancelado && res.content) {
          setPeriodos(res.content)
        }
      })
      .catch((error) => console.error('Error al cargar periodos en cabecera:', error))

    return () => {
      cancelado = true
    }
  }, [periodosIniciales])

  useEffect(() => {
    if (periodos.length === 0) return

    if (periodoIdUrl) {
      const encontrado = periodos.find((p: any) => String(p.id) === periodoIdUrl)
      if (encontrado) {
        setPeriodoSeleccionado(String(encontrado.id))
        return
      }
    }

    // Si no hay periodoId en la URL o el provisto es inexistente, seleccionar el periodo activo por defecto
    const activo = periodos.find((p: any) => p.estado === 'ACTIVO') || periodos[0]
    if (activo) {
      setPeriodoSeleccionado(String(activo.id))
    }
  }, [periodoIdUrl, periodos])

  const manejarCambioPeriodo = (nuevoPeriodoId: string) => {
    setPeriodoSeleccionado(nuevoPeriodoId)
    const params = new URLSearchParams(parametrosBusqueda.toString())
    params.set('periodoId', nuevoPeriodoId)
    router.push(`${rutaActual}?${params.toString()}`)
  }

  // Lógica para determinar el título de módulo y las migas de pan
  const obtenerInfoNavegacion = () => {
    if (rutaActual.startsWith('/dashboard/vinculacion')) {
      if (rutaActual.includes('/asignaciones-existentes')) {
        return {
          modulo: 'Vinculación con la Sociedad',
          miga: 'Asignaciones Existentes',
          rutaMiga: '/dashboard/vinculacion/asignaciones-existentes',
        }
      }
      if (rutaActual.includes('/asignaciones')) {
        return {
          modulo: 'Vinculación con la Sociedad',
          miga: 'Asignar Estudiantes',
          rutaMiga: '/dashboard/vinculacion/asignaciones',
        }
      }
      if (rutaActual.includes('/proyectos-comunitarios')) {
        return {
          modulo: 'Vinculación con la Sociedad',
          miga: 'Gestión de Proyectos',
          rutaMiga: '/dashboard/vinculacion/proyectos-comunitarios',
        }
      }
      if (rutaActual.includes('/ingreso-datos')) {
        return {
          modulo: 'Vinculación con la Sociedad',
          miga: 'Ingreso de Datos',
          rutaMiga: '/dashboard/vinculacion/ingreso-datos',
        }
      }
      return {
        modulo: 'Vinculación con la Sociedad',
        miga: 'Panel Principal',
        rutaMiga: '/dashboard/vinculacion/proyectos-comunitarios',
      }
    }

    if (rutaActual.startsWith('/dashboard/configuracion')) {
      return {
        modulo: 'Configuración',
        miga: 'Perfil y Cuenta',
        rutaMiga: '/dashboard/configuracion',
      }
    }

    if (rutaActual.startsWith('/dashboard/administracion')) {
      return {
        modulo: 'Administración del Sistema',
        miga: 'Ingreso de Datos',
        rutaMiga: '/dashboard/administracion/ingreso-datos',
      }
    }

    if (rutaActual.startsWith('/dashboard/practicas')) {
      if (rutaActual.includes('/convenios')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Gestión de Convenios',
          rutaMiga: '/dashboard/practicas/convenios',
        }
      }
      if (rutaActual.includes('/estudiantes')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Estudiantes con Asignación',
          rutaMiga: '/dashboard/practicas/estudiantes',
        }
      }
      if (rutaActual.includes('/asignaciones')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Asignación de Carrera',
          rutaMiga: '/dashboard/practicas/asignaciones',
        }
      }
      if (rutaActual.includes('/tutores')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Tutores Académicos',
          rutaMiga: '/dashboard/practicas/tutores',
        }
      }
      if (rutaActual.includes('/matriz-caces')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Matriz CACES',
          rutaMiga: '/dashboard/practicas/matriz-caces',
        }
      }
      if (rutaActual.includes('/ingreso-datos')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Ingreso de Datos',
          rutaMiga: '/dashboard/practicas/ingreso-datos',
        }
      }
      if (rutaActual.includes('/progreso-general')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Progreso General',
          rutaMiga: '/dashboard/practicas/progreso-general',
        }
      }
      if (rutaActual.includes('/mi-practica')) {
        return {
          modulo: 'Prácticas Preprofesionales',
          miga: 'Mis Prácticas',
          rutaMiga: '/dashboard/practicas/mi-practica',
        }
      }
      return {
        modulo: 'Prácticas Preprofesionales',
        miga: 'Panel Principal',
        rutaMiga: '/dashboard/practicas/convenios',
      }
    }

    const moduloActual = parametrosBusqueda.get('modulo')
    if (rutaActual === '/dashboard') {
      if (moduloActual === 'pp') {
        return {
          modulo: 'Panel Principal',
          miga: 'Métricas de Prácticas Preprofesionales',
          rutaMiga: '/dashboard?modulo=pp',
        }
      }
      if (moduloActual === 'vcs') {
        return {
          modulo: 'Panel Principal',
          miga: 'Métricas de Vinculación con la Sociedad',
          rutaMiga: '/dashboard?modulo=vcs',
        }
      }
      return {
        modulo: 'Panel Principal',
        miga: 'Dashboard General',
        rutaMiga: '/dashboard',
      }
    }

    return {
      modulo: 'Panel Principal',
      miga: 'Dashboard General',
      rutaMiga: '/dashboard',
    }
  }

  const { modulo, miga } = obtenerInfoNavegacion()
  const numNotificacionesSinLeer = notificaciones.filter((n) => !n.leida).length

  return (
    <header className="h-10 flex items-center justify-between gap-2 sm:gap-4 px-0 shrink-0 min-w-0">
      {/* Información del Módulo y Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {alAlternarMenuMovil && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-muted-foreground shrink-0"
            onClick={alAlternarMenuMovil}
            title="Abrir menú de navegación"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground leading-tight truncate" title={modulo}>
            {modulo}
          </h2>

          <Breadcrumb className="truncate">
            <BreadcrumbList className="text-[10px] sm:text-[11px] text-muted-foreground leading-none flex-nowrap overflow-hidden">
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Inicio
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="shrink-0" />
              <BreadcrumbItem className="min-w-0 truncate">
                <BreadcrumbPage className="font-semibold text-foreground truncate block" title={miga}>
                  {miga}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Controles del Header: Selector de Periodo (solo roles administrativos/tutores) y Notificaciones */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {usuario?.rol !== 'ESTUDIANTE' && (
          <SelectorPeriodo
            periodoSeleccionado={periodoSeleccionado}
            onPeriodoChange={manejarCambioPeriodo}
            periodos={periodos}
            className="h-8 w-[120px] sm:w-[170px] text-xs bg-background"
          />
        )}

        {/* Notificaciones con Panel Lateral (Sheet) */}
        <PanelNotificaciones
          notificaciones={notificaciones}
          alHacerClickNotificacion={alHacerClickNotificacion}
          alMarcarTodasComoLeidas={alMarcarTodasComoLeidas}
        />
      </div>
    </header>
  )
}
