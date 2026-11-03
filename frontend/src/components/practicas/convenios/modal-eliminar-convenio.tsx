'use client';

import { useTransition } from 'react';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';
import { eliminarConvenioAccion } from '@/lib/acciones/pp/convenio.acciones';
import { toast } from 'sonner';
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

export interface ModalEliminarConvenioProps {
  convenio: ConvenioDto | null;
  abierto: boolean;
  alCerrar: () => void;
  alExito?: () => void;
}

export function ModalEliminarConvenio({
  convenio,
  abierto,
  alCerrar,
  alExito,
}: ModalEliminarConvenioProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();

  if (!convenio) return null;

  const manejarEliminacion = () => {
    iniciarTransicion(async () => {
      const respuesta = await eliminarConvenioAccion(Number(convenio.id));
      if (!respuesta.exito) {
        toast.error(respuesta.mensaje);
        return;
      }

      toast.success('Convenio eliminado exitosamente');
      alCerrar();
      if (alExito) {
        alExito();
      }
    });
  };

  return (
    <AlertDialog open={abierto} onOpenChange={(ab) => !ab && !estaPendiente && alCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de eliminar este convenio?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el convenio con{' '}
            <strong className="text-foreground">{convenio.institucion}</strong> y su registro en el sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={estaPendiente}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={estaPendiente}
            onClick={(e) => {
              e.preventDefault();
              manejarEliminacion();
            }}
          >
            {estaPendiente ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar Convenio'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
