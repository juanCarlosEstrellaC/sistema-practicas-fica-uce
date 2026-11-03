'use client';

import { useState } from 'react';
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
import { Mail, Download, Upload, X, Loader2, ArrowLeft, FileCheck } from 'lucide-react';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { emitirCartaAsignacionAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { toast } from 'sonner';

export interface ModalEmitirCartaCppProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  asignacionId: number | string;
  nombreEstudiante?: string;
  tutorInstitucional?: string | null;
  correoTutorInstitucional?: string | null;
  institucion?: string | null;
  esInactivo?: boolean;
  alConfirmar?: () => void;
}

export function ModalEmitirCartaCpp({
  abierto,
  alCambiarAbierto,
  asignacionId,
  nombreEstudiante = 'Estudiante',
  tutorInstitucional,
  correoTutorInstitucional,
  institucion,
  esInactivo = false,
  alConfirmar,
}: ModalEmitirCartaCppProps) {
  const [archivoCarta, setArchivoCarta] = useState<File | null>(null);
  const [urlLocalCarta, setUrlLocalCarta] = useState<string | null>(null);
  const [estaEmitiendo, setEstaEmitiendo] = useState(false);
  const [metodoFirma, setMetodoFirma] = useState<'seleccion' | 'manual'>('seleccion');

  const urlVistaPrevia = `/api/proxy/asignaciones-practicas/${asignacionId}/carta-asignacion/preview`;

  const manejarCambioAbierto = (nuevoAbierto: boolean) => {
    if (!nuevoAbierto) {
      setArchivoCarta(null);
      setUrlLocalCarta(null);
      setMetodoFirma('seleccion');
    }
    alCambiarAbierto(nuevoAbierto);
  };

  const manejarEmitir = async () => {
    if (!archivoCarta) {
      toast.error('Debe subir la carta de asignación firmada antes de enviarla');
      return;
    }

    setEstaEmitiendo(true);
    try {
      const urlCartaSubida = await subirArchivo(archivoCarta, CARPETAS_ARCHIVOS.CARTAS_ASIGNACION);
      const res = await emitirCartaAsignacionAccion(asignacionId, urlCartaSubida);
      if (res.exito) {
        toast.success(res.mensaje || 'Carta de asignación emitida correctamente');
        manejarCambioAbierto(false);
        if (alConfirmar) alConfirmar();
      } else {
        toast.error(res.mensaje || 'Error al emitir carta de asignación');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error inesperado al emitir la carta');
    } finally {
      setEstaEmitiendo(false);
    }
  };

  const manejarDescargarPdf = () => {
    const enlace = document.createElement('a');
    enlace.href = urlLocalCarta || urlVistaPrevia;
    enlace.download = `Carta_Asignacion_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`;
    enlace.click();
  };

  const procesarArchivoFirmado = (archivo?: File) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Solo se permiten documentos en formato PDF');
      return;
    }
    setArchivoCarta(archivo);
    setUrlLocalCarta(URL.createObjectURL(archivo));
    toast.success('Documento firmado cargado correctamente');
  };

  return (
    <Dialog open={abierto} onOpenChange={manejarCambioAbierto}>
      <DialogContent className="w-[90vw] sm:max-w-4xl md:max-w-5xl h-[85vh] max-h-[95vh] flex flex-col p-4 sm:p-5 gap-2.5">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            Confirmar Emisión de Carta de Asignación
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden">
          {/* Columna Izquierda: Información de correo y opciones de firma */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-2.5 shrink-0 overflow-y-auto pr-1">
            {/* Información del correo electrónico a enviar */}
            <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-300">
                <Mail className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Notificación al Tutor Institucional</span>
              </div>

              <div className="space-y-1.5 text-xs bg-background/90 p-2.5 rounded-md">
                <div>
                  <span className="font-semibold text-foreground">Destinatario: </span>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    {tutorInstitucional
                      ? `${tutorInstitucional}${correoTutorInstitucional ? ` <${correoTutorInstitucional}>` : ''}`
                      : correoTutorInstitucional || 'Tutor Institucional (correo registrado)'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-foreground">Asunto: </span>
                  <span className="text-muted-foreground">
                    Carta de Asignación - Prácticas Preprofesionales UCE
                  </span>
                </div>

                <div className="pt-0.5">
                  <span className="font-semibold text-foreground block mb-0.5">
                    Cuerpo del correo:
                  </span>
                  <div className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 p-2 rounded italic space-y-1">
                    <p>Estimado/a {tutorInstitucional || 'Tutor/a Institucional'},</p>
                    <p>
                      Adjunto a este correo encontrará la <strong>Carta de Asignación</strong> para el estudiante{' '}
                      <strong>{nombreEstudiante}</strong>, quien realizará sus Prácticas Preprofesionales en{' '}
                      <strong>{institucion || 'su distinguida institución'}</strong>.
                    </p>
                    <p className="not-italic text-[10px] text-primary/80 pt-0.5 font-medium">
                      (El archivo oficial firmado se adjuntará automáticamente en formato PDF).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones de Firma */}
            {metodoFirma === 'seleccion' ? (
              <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Método de firma
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 justify-center font-medium text-xs transition-all"
                  onClick={() => {
                    // Sin funcionalidad real para FirmaEC hasta nuevo aviso
                  }}
                >
                  FirmaEC
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 justify-center font-medium text-xs transition-all hover:border-primary/50"
                  onClick={() => setMetodoFirma('manual')}
                >
                  Sin FirmaEC (firma manual)
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2.5">
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
                <div className="bg-background/85 p-2.5 rounded-md text-xs space-y-1.5 leading-relaxed">
                  <span className="font-semibold text-foreground block text-xs">
                    Instrucciones de firma:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                    <li>
                      <strong className="text-foreground">Descargar PDF:</strong> use el botón &ldquo;Descargar&rdquo; a continuación.
                    </li>
                    <li>
                      <strong className="text-foreground">Firmar documento:</strong>
                      <ul className="list-disc list-inside pl-3 pt-0.5 space-y-0.5 text-[10.5px]">
                        <li>Desde el editor de PDF (añadiendo imagen de su firma o una firma digital almacenada).</li>
                        <li>O en físico con <strong className="text-foreground">esferográfico azul</strong>.</li>
                      </ul>
                    </li>
                    <li>
                      <strong className="text-foreground">Subir:</strong> cargue el archivo PDF firmado para adjuntarlo.
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={manejarDescargarPdf}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Descargar
                  </Button>

                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="subir-carta-firmada"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          procesarArchivoFirmado(e.target.files[0]);
                        }
                      }}
                    />
                    <Label
                      htmlFor="subir-carta-firmada"
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
                      <span>Subir</span>
                    </Label>
                  </div>
                </div>

                {archivoCarta && (
                  <div className="flex items-center justify-between min-w-0 w-full p-2 rounded-md bg-green-50 dark:bg-green-950/40 text-xs text-green-800 dark:text-green-300 overflow-hidden">
                    <span className="truncate min-w-0 flex-1 font-medium mr-2" title={archivoCarta.name}>
                      {archivoCarta.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setArchivoCarta(null);
                        setUrlLocalCarta(null);
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

          {/* Columna Derecha: Previsualización del Documento */}
          <div className="flex-1 min-h-[300px] md:min-h-0 border rounded-md overflow-hidden bg-muted/10 flex flex-col">
            <iframe
              src={urlLocalCarta || urlVistaPrevia}
              className="w-full flex-1 border-0"
              title="Previsualización Carta de Asignación"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 shrink-0 pt-1 pb-0">
          <Button
            type="button"
            variant="outline"
            disabled={estaEmitiendo}
            onClick={() => manejarCambioAbierto(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={estaEmitiendo || esInactivo || !archivoCarta}
            onClick={manejarEmitir}
          >
            {estaEmitiendo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Emitiendo...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Carta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
