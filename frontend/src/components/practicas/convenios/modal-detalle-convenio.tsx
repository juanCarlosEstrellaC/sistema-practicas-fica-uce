'use client';

import { ConvenioDto } from '@/lib/tipos/pp/general-pp';
import { BadgeEstadoConvenio } from '@/components/practicas/badges/badge-estado-convenio';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { formatearFecha } from '@/lib/utilidades/fechas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Building, MapPin, Mail, User, Clock, FileText, Phone } from 'lucide-react';

export interface ModalDetalleConvenioProps {
  convenio: ConvenioDto | null;
  abierto: boolean;
  alCerrar: () => void;
}

export function ModalDetalleConvenio({
  convenio,
  abierto,
  alCerrar,
}: ModalDetalleConvenioProps) {
  if (!convenio) return null;

  const urlDocumentoAdaptada = adaptarUrlProxy(convenio.urlDocumento || convenio.documentoUrl);

  return (
    <Dialog open={abierto} onOpenChange={(ab) => !ab && alCerrar()}>
      <DialogContent className="w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-12">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 min-w-0">
              <Building className="w-5 h-5 text-primary shrink-0" />
              <span>{convenio.institucion}</span>
            </DialogTitle>
            <div className="shrink-0">
              <BadgeEstadoConvenio estado={convenio.estado} />
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-1">
          {/* Columna Izquierda: Ficha de Datos */}
          <div className="min-w-0 lg:col-span-5 space-y-4">
            {/* Datos Generales */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground border-b border-border/40 pb-2">
                <FileText className="w-4 h-4 text-primary" />
                Datos Generales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Tipo</span>
                  <span className="font-medium text-foreground">
                    {convenio.tipo === 'PUBLICO' ? 'Público' : 'Privado'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Cupos</span>
                  <span className="font-medium text-foreground">
                    {convenio.ocupados || 0} ocupados / {convenio.cuposTotales} totales
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Campo Específico</span>
                  <span className="font-medium text-foreground">
                    {convenio.campoEspecifico ?? 'No registrado'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Dirección</span>
                  <span className="font-medium text-foreground flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{convenio.direccion || 'No especificada'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Vigencia */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground border-b border-border/40 pb-2">
                <Clock className="w-4 h-4 text-primary" />
                Vigencia del Convenio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Fecha de Inicio</span>
                  <span className="font-medium text-foreground">
                    {formatearFecha(convenio.fechaInicio, false)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Fecha de Fin (Vencimiento)</span>
                  <span className="font-medium text-foreground">
                    {formatearFecha(convenio.fechaFin, false)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tutor Institucional */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground border-b border-border/40 pb-2">
                <User className="w-4 h-4 text-primary" />
                Responsable Institucional
              </h3>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Nombre</span>
                  <span className="font-medium text-foreground">
                    {convenio.tutorInstitucional || 'Por designar'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">Correo de Contacto</span>
                    <span className="font-medium text-foreground flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{convenio.correoTutor || 'Sin correo'}</span>
                    </span>
                  </div>
                  {convenio.telefonoTutor && (
                    <div>
                      <span className="text-xs text-muted-foreground block font-medium">Teléfono</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{convenio.telefonoTutor}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Visor de Documento */}
          <div className="min-w-0 lg:col-span-7 flex flex-col h-full min-h-[500px] lg:min-h-[520px] border border-border rounded-xl overflow-hidden bg-muted/10">
            <div className="bg-muted/40 px-3.5 py-2.5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-xs truncate">
                  {convenio.nombreDocumento || 'Documento del Convenio'}
                </span>
              </div>
              {urlDocumentoAdaptada && (
                <BotonPrevisualizarDocumento
                  url={urlDocumentoAdaptada}
                  titulo={`Convenio - ${convenio.institucion}`}
                  nombreArchivo={convenio.nombreDocumento || 'convenio.pdf'}
                  texto="Expandir"
                  tamano="sm"
                />
              )}
            </div>

            {urlDocumentoAdaptada ? (
              <iframe
                src={urlDocumentoAdaptada}
                className="w-full flex-1 bg-white"
                title={`Documento del convenio ${convenio.institucion}`}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-sm">No se ha subido ningún documento para este convenio.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El Subdecanato puede adjuntar el documento en formato PDF al editar el convenio.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
