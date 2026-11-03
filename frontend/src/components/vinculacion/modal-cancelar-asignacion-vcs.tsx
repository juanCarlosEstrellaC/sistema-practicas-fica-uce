'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import { cancelarAsignacionProyectoAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { AsignacionProyectoComunitarioDto } from '@/lib/tipos/vcs/asignacion-proyecto';

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

interface ModalCancelarAsignacionVcsProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  asignacion: AsignacionProyectoComunitarioDto | null;
  alActualizar?: () => void;
}

export function ModalCancelarAsignacionVcs({
  abierto,
  abrirModal,
  asignacion,
  alActualizar,
}: ModalCancelarAsignacionVcsProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!asignacion) return null;

  const manejarCancelacion = () => {
    iniciarTransicion(async () => {
      const respuesta = await cancelarAsignacionProyectoAccion(asignacion.id);
      if (respuesta.exito) {
        toast.success(respuesta.mensaje || 'Asignación cancelada con éxito');
        abrirModal(false);
        if (alActualizar) alActualizar();
      } else {
        toast.error(respuesta.mensaje || 'Error al cancelar la asignación');
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={abrirModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Ban className="h-5 w-5 shrink-0" />
            <AlertDialogTitle>¿Está seguro de cancelar esta asignación?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 text-left pt-2">
            <span>
              Se marcará como <strong className="text-destructive font-semibold">CANCELADA</strong> la asignación del estudiante{' '}
              <strong className="text-foreground font-semibold">
                {asignacion.nombreCompletoEstudiante}
              </strong>{' '}
              en el proyecto{' '}
              <strong className="text-foreground font-semibold">
                "{asignacion.nombreProyecto}"
              </strong>
              .
            </span>
            <span className="block text-xs text-muted-foreground">
              Esta acción es un cierre administrativo ejecutado por la Coordinación de Prácticas Preprofesionales y Vinculación. La asignación dejará de estar activa y las horas completadas no se acreditarán como válidas.
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
