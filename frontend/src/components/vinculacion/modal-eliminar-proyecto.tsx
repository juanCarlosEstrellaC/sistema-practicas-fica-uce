'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import { eliminarProyectoComunitarioAccion } from '@/lib/acciones/vcs/proyecto-comunitario.acciones';
import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';

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

interface ModalEliminarProyectoProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  proyecto: ProyectoComunitarioDto | null;
}

export function ModalEliminarProyecto({ abierto, abrirModal, proyecto }: ModalEliminarProyectoProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!proyecto) return null;

  const manejarEliminacion = () => {
    iniciarTransicion(async () => {
      const respuesta = await eliminarProyectoComunitarioAccion(proyecto.id);
      if (respuesta.exito) {
        toast.success(respuesta.mensaje);
        abrirModal(false);
      } else {
        toast.error(respuesta.mensaje);
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={abrirModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de eliminar este proyecto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará definitivamente el proyecto{' '}
            <strong className="text-foreground font-semibold">"{proyecto.nombre}"</strong>.
            No podrá ser recuperado.
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
              'Eliminar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
