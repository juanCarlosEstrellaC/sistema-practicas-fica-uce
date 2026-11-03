'use client';

import { useState, useEffect } from 'react';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { ResultadoAprobacionHoras } from '@/lib/tipos/vcs/evidencia-vcs';
import { aprobarHorasSubdecanatoAccion } from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { SeccionFirmaDocumento } from '@/components/comunes/seccion-firma-documento';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Award } from 'lucide-react';

export interface ModalAprobarHorasSubdecanoProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  asignacion: AsignacionProyectoDto | null;
  alAprobar?: (resultado: ResultadoAprobacionHoras) => void;
}

export function ModalAprobarHorasSubdecano({
  abierto,
  abrirModal,
  asignacion,
  alAprobar,
}: ModalAprobarHorasSubdecanoProps) {
  const [procesando, setProcesando] = useState(false);
  const [archivoFirmado, setArchivoFirmado] = useState<File | null>(null);
  const [urlLocalFirmado, setUrlLocalFirmado] = useState<string | null>(null);

  const urlPreviewPdf = asignacion?.id
    ? `/api/proxy/asignaciones-proyectos-comunitarios/${asignacion.id}/certificado-horas/preview`
    : null;

  // Limpiar estado al cerrar o cambiar asignacion
  useEffect(() => {
    if (!abierto) {
      setArchivoFirmado(null);
      if (urlLocalFirmado) {
        URL.revokeObjectURL(urlLocalFirmado);
        setUrlLocalFirmado(null);
      }
    }
  }, [abierto]);

  const yaAprobado = asignacion?.estado === 'APROBADO';

  const manejarDescargarParaFirma = () => {
    if (!urlPreviewPdf && !urlLocalFirmado) return;
    const urlFinal = urlLocalFirmado || adaptarUrlProxy(urlPreviewPdf!);
    const nombreEstudiante = asignacion?.nombreCompletoEstudiante || 'Estudiante';
    const nombreCarrera = asignacion?.nombreCarrera || 'Carrera';
    const nombreArchivo = `Certificado_VCS_${nombreEstudiante}_${nombreCarrera}.pdf`.replace(/\s+/g, '_');
    const enlace = document.createElement('a');
    enlace.href = urlFinal;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  const manejarAprobar = async () => {
    if (!asignacion?.id) return;
    if (!archivoFirmado) {
      toast.error('Debe subir el certificado firmado antes de aprobar las horas');
      return;
    }

    setProcesando(true);
    try {
      // 1. Subir PDF firmado al storage
      const urlSubidaFirmada = await subirArchivo(archivoFirmado, CARPETAS_ARCHIVOS.VINCULACION);

      // 2. Invocar la aprobacion y convalidacion de horas en backend enviando el archivo firmado
      const respuesta = await aprobarHorasSubdecanatoAccion(asignacion.id, {
        horasAprobadas: asignacion.horasAsignadas || 80,
        observaciones: 'Certificado firmado convalidado y acreditado',
        urlCertificadoFirmado: urlSubidaFirmada,
      });

      if (respuesta.exito && respuesta.data) {
        toast.success('Certificado firmado convalidado y horas acreditadas exitosamente');
        abrirModal(false);
        if (alAprobar) {
          alAprobar(respuesta.data);
        }
      } else {
        toast.error(respuesta.mensaje || 'Error al aprobar las horas');
      }
    } catch (error: any) {
      console.error('Error al aprobar horas:', error);
      toast.error(error.message || 'Error de conexion con el servidor');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={abrirModal}>
      <DialogContent className="sm:max-w-5xl md:max-w-5xl h-[85vh] max-h-[85vh] flex flex-col p-4 sm:p-5 gap-2.5">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            Validación de Horas y Emisión de Certificado de Vinculación
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden">
          {/* Columna Izquierda: Resumen de Asignacion y Opciones de Firma */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-2.5 shrink-0 overflow-y-auto pr-1">
            {/* Tarjeta de Datos de la Asignacion VCS */}
            <div className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-2 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground font-medium">Estudiante:</span>
                <span className="font-semibold text-foreground text-right">
                  {asignacion?.nombreCompletoEstudiante || 'No disponible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Cédula:</span>
                <span className="font-medium text-foreground">
                  {asignacion?.identificacionEstudiante || 'No disponible'}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground font-medium">Proyecto:</span>
                <span className="font-medium text-foreground text-right">
                  {asignacion?.nombreProyecto || 'No disponible'}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground font-medium">Tutor Académico:</span>
                <span className="font-medium text-foreground text-right">
                  {asignacion?.nombreCompletoTutor || 'No asignado'}
                </span>
              </div>
              <div className="border-t pt-2 border-border/60 flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Estado Evidencias:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Bitácora e Informe Validados
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 border-border/60">
                <span className="text-muted-foreground font-medium">Horas a Convalidar:</span>
                <span className="font-bold text-xs text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {asignacion?.horasAsignadas || 80} horas
                </span>
              </div>
            </div>

            {/* Si ya fue emitido, mostrar tarjeta informativa; sino selector unificado de firma */}
            {yaAprobado ? (
              <div className="rounded-xl border border-emerald-500/30 p-4 bg-emerald-500/10 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wide">
                  <Award className="h-4 w-4 shrink-0" />
                  <span>Certificado Emitido y Validado</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Las horas de vinculación con la sociedad han sido convalidadas y el certificado oficial emitido y acreditado satisfactoriamente.
                </p>
              </div>
            ) : (
              <SeccionFirmaDocumento
                archivoFirmado={archivoFirmado}
                alCambiarArchivo={(archivo) => {
                  setArchivoFirmado(archivo);
                  if (urlLocalFirmado) {
                    URL.revokeObjectURL(urlLocalFirmado);
                  }
                  setUrlLocalFirmado(archivo ? URL.createObjectURL(archivo) : null);
                }}
                alDescargar={manejarDescargarParaFirma}
                deshabilitado={procesando}
                idInput="upload-cert-firmado"
                etiquetaDocumento="certificado"
              />
            )}
          </div>

          {/* Columna Derecha: Previsualizador del PDF (Vista Previa o Archivo Firmado) */}
          <div className="flex-1 min-h-[300px] md:min-h-0 border rounded-md overflow-hidden bg-muted/10 flex flex-col">
            {urlLocalFirmado || urlPreviewPdf ? (
              <iframe
                src={urlLocalFirmado || urlPreviewPdf!}
                className="w-full flex-1 border-0"
                title="Previsualización Certificado de Vinculación"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
                No se pudo cargar la vista previa del documento.
              </div>
            )}
          </div>
        </div>

        {/* Pie del Modal con Acciones */}
        <DialogFooter className="gap-2 shrink-0 pt-1 pb-0">
          {yaAprobado ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => abrirModal(false)}
            >
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => abrirModal(false)}
                disabled={procesando}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={procesando || !archivoFirmado}
                onClick={manejarAprobar}
              >
                {procesando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando convalidación...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar y Enviar Certificado Firmado
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
