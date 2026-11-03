'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import { cancelarAsignacionPracticaAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { AsignacionPracticaDetalleDto } from '@/lib/tipos/pp/general-pp';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Ban } from 'lucide-react';

interface ModalCancelarAsignacionPracticaProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  asignacion: AsignacionPracticaDetalleDto | null;
  alConfirmar?: () => void;
}

export function ModalCancelarAsignacionPractica({
  abierto,
  alCambiarAbierto,
  asignacion,
  alConfirmar,
}: ModalCancelarAsignacionPracticaProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!asignacion) return null;

  const nombreEstudiante =
    `${asignacion.estudiante?.nombres || ''} ${asignacion.estudiante?.apellidos || ''}`.trim() ||
    'el estudiante';
  const institucion = asignacion.institucion || 'la institución receptora';

  const manejarCancelacion = () => {
    iniciarTransicion(async () => {
      const respuesta = await cancelarAsignacionPracticaAccion(Number(asignacion.id));
      if (respuesta.exito) {
        toast.success(respuesta.mensaje || 'Práctica cancelada con éxito');
        alCambiarAbierto(false);
        if (alConfirmar) alConfirmar();
      } else {
        toast.error(respuesta.mensaje || 'Error al cancelar la práctica preprofesional');
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={alCambiarAbierto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Ban className="h-5 w-5 shrink-0" />
            <AlertDialogTitle>¿Está seguro de cancelar esta práctica?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 text-left pt-2">
            <span className="block text-sm text-muted-foreground">
              Se marcará como <strong className="text-destructive font-semibold">CANCELADA</strong> la práctica del estudiante{' '}
              <strong className="text-foreground font-semibold">
                {nombreEstudiante}
              </strong>{' '}
              en la institución{' '}
              <strong className="text-foreground font-semibold">
                "{institucion}"
              </strong>
              .
            </span>
            <span className="block text-xs text-muted-foreground">
              Esta acción es un cierre administrativo ejecutado por la Coordinación de Prácticas Preprofesionales y Vinculación. La práctica dejará de estar activa y las horas completadas no se acreditarán como válidas.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={estaPendiente}>Regresar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              manejarCancelacion();
            }}
            disabled={estaPendiente}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {estaPendiente ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar Cancelación'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
