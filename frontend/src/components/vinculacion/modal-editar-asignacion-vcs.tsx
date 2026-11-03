'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { actualizarAsignacionProyectoAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import {
  AsignacionProyectoComunitarioDto,
  ProyectoResumenDto,
} from '@/lib/tipos/vcs/asignacion-proyecto';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Clock, Building, CheckCircle2 } from 'lucide-react';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';

interface ModalEditarAsignacionVcsProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  asignacion: AsignacionProyectoComunitarioDto | null;
  proyectos: ProyectoResumenDto[];
}

export function ModalEditarAsignacionVcs({
  abierto,
  abrirModal,
  asignacion,
  proyectos,
}: ModalEditarAsignacionVcsProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();
  const [proyectoId, setProyectoId] = useState<string>('');
  const [horasAsignadas, setHorasAsignadas] = useState<number>(40);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Horas acumuladas y requeridas del estudiante
  const horasRequeridas = asignacion?.horasRequeridasEstudiante ?? 80;
  const horasAcumuladas = asignacion?.horasAcumuladasEstudiante ?? 0;
  const maximoHorasDisponibles = Math.max(1, horasRequeridas - horasAcumuladas);

  useEffect(() => {
    if (asignacion && abierto) {
      setProyectoId(asignacion.proyectoId?.toString() || '');
      setHorasAsignadas(asignacion.horasAsignadas || 40);
      setErrorValidacion(null);
    }
  }, [asignacion, abierto]);

  if (!asignacion) return null;

  const proyectoSeleccionado = proyectos.find((p) => p.id.toString() === proyectoId);
  const horasTotalesProyectadas = horasAcumuladas + (horasAsignadas || 0);
  const porcentajeAvance = Math.min(
    100,
    Math.round((horasTotalesProyectadas / (horasRequeridas || 80)) * 100)
  );

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    const idProyectoNumerico = parseInt(proyectoId, 10);
    if (isNaN(idProyectoNumerico) || idProyectoNumerico <= 0) {
      setErrorValidacion('Debe seleccionar un proyecto comunitario válido');
      return;
    }

    if (isNaN(horasAsignadas) || horasAsignadas <= 0) {
      setErrorValidacion('Las horas asignadas deben ser un número entero mayor a 0');
      return;
    }

    if (horasAsignadas > maximoHorasDisponibles) {
      setErrorValidacion(
        `Las horas asignadas (${horasAsignadas}h) exceden el límite máximo disponible para este estudiante (${maximoHorasDisponibles}h)`
      );
      return;
    }

    if (horasAsignadas < asignacion.horasCompletadas) {
      setErrorValidacion(
        `Las horas asignadas (${horasAsignadas}h) no pueden ser menores a las ya completadas (${asignacion.horasCompletadas}h)`
      );
      return;
    }

    iniciarTransicion(async () => {
      const respuesta = await actualizarAsignacionProyectoAccion(asignacion.id, {
        proyectoComunitarioId: idProyectoNumerico,
        horasAsignadas: Math.floor(horasAsignadas),
      });

      if (respuesta.exito) {
        toast.success(respuesta.mensaje || 'Asignación actualizada correctamente');
        abrirModal(false);
      } else {
        toast.error(respuesta.mensaje || 'Error al actualizar la asignación');
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={abrirModal}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={manejarEnvio}>
          <DialogHeader>
            <DialogTitle>Editar Asignación</DialogTitle>
            <DialogDescription>
              Modifique el proyecto comunitario o las horas asignadas para el estudiante.
            </DialogDescription>
          </DialogHeader>

          {/* Tarjeta con datos del estudiante y su avance */}
          <div className="my-4 rounded-xl border border-border bg-muted/40 p-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <AvatarUsuario
                  nombre={asignacion.nombreCompletoEstudiante}
                  urlFoto={asignacion.urlAvatar}
                  tamano="md"
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">
                    {asignacion.nombreCompletoEstudiante}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>C.I: {asignacion.identificacionEstudiante}</span>
                    <span>{asignacion.correoEstudiante}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                {asignacion.nombreCarrera}
              </span>
            </div>

            {/* Barra de progreso y resumen de horas */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Avance proyectado:</span>
                  <strong className="text-foreground font-semibold">
                    {horasTotalesProyectadas}h de {horasRequeridas}h
                  </strong>
                </span>
                <span className="font-semibold text-primary">{porcentajeAvance}%</span>
              </div>

              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${porcentajeAvance}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                Horas acumuladas previas: <strong className="text-foreground">{horasAcumuladas}h</strong> | Máximo asignable: <strong className="text-foreground">{maximoHorasDisponibles}h</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4 py-1">
            {/* Selección de Proyecto */}
            <div className="space-y-1.5">
              <Label htmlFor="proyecto-select" className="text-sm font-medium">
                Proyecto Comunitario
              </Label>
              <Select value={proyectoId} onValueChange={setProyectoId}>
                <SelectTrigger id="proyecto-select" className="w-full">
                  <SelectValue placeholder="Seleccione un proyecto..." />
                </SelectTrigger>
                <SelectContent>
                  {proyectos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-medium text-xs">{p.nombre}</span>
                        {p.nombreTutor && (
                          <span className="text-[11px] text-muted-foreground">
                            Tutor: {p.nombreTutor}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {proyectoSeleccionado?.nombreTutor && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Building className="h-3.5 w-3.5" />
                  <span>Tutor: {proyectoSeleccionado.nombreTutor}</span>
                </div>
              )}
            </div>

            {/* Horas asignadas */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="horas-asignadas" className="text-sm font-medium">
                  Horas Asignadas
                </Label>
                <span className="text-xs text-muted-foreground">
                  Máx. permitido: <strong className="text-foreground">{maximoHorasDisponibles}h</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="horas-asignadas"
                  type="number"
                  min={1}
                  max={maximoHorasDisponibles}
                  step={1}
                  value={horasAsignadas === 0 ? '' : horasAsignadas}
                  onChange={(e) => {
                    const texto = e.target.value;
                    if (texto === '') {
                      setHorasAsignadas(0);
                      setErrorValidacion(null);
                      return;
                    }
                    const val = parseInt(texto, 10);
                    if (!isNaN(val)) {
                      setHorasAsignadas(val);
                      if (val > maximoHorasDisponibles) {
                        setErrorValidacion(
                          `El estudiante solo puede recibir hasta ${maximoHorasDisponibles} horas en este proyecto`
                        );
                      } else {
                        setErrorValidacion(null);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full"
                  required
                />
                <span className="text-sm text-muted-foreground font-medium shrink-0">
                  horas
                </span>
              </div>
            </div>

            {/* Error de validación */}
            {errorValidacion && (
              <p className="text-xs font-medium text-destructive">{errorValidacion}</p>
            )}
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => abrirModal(false)}
              disabled={estaPendiente}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={estaPendiente || !proyectoId || horasAsignadas <= 0 || horasAsignadas > maximoHorasDisponibles}
            >
              {estaPendiente ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
