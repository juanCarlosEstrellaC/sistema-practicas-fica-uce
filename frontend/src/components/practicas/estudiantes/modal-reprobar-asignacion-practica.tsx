'use client';

import React, { useTransition } from 'react';
import { toast } from 'sonner';
import { reprobarAsignacionPracticaAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
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
import { Loader2, AlertTriangle } from 'lucide-react';

interface ModalReprobarAsignacionPracticaProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  asignacion: AsignacionPracticaDetalleDto | null;
  alConfirmar?: () => void;
}

export function ModalReprobarAsignacionPractica({
  abierto,
  alCambiarAbierto,
  asignacion,
  alConfirmar,
}: ModalReprobarAsignacionPracticaProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!asignacion) return null;

  const nombreEstudiante =
    `${asignacion.estudiante?.nombres || ''} ${asignacion.estudiante?.apellidos || ''}`.trim() ||
    'el estudiante';
  const institucion = asignacion.institucion || 'la institución receptora';

  const manejarReprobacion = () => {
    iniciarTransicion(async () => {
      const respuesta = await reprobarAsignacionPracticaAccion(Number(asignacion.id));
      if (respuesta.exito) {
        toast.success(respuesta.mensaje || 'Práctica reprobada con éxito');
        alCambiarAbierto(false);
        if (alConfirmar) alConfirmar();
      } else {
        toast.error(respuesta.mensaje || 'Error al reprobar la práctica preprofesional');
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={alCambiarAbierto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <AlertDialogTitle>¿Está seguro de reprobar esta práctica?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 text-left pt-2">
            <span className="block text-sm text-muted-foreground">
              Se marcará como <strong className="text-rose-600 dark:text-rose-400 font-semibold">REPROBADA</strong> la práctica del estudiante{' '}
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
              Esta acción es un cierre negativo ejecutado por el Tutor Académico. El estudiante no acreditará horas por este periodo y su estado pasará a reprobado.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={estaPendiente}>Regresar</AlertDialogCancel>
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
