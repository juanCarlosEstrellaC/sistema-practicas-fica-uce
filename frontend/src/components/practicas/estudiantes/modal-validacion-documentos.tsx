'use client';

import { useState, useEffect } from 'react';
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
import { CheckCircle2, AlertCircle, FileText, X, Loader2 } from 'lucide-react';
import { DocumentoDto } from '@/lib/tipos/pp/general-pp';
import { obtenerEtiquetaTipoDocumento } from '@/lib/utilidades/etiquetas';
import {
  adaptarUrlProxy,
  obtenerUrlPrevisualizacionDocumentoPortafolio,
} from '@/lib/utilidades/proxy-url';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import {
  revisarDocumentoPortafolioAccion,
  obtenerDocumentosPorEstudianteAccion,
} from '@/lib/acciones/pp/documento-portafolio.acciones';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { validarCppAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { cn } from '@/lib/utils';

export interface ModalValidacionDocumentosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentos: DocumentoDto[] | any[];
  fase?: string;
  estudianteId?: string;
  nombreEstudiante?: string;
  asignacionId?: string;
  onValidacionCompleta: () => void;
}

const ORDEN_DOCUMENTOS = [
  'CV',
  'DOCUMENTO_IDENTIDAD',
  'SEGUIMIENTO_TA',
  'INFORME_FINAL',
  'CERTIFICADO_CUMPLIMIENTO',
];

function obtenerNombrePdf(doc?: DocumentoDto | null): string {
  if (!doc) return '';
  if (!doc.url && (!doc.id || String(doc.id) === '0')) return '';

  if (doc.nombre && (doc.nombre.toLowerCase().endsWith('.pdf') || doc.nombre.includes('.'))) {
    return doc.nombre;
  }

  if (doc.url) {
    const parteFinal = doc.url.split('/').pop()?.split('?')[0];
    if (parteFinal && (parteFinal.toLowerCase().endsWith('.pdf') || parteFinal.includes('.'))) {
      return decodeURIComponent(parteFinal);
    }
  }

  if (doc.nombre && doc.nombre !== obtenerEtiquetaTipoDocumento(doc.tipo)) {
    return doc.nombre.toLowerCase().endsWith('.pdf') ? doc.nombre : `${doc.nombre}.pdf`;
  }

  return doc.url ? 'documento.pdf' : '';
}

function obtenerIndiceInicialNoAprobado(docs: DocumentoDto[], asignacionId?: string): number {
  const filtrados = asignacionId
    ? docs.filter(
        (d: any) =>
          d.tipo === 'CV' ||
          d.tipo === 'DOCUMENTO_IDENTIDAD' ||
          !d.asignacionId ||
          String(d.asignacionId) === String(asignacionId)
      )
    : docs;

  const primerPendienteIdx = ORDEN_DOCUMENTOS.findIndex((tipo) => {
    const doc = filtrados.find((d: any) => d.tipo === tipo);
    return !doc || doc.estado !== 'APROBADO';
  });

  return primerPendienteIdx !== -1 ? primerPendienteIdx : 0;
}

