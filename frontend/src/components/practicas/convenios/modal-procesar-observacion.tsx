'use client';

import { useState, useTransition } from 'react';
import { ObservacionDto } from '@/lib/tipos/pp/general-pp';
import { procesarObservacionAccion } from '@/lib/acciones/pp/observacion.acciones';
import { desglosarDescripcionObservacion } from '@/lib/utilidades/observaciones';
import { formatearFecha } from '@/lib/utilidades/fechas';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  FileText,
  Mail,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ModalProcesarObservacionProps {
  observacion: ObservacionDto | null;
  abierto: boolean;
  esSubdecano: boolean;
  alCerrar: () => void;
  alProcesarExitoso?: () => void;
}

export function ModalProcesarObservacion({
  observacion,
  abierto,
  esSubdecano,
  alCerrar,
  alProcesarExitoso,
}: ModalProcesarObservacionProps) {
  const [estaRechazando, setEstaRechazando] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!observacion) return null;

  const desglose = desglosarDescripcionObservacion(observacion.descripcion);
  const esAnulacion = observacion.tipo === 'ANULACION';

  const obtenerNombreRemitente = () => {
    if (observacion.remitente) {
      const nombres = observacion.remitente.nombres || '';
      const apellidos = observacion.remitente.apellidos || '';
      const nombreCompleto = `${nombres} ${apellidos}`.trim();
      if (nombreCompleto) return nombreCompleto;
    }
    if (observacion.remitenteNombre) return observacion.remitenteNombre;
    return `Usuario (ID: ${observacion.remitenteId})`;
  };

  const obtenerCarreraRemitente = () => {
    return observacion.carreraNombre || observacion.remitente?.carreraNombre || '';
  };

  const renderBadgeEstado = () => {
    switch (observacion.estado) {
      case 'APROBADA':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold gap-1.5 py-0.5 px-2.5 text-xs shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Aprobada
          </Badge>
        );
      case 'RECHAZADA':
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-semibold gap-1.5 py-0.5 px-2.5 text-xs shadow-2xs"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Rechazada
          </Badge>
        );
      case 'PENDIENTE':
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 font-semibold gap-1.5 py-0.5 px-2.5 text-xs shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Pendiente
          </Badge>
        );
    }
  };

  const manejarProcesar = (aprobado: boolean) => {
    if (!aprobado && !motivoRechazo.trim()) {
      toast.error('Debe ingresar un motivo para rechazar la solicitud');
      return;
    }

    iniciarTransicion(async () => {
      const respuesta = await procesarObservacionAccion(
        observacion.id,
        aprobado,
        aprobado ? undefined : motivoRechazo.trim()
      );

      if (!respuesta.exito) {
        toast.error(respuesta.mensaje);
        return;
      }

      toast.success(respuesta.mensaje);
      setEstaRechazando(false);
      setMotivoRechazo('');
      alCerrar();
      if (alProcesarExitoso) {
        alProcesarExitoso();
      }
    });
  };

  const manejarCerrarModal = () => {
    if (estaPendiente) return;
    setEstaRechazando(false);
    setMotivoRechazo('');
    alCerrar();
  };

  return (
    <Dialog open={abierto} onOpenChange={(ab) => !ab && manejarCerrarModal()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-base font-bold min-w-0">
              {esAnulacion ? (
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
              )}
              <span className="leading-snug">
                {esAnulacion ? 'Observación de Anulación' : 'Propuesta de Nuevo Convenio'}
              </span>
            </DialogTitle>
            {renderBadgeEstado()}
          </div>
          <DialogDescription>
            {esAnulacion
              ? 'Detalle de la solicitud de anulación y resolución emitida.'
              : 'Información remitida para análisis y tramitación del Subdecanato.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 min-w-0">
          {/* Tarjeta de información institucional y fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 text-sm">
            <div className="min-w-0">
              <span className="text-[11px] text-muted-foreground font-semibold block">
                Empresa / Institución
              </span>
              <span className="font-semibold text-foreground block truncate" title={observacion.empresa}>
                {observacion.empresa}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-muted-foreground font-semibold block">
                Fecha de Envío
              </span>
              <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{formatearFecha(observacion.fecha, false)}</span>
              </span>
            </div>
            {observacion.contacto && (
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground font-semibold block">
                  Contacto
                </span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5 min-w-0" title={observacion.contacto}>
                  <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{observacion.contacto}</span>
                </span>
              </div>
            )}
            {observacion.correo && (
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground font-semibold block">
                  Correo Electrónico
                </span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5 min-w-0" title={observacion.correo}>
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{observacion.correo}</span>
                </span>
              </div>
            )}
          </div>

          {/* Tarjeta de remitente para Subdecano */}
          {esSubdecano && (
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center gap-3">
              <AvatarUsuario
                nombre={obtenerNombreRemitente()}
                urlFoto={observacion.remitente?.urlAvatar}
                tamano="md"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  Remitente de la Propuesta
                </span>
                <p className="font-semibold text-sm text-foreground truncate">
                  {obtenerNombreRemitente()}
                </p>
                {obtenerCarreraRemitente() && (
                  <p className="text-xs text-muted-foreground truncate">
                    Carrera: {obtenerCarreraRemitente()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Justificación original de la propuesta */}
          <div className="bg-muted/30 p-3.5 rounded-lg border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-semibold tracking-wider">
                Descripción / Justificación de la propuesta
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {desglose.descripcion || (
                <span className="italic text-muted-foreground">Sin descripción detallada registrada.</span>
              )}
            </p>
          </div>

          {/* Bloque dedicado al motivo de rechazo */}
          {desglose.motivoRechazo && (
            <div className="bg-rose-500/10 p-3.5 rounded-lg border border-rose-500/25 text-rose-700 dark:text-rose-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-rose-600 dark:text-rose-400">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Motivo del Rechazo Emitido</span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed pl-5.5 font-medium">
                {desglose.motivoRechazo}
              </p>
            </div>
          )}

          {/* Acciones para Subdecano en estado PENDIENTE */}
          {esSubdecano && observacion.estado === 'PENDIENTE' && (
            <div className="pt-3 border-t border-border mt-3">
              {estaRechazando ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-destructive">
                      Motivo del rechazo *
                    </Label>
                    <Textarea
                      placeholder="Especifique detalladamente las razones por las cuales se rechaza la propuesta..."
                      value={motivoRechazo}
                      onChange={(e) => setMotivoRechazo(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={estaPendiente}
                      onClick={() => {
                        setEstaRechazando(false);
                        setMotivoRechazo('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={estaPendiente || !motivoRechazo.trim()}
                      onClick={() => manejarProcesar(false)}
                    >
                      {estaPendiente ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Rechazando...
                        </>
                      ) : (
                        'Confirmar Rechazo'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2.5">
                  <Button
                    variant="outline"
                    className="font-semibold hover:bg-destructive/10 hover:text-destructive"
                    disabled={estaPendiente}
                    onClick={() => setEstaRechazando(true)}
                  >
                    <XCircle className="w-4 h-4 mr-1.5 text-destructive" />
                    Rechazar
                  </Button>
                  <Button
                    variant={esAnulacion ? 'destructive' : 'default'}
                    className="font-semibold shadow-xs"
                    disabled={estaPendiente}
                    onClick={() => manejarProcesar(true)}
                  >
                    {estaPendiente ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Aprobando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Aprobar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

