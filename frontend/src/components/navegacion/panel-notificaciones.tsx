"use client"

import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  BookOpen,
  Briefcase,
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NotificacionItem {
  id: string | number
  titulo: string
  mensaje: string
  tipo?: 'INFO' | 'INFORMACION' | 'EXITO' | 'ADVERTENCIA' | 'ERROR'
  leida: boolean
  accionUrl?: string
  fechaCreacion?: string
}

interface PanelNotificacionesProps {
  notificaciones: NotificacionItem[]
  alHacerClickNotificacion: (notif: NotificacionItem) => void
  alMarcarTodasComoLeidas: () => void
}

type FiltroEstado = 'TODAS' | 'NO_LEIDAS' | 'LEIDAS'
type FiltroModulo = 'TODOS' | 'VINCULACION' | 'PRACTICAS'

export function PanelNotificaciones({
  notificaciones,
  alHacerClickNotificacion,
  alMarcarTodasComoLeidas,
}: PanelNotificacionesProps) {
  const [abierto, setAbierto] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODAS')
  const [filtroModulo, setFiltroModulo] = useState<FiltroModulo>('TODOS')

  const numNoLeidas = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  )

  const clasificarModulo = (notif: NotificacionItem): 'VINCULACION' | 'PRACTICAS' => {
    const url = (notif.accionUrl || '').toLowerCase()
    const titulo = (notif.titulo || '').toLowerCase()
    const mensaje = (notif.mensaje || '').toLowerCase()

    if (
      url.includes('vinculacion') ||
      url.includes('vcs') ||
      titulo.includes('vcs') ||
      titulo.includes('vinculacion') ||
      mensaje.includes('vinculacion') ||
      mensaje.includes('comunitario')
    ) {
      return 'VINCULACION'
    }

    return 'PRACTICAS'
  }

  const notificacionesFiltradas = useMemo(() => {
    return notificaciones.filter((notif) => {
      // Filtro por estado
      if (filtroEstado === 'NO_LEIDAS' && notif.leida) return false
      if (filtroEstado === 'LEIDAS' && !notif.leida) return false

      // Filtro por modulo
      const modulo = clasificarModulo(notif)
      if (filtroModulo === 'VINCULACION' && modulo !== 'VINCULACION') return false
      if (filtroModulo === 'PRACTICAS' && modulo !== 'PRACTICAS') return false

      return true
    })
  }, [notificaciones, filtroEstado, filtroModulo])

  const manejarClick = (notif: NotificacionItem) => {
    setAbierto(false)
    alHacerClickNotificacion(notif)
  }

  const renderIconoTipo = (tipo?: string) => {
    switch (tipo?.toUpperCase()) {
      case 'EXITO':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      case 'ADVERTENCIA':
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      default:
        return <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
    }
  }

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 rounded-lg bg-background hover:bg-muted"
          aria-label="Abrir panel de notificaciones"
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {numNoLeidas > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center p-0.5 text-[9px] font-bold bg-destructive text-destructive-foreground border-2 border-background rounded-full">
              {numNoLeidas}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background">
        <SheetHeader className="p-4 border-b border-border/60 pb-3 space-y-3">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-bold text-foreground">
                Notificaciones
              </SheetTitle>
              {numNoLeidas > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-0 font-medium">
                  {numNoLeidas} no leídas
                </Badge>
              )}
            </div>

            {numNoLeidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary/90 flex items-center gap-1 font-medium"
                onClick={alMarcarTodasComoLeidas}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar leídas</span>
              </Button>
            )}
          </div>

          {/* Filtros de Estado */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFiltroEstado('TODAS')}
              className={cn(
                'flex-1 py-1 px-2 rounded-md font-medium transition-all text-center',
                filtroEstado === 'TODAS'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Todas ({notificaciones.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado('NO_LEIDAS')}
              className={cn(
                'flex-1 py-1 px-2 rounded-md font-medium transition-all text-center',
                filtroEstado === 'NO_LEIDAS'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              No leídas ({numNoLeidas})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado('LEIDAS')}
              className={cn(
                'flex-1 py-1 px-2 rounded-md font-medium transition-all text-center',
                filtroEstado === 'LEIDAS'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Leídas ({notificaciones.length - numNoLeidas})
            </button>
          </div>

          {/* Filtros de Modulo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs scrollbar-none">
            <Button
              variant={filtroModulo === 'TODOS' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-6 px-2.5 text-[11px] rounded-full gap-1 shrink-0 font-medium"
              onClick={() => setFiltroModulo('TODOS')}
            >
              <Layers className="w-3 h-3" />
              Todos
            </Button>
            <Button
              variant={filtroModulo === 'PRACTICAS' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-6 px-2.5 text-[11px] rounded-full gap-1 shrink-0 font-medium"
              onClick={() => setFiltroModulo('PRACTICAS')}
            >
              <BookOpen className="w-3 h-3 text-amber-500" />
              Prácticas Preprofesionales
            </Button>
            <Button
              variant={filtroModulo === 'VINCULACION' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-6 px-2.5 text-[11px] rounded-full gap-1 shrink-0 font-medium"
              onClick={() => setFiltroModulo('VINCULACION')}
            >
              <Briefcase className="w-3 h-3 text-sky-500" />
              Vinculación
            </Button>
          </div>
        </SheetHeader>

        {/* Lista de Notificaciones */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-border/30">
          {notificacionesFiltradas.length > 0 ? (
            notificacionesFiltradas.map((notif) => {
              const esVinculacion = clasificarModulo(notif) === 'VINCULACION'
              return (
                <div
                  key={notif.id}
                  onClick={() => manejarClick(notif)}
                  className={cn(
                    'group relative flex flex-col gap-2 p-3 rounded-xl cursor-pointer transition-all border pt-3 first:pt-3',
                    !notif.leida
                      ? 'bg-primary/5 hover:bg-primary/10 border-primary/20 shadow-xs'
                      : 'bg-card hover:bg-muted/60 border-border/40 opacity-80 hover:opacity-100'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {renderIconoTipo(notif.tipo)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {notif.titulo}
                        </span>
                        {!notif.leida && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-3">
                        {notif.mensaje}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-sm',
                        esVinculacion
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {esVinculacion ? 'Vinculación con la Sociedad' : 'Prácticas Preprofesionales'}
                    </span>

                    {notif.accionUrl && (
                      <span className="inline-flex items-center gap-1 text-primary group-hover:underline font-medium">
                        Ver detalle
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-center text-muted-foreground p-6">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 opacity-60">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground">No hay notificaciones</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                No tienes notificaciones con los filtros seleccionados
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
