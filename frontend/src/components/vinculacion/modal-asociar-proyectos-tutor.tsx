'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { TutorResumenVcsDto, ProyectoResumenDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { asociarProyectosATutorAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, FolderGit2, AlertCircle } from 'lucide-react';

interface ModalAsociarProyectosTutorProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  tutor: TutorResumenVcsDto | null;
  proyectos: ProyectoResumenDto[];
}

export function ModalAsociarProyectosTutor({
  abierto,
  abrirModal,
  tutor,
  proyectos,
}: ModalAsociarProyectosTutorProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();
  const [proyectosSeleccionados, setProyectosSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    if (abierto && tutor) {
      const idsIniciales = (tutor.proyectos || []).map((p) => p.id);
      setProyectosSeleccionados(idsIniciales);
    }
  }, [abierto, tutor]);

  const alternarProyecto = (proyectoId: number) => {
    if (proyectosSeleccionados.includes(proyectoId)) {
      setProyectosSeleccionados(proyectosSeleccionados.filter((id) => id !== proyectoId));
    } else {
      if (proyectosSeleccionados.length >= 2) {
        toast.warning('Un tutor académico no puede tener más de 2 proyectos asociados por periodo.');
        return;
      }
      setProyectosSeleccionados([...proyectosSeleccionados, proyectoId]);
    }
  };

  const guardarAsociaciones = () => {
    if (!tutor) return;

    iniciarTransicion(async () => {
      const respuesta = await asociarProyectosATutorAccion(tutor.id, proyectosSeleccionados);
      if (respuesta.exito) {
        toast.success(respuesta.mensaje || 'Proyectos asociados correctamente');
        abrirModal(false);
      } else {
        toast.error(respuesta.mensaje || 'Error al asociar los proyectos');
      }
    });
  };

  if (!tutor) return null;

  const totalSeleccionados = proyectosSeleccionados.length;
  const limiteAlcanzado = totalSeleccionados >= 2;

  return (
    <Dialog open={abierto} onOpenChange={abrirModal}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-primary" />
            Asociar Proyectos a Tutor Académico
          </DialogTitle>
          <DialogDescription>
            Seleccione los proyectos comunitarios a cargo del docente{' '}
            <span className="font-semibold text-foreground">
              {tutor.nombres} {tutor.apellidos}
            </span>
            .
          </DialogDescription>
        </DialogHeader> 

        <div className="space-y-4 py-2">
          {/* Indicador de límite */}
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span>
                <strong>Máximo 2 proyectos</strong> por tutor académico.
              </span>
            </div>
            <Badge
              variant={limiteAlcanzado ? 'default' : 'secondary'}
              className="text-xs font-semibold shrink-0"
            >
              {totalSeleccionados}/2
            </Badge>
          </div>

          {/* Lista de proyectos */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {proyectos.length === 0 ? (
              <p className="text-sm text-center py-6 text-muted-foreground">
                No hay proyectos comunitarios disponibles en esta carrera.
              </p>
            ) : (
              proyectos.map((proyecto) => {
                const estaSeleccionado = proyectosSeleccionados.includes(proyecto.id);
                const asignadoAOtroTutor =
                  proyecto.tutorAcademicoId != null && proyecto.tutorAcademicoId !== tutor.id;
                const deshabilitadoPorLimite = !estaSeleccionado && limiteAlcanzado;
                const deshabilitado = asignadoAOtroTutor || deshabilitadoPorLimite;

                const manejarClicProyecto = () => {
                  if (estaPendiente) return;
                  if (asignadoAOtroTutor) {
                    toast.warning(
                      `El proyecto ya está asignado al tutor ${proyecto.nombreTutor || 'otro tutor'}. Debe quitarle la asignación a dicho tutor antes de poder asociarlo a este docente.`
                    );
                    return;
                  }
                  if (deshabilitadoPorLimite) {
                    toast.warning('Un tutor académico no puede tener más de 2 proyectos asociados por periodo.');
                    return;
                  }
                  alternarProyecto(proyecto.id);
                };

                return (
                  <div
                    key={proyecto.id}
                    onClick={manejarClicProyecto}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      estaSeleccionado
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : asignadoAOtroTutor
                        ? 'border-border/60 bg-muted/40 opacity-70 cursor-not-allowed'
                        : deshabilitadoPorLimite
                        ? 'border-border/50 opacity-50 cursor-not-allowed bg-muted/20'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      checked={estaSeleccionado}
                      onCheckedChange={() => {
                        if (!asignadoAOtroTutor) alternarProyecto(proyecto.id);
                      }}
                      disabled={deshabilitado || estaPendiente}
                      className="mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-foreground leading-tight truncate">
                          {proyecto.nombre}
                        </div>
                        {asignadoAOtroTutor && (
                          <span className="text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                            Asignado a: {proyecto.nombreTutor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => abrirModal(false)}
            disabled={estaPendiente}
          >
            Cancelar
          </Button>
          <Button onClick={guardarAsociaciones} disabled={estaPendiente}>
            {estaPendiente ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Asignación'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
