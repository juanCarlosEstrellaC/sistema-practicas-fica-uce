'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import { eliminarAsignacionProyectoAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
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
import { Loader2 } from 'lucide-react';

interface ModalEliminarAsignacionVcsProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  asignacion: AsignacionProyectoComunitarioDto | null;
}

export function ModalEliminarAsignacionVcs({
  abierto,
  abrirModal,
  asignacion,
}: ModalEliminarAsignacionVcsProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!asignacion) return null;

  const manejarEliminacion = () => {
    iniciarTransicion(async () => {
      const respuesta = await eliminarAsignacionProyectoAccion(asignacion.id);
      if (respuesta.exito) {
        toast.success(respuesta.mensaje || 'Asignación eliminada correctamente');
        abrirModal(false);
      } else {
        toast.error(respuesta.mensaje || 'Error al eliminar la asignación');
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={abrirModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de eliminar esta asignación?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            <span>
              Se eliminará la asignación del estudiante{' '}
              <strong className="text-foreground font-semibold">
                {asignacion.nombreCompletoEstudiante}
              </strong>{' '}
              al proyecto{' '}
              <strong className="text-foreground font-semibold">
                "{asignacion.nombreProyecto}"
              </strong>
              .
            </span>
            <span className="block text-xs text-muted-foreground">
              El estudiante volverá a estar disponible para ser asignado a un nuevo proyecto comunitario en este periodo.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={estaPendiente}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              manejarEliminacion();
            }}
            disabled={estaPendiente}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {estaPendiente ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar Asignación'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