export function ModalValidacionDocumentos({
  open,
  onOpenChange,
  documentos,
  estudianteId,
  nombreEstudiante,
  asignacionId,
  onValidacionCompleta,
}: ModalValidacionDocumentosProps) {
  const [indiceDocActual, setIndiceDocActual] = useState(() =>
    obtenerIndiceInicialNoAprobado(documentos || [], asignacionId)
  );
  const [rechazoOpen, setRechazoOpen] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [listaDocumentos, setListaDocumentos] = useState<DocumentoDto[]>(documentos || []);

  useEffect(() => {
    if (open && estudianteId) {
      obtenerDocumentosPorEstudianteAccion(Number(estudianteId))
        .then((docs) => {
          if (docs && docs.length > 0) {
            setListaDocumentos(docs);
            setIndiceDocActual(obtenerIndiceInicialNoAprobado(docs, asignacionId));
          } else if (documentos && documentos.length > 0) {
            setListaDocumentos(documentos);
            setIndiceDocActual(obtenerIndiceInicialNoAprobado(documentos, asignacionId));
          }
        })
        .catch((err) => console.error('Error al cargar documentos del estudiante:', err));
    } else if (documentos && documentos.length > 0) {
      setListaDocumentos(documentos);
      setIndiceDocActual(obtenerIndiceInicialNoAprobado(documentos, asignacionId));
    }
  }, [open, estudianteId, documentos, asignacionId]);

  const documentosFiltrados = asignacionId
    ? listaDocumentos.filter(
        (d: any) =>
          d.tipo === 'CV' ||
          d.tipo === 'DOCUMENTO_IDENTIDAD' ||
          !d.asignacionId ||
          String(d.asignacionId) === String(asignacionId)
      )
    : listaDocumentos;

  const documentosAValidar: DocumentoDto[] = ORDEN_DOCUMENTOS.map((tipo) => {
    const doc = documentosFiltrados.find((d: any) => d.tipo === tipo);
    return (
      doc || {
        id: '0',
        estudianteId: String(estudianteId || '0'),
        tipo: tipo as any,
        nombre: obtenerEtiquetaTipoDocumento(tipo as any),
        estado: 'PENDIENTE_REVISION',
        url: '',
        observacion: '',
        firmado: false,
        fechaSubida: '',
      }
    );
  });

  const todosAprobados =
    documentosAValidar.length === 5 &&
    documentosAValidar.every((d) => d.estado === 'APROBADO');

  if (documentosAValidar.length === 0) return null;

  const documentoActual = documentosAValidar[indiceDocActual];
  const esDocumentoBaseEstudiante =
    documentoActual?.tipo === 'CV' || documentoActual?.tipo === 'DOCUMENTO_IDENTIDAD';

  const manejarValidacion = async (estado: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE_REVISION') => {
    if (estado === 'RECHAZADO' && !observacion.trim()) {
      toast.error('Debe ingresar una observación para rechazar el documento.');
      return;
    }

    if (!documentoActual.id || String(documentoActual.id) === '0') {
      toast.error('No se puede revisar un documento que no ha sido subido por el estudiante.');
      return;
    }

    setEstaEnviando(true);
    try {
      const respuesta = await revisarDocumentoPortafolioAccion(Number(documentoActual.id), {
        estado,
        observacion: estado === 'RECHAZADO' ? observacion.trim() : undefined,
      });

      if (respuesta.exito) {
        if (estado === 'PENDIENTE_REVISION') {
          toast.success('Validación revertida a Pendiente');
        } else {
          toast.success(
            estado === 'APROBADO'
              ? 'Documento aprobado con éxito'
              : 'Documento devuelto con observaciones'
          );
        }

        // Actualizar localmente para retroalimentación visual inmediata
        setListaDocumentos((prev) =>
          prev.map((d) =>
            d.tipo === documentoActual.tipo
              ? {
                ...d,
                estado: estado as any,
                observacion: estado === 'RECHAZADO' ? observacion.trim() : undefined,
              }
              : d
          )
        );

        setRechazoOpen(false);
        setObservacion('');

        // Avanzar automáticamente al siguiente si se aprobó o rechazó
        if (estado !== 'PENDIENTE_REVISION' && indiceDocActual < documentosAValidar.length - 1) {
          setIndiceDocActual(indiceDocActual + 1);
        }
      } else {
        toast.error(respuesta.mensaje || 'Error al validar el documento');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error de conexión al validar documento');
    } finally {
      setEstaEnviando(false);
    }
  };

  const renderBadge = (estado?: string, tieneUrl?: boolean) => {
    switch (estado?.toUpperCase()) {
      case 'APROBADO':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap">
            Aprobado
          </Badge>
        );
      case 'RECHAZADO':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 shrink-0 whitespace-nowrap">
            Rechazado
          </Badge>
        );
      case 'PENDIENTE_REVISION':
      case 'SUBIDO':
        if (tieneUrl === false) {
          return (
            <Badge variant="outline" className="shrink-0 whitespace-nowrap text-muted-foreground">
              Pendiente
            </Badge>
          );
        }
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0 whitespace-nowrap">
            En Revisión
          </Badge>
        );
      case 'PENDIENTE':
      default:
        return (
          <Badge variant="outline" className="shrink-0 whitespace-nowrap text-muted-foreground">
            Pendiente
          </Badge>
        );
    }
  };

  const urlDocumentoBase = documentoActual?.url
    ? documentoActual.id && String(documentoActual.id) !== '0'
      ? obtenerUrlPrevisualizacionDocumentoPortafolio(documentoActual.id)
      : documentoActual.url
    : '';
  const urlDocumentoSegura = urlDocumentoBase ? adaptarUrlProxy(urlDocumentoBase) : '';
  const nombrePdfActual = documentoActual ? obtenerNombrePdf(documentoActual) : '';
  const etiquetaTipoActual = documentoActual ? obtenerEtiquetaTipoDocumento(documentoActual.tipo) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-3 border-b">
          <DialogTitle className="text-base font-bold text-foreground">
            Validación de Documentos del Portafolio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5" title={nombreEstudiante ? `Estudiante: ${nombreEstudiante}` : undefined}>
            Estudiante: <strong className="font-medium text-foreground">{nombreEstudiante || 'Estudiante'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden m-0">
          {/* Barra Lateral de Selección de Documento */}
          <div className="w-64 border-r bg-muted/20 flex flex-col p-2 gap-1.5 overflow-y-auto shrink-0">
            {documentosAValidar.map((doc, idx) => {
              const esActivo = indiceDocActual === idx;
              const fechaArchivo = doc.fechaSubida || (doc as any).fechaCreacion || (doc as any).fecha;
              return (
                <Button
                  key={doc.tipo}
                  variant={esActivo ? 'secondary' : 'ghost'}
                  className={cn(
                    'justify-start text-left h-auto py-2.5 px-3 flex-col items-start gap-1 rounded-lg transition-colors',
                    esActivo
                      ? 'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-semibold shadow-2xs'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'
                  )}
                  onClick={() => {
                    setIndiceDocActual(idx);
                    setRechazoOpen(false);
                    setObservacion('');
                  }}
                >
                  <div className="font-medium text-xs sm:text-sm truncate w-full">
                    {obtenerEtiquetaTipoDocumento(doc.tipo)}
                  </div>
                  <div className="flex items-center justify-between w-full gap-2 mt-0.5">
                    {renderBadge(doc.estado, Boolean(doc.url))}
                    {fechaArchivo && (
                      <span className="text-[10px] text-muted-foreground shrink-0 font-normal">
                        {formatearFechaCorta(fechaArchivo)}
                      </span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Contenido Principal con Visor Proxy */}
          <div className="flex-1 flex flex-col bg-muted/5 overflow-hidden">
            {documentoActual ? (
              <>
                {/* Cabecera sutil del documento (similar a VCS, pero compacta) */}
                <div className="px-3.5 py-1.5 border-b bg-background/80 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-xs text-foreground shrink-0" title={etiquetaTipoActual}>
                      {etiquetaTipoActual}
                    </span>
                    <span className="text-muted-foreground/40 shrink-0">|</span>
                    <span className="text-xs text-muted-foreground truncate min-w-0" title={nombrePdfActual || 'Sin archivo'}>
                      {nombrePdfActual || 'Sin archivo'}
                    </span>
                  </div>
                  <div className="shrink-0 scale-90 origin-right">
                    {renderBadge(documentoActual.estado, Boolean(documentoActual.url))}
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  {urlDocumentoSegura ? (
                    <iframe
                      src={urlDocumentoSegura}
                      className="w-full h-full border-none"
                      title={`Visor ${documentoActual.nombre || 'Documento'}`}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-2">
                      <FileText className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-sm">El estudiante aún no ha subido este documento.</p>
                    </div>
                  )}
                </div>

                <div className="p-2.5 border-t bg-background shadow-xs z-10">
                  {documentoActual.estado === 'APROBADO' ? (
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium text-sm">
                          {esDocumentoBaseEstudiante
                            ? 'Este documento ya fue aprobado y se reutiliza en todas las prácticas del estudiante.'
                            : 'Este documento ya ha sido aprobado.'}
                        </span>
                      </div>
                      {!esDocumentoBaseEstudiante && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => manejarValidacion('PENDIENTE_REVISION')}
                          disabled={estaEnviando}
                        >
                          Revertir a Pendiente
                        </Button>
                      )}
                    </div>
                  ) : documentoActual.estado === 'RECHAZADO' ? (
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2 text-destructive max-w-md">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium text-sm truncate" title={documentoActual.observacion}>
                          Rechazado: {documentoActual.observacion}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => manejarValidacion('PENDIENTE_REVISION')}
                        disabled={estaEnviando}
                      >
                        Revertir a Pendiente
                      </Button>
                    </div>
                  ) : rechazoOpen ? (
                    <div className="space-y-3 animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-destructive font-semibold text-xs uppercase tracking-wide">
                          Motivo del Rechazo / Observaciones:
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
                        placeholder="Escriba los motivos o correcciones requeridas para el estudiante..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        maxLength={500}
                        rows={3}
                        className="resize-none text-sm"
                      />
                      <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                        <span>Sea específico con las correcciones requeridas.</span>
                        <span className={cn(observacion.length >= 500 && 'text-destructive font-semibold')}>
                          {observacion.length}/500
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setRechazoOpen(false)}
                          disabled={estaEnviando}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => manejarValidacion('RECHAZADO')}
                          disabled={estaEnviando || !observacion.trim()}
                        >
                          {estaEnviando ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Confirmar Rechazo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center ">
                      <div className="flex gap-3 ml-auto ">
                        <Button
                          variant="destructive"
                          onClick={() => setRechazoOpen(true)}
                          disabled={estaEnviando || !documentoActual.url}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Rechazar
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => manejarValidacion('APROBADO')}
                          disabled={estaEnviando || !documentoActual.url}
                        >
                          {estaEnviando ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          Validar y Aprobar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Seleccione un documento para revisar
              </div>
            )}
          </div>
        </div>

        {/* Footer con Confirmación Global y Envío al Subdecano */}
        <div className="p-2.5 px-4 border-t bg-background flex justify-end">
          <Button
            className="w-full sm:w-auto bg-primary text-primary-foreground"
            disabled={!todosAprobados || estaEnviando}
            onClick={async () => {
              if (asignacionId) {
                setEstaEnviando(true);
                try {
                  const res = await validarCppAccion(asignacionId);
                  if (res.exito) {
                    toast.success(res.mensaje || 'Validación de Coordinador de Prácticas exitosa');
                    onOpenChange(false);
                    onValidacionCompleta();
                  } else {
                    toast.error(res.mensaje || 'Error al validar y enviar al Subdecano');
                  }
                } catch {
                  toast.error('Error al validar y enviar al Subdecano');
                } finally {
                  setEstaEnviando(false);
                }
              }
            }}
          >
            {estaEnviando ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Terminar validación y enviar al Subdecano
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export compatible
export { ModalValidacionDocumentos as ValidacionDocumentosDialog };
