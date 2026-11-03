'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import { eliminarAsignacionPracticaAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
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
import { Loader2 } from 'lucide-react';

export interface ModalEliminarAsignacionPracticaProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  asignacion: AsignacionPracticaDetalleDto | null;
  alEliminadoExitoso?: () => void;
}

export function ModalEliminarAsignacionPractica({
  abierto,
  alCambiarAbierto,
  asignacion,
  alEliminadoExitoso,
}: ModalEliminarAsignacionPracticaProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!asignacion) return null;

  const nombreEstudiante =
    `${asignacion.estudiante?.nombres || ''} ${asignacion.estudiante?.apellidos || ''}`.trim() ||
    'el estudiante';
  const institucion = asignacion.institucion || 'la institución asignada';

  const manejarEliminacion = () => {
    iniciarTransicion(async () => {
      try {
        const respuesta = await eliminarAsignacionPracticaAccion(Number(asignacion.id));
        if (respuesta.exito) {
          toast.success(respuesta.mensaje || 'Asignación eliminada correctamente');
          alCambiarAbierto(false);
          alEliminadoExitoso?.();
        } else {
          toast.error(respuesta.mensaje || 'Error al eliminar la asignación');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Error inesperado al eliminar la asignación');
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={alCambiarAbierto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de eliminar esta asignación?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            <span>
              Se eliminará la asignación de práctica preprofesional de{' '}
              <strong className="text-foreground font-semibold">{nombreEstudiante}</strong> en{' '}
              <strong className="text-foreground font-semibold">"{institucion}"</strong>.
            </span>
            <span className="block text-xs text-muted-foreground">
              Esta acción no se puede deshacer. El estudiante perderá su tutor y empresa asignados y volverá a estar disponible para una nueva asignación.
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
