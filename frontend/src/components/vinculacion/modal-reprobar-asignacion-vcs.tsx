'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import { reprobarAsignacionProyectoAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
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
import { Loader2, AlertTriangle } from 'lucide-react';

interface ModalReprobarAsignacionVcsProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  asignacion: AsignacionProyectoComunitarioDto | null;
  alActualizar?: () => void;
}

export function ModalReprobarAsignacionVcs({
  abierto,
  abrirModal,
  asignacion,
  alActualizar,
}: ModalReprobarAsignacionVcsProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!asignacion) return null;

  const manejarReprobacion = () => {
    iniciarTransicion(async () => {
      const respuesta = await reprobarAsignacionProyectoAccion(asignacion.id);
      if (respuesta.exito) {
        toast.success(respuesta.mensaje || 'Asignación reprobada con éxito');
        abrirModal(false);
        if (alActualizar) alActualizar();
      } else {
        toast.error(respuesta.mensaje || 'Error al reprobar la asignación');
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={abrirModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <AlertDialogTitle>¿Está seguro de reprobar esta asignación?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 text-left pt-2">
            <span>
              Se marcará como <strong className="text-rose-600 dark:text-rose-400 font-semibold">REPROBADA</strong> la asignación del estudiante{' '}
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
              Esta acción es un cierre negativo por parte del Tutor Académico. El estudiante no acreditará horas por esta asignación y finalizará su participación con estado reprobado.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={estaPendiente}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              manejarReprobacion();
            }}
            disabled={estaPendiente}
            className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800"
          >
            {estaPendiente ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar Reprobación'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
