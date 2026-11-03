'use client';

import { Loader2 } from 'lucide-react';
import { EstudianteResumenDto } from '@/lib/tipos/general';
import { ProyectoResumenDto } from '@/lib/tipos/vcs/asignacion-proyecto';
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

interface ModalResumenAsignacionProps {
    abierto: boolean;
    alCerrar: () => void;
    alConfirmar: () => void;
    estaPendiente: boolean;
    proyecto: ProyectoResumenDto | undefined;
    estudiantes: EstudianteResumenDto[];
    horasAsignadas: number;
}

export function ModalResumenAsignacion({
    abierto,
    alCerrar,
    alConfirmar,
    estaPendiente,
    proyecto,
    estudiantes,
    horasAsignadas,
}: ModalResumenAsignacionProps) {
    return (
        <Dialog open={abierto} onOpenChange={(open) => !open && alCerrar()}>
            <DialogContent className="max-w-lg sm:max-w-2xl md:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Resumen de Asignación</DialogTitle>
                    <DialogDescription>
                        Verifique los detalles antes de confirmar la asignación comunitaria.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Resumen del Proyecto, Descripción y Horas */}
                    <div className="p-4 bg-muted/40 rounded-lg border border-border text-sm space-y-3">
                        <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                Proyecto destino:
                            </span>
                            <p className="font-semibold text-foreground text-sm sm:text-base leading-snug break-words">
                                {proyecto?.nombre || 'No seleccionado'}
                            </p>
                            {proyecto?.descripcion && (
                                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed bg-background/70 break-words">
                                    {proyecto.descripcion}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60">
                            <div>
                                <span className="text-xs text-muted-foreground block font-medium">Tutor académico:</span>
                                <span className="font-semibold text-xs sm:text-sm text-foreground">
                                    {proyecto?.nombreTutor || 'Sin asignar'}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block font-medium">Horas a asignar:</span>
                                <span className="font-bold text-xs sm:text-sm text-primary">{horasAsignadas} horas</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block font-medium">Total estudiantes:</span>
                                <span className="font-bold text-xs sm:text-sm text-foreground">{estudiantes.length}</span>
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
                                    <div key={est.id} className="text-xs flex justify-between items-center p-2 rounded bg-background border">
                                        <div className="truncate mr-2">
                                            <p className="font-medium text-foreground truncate">{est.nombres} {est.apellidos}</p>
                                            <p className="text-muted-foreground">CI: {est.identificacion || 'S/N'}</p>
                                        </div>
                                        <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
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
                            'Confirmar y Guardar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
