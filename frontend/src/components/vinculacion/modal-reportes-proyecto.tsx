'use client';

import { useState, useEffect, useRef } from 'react';
import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';
import { ReporteProyecto, TipoReporteProyectoVcs, EstadoRevisionVcs } from '@/lib/tipos/vcs/reporte-proyecto';
import {
    obtenerReportesPorProyectoAccion,
    subirReporteProyectoAccion,
    revisarReporteSubdecanatoAccion,
} from '@/lib/acciones/vcs/reporte-proyecto.acciones';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { BadgeEstadoRevision } from './badge-estado-revision';
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion';
import { tienePermiso, PERMISOS } from '@/lib/seguridad/permisos';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Download,
    Plus,
    Calendar,
    User,
    X,
    FolderGit2,
} from 'lucide-react';

interface ModalReportesProyectoProps {
    abierto: boolean;
    abrirModal: (abierto: boolean) => void;
    proyecto: ProyectoComunitarioDto | null;
    periodoId?: number;
}

export function ModalReportesProyecto({
    abierto,
    abrirModal,
    proyecto,
    periodoId = 1,
}: ModalReportesProyectoProps) {
    const { usuario } = useAutenticacion();
    const [reportes, setReportes] = useState<ReporteProyecto[]>([]);
    const [cargando, setCargando] = useState(false);
    const [indiceReporteActual, setIndiceReporteActual] = useState(0);
    const [modoSubida, setModoSubida] = useState(false);

    // Formulario de subida (CPP)
    const [tipoReporte, setTipoReporte] = useState<TipoReporteProyectoVcs>('TRIMESTRAL_AVANCES');
    const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
    const [arrastrandoPdf, setArrastrandoPdf] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const refInputPdf = useRef<HTMLInputElement>(null);

    const validarPdfReporte = (f: File): boolean => {
        if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
            toast.error('Formato no permitido. Solo se permiten archivos en formato PDF.');
            return false;
        }
        if (f.size > 10 * 1024 * 1024) {
            toast.error('El archivo excede el tamaño máximo permitido de 10 MB.');
            return false;
        }
        return true;
    };

    // Revisión por Subdecano
    const [rechazoOpen, setRechazoOpen] = useState(false);
    const [observacion, setObservacion] = useState('');
    const [estaEnviandoRevision, setEstaEnviandoRevision] = useState(false);

    const puedeSubir = tienePermiso(usuario?.rol, PERMISOS.REPORTES_SUBIR);
    const puedeRevisar = tienePermiso(usuario?.rol, PERMISOS.REPORTES_REVISAR);

    const cargarReportes = async () => {
        if (!proyecto?.id) return;
        setCargando(true);
        try {
            const respuesta = await obtenerReportesPorProyectoAccion(proyecto.id);
            if (respuesta.exito && respuesta.data) {
                setReportes(respuesta.data);
            } else {
                setReportes([]);
            }
        } catch (error) {
            console.error('Error al cargar reportes:', error);
            toast.error('No se pudieron cargar los reportes del proyecto');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (abierto && proyecto?.id) {
            cargarReportes();
            setIndiceReporteActual(0);
            setModoSubida(false);
            setRechazoOpen(false);
            setObservacion('');
            setArchivoPdf(null);
        }
    }, [abierto, proyecto?.id]);

    const reporteActual = reportes[indiceReporteActual] || null;

    const manejarSubirReporte = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proyecto?.id) return;
        if (!archivoPdf) {
            toast.error('Debes seleccionar un archivo PDF para el reporte');
            return;
        }

        setSubiendo(true);
        try {
            // 1. Subir archivo físico al servidor
            const urlArchivo = await subirArchivo(archivoPdf, CARPETAS_ARCHIVOS.VINCULACION);

            // 2. Registrar reporte en la base de datos
            const respuesta = await subirReporteProyectoAccion({
                proyectoId: proyecto.id,
                periodoId: periodoId,
                tipo: tipoReporte,
                nombreArchivo: archivoPdf.name,
                urlArchivo: urlArchivo,
            });

            if (respuesta.exito) {
                toast.success('Reporte subido y enviado a revisión exitosamente');
                setModoSubida(false);
                setArchivoPdf(null);
                await cargarReportes();
                setIndiceReporteActual(0);
            } else {
                toast.error(respuesta.mensaje || 'Error al registrar el reporte');
            }
        } catch (error: any) {
            console.error('Error al subir reporte:', error);
            toast.error(error.message || 'Error al procesar la subida del reporte');
        } finally {
            setSubiendo(false);
        }
    };

    const manejarRevisionSubdecanato = async (nuevoEstado: EstadoRevisionVcs) => {
        if (!reporteActual) return;
        if (nuevoEstado === 'OBSERVADO' && !observacion.trim()) {
            toast.error('Debe ingresar las observaciones para la devolución');
            return;
        }

        setEstaEnviandoRevision(true);
        try {
            const respuesta = await revisarReporteSubdecanatoAccion(reporteActual.id, {
                estadoSubdecanato: nuevoEstado,
                observaciones: nuevoEstado === 'OBSERVADO' ? observacion : '',
            });

            if (respuesta.exito) {
                toast.success(
                    nuevoEstado === 'APROBADO'
                        ? 'Informe aprobado exitosamente'
                        : 'Informe observado y devuelto al coordinador'
                );
                setRechazoOpen(false);
                setObservacion('');
                await cargarReportes();
            } else {
                toast.error(respuesta.mensaje || 'Error al registrar la revisión');
            }
        } catch (error: any) {
            console.error('Error al revisar informe:', error);
            toast.error(error.message || 'Error al guardar la revisión');
        } finally {
            setEstaEnviandoRevision(false);
        }
    };

    const descargarReporte = async () => {
        if (!reporteActual?.urlArchivo) return;
        try {
            const urlFinal = adaptarUrlProxy(reporteActual.urlArchivo);
            const respuesta = await fetch(urlFinal);
            if (!respuesta.ok) throw new Error('Error al descargar archivo');
            const blob = await respuesta.blob();
            const urlBlob = window.URL.createObjectURL(blob);
            const enlace = document.createElement('a');
            enlace.href = urlBlob;
            enlace.download = reporteActual.nombreArchivo || 'informe_proyecto.pdf';
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            toast.error('No se pudo descargar el archivo');
        }
    };

    return (
        <Dialog open={abierto} onOpenChange={abrirModal}>
            <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden border-border bg-card">
                {/* Cabecera del Modal */}
                <DialogHeader className="p-5 pb-3 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                            <FolderGit2 className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">
                                Informes y Seguimiento del Proyecto
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {proyecto?.nombre} • {proyecto?.nombreCarrera}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Cuerpo Principal dividido en 2 paneles (Estilo Visor de Aprobación de Evidencias) */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-w-0">
                    {/* Panel Lateral Izquierdo: Lista de Informes */}
                    <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col p-3 sm:p-4 gap-2 overflow-y-auto max-h-[180px] md:max-h-none shrink-0">
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Informes ({reportes.length})
                            </span>
                            {puedeSubir && proyecto?.estado !== 'FINALIZADO' && (
                                <Button
                                    size="sm"
                                    onClick={() => setModoSubida(true)}
                                    className="h-7 text-xs font-semibold gap-1 px-2.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Subir
                                </Button>
                            )}
                        </div>

                        {cargando ? (
                            <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="text-xs">Cargando...</span>
                            </div>
                        ) : reportes.length === 0 ? (
                            <div className="py-8 text-center space-y-2">
                                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                                <p className="text-xs font-medium text-foreground">Sin informes registrados</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {puedeSubir
                                        ? 'Carga el reporte trimestral o final usando el botón superior.'
                                        : 'El coordinador aún no ha cargado informes.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {reportes.map((rep, idx) => {
                                    const seleccionado = !modoSubida && indiceReporteActual === idx;
                                    return (
                                        <Button
                                            key={rep.id}
                                            variant={seleccionado ? 'secondary' : 'ghost'}
                                            className={`justify-start text-left h-auto py-3 px-3 flex-col items-start gap-1.5 rounded-xl transition-all w-full ${seleccionado
                                                ? 'bg-background shadow-xs border border-border font-semibold'
                                                : 'hover:bg-muted/50 border border-transparent'
                                                }`}
                                            onClick={() => {
                                                setModoSubida(false);
                                                setIndiceReporteActual(idx);
                                                setRechazoOpen(false);
                                                setObservacion('');
                                            }}
                                        >
                                            <div className="flex items-center justify-between w-full gap-1">
                                                <span className="text-xs font-bold truncate text-foreground">
                                                    {rep.tipo === 'TRIMESTRAL_AVANCES'
                                                        ? 'Reporte Trimestral'
                                                        : 'Informe Final Definitivo'}
                                                </span>
                                                <BadgeEstadoRevision estado={rep.estadoSubdecanato} />
                                            </div>

                                            <div className="text-xs text-muted-foreground truncate w-full flex items-center gap-1">
                                                <FileText className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{rep.nombreArchivo}</span>
                                            </div>

                                            <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground pt-0.5 border-t border-border/40">
                                                <span>{formatearFechaCorta(rep.fechaSubida)}</span>
                                                {rep.nombreCoordinador && (
                                                    <span className="truncate max-w-[120px]">
                                                        {rep.nombreCoordinador}
                                                    </span>
                                                )}
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Panel Central Derecho: Visor Integrado de PDF o Formulario de Subida */}
                    <div className="flex-1 flex flex-col bg-muted/5 overflow-hidden">
                        {modoSubida ? (
                            <div className="flex-1 p-6 overflow-y-auto">
                                <form onSubmit={manejarSubirReporte} className="max-w-xl mx-auto space-y-5">
                                    <div className="border rounded-2xl p-6 bg-card shadow-xs space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-border">
                                            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                                <Upload className="h-5 w-5 text-primary" />
                                                Cargar Nuevo Informe de Proyecto
                                            </h4>
                                            {reportes.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setModoSubida(false)}
                                                    className="h-7 text-xs"
                                                >
                                                    Volver al Visor
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tipoReporte" className="text-xs font-semibold">
                                                Tipo de Informe
                                            </Label>
                                            <Select
                                                value={tipoReporte}
                                                onValueChange={(val) => setTipoReporte(val as TipoReporteProyectoVcs)}
                                            >
                                                <SelectTrigger id="tipoReporte" className="h-9 text-xs">
                                                    <SelectValue placeholder="Seleccione el tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="TRIMESTRAL_AVANCES">
                                                        Reporte Trimestral de Avances
                                                    </SelectItem>
                                                    <SelectItem value="INFORME_DEFINITIVO">
                                                        Informe Final Definitivo (Cierre de Proyecto)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="archivoPdf" className="text-xs font-semibold">
                                                Archivo del Informe (.pdf)
                                            </Label>
                                            <div
                                                className={cn(
                                                    'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none',
                                                    arrastrandoPdf
                                                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]'
                                                        : archivoPdf
                                                        ? 'border-primary/60 bg-primary/5'
                                                        : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-muted/10'
                                                )}
                                                onClick={() => !archivoPdf && !subiendo && refInputPdf.current?.click()}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onDragEnter={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (!archivoPdf && !subiendo) {
                                                        setArrastrandoPdf(true);
                                                    }
                                                }}
                                                onDragLeave={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                                    setArrastrandoPdf(false);
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setArrastrandoPdf(false);
                                                    if (subiendo || archivoPdf) return;

                                                    const archivoSoltado = e.dataTransfer.files?.[0];
                                                    if (archivoSoltado && validarPdfReporte(archivoSoltado)) {
                                                        setArchivoPdf(archivoSoltado);
                                                        toast.success(`Informe preparado: ${archivoSoltado.name}`);
                                                    }
                                                }}
                                            >
                                                <input
                                                    ref={refInputPdf}
                                                    id="archivoPdf"
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    disabled={subiendo}
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        if (f && validarPdfReporte(f)) {
                                                            setArchivoPdf(f);
                                                            toast.success(`Informe preparado: ${f.name}`);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                                {archivoPdf ? (
                                                    <div className="flex items-center justify-between gap-3 text-foreground p-1">
                                                        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                                                            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-semibold text-xs sm:text-sm truncate">
                                                                    {archivoPdf.name}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    {(archivoPdf.size / (1024 * 1024)).toFixed(2)} MB • PDF
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                                                            disabled={subiendo}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setArchivoPdf(null);
                                                                if (refInputPdf.current) refInputPdf.current.value = '';
                                                            }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Upload
                                                            className={cn(
                                                                'h-8 w-8 mb-2 transition-all',
                                                                arrastrandoPdf ? 'text-primary scale-110' : 'text-primary'
                                                            )}
                                                        />
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {arrastrandoPdf ? 'Suelta el archivo PDF aquí' : 'Haz clic o arrastra el archivo PDF aquí'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Formato permitido únicamente: PDF (máx. 10 MB)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {tipoReporte === 'INFORME_DEFINITIVO' && (
                                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                                                <strong>Nota:</strong> El informe final definitivo debe incluir las firmas y anexos de culminación del proyecto comunitario.
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-3">
                                            {reportes.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setModoSubida(false)}
                                                    disabled={subiendo}
                                                >
                                                    Cancelar
                                                </Button>
                                            )}
                                            <Button type="submit" size="sm" disabled={subiendo || !archivoPdf} className="gap-2">
                                                {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                Enviar a Revisión
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : cargando ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-xs">Cargando informe y documento...</p>
                            </div>
                        ) : reporteActual ? (
                            <>
                                {/* Barra Superior del Visor con Metadatos y Descarga */}
                                <div className="p-4 border-b border-border bg-background flex flex-wrap justify-between items-center gap-2 shrink-0">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-primary" />
                                                {reporteActual.tipo === 'TRIMESTRAL_AVANCES'
                                                    ? 'Reporte Trimestral de Avances'
                                                    : 'Informe Final Definitivo'}
                                            </h3>
                                            <BadgeEstadoRevision estado={reporteActual.estadoSubdecanato} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Archivo: <strong>{reporteActual.nombreArchivo}</strong> • Subido:{' '}
                                            {formatearFechaCorta(reporteActual.fechaSubida)}
                                            {reporteActual.nombreCoordinador && ` por ${reporteActual.nombreCoordinador}`}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={descargarReporte}
                                        className="gap-1.5 h-8 text-xs font-semibold"
                                    >
                                        <Download className="h-3.5 w-3.5 text-primary" />
                                        Descargar PDF
                                    </Button>
                                </div>

                                {/* Contenedor del PDF (iFrame sin intermediarios) */}
                                <div className="flex-1 overflow-hidden relative bg-muted/10">
                                    {reporteActual.urlArchivo ? (
                                        <iframe
                                            src={adaptarUrlProxy(reporteActual.urlArchivo)}
                                            className="w-full h-full border-none"
                                            title={`Visor ${reporteActual.nombreArchivo}`}
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-3 p-6 text-center">
                                            <FileText className="w-14 h-14 text-muted-foreground/30" />
                                            <p className="font-semibold text-foreground text-sm">
                                                No se puede previsualizar el archivo
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Barra Inferior de Acciones */}
                                <div className="p-4 border-t border-border bg-background shadow-xs z-10 shrink-0">
                                    {/* Panel de Decisiones para Subdecanato */}
                                    {puedeRevisar ? (
                                        reporteActual.estadoSubdecanato === 'APROBADO' ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span>Este informe ha sido aprobado por el Subdecanato.</span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => manejarRevisionSubdecanato('PENDIENTE')}
                                                    disabled={estaEnviandoRevision}
                                                    className="h-8 text-xs"
                                                >
                                                    Revertir a Pendiente
                                                </Button>
                                            </div>
                                        ) : reporteActual.estadoSubdecanato === 'OBSERVADO' ? (
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                <div className="flex items-start gap-2 text-destructive text-xs max-w-2xl">
                                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold">Devuelto con observaciones: </span>
                                                        <p className="whitespace-pre-wrap mt-0.5 text-foreground/90">
                                                            {reporteActual.observaciones || 'Sin observación especificada.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => manejarRevisionSubdecanato('PENDIENTE')}
                                                    disabled={estaEnviandoRevision}
                                                    className="h-8 text-xs shrink-0"
                                                >
                                                    Revertir a Pendiente
                                                </Button>
                                            </div>
                                        ) : rechazoOpen ? (
                                            <div className="space-y-3 animate-in slide-in-from-bottom-2">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-destructive font-semibold text-xs flex items-center gap-1.5">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Observaciones para la devolución del informe al Coordinador:
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
                                                    placeholder="Detalla claramente los motivos o correcciones requeridas por el Subdecanato..."
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
                                                        disabled={estaEnviandoRevision}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => manejarRevisionSubdecanato('OBSERVADO')}
                                                        disabled={estaEnviandoRevision || !observacion.trim()}
                                                    >
                                                        {estaEnviandoRevision ? 'Guardando...' : 'Confirmar Observación y Devolver'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                <div className="text-xs text-muted-foreground">
                                                    Revise el contenido del informe en el visor integrado y registre su resolución.
                                                </div>
                                                <div className="flex gap-2 ml-auto shrink-0">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setRechazoOpen(true)}
                                                        disabled={estaEnviandoRevision}
                                                        className="gap-1.5 h-8 text-xs font-semibold"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Rechazar / Observar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-semibold shadow-xs"
                                                        onClick={() => manejarRevisionSubdecanato('APROBADO')}
                                                        disabled={estaEnviandoRevision}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Aprobar Informe
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        /* Panel Informativo para CPP */
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                            {reporteActual.estadoSubdecanato === 'OBSERVADO' ? (
                                                <div className="flex items-start gap-2 text-destructive text-xs max-w-xl">
                                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold">Observado por Subdecanato: </span>
                                                        <span className="text-foreground/90">{reporteActual.observaciones}</span>
                                                    </div>
                                                </div>
                                            ) : reporteActual.estadoSubdecanato === 'APROBADO' ? (
                                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Informe aprobado y archivado en Subdecanato.</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Informe en espera de revisión por el Subdecanato.</span>
                                                </div>
                                            )}

                                            {puedeSubir && reporteActual.estadoSubdecanato === 'OBSERVADO' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setTipoReporte(reporteActual.tipo);
                                                        setModoSubida(true);
                                                    }}
                                                    className="gap-1.5 h-8 text-xs font-semibold ml-auto"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    Subir Corrección
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 p-8 text-center">
                                <FileText className="w-16 h-16 text-muted-foreground/30" />
                                <div>
                                    <p className="font-bold text-foreground text-base">
                                        No hay ningún informe seleccionado
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                        {puedeSubir
                                            ? 'Carga un nuevo informe trimestral o final para el proyecto.'
                                            : 'Los informes subidos por la Coordinación de Vinculación aparecerán aquí.'}
                                    </p>
                                </div>
                                {puedeSubir && proyecto?.estado !== 'FINALIZADO' && (
                                    <Button
                                        size="sm"
                                        onClick={() => setModoSubida(true)}
                                        className="gap-1.5 text-xs font-semibold mt-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Subir Primer Informe
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie del Modal */}
                <div className="p-3.5 px-5 border-t border-border bg-card flex justify-end items-center shrink-0">
                    <Button variant="outline" size="sm" onClick={() => abrirModal(false)} className="h-8 text-xs font-semibold">
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
