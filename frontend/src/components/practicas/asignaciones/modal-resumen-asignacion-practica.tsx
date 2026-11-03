'use client';

import { Loader2, Building2, User, Clock, CheckCircle2 } from 'lucide-react';
import { UsuarioDto, ConvenioDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ModalResumenAsignacionPracticaProps {
  abierto: boolean;
  alCerrar: () => void;
  alConfirmar: () => void;
  estaPendiente: boolean;
  convenio: ConvenioDto | undefined;
  tutor: TutorResumenDto | undefined;
  estudiantes: UsuarioDto[];
  horasAsignadas: number;
}

export function ModalResumenAsignacionPractica({
  abierto,
  alCerrar,
  alConfirmar,
  estaPendiente,
  convenio,
  tutor,
  estudiantes,
  horasAsignadas,
}: ModalResumenAsignacionPracticaProps) {
  const nombreTutor = tutor
    ? `${tutor.nombres} ${tutor.apellidos}`
    : 'Por designar';

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && alCerrar()}>
      <DialogContent className="max-w-lg sm:max-w-2xl md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Resumen de Asignación de Prácticas</DialogTitle>
          <DialogDescription>
            Verifique los detalles antes de confirmar la asignación de carrera en prácticas preprofesionales.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tarjeta de Resumen */}
          <div className="p-4 bg-muted/40 rounded-lg border border-border text-sm space-y-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Institución receptora / Convenio:
              </span>
              <p className="font-semibold text-foreground text-sm sm:text-base leading-snug break-words flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                {convenio?.institucion || 'No seleccionado'}
              </p>
              {convenio?.tutorInstitucional && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tutor Institucional: {convenio.tutorInstitucional}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Tutor Académico:</span>
                <span className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-primary shrink-0" />
                  {nombreTutor}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Horas a asignar:</span>
                <span className="font-bold text-xs sm:text-sm text-primary flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  {horasAsignadas} horas
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Total estudiantes:</span>
                <span className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {estudiantes.length}
                </span>
              </div>
            </div>
          </div>

          {/* Lista de estudiantes seleccionados */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Estudiantes a asignar:
            </span>
            <ScrollArea className="h-44 rounded-md border p-2">
              <div className="space-y-1.5">
                {estudiantes.map((est) => (
                  <div
                    key={est.id}
                    className="text-xs flex justify-between items-center p-2 rounded bg-background border"
                  >
                    <div className="truncate mr-2">
                      <p className="font-medium text-foreground truncate">
                        {est.nombres} {est.apellidos}
                      </p>
                      <p className="text-muted-foreground">CI: {est.identificacion || 'S/N'}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-primary shrink-0">
                      + {horasAsignadas}h
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={alCerrar}
            disabled={estaPendiente}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={alConfirmar}
            disabled={estaPendiente}
            className="gap-2"
          >
            {estaPendiente ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              'Confirmar Asignación'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
