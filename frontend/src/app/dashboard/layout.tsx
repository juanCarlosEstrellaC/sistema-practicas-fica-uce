"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion'
import { useTema } from '@/lib/contextos/contexto-tema'
import { reiniciarSistemaApi } from '@/lib/servicios/sistema.servicio'
import { type RolUsuario } from '@/lib/tipos/general'
import { obtenerNotificacionesAccion, marcarNotificacionLeidaAccion, marcarTodasNotificacionesLeidasAccion } from '@/lib/acciones/notificacion.acciones'
import { resolverRutaNotificacion } from '@/lib/servicios/notificacion.servicio'
import { API_URL } from '@/lib/servicios/configuracion'
import { SidebarDashboard } from '@/components/navegacion/sidebar-dashboard'
import { CabeceraDashboard } from '@/components/navegacion/cabecera-dashboard'

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [montado, setMontado] = useState(false)
  const { usuario, cerrarSesion, cambiarRol } = useAutenticacion()
  const { tema, alternarTema } = useTema()
  const [sidebarColapsado, setSidebarColapsado] = useState<boolean>(false)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false)
  const [notificaciones, setNotificaciones] = useState<any[]>([])

  // Cargar preferencia de colapso desde localStorage
  useEffect(() => {
    setMontado(true)
    const preferenciaColapsado = localStorage.getItem('sidebar_colapsado')
    if (preferenciaColapsado !== null) {
      setSidebarColapsado(preferenciaColapsado === 'true')
    }
  }, [])

  const manejarCambioColapsado = (nuevoEstado: boolean) => {
    setSidebarColapsado(nuevoEstado)
    localStorage.setItem('sidebar_colapsado', String(nuevoEstado))
  }

  useEffect(() => {
    if (montado && !usuario) {
      router.push('/')
    } else if (montado && usuario?.id) {
      cargarNotificaciones()

      const urlSse = `${API_URL}/notificaciones/stream/${usuario.id}`
      let fuenteEventos: EventSource | null = null
      let esConexionInicial = true

      try {
        fuenteEventos = new EventSource(urlSse)

        fuenteEventos.addEventListener('NOTIFICACION', (event) => {
          try {
            const nuevaNotificacion = JSON.parse(event.data)
            setNotificaciones((prev) => {
              const existe = prev.some((n) => String(n.id) === String(nuevaNotificacion.id))
              if (existe) {
                return prev.map((n) => (String(n.id) === String(nuevaNotificacion.id) ? nuevaNotificacion : n))
              }
              return [nuevaNotificacion, ...prev]
            })

            // Notificación visual flotante con sonner
            // Si es una confirmación propia de envío ("Observacion Enviada"), se omite porque el toast de éxito de la acción es suficiente
            const esConfirmacionEnvioPropia =
              nuevaNotificacion.titulo?.toLowerCase().includes('observacion enviada') ||
              nuevaNotificacion.mensaje?.toLowerCase().includes('fue enviada al subdecanato');

            if (!esConfirmacionEnvioPropia) {
              toast.info(nuevaNotificacion.titulo || 'Nueva notificación', {
                description: nuevaNotificacion.mensaje,
                action: nuevaNotificacion.accionUrl
                  ? {
                    label: 'Ver',
                    onClick: () => manejarClickNotificacion(nuevaNotificacion),
                  }
                  : undefined,
              })
            }

            // Refrescar los Server Components de la ruta activa ante eventos en tiempo real
            router.refresh()
          } catch (e) {
            console.error('Error parseando notificación SSE:', e)
          }
        })

        // Ignorar eventos PING de keep-alive
        fuenteEventos.addEventListener('PING', () => { })

        // Re-sincronizar historial si el stream SSE se reconecta tras una caída de red
        fuenteEventos.addEventListener('INIT', () => {
          if (esConexionInicial) {
            esConexionInicial = false
            return
          }
          cargarNotificaciones()
        })

        fuenteEventos.onerror = () => {
          // El navegador intentara reconectar automaticamente segun el protocolo SSE
        }
      } catch (e) {
        console.error('Error al inicializar SSE:', e)
      }

      return () => {
        if (fuenteEventos) {
          fuenteEventos.close()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, montado])

  const cargarNotificaciones = async () => {
    if (!usuario?.id) return
    try {
      const notifs = await obtenerNotificacionesAccion(String(usuario.id))
      setNotificaciones(notifs)
    } catch (e) {
      console.error('Error al cargar notificaciones:', e)
    }
  }

  const manejarClickNotificacion = async (notif: any) => {
    try {
      const notifId = String(notif.id)
      setNotificaciones((prev) =>
        prev.map((n) => (String(n.id) === notifId ? { ...n, leida: true } : n))
      )
      const rutaDestino = resolverRutaNotificacion(notif, usuario?.rol)
      if (rutaDestino) {
        router.push(rutaDestino)
      }
      await marcarNotificacionLeidaAccion(notifId)
    } catch (e) {
      console.error('Error al marcar notificación:', e)
    }
  }

  const manejarMarcarTodasComoLeidas = async () => {
    if (!usuario?.id) return
    try {
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
      await marcarTodasNotificacionesLeidasAccion(String(usuario.id))
       toast.success('Todas las notificaciones marcadas como leídas')
    } catch (e) {
      console.error('Error al marcar todas como leídas:', e)
    }
  }

  const manejarCierreSesion = async () => {
    await cerrarSesion()
    router.push('/')
  }

  const manejarCambiarRol = async (rol: RolUsuario) => {
    await cambiarRol(rol)
    router.push('/dashboard')
    router.refresh()
  }

  const manejarRestablecerSimulacion = async () => {
    if (confirm('¿Estás seguro de que deseas restablecer los datos de simulación y volver a cero?')) {
      const toastId = toast.loading('Restableciendo base de datos y archivos en el servidor...')
      try {
        await reiniciarSistemaApi()
        await cerrarSesion()
        toast.success('Simulación restablecida correctamente. Por favor inicie sesión nuevamente.', { id: toastId })
        router.push('/')
      } catch (error: any) {
        toast.error('Error al restablecer: ' + error.message, { id: toastId })
        await cerrarSesion()
        router.push('/')
      }
    }
  }

  if (!montado || !usuario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground uppercase tracking-widest text-xs font-bold">
          Cargando Sistema...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Barra Lateral Modular (Sidebar con Drawer móvil y modo sticky desktop) */}
      <SidebarDashboard
        colapsado={sidebarColapsado}
        alCambiarColapsado={manejarCambioColapsado}
        menuMovilAbierto={menuMovilAbierto}
        alCerrarMenuMovil={() => setMenuMovilAbierto(false)}
        usuario={usuario}
        tema={tema}
        alAlternarTema={alternarTema}
        alCambiarRol={manejarCambiarRol}
        alRestablecerSimulacion={manejarRestablecerSimulacion}
        alCerrarSesion={manejarCierreSesion}
      />

      {/* Área Principal de Contenido (Desplazamiento nativo del navegador) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="flex-1 flex flex-col px-2 sm:px-4 pt-2 pb-3 w-full gap-2 min-w-0">
          {/* Cabecera Superior */}
          <CabeceraDashboard
            notificaciones={notificaciones}
            alHacerClickNotificacion={manejarClickNotificacion}
            alMarcarTodasComoLeidas={manejarMarcarTodasComoLeidas}
            alAlternarMenuMovil={() => setMenuMovilAbierto((prev) => !prev)}
          />

          {/* Marco / Tarjeta de Contenido Principal a ancho completo */}
          <main className="flex-1 rounded-xl border border-border bg-card p-3 sm:p-5 shadow-xs w-full min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
