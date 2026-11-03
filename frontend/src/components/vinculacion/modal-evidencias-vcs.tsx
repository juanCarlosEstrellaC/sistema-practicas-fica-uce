'use client';

import { useState, useEffect } from 'react';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { EvidenciaVcs, EstadoRevisionVcs, TipoDocumentoVcs } from '@/lib/tipos/vcs/evidencia-vcs';
import {
    obtenerEvidenciasPorAsignacionAccion,
    revisarEvidenciaTutorAccion,
} from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { enviarASubdecanatoAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
} from 'lucide-react';

interface ModalEvidenciasVcsProps {
    abierto: boolean;
    abrirModal: (abierto: boolean) => void;
    asignacion: AsignacionProyectoDto | null;
    alActualizar?: (asignacionActualizada?: AsignacionProyectoDto) => void;
}

interface ItemDocumentoVcs {
    tipo: TipoDocumentoVcs;
    nombre: string;
    descripcion: string;
    evidencia?: EvidenciaVcs;
    estado: 'APROBADO' | 'OBSERVADO' | 'PENDIENTE' | 'NO_SUBIDO';
}

export function ModalEvidenciasVcs({
    abierto,
    abrirModal,
    asignacion,
    alActualizar,
}: ModalEvidenciasVcsProps) {
    const [evidencias, setEvidencias] = useState<EvidenciaVcs[]>([]);
    const [cargando, setCargando] = useState(false);
    const [indiceDocActual, setIndiceDocActual] = useState(0);
    const [rechazoOpen, setRechazoOpen] = useState(false);
    const [observacion, setObservacion] = useState('');
    const [estaEnviando, setEstaEnviando] = useState(false);
    const [estaEnviandoSubdecanato, setEstaEnviandoSubdecanato] = useState(false);
    const [documentosValidadosLocal, setDocumentosValidadosLocal] = useState(
        Boolean(asignacion?.documentosValidados)
    );

    const cargarEvidencias = async () => {
        if (!asignacion?.id) return;
        setCargando(true);
        try {
            const respuesta = await obtenerEvidenciasPorAsignacionAccion(asignacion.id);
            if (respuesta.exito && respuesta.data) {
                setEvidencias(respuesta.data);
            } else {
                setEvidencias([]);
            }
        } catch (error) {
            console.error('Error al cargar evidencias:', error);
            toast.error('No se pudieron cargar las evidencias');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (abierto && asignacion?.id) {
            cargarEvidencias();
            setIndiceDocActual(0);
            setRechazoOpen(false);
            setObservacion('');
            setDocumentosValidadosLocal(Boolean(asignacion.documentosValidados));
        }
    }, [abierto, asignacion?.id, asignacion?.documentosValidados]);

    const tiposDefinidos: { tipo: TipoDocumentoVcs; nombre: string; descripcion: string }[] = [
        {
            tipo: 'BITACORA',
            nombre: 'Bitácora de Actividades',
            descripcion: 'Registro de actividades y control de asistencia de vinculación',
        },
        {
            tipo: 'INFORME_FINAL',
            nombre: 'Informe Final de Vinculación',
            descripcion: 'Informe final de actividades firmado y evaluado',
        },
    ];

    const documentosVcs: ItemDocumentoVcs[] = tiposDefinidos.map((t) => {
        const evi = evidencias.find(
            (e) => e.tipoDocumento === t.tipo || (e.nombreArchivo && e.nombreArchivo.toLowerCase().includes(t.tipo.toLowerCase()))
        );
        if (!evi) {
            return {
                ...t,
                estado: 'NO_SUBIDO',
            };
        }
        return {
            ...t,
            evidencia: evi,
            estado: evi.estadoTutor === 'APROBADO' ? 'APROBADO' : evi.estadoTutor === 'OBSERVADO' ? 'OBSERVADO' : 'PENDIENTE',
        };
    });

    const documentoActual = documentosVcs[indiceDocActual] || documentosVcs[0];
    const todosAprobados = documentosVcs.length > 0 && documentosVcs.every((d) => d.estado === 'APROBADO');
    const yaEnviado = Boolean(asignacion?.documentosValidados || documentosValidadosLocal);

    const manejarValidacion = async (nuevoEstado: EstadoRevisionVcs) => {
        if (!documentoActual?.evidencia) {
            toast.error('El estudiante aún no ha subido este documento');
            return;
        }

        if (nuevoEstado === 'OBSERVADO' && !observacion.trim()) {
            toast.error('Debe ingresar el motivo de las observaciones');
            return;
        }

        setEstaEnviando(true);
        try {
            const respuesta = await revisarEvidenciaTutorAccion(documentoActual.evidencia.id, {
                estadoTutor: nuevoEstado,
                observaciones: nuevoEstado === 'OBSERVADO' ? observacion : '',
            });

            if (respuesta.exito) {
                if (nuevoEstado === 'PENDIENTE') {
                    toast.success('Validación revertida a Pendiente');
                    setDocumentosValidadosLocal(false);
                } else if (nuevoEstado === 'APROBADO') {
                    toast.success('Documento validado y aprobado con éxito');
                } else {
                    toast.success('Documento observado y devuelto al estudiante');
                    setDocumentosValidadosLocal(false);
                }

                setRechazoOpen(false);
                setObservacion('');
                await cargarEvidencias();
                if (alActualizar) alActualizar();

                // Avanzar al siguiente si se aprobó/observó
                if (nuevoEstado !== 'PENDIENTE' && indiceDocActual < documentosVcs.length - 1) {
                    setIndiceDocActual(indiceDocActual + 1);
                }
            } else {
                toast.error(respuesta.mensaje || 'Error al procesar la revisión');
            }
        } catch (error) {
            console.error('Error al revisar:', error);
            toast.error('Error al conectar con el servidor');
        } finally {
            setEstaEnviando(false);
        }
    };

    const manejarEnviarSubdecanato = async () => {
        if (!asignacion?.id || !todosAprobados) return;

        setEstaEnviandoSubdecanato(true);
        try {
            const respuesta = await enviarASubdecanatoAccion(asignacion.id);
            if (respuesta.exito) {
                setDocumentosValidadosLocal(true);
                toast.success(respuesta.mensaje || 'Documentos validados y enviados a Subdecanato con éxito');
                if (alActualizar) alActualizar(respuesta.data);
                abrirModal(false);
            } else {
                toast.error(respuesta.mensaje || 'Error al enviar a Subdecanato');
            }
        } catch (error) {
            console.error('Error al enviar a Subdecanato:', error);
            toast.error('Error al conectar con el servidor');
        } finally {
            setEstaEnviandoSubdecanato(false);
        }
    };

    const renderBadge = (estado: ItemDocumentoVcs['estado']) => {
        switch (estado) {
            case 'APROBADO':
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap">
                        Aprobado
                    </Badge>
                );
            case 'OBSERVADO':
                return <Badge variant="destructive">Observado</Badge>;
            case 'PENDIENTE':
                return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">Pendiente</Badge>;
            default:
                return <Badge variant="outline" className="text-muted-foreground border-border">No subido</Badge>;
        }
    };

    return (
        <Dialog open={abierto} onOpenChange={abrirModal}>
            <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-border bg-card">
                <DialogHeader className="px-5 py-3 border-b border-border">
                    <DialogTitle className="text-base font-bold text-foreground">
                        Validación de Documentos de Vinculación con la Sociedad
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5" title={asignacion?.nombreCompletoEstudiante ? `Estudiante: ${asignacion.nombreCompletoEstudiante}` : undefined}>
                        Estudiante: <strong className="font-medium text-foreground">{asignacion?.nombreCompletoEstudiante || 'Estudiante'}</strong>
                        {asignacion?.nombreProyecto && (
                            <span className="text-muted-foreground/70 ml-1">({asignacion.nombreProyecto})</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden m-0">
                    {/* Barra Lateral Izquierda (Lista de Documentos) */}
                    <div className="w-64 border-r border-border bg-muted/20 flex flex-col p-2 gap-1.5 overflow-y-auto shrink-0">
                        {documentosVcs.map((doc, idx) => {
                            const esActivo = indiceDocActual === idx;
                            return (
                                <Button
                                    key={doc.tipo}
                                    variant={esActivo ? 'secondary' : 'ghost'}
                                    className={cn(
                                        'justify-start text-left h-auto py-2.5 px-3 flex-col items-start gap-1 rounded-lg transition-colors',
                                        esActivo
                                            ? 'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-2xs border border-primary/20'
                                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'
                                    )}
                                    onClick={() => {
                                        setIndiceDocActual(idx);
                                        setRechazoOpen(false);
                                        setObservacion('');
                                    }}
                                >
                                    <div className="font-medium text-xs sm:text-sm truncate w-full text-foreground">{doc.nombre}</div>
                                    <div className="flex items-center justify-between w-full gap-2 mt-0.5">
                                        {renderBadge(doc.estado)}
                                        {doc.evidencia?.fechaSubida && (
                                            <span className="text-[10px] text-muted-foreground shrink-0 font-normal">
                                                {formatearFechaCorta(doc.evidencia.fechaSubida)}
                                            </span>
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>

                    {/* Contenido Principal Derecho (Visor Integrado de PDF) */}
                    <div className="flex-1 flex flex-col bg-muted/5 overflow-hidden">
                        {cargando ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-xs">Cargando documento y evidencias...</p>
                            </div>
                        ) : documentoActual ? (
                            <>
                                {/* Cabecera sutil del documento (uniforme con PP, compacta) */}
                                <div className="px-3.5 py-1.5 border-b border-border bg-background/80 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <span className="font-semibold text-xs text-foreground shrink-0" title={documentoActual.nombre}>
                                            {documentoActual.nombre}
                                        </span>
                                        <span className="text-muted-foreground/40 shrink-0">|</span>
                                        <span className="text-xs text-muted-foreground truncate min-w-0" title={documentoActual.evidencia?.nombreArchivo || 'Sin archivo'}>
                                            {documentoActual.evidencia?.nombreArchivo || 'Sin archivo'}
                                        </span>
                                    </div>
                                    <div className="shrink-0 scale-90 origin-right">
                                        {renderBadge(documentoActual.estado)}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden relative bg-muted/10">
                                    {documentoActual.evidencia?.urlArchivo ? (
                                        <iframe
                                            src={adaptarUrlProxy(documentoActual.evidencia.urlArchivo)}
                                            className="w-full h-full border-none"
                                            title={`Visor ${documentoActual.nombre}`}
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-3 p-6 text-center">
                                            <FileText className="w-16 h-16 text-muted-foreground/30" />
                                            <div>
                                                <p className="font-semibold text-foreground text-base">
                                                    El estudiante aún no ha subido este documento
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                                    Cuando el estudiante cargue su {documentoActual.nombre.toLowerCase()} en formato PDF, se visualizará automáticamente aquí.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Barra de Acciones del Tutor */}
                                <div className="p-2.5 border-t border-border bg-background shadow-xs z-10 shrink-0">
                                    {documentoActual.estado === 'APROBADO' ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>Este documento ya ha sido aprobado por el Tutor Académico.</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => manejarValidacion('PENDIENTE')}
                                                disabled={estaEnviando || estaEnviandoSubdecanato}
                                            >
                                                Revertir
                                            </Button>
                                        </div>
                                    ) : documentoActual.estado === 'OBSERVADO' ? (
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-start gap-2 text-destructive text-xs max-w-xl">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold">Devuelto con observaciones: </span>
                                                    <span>{documentoActual.evidencia?.observacionesTutor || 'Sin observación especificada.'}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => manejarValidacion('PENDIENTE')}
                                                disabled={estaEnviando || estaEnviandoSubdecanato}
                                            >
                                                Revertir
                                            </Button>
                                        </div>
                                    ) : rechazoOpen ? (
                                        <div className="space-y-3 animate-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-destructive font-semibold text-xs flex items-center gap-1.5">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Observaciones para la devolución del documento:
                                                </Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => setRechazoOpen(false)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Textarea
                                                placeholder="Describa claramente las correcciones que el estudiante debe realizar en el documento..."
                                                value={observacion}
                                                onChange={(e) => setObservacion(e.target.value)}
                                                rows={3}
                                                className="resize-none text-xs bg-background"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setRechazoOpen(false)}
                                                    disabled={estaEnviando || estaEnviandoSubdecanato}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => manejarValidacion('OBSERVADO')}
                                                    disabled={estaEnviando || estaEnviandoSubdecanato || !observacion.trim()}
                                                >
                                                    {estaEnviando ? 'Guardando...' : 'Confirmar Observación y Devolver'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-muted-foreground">
                                                {documentoActual.evidencia
                                                    ? 'Revise el documento en el visor y tome una decisión.'
                                                    : 'Documento pendiente de subida por el estudiante.'}
                                            </p>
                                            <div className="flex gap-2 ml-auto">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setRechazoOpen(true)}
                                                    disabled={estaEnviando || estaEnviandoSubdecanato || !documentoActual.evidencia?.urlArchivo}
                                                    className="gap-1.5"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Rechazar / Observar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                                    onClick={() => manejarValidacion('APROBADO')}
                                                    disabled={estaEnviando || estaEnviandoSubdecanato || !documentoActual.evidencia?.urlArchivo}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Validar y Aprobar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                Seleccione un documento para visualizar
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie del Modal */}
                <div className="p-2.5 px-4 border-t border-border bg-background flex justify-end items-center shrink-0">
                    <Button
                        size="sm"
                        disabled={!todosAprobados || estaEnviando || estaEnviandoSubdecanato || yaEnviado}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs disabled:opacity-60"
                        onClick={manejarEnviarSubdecanato}
                    >
                        {estaEnviandoSubdecanato ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        {yaEnviado
                            ? 'Información ya enviada a Subdecanato'
                            : todosAprobados
                            ? 'Terminar validación y enviar a Subdecanato'
                            : 'Pendiente de aprobar todos los documentos'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
