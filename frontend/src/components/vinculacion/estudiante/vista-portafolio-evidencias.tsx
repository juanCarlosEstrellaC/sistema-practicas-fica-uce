'use client';

import { useState, useEffect } from 'react';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { EvidenciaVcs, TipoDocumentoVcs } from '@/lib/tipos/vcs/evidencia-vcs';
import { BadgeEstadoRevision } from '@/components/vinculacion/badge-estado-revision';
import { subirEvidenciaAccion } from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Upload,
  Clock,
  Download,
  Eye,
  Plus,
  Loader2,
  FolderGit2,
  Info,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface VistaPortafolioEvidenciasProps {
  asignaciones: AsignacionProyectoDto[];
  evidenciasIniciales: EvidenciaVcs[];
  asignacionActivaId?: number;
}

export function VistaPortafolioEvidencias({
  asignaciones,
  evidenciasIniciales,
  asignacionActivaId,
}: VistaPortafolioEvidenciasProps) {
  const [asignacionIdSeleccionada, setAsignacionIdSeleccionada] = useState<string>(
    asignacionActivaId ? String(asignacionActivaId) : asignaciones.length > 0 ? String(asignaciones[0].id) : ''
  );

  const asignacion = asignaciones.find((a) => String(a.id) === asignacionIdSeleccionada) || asignaciones[0] || null;
  const [evidencias, setEvidencias] = useState<EvidenciaVcs[]>(evidenciasIniciales);
  const [estaSubiendo, setEstaSubiendo] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  // Previsualización y descarga (Estilo PP)
  const [docVistaPrevia, setDocVistaPrevia] = useState<EvidenciaVcs | null>(null);
  const [blobUrlPrevia, setBlobUrlPrevia] = useState<string | null>(null);
  const [cargandoVistaPrevia, setCargandoVistaPrevia] = useState<boolean>(false);

  useEffect(() => {
    let activo = true;
    let urlObjeto: string | null = null;

    async function cargarPreview() {
      if (!docVistaPrevia || !docVistaPrevia.urlArchivo) {
        setBlobUrlPrevia(null);
        return;
      }

      setCargandoVistaPrevia(true);
      try {
        const urlFinal = adaptarUrlProxy(docVistaPrevia.urlArchivo);
        const respuesta = await fetch(urlFinal);
        if (!respuesta.ok) throw new Error('Error al cargar archivo');
        const blob = await respuesta.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        if (activo) {
          urlObjeto = window.URL.createObjectURL(pdfBlob);
          setBlobUrlPrevia(urlObjeto);
        }
      } catch (error) {
        console.error('Error al obtener el blob de previsualización:', error);
        if (activo) {
          setBlobUrlPrevia(adaptarUrlProxy(docVistaPrevia.urlArchivo));
        }
      } finally {
        if (activo) setCargandoVistaPrevia(false);
      }
    }

    cargarPreview();

    return () => {
      activo = false;
      if (urlObjeto) window.URL.revokeObjectURL(urlObjeto);
    };
  }, [docVistaPrevia]);

  const manejarDescarga = async (e: React.MouseEvent, url: string, nombreArchivo: string) => {
    e.preventDefault();
    e.stopPropagation();
    const urlFinal = adaptarUrlProxy(url);
    try {
      const respuesta = await fetch(urlFinal);
      if (!respuesta.ok) throw new Error('Error al descargar');
      const blob = await respuesta.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      window.open(urlFinal, '_blank');
    }
  };

  // Formulario nuevo archivo
  const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState<TipoDocumentoVcs>('BITACORA');
  const [archivoPdf, setArchivoPdf] = useState<File | null>(null);

  if (!asignacion) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
        <FolderGit2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-bold text-foreground">No hay proyecto asignado</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1">
          No tienes un proyecto comunitario de vinculación activo para gestionar evidencias.
        </p>
      </div>
    );
  }

  const esFaseAsignacion = asignacion.faseActual === 'ASIGNACION';

  const manejarSubirEvidencia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivoPdf) {
      toast.error('Debe seleccionar un archivo PDF');
      return;
    }

    if (archivoPdf.type !== 'application/pdf') {
      toast.error('El archivo debe estar en formato PDF');
      return;
    }

    if (archivoPdf.size > 10 * 1024 * 1024) {
      toast.error('El tamaño máximo permitido es de 10MB');
      return;
    }

    setEstaSubiendo(true);
    try {
      // 1. Subir archivo físico al storage
      const urlArchivo = await subirArchivo(archivoPdf, CARPETAS_ARCHIVOS.VINCULACION);

      if (!urlArchivo) {
        throw new Error('No se pudo obtener la URL del archivo subido');
      }

      // 2. Registrar en la base de datos de VCS
      const prefijoTipo = tipoDocumentoSeleccionado === 'BITACORA' ? 'Bitácora' : 'Informe Final';
      const nombreFinal = `${prefijoTipo} - ${archivoPdf.name}`;

      const res = await subirEvidenciaAccion({
        asignacionId: asignacion.id,
        tipoDocumento: tipoDocumentoSeleccionado,
        urlArchivo,
        nombreArchivo: nombreFinal,
        horasReportadas: asignacion.horasAsignadas || 0,
      });

      if (res.exito && res.data) {
        toast.success(res.mensaje || 'Evidencia guardada y enviada a revisión');
        const evidenciaActualizada = res.data as EvidenciaVcs;
        setEvidencias((prev) => {
          const index = prev.findIndex(
            (e) => e.id === evidenciaActualizada.id || (e.tipoDocumento && e.tipoDocumento === evidenciaActualizada.tipoDocumento)
          );
          if (index >= 0) {
            const nuevaLista = [...prev];
            nuevaLista[index] = evidenciaActualizada;
            return nuevaLista;
          }
          return [evidenciaActualizada, ...prev];
        });
        setArchivoPdf(null);
        setFormularioAbierto(false);
      } else {
        toast.error(res.mensaje || 'Error al guardar la evidencia');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al procesar la subida del documento');
    } finally {
      setEstaSubiendo(false);
    }
  };

  const opcionesDocumento: { valor: TipoDocumentoVcs; etiqueta: string }[] = [
    { valor: 'BITACORA', etiqueta: 'Bitácora' },
    { valor: 'INFORME_FINAL', etiqueta: 'Informe Final' },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de proyecto si tiene más de uno */}
      {asignaciones.length > 1 && (
        <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border">
          <span className="text-sm font-medium text-muted-foreground">Proyecto Comunitario:</span>
          <Select value={asignacionIdSeleccionada} onValueChange={setAsignacionIdSeleccionada}>
            <SelectTrigger className="w-[340px] bg-background">
              <SelectValue placeholder="Seleccione proyecto" />
            </SelectTrigger>
            <SelectContent>
              {asignaciones.map((asig) => (
                <SelectItem key={asig.id} value={String(asig.id)}>
                  {asig.nombreProyecto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Bloqueo si el proyecto no ha sido iniciado por el TA */}
      {esFaseAsignacion ? (
        <div className="flex items-start gap-3 p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <h4 className="font-bold text-sm">Proyecto aún no iniciado</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Tu asignación al proyecto <strong>{asignacion.nombreProyecto}</strong> se encuentra en fase de <strong>Asignación</strong>. Podrás registrar tus bitácoras y evidencias una vez que el Tutor Académico ({asignacion.nombreCompletoTutor || 'Tutor asignado'}) dé inicio oficial al proyecto (Fase de Desarrollo).
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Cabecera y Botón de Nueva Evidencia */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Documentación y Evidencias de Vinculación
              </h3>
              <p className="text-xs text-muted-foreground">
                Proyecto: <span className="font-semibold text-foreground">{asignacion.nombreProyecto}</span> | Tutor:{' '}
                <span className="font-medium text-foreground">{asignacion.nombreCompletoTutor || 'Por asignar'}</span>
              </p>
            </div>

            {!formularioAbierto && (
              <Button onClick={() => setFormularioAbierto(true)} className="gap-1.5 shadow-xs">
                <Plus className="h-4 w-4" />
                Subir Nueva Evidencia
              </Button>
            )}
          </div>

          {/* Formulario de Subida */}
          {formularioAbierto && (
            <Card className="border-primary/30 shadow-sm bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Registro de Nueva Evidencia / Bitácora
                </CardTitle>
                <CardDescription className="text-xs">
                  Cargue el documento correspondiente en formato PDF (máximo 10MB).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={manejarSubirEvidencia} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="tipo" className="text-xs font-semibold">
                        Tipo de Documento *
                      </Label>
                      <Select
                        value={tipoDocumentoSeleccionado}
                        onValueChange={(val) => setTipoDocumentoSeleccionado(val as TipoDocumentoVcs)}
                      >
                        <SelectTrigger id="tipo" className="bg-background">
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {opcionesDocumento.map((opc) => (
                            <SelectItem key={opc.valor} value={opc.valor}>
                              {opc.etiqueta}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="archivo" className="text-xs font-semibold">
                      Archivo en formato PDF *
                    </Label>
                    <Input
                      id="archivo"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setArchivoPdf(e.target.files?.[0] || null)}
                      className="bg-background file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormularioAbierto(false)}
                      disabled={estaSubiendo}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={estaSubiendo || !archivoPdf} className="gap-1.5">
                      {estaSubiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {estaSubiendo ? 'Subiendo...' : 'Guardar Evidencia'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Listado de Evidencias */}
          <div className="space-y-3">
            {evidencias.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/20">
                <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Aún no has subido evidencias</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Haz clic en &quot;Subir Nueva Evidencia&quot; para registrar tus bitácoras e informes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {evidencias.map((evi) => {
                  return (
                    <div
                      key={evi.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{evi.nombreArchivo || 'Documento adjunto'}</span>
                            <BadgeEstadoRevision estado={evi.estadoTutor} />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {evi.horasReportadas ? `${evi.horasReportadas} horas` : 'N/A'}
                            </span>
                            <span>•</span>
                            <span>Subido el {formatearFechaCorta(evi.fechaSubida)}</span>
                          </div>

                          {/* Observaciones del tutor si existen */}
                          {evi.observacionesTutor && (
                            <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border/60 text-xs">
                              <span className="font-semibold text-muted-foreground">Observación del Tutor: </span>
                              <span className="text-foreground">{evi.observacionesTutor}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {evi.urlArchivo && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              title="Previsualizar documento"
                              className="h-8 w-8"
                              onClick={() => setDocVistaPrevia(evi)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              title="Descargar documento"
                              className="h-8 w-8"
                              onClick={(e) =>
                                manejarDescarga(e, evi.urlArchivo, evi.nombreArchivo)
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {evi.estadoTutor === 'OBSERVADO' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => {
                              if (evi.tipoDocumento) {
                                setTipoDocumentoSeleccionado(evi.tipoDocumento);
                              }
                              setFormularioAbierto(true);
                            }}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Corregir y Resubir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Previsualización de Documento PDF (Estilo PP) */}
      <Dialog open={!!docVistaPrevia} onOpenChange={(open) => !open && setDocVistaPrevia(null)}>
        <DialogContent className="w-[90vw] sm:max-w-4xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold truncate">
              Previsualización: {docVistaPrevia?.nombreArchivo}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Documento de evidencia en formato PDF
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-[55vh] border border-border rounded-lg bg-muted/20 overflow-hidden relative">
            {cargandoVistaPrevia ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs">Cargando documento...</p>
              </div>
            ) : blobUrlPrevia ? (
              <iframe
                src={blobUrlPrevia}
                className="w-full h-full min-h-[55vh]"
                title="Previsualización Documento"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p className="text-xs">No se pudo cargar la previsualización.</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setDocVistaPrevia(null)}>
              Cerrar
            </Button>
            {docVistaPrevia?.urlArchivo && (
              <Button
                size="sm"
                onClick={(e) =>
                  manejarDescarga(
                    e,
                    docVistaPrevia.urlArchivo,
                    docVistaPrevia.nombreArchivo
                  )
                }
                className="gap-1.5"
              >
                <Download className="w-4 h-4" />
                Descargar Documento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
