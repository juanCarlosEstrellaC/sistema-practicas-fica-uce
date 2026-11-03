"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cambiarEstadoMatrizCacesAccion } from '@/lib/acciones/pp/matriz-caces.acciones';
import { EstadoMatrizCaces } from '@/lib/tipos/pp/general-pp';

interface ModalObservacionesCacesProps {
  abierto: boolean;
  alCerrar: () => void;
  matrizId: number | string;
  rolUsuario: 'SUBDECANO' | 'DIRECTOR_CARRERA' | 'COORDINADOR_PRACTICAS';
  alCompletar?: () => void;
}

export function ModalObservacionesCaces({
  abierto,
  alCerrar,
  matrizId,
  rolUsuario,
  alCompletar,
}: ModalObservacionesCacesProps) {
  const [observacion, setObservacion] = useState('');
  const [estaEnviando, setEstaEnviando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observacion.trim()) {
      toast.error('Debe ingresar el motivo de la observación antes de devolver la matriz.');
      return;
    }

    setEstaEnviando(true);
    try {
      const prefijo =
        rolUsuario === 'SUBDECANO'
          ? '[Subdecanato] '
          : rolUsuario === 'DIRECTOR_CARRERA'
            ? '[Dirección de Carrera] '
            : '[Coordinación] ';

      const res = await cambiarEstadoMatrizCacesAccion(
        matrizId,
        'PENDIENTE' as EstadoMatrizCaces,
        prefijo + observacion.trim()
      );

      if (res.exito) {
        toast.success('La matriz ha sido devuelta con las observaciones registradas.');
        setObservacion('');
        alCerrar();
        alCompletar?.();
      } else {
        toast.error(res.mensaje || 'Error al devolver la matriz CACES');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error inesperado al devolver matriz');
    } finally {
      setEstaEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && alCerrar()}>
      <DialogContent className="max-w-md">
        <form onSubmit={manejarEnvio} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              Devolver Matriz con Observaciones
            </DialogTitle>
            <DialogDescription>
              Detalle las correcciones que deben realizarse en la consolidación de horas y datos CACES antes de su aprobación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="observacion-caces">Observaciones requeridas</Label>
            <Textarea
              id="observacion-caces"
              placeholder="Ej. Añadir observaciones en estudiantes que..."
              className="min-h-[120px] resize-none"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              disabled={estaEnviando}
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={alCerrar}
              disabled={estaEnviando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={estaEnviando || !observacion.trim()}
            >
              {estaEnviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Devolviendo...
                </>
              ) : (
                'Registrar y Devolver'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
