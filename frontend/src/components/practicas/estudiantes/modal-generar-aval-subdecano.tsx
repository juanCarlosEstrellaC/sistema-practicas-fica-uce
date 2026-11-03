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
import { CheckCircle2, Loader2, FileCheck } from 'lucide-react';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import { generarAvalAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { AsignacionPracticaDetalleDto } from '@/lib/tipos/pp/general-pp';
import { SeccionFirmaDocumento } from '@/components/comunes/seccion-firma-documento';
import { toast } from 'sonner';

export interface ModalGenerarAvalSubdecanoProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  asignacionId: number | string;
  nombreEstudiante?: string;
  identificacionEstudiante?: string;
  institucion?: string;
  tutorAcademico?: string;
  tutorInstitucional?: string;
  horasAsignadas?: number;
  asignacion?: AsignacionPracticaDetalleDto | any | null;
  esInactivo?: boolean;
  alConfirmar?: (asignacionActualizada?: AsignacionPracticaDetalleDto) => void;
}

export function ModalGenerarAvalSubdecano({
  abierto,
  alCambiarAbierto,
  asignacionId,
  nombreEstudiante = 'Estudiante',
  identificacionEstudiante,
  institucion,
  tutorAcademico,
  tutorInstitucional,
  horasAsignadas,
  asignacion,
  esInactivo = false,
  alConfirmar,
}: ModalGenerarAvalSubdecanoProps) {
  const [archivoAval, setArchivoAval] = useState<File | null>(null);
  const [urlLocalAval, setUrlLocalAval] = useState<string | null>(null);
  const [estaGenerando, setEstaGenerando] = useState(false);

  const asig = asignacion || {};
  const est = asig.estudiante || {};
  const nombreFinal =
    nombreEstudiante !== 'Estudiante'
      ? nombreEstudiante
      : `${est.nombres || ''} ${est.apellidos || ''}`.trim() || est.nombre || 'Estudiante';
  const cedulaFinal = identificacionEstudiante || est.identificacion || asig.identificacionEstudiante || 'No registrada';
  const institucionFinal = institucion || asig.institucion || asig.convenio?.institucion || 'No asignada';
  const tutorAcademicoFinal =
    tutorAcademico ||
    `${asig.tutorAcademico?.nombres || ''} ${asig.tutorAcademico?.apellidos || ''}`.trim() ||
    asig.tutorAcademico?.nombre ||
    'No asignado';
  const tutorInstitucionalFinal = tutorInstitucional || asig.tutorInstitucional || 'No asignado';
  const horasFinal = horasAsignadas || asig.horasAsignadas || 240;

  const urlVistaPrevia = `/api/proxy/asignaciones-practicas/${asignacionId}/aval/preview`;

  const manejarCambioAbierto = (nuevoAbierto: boolean) => {
    if (!nuevoAbierto) {
      setArchivoAval(null);
      if (urlLocalAval) {
        URL.revokeObjectURL(urlLocalAval);
        setUrlLocalAval(null);
      }
    }
    alCambiarAbierto(nuevoAbierto);
  };

  const manejarGenerarAval = async () => {
    if (!archivoAval) {
      toast.error('Debe subir el aval de cumplimiento firmado antes de aprobarlo');
      return;
    }

    setEstaGenerando(true);
    try {
      const urlAvalSubido = await subirArchivo(archivoAval, CARPETAS_ARCHIVOS.AVALES);
      const res = await generarAvalAccion(asignacionId, urlAvalSubido);
      if (res.exito) {
        toast.success(res.mensaje || 'Aval de cumplimiento generado exitosamente');
        manejarCambioAbierto(false);
        if (alConfirmar) alConfirmar(res.data);
      } else {
        toast.error(res.mensaje || 'Error al generar el aval de cumplimiento');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error inesperado al generar el aval');
    } finally {
      setEstaGenerando(false);
    }
  };

  const manejarDescargarPdf = () => {
    const enlace = document.createElement('a');
    enlace.href = urlLocalAval || urlVistaPrevia;
    enlace.download = `Aval_Cumplimiento_${nombreFinal.replace(/\s+/g, '_')}.pdf`;
    enlace.click();
  };

  return (
    <Dialog open={abierto} onOpenChange={manejarCambioAbierto}>
      <DialogContent className="sm:max-w-5xl md:max-w-5xl h-[85vh] max-h-[85vh] flex flex-col p-4 sm:p-5 gap-2.5">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            Generar y Firmar Aval de Cumplimiento
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden">
          {/* Columna Izquierda: Información de práctica y opciones de firma */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-2.5 shrink-0 overflow-y-auto pr-1">
            {/* Explicación contextual del aval */}
            <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-lg text-xs text-blue-900 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                Acreditación de Práctica
              </p>
              <p className="text-muted-foreground dark:text-blue-300/80 leading-relaxed text-[11px]">
                El aval de cumplimiento firmado para <strong className="text-foreground">{nombreFinal}</strong> se registrará en su portafolio de prácticas preprofesionales para validar sus horas acreditadas.
              </p>
            </div>

            {/* Tarjeta de Información de la Práctica (Estandarizada) */}
            <div className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-2 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground font-medium">Estudiante:</span>
                <span className="font-semibold text-foreground text-right">{nombreFinal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Cédula:</span>
                <span className="font-medium text-foreground">{cedulaFinal}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground font-medium">Institución Receptora:</span>
                <span className="font-medium text-foreground text-right">{institucionFinal}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground font-medium">Tutor Académico:</span>
                <span className="font-medium text-foreground text-right">{tutorAcademicoFinal}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground font-medium">Tutor Institucional:</span>
                <span className="font-medium text-foreground text-right">{tutorInstitucionalFinal}</span>
              </div>
              <div className="border-t pt-2 border-border/60 flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Estado Evidencias:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Portafolio validado por CPP
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 border-border/60">
                <span className="text-muted-foreground font-medium">Horas a Convalidar:</span>
                <span className="font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {horasFinal} horas
                </span>
              </div>
            </div>

            {/* Selector y Flujo Unificado de Firma */}
            <SeccionFirmaDocumento
              archivoFirmado={archivoAval}
              alCambiarArchivo={(archivo) => {
                setArchivoAval(archivo);
                if (urlLocalAval) {
                  URL.revokeObjectURL(urlLocalAval);
                }
                setUrlLocalAval(archivo ? URL.createObjectURL(archivo) : null);
              }}
              alDescargar={manejarDescargarPdf}
              deshabilitado={estaGenerando}
              idInput="subir-aval-firmado"
              etiquetaDocumento="aval"
            />
          </div>

          {/* Columna Derecha: Previsualización del Documento */}
          <div className="flex-1 min-h-[300px] md:min-h-0 border rounded-md overflow-hidden bg-muted/10 flex flex-col">
            <iframe
              src={urlLocalAval || urlVistaPrevia}
              className="w-full flex-1 border-0"
              title="Previsualización Aval de Cumplimiento"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 shrink-0 pt-1 pb-0">
          <Button
            type="button"
            variant="outline"
            disabled={estaGenerando}
            onClick={() => manejarCambioAbierto(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={estaGenerando || esInactivo || !archivoAval}
            onClick={manejarGenerarAval}
          >
            {estaGenerando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando Aval...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aprobar Aval
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
