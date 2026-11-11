"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  Download,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  FileCheck,
  Building2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import {
  cambiarEstadoMatrizCacesAccion,
  subirArchivoFirmadoMatrizCacesAccion,
} from '@/lib/acciones/pp/matriz-caces.acciones';
import { EstadoMatrizCaces } from '@/lib/tipos/pp/general-pp';
import { formatearNombreDescargaMatrizCaces } from '@/lib/utilidades/matriz-caces';

export interface ModalSubirMatrizFirmadaProps {
  abierto: boolean;
  alCerrar: () => void;
  matrizId: number | string;
  nuevoEstado: EstadoMatrizCaces;
  carreraNombre?: string;
  carreraCodigo?: string;
  periodoNombre?: string;
  rolUsuario?: 'SUBDECANO' | 'DIRECTOR_CARRERA' | 'COORDINADOR_PRACTICAS';
  archivoPrevioUrl?: string | null;
  alCompletar?: () => void;
}

export function ModalSubirMatrizFirmada({
  abierto,
  alCerrar,
  matrizId,
  nuevoEstado,
  carreraNombre,
  carreraCodigo,
  periodoNombre,
  rolUsuario = 'DIRECTOR_CARRERA',
  archivoPrevioUrl,
  alCompletar,
}: ModalSubirMatrizFirmadaProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [urlLocalArchivo, setUrlLocalArchivo] = useState<string | null>(null);
  const [esPdf, setEsPdf] = useState(false);
  const [estaSubiendo, setEstaSubiendo] = useState(false);
  const [metodoFirma, setMetodoFirma] = useState<'seleccion' | 'manual'>('seleccion');
  const inputRef = useRef<HTMLInputElement>(null);

  const extensionesPermitidas = ['.pdf', '.xlsx', '.xls', '.ods'];
  const LIMITE_TAMANIO_BYTES = 15 * 1024 * 1024; // 15 MB

  const esSubdecano = nuevoEstado === 'FIRMADA_POR_SUBDECANO' || rolUsuario === 'SUBDECANO';
  const esCoordinador = nuevoEstado === 'ENVIADA_A_SUBDECANO' || rolUsuario === 'COORDINADOR_PRACTICAS';

  const tituloModal = esSubdecano
    ? 'Oficialización y Firma de Matriz CACES (Subdecanato)'
    : esCoordinador
    ? 'Firma y Remisión de Matriz CACES a Subdecanato (Coordinador)'
    : 'Firma y Validación de Matriz CACES (Dirección de Carrera)';

  const manejarCerrar = () => {
    if (urlLocalArchivo) {
      URL.revokeObjectURL(urlLocalArchivo);
    }
    setArchivo(null);
    setUrlLocalArchivo(null);
    setEsPdf(false);
    setMetodoFirma('seleccion');
    alCerrar();
  };

  const procesarArchivoFirmado = (f?: File) => {
    if (!f) return;
    const nombre = f.name.toLowerCase();
    const esValido = extensionesPermitidas.some((ext) => nombre.endsWith(ext));
    if (!esValido) {
      toast.error('Solo se permiten archivos en formato PDF (.pdf) o Excel/ODS (.xlsx, .ods)');
      return;
    }
    if (f.size > LIMITE_TAMANIO_BYTES) {
      toast.error('El archivo excede el tamaño máximo permitido de 15 MB.');
      return;
    }

    if (urlLocalArchivo) {
      URL.revokeObjectURL(urlLocalArchivo);
    }

    const esFormatoPdf = nombre.endsWith('.pdf');
    setEsPdf(esFormatoPdf);
    setArchivo(f);
    setUrlLocalArchivo(URL.createObjectURL(f));
    toast.success(`Archivo cargado: ${f.name}`);
  };

  const manejarDescargarExcelOficial = () => {
    const enlace = document.createElement('a');
    const estadoArchivoPrevio =
      nuevoEstado === 'ENVIADA_A_SUBDECANO'
        ? 'FIRMADA_POR_DC'
        : nuevoEstado === 'FIRMADA_POR_SUBDECANO'
        ? 'ENVIADA_A_SUBDECANO'
        : undefined;

    enlace.href = `/api/proxy/matrices-caces/${matrizId}/excel?t=${
      archivoPrevioUrl ? encodeURIComponent(archivoPrevioUrl) : Date.now()
    }`;
    enlace.download = formatearNombreDescargaMatrizCaces(
      carreraNombre,
      periodoNombre,
      archivoPrevioUrl ? estadoArchivoPrevio : undefined,
      archivoPrevioUrl
    );
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  const manejarEnvio = async () => {
    if (!archivo) {
      toast.error('Debe seleccionar o subir un archivo firmado para continuar.');
      return;
    }

    setEstaSubiendo(true);
    try {
      // 1. Subir archivo físico al repositorio institucional
      const urlSubida = await subirArchivo(archivo, CARPETAS_ARCHIVOS.MATRICES_CACES);
      if (!urlSubida) {
        throw new Error('No se pudo obtener la URL del archivo subido.');
      }

      // 2. Asociar URL del archivo firmado a la matriz
      const resArchivo = await subirArchivoFirmadoMatrizCacesAccion(matrizId, urlSubida);
      if (!resArchivo.exito) {
        throw new Error(resArchivo.mensaje || 'Error al asociar archivo firmado');
      }

      // 3. Cambiar estado según el rol de firma
      const resEstado = await cambiarEstadoMatrizCacesAccion(matrizId, nuevoEstado);
      if (!resEstado.exito) {
        throw new Error(resEstado.mensaje || 'Error al actualizar estado');
      }

      toast.success(
        esSubdecano
          ? 'Matriz CACES oficializada y registrada correctamente.'
          : esCoordinador
          ? 'Matriz CACES firmada por Coordinación y remitida a Subdecanato con éxito.'
          : 'Matriz CACES firmada y validada por Dirección de Carrera.'
      );
      manejarCerrar();
      alCompletar?.();
    } catch (error: any) {
      toast.error(error.message || 'Error inesperado al subir matriz firmada');
    } finally {
      setEstaSubiendo(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && manejarCerrar()}>
      <DialogContent className="w-[90vw] sm:max-w-4xl h-[80vh] max-h-[720px] flex flex-col p-4 sm:p-5 gap-2.5">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
            <span>{tituloModal}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden">
          {/* Columna Izquierda: Información y Opciones de Firma */}
          <div className="w-full md:w-80 flex flex-col gap-2.5 shrink-0 overflow-y-auto pr-1">
            {/* Resumen Institucional de la Matriz */}
            <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-lg text-xs space-y-2 border border-blue-200/50 dark:border-blue-900/40">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-300">
                <Building2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Información de Carrera</span>
              </div>

              <div className="space-y-1.5 text-xs bg-background/90 p-2.5 rounded-md">
                <div>
                  <span className="font-semibold text-foreground">Carrera: </span>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    {carreraNombre || 'Carrera Universitaria'}
                  </span>
                </div>
                {carreraCodigo && (
                  <div>
                    <span className="font-semibold text-foreground">Código carrera: </span>
                    <span className="text-muted-foreground">{carreraCodigo}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-foreground">Código IES: </span>
                  <span className="text-muted-foreground">1005 (UCE)</span>
                </div>
                <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/50">
                  {esSubdecano
                    ? 'La oficialización culminará el ciclo de acreditación CACES del periodo.'
                    : 'Al firmar y validar, la matriz se remitirá automáticamente a Subdecanato.'}
                </div>
              </div>
            </div>

            {/* Opciones de Firma */}
            {metodoFirma === 'seleccion' ? (
              <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2 border border-border/50">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Método de firma
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 justify-center font-medium text-xs transition-all hover:bg-muted"
                  onClick={() => {
                    toast.info(
                      'El servicio de FirmaEC estará disponible próximamente. Por favor, utilice firma manual.'
                    );
                  }}
                >
                  FirmaEC
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 justify-center font-medium text-xs transition-all hover:border-primary/50 hover:bg-primary/5 text-foreground"
                  onClick={() => setMetodoFirma('manual')}
                >
                  Sin FirmaEC (firma manual)
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2.5 border border-border/50">
                <div className="flex items-center justify-between pb-0.5">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-primary" />
                    Firma manual
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    onClick={() => setMetodoFirma('seleccion')}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver
                  </Button>
                </div>

                {/* Instrucciones unificadas para firma manual */}
                <div className="bg-background/90 p-2.5 rounded-md text-xs space-y-1.5 leading-relaxed border border-border/40">
                  <span className="font-semibold text-foreground block text-xs">
                    Instrucciones de firma:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                    <li>
                      <strong className="text-foreground">Descargar matriz:</strong> use el botón
                      &ldquo;Descargar&rdquo; a continuación.
                    </li>
                    <li>
                      <strong className="text-foreground">Firmar documento:</strong>
                      <ul className="list-disc list-inside pl-3 pt-0.5 space-y-0.5 text-[10.5px]">
                        <li>
                          Con su firma digital / electrónica en formato PDF o Excel.
                        </li>
                        <li>
                          O en físico con <strong className="text-foreground">esferográfico azul</strong> y escaneado a PDF.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong className="text-foreground">Subir:</strong> cargue el archivo PDF o Excel firmado para validar.
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 hover:text-emerald-800 transition-all duration-200 group px-2 font-medium"
                    onClick={manejarDescargarExcelOficial}
                    title={archivoPrevioUrl ? 'Descargar matriz firmada previamente' : 'Descargar plantilla oficial Excel'}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:translate-y-0.5 group-hover:scale-110 transition-transform duration-200" />
                    <span>Descargar</span>
                  </Button>

                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,.xlsx,.xls,.ods"
                      className="hidden"
                      id="subir-matriz-firmada-input"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          procesarArchivoFirmado(e.target.files[0]);
                        }
                      }}
                    />
                    <Label
                      htmlFor="subir-matriz-firmada-input"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        procesarArchivoFirmado(e.dataTransfer.files?.[0]);
                      }}
                      className="flex items-center justify-center w-full h-8 px-2 border rounded-md cursor-pointer text-xs font-medium bg-background hover:bg-accent transition-colors select-none"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      <span>Subir archivo</span>
                    </Label>
                  </div>
                </div>

                {archivo && (
                  <div className="flex items-center justify-between min-w-0 w-full p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 overflow-hidden">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                      {esPdf ? (
                        <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      )}
                      <span className="truncate font-medium text-[11px]" title={archivo.name}>
                        {archivo.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (urlLocalArchivo) URL.revokeObjectURL(urlLocalArchivo);
                        setArchivo(null);
                        setUrlLocalArchivo(null);
                        setEsPdf(false);
                        if (inputRef.current) inputRef.current.value = '';
                      }}
                      title="Quitar archivo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna Derecha: Previsualización en Vivo */}
          <div className="flex-1 min-h-[300px] md:min-h-0 border rounded-lg overflow-hidden bg-muted/10 flex flex-col relative">
            {urlLocalArchivo && esPdf ? (
              <iframe
                src={urlLocalArchivo}
                className="w-full flex-1 border-0"
                title="Previsualización de Matriz CACES Firmada"
              />
            ) : urlLocalArchivo && !esPdf ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-xs">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">
                  Hoja de cálculo cargada
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {archivo?.name} ({(archivo?.size ? archivo.size / 1024 : 0).toFixed(1)} KB)
                </p>
                <Badge variant="outline" className="mt-3 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  Archivo firmado listo para confirmación
                </Badge>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground/70">
                <FileSpreadsheet className="w-12 h-12 mb-3 stroke-1 text-muted-foreground/40" />
                <p className="font-medium text-sm text-muted-foreground">
                  Vista previa de la matriz firmada
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-md">
                  En el panel izquierdo descargue la matriz oficial en Excel y suba el archivo con las firmas correspondientes.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 shrink-0 pt-1 pb-0">
          <Button
            type="button"
            variant="outline"
            disabled={estaSubiendo}
            onClick={manejarCerrar}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={estaSubiendo || !archivo}
            onClick={manejarEnvio}
            className={esSubdecano ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
          >
            {estaSubiendo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando matriz...
              </>
            ) : esSubdecano ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Oficializar Matriz
              </>
            ) : esCoordinador ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Firmar y Remitir a Subdecanato
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Validar y Remitir
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
