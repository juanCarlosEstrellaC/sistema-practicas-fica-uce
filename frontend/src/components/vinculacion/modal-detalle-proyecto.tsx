'use client';

import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';
import { BadgeEstadoProyecto } from '@/components/vinculacion/badge-estado-proyecto';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { formatearFecha } from '@/lib/utilidades/fechas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FolderGit2, GraduationCap, Mail, User, Clock, FileText } from 'lucide-react';

export interface ModalDetalleProyectoProps {
  proyecto: ProyectoComunitarioDto | null;
  abierto: boolean;
  alCerrar: () => void;
}

export function ModalDetalleProyecto({
  proyecto,
  abierto,
  alCerrar,
}: ModalDetalleProyectoProps) {
  if (!proyecto) return null;

  const urlDocumento = proyecto.urlDocumento
    ? (proyecto.id ? `/proyectos-comunitarios/${proyecto.id}/preview` : proyecto.urlDocumento)
    : undefined;
  const urlDocumentoAdaptada = adaptarUrlProxy(urlDocumento);
  const nombreArchivoPdf = proyecto.nombreDocumento
    ? (proyecto.nombreDocumento.toLowerCase().endsWith('.pdf')
        ? proyecto.nombreDocumento
        : `${proyecto.nombreDocumento}.pdf`)
    : 'proyecto.pdf';

  return (
    <Dialog open={abierto} onOpenChange={(ab) => !ab && alCerrar()}>
      <DialogContent className="w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-12">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 min-w-0">
              <FolderGit2 className="w-5 h-5 text-primary shrink-0" />
              <span>{proyecto.nombre}</span>
            </DialogTitle>
            <div className="shrink-0">
              <BadgeEstadoProyecto estado={proyecto.estado} />
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
                  <span className="text-xs text-muted-foreground block font-medium">Carrera</span>
                  <span className="font-medium text-foreground flex items-start gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{proyecto.nombreCarrera || `Carrera ID: ${proyecto.carreraId}`}</span>
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Ejecución</span>
                  <span className="font-medium text-foreground">
                    {proyecto.iniciado ? 'En Desarrollo (Iniciado)' : 'En Asignación'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-muted-foreground block font-medium">Descripción</span>
                  <span className="font-medium text-foreground leading-relaxed block mt-0.5">
                    {proyecto.descripcion || 'Sin descripción registrada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vigencia del Proyecto */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground border-b border-border/40 pb-2">
                <Clock className="w-4 h-4 text-primary" />
                Vigencia del Proyecto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Fecha de Inicio</span>
                  <span className="font-medium text-foreground">
                    {formatearFecha(proyecto.fechaInicio, false)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Fecha de Fin (Vencimiento)</span>
                  <span className="font-medium text-foreground">
                    {formatearFecha(proyecto.fechaFin, false)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tutor Académico Responsable */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground border-b border-border/40 pb-2">
                <User className="w-4 h-4 text-primary" />
                Tutor Académico Responsable
              </h3>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Nombre</span>
                  <span className="font-medium text-foreground">
                    {proyecto.nombreCompletoTutor || 'Por designar'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Correo de Contacto</span>
                  <span className="font-medium text-foreground flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{proyecto.correoTutor || 'Sin correo'}</span>
                  </span>
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
                  {proyecto.nombreDocumento || 'Documento del Proyecto'}
                </span>
              </div>
              {urlDocumentoAdaptada && (
                <BotonPrevisualizarDocumento
                  url={urlDocumentoAdaptada}
                  titulo={`Proyecto - ${proyecto.nombre}`}
                  subtitulo="Documento oficial de Vinculación con la Sociedad • Universidad Central del Ecuador"
                  nombreArchivo={nombreArchivoPdf}
                  texto="Expandir"
                  tamano="sm"
                />
              )}
            </div>

            {urlDocumentoAdaptada ? (
              <iframe
                key={`${proyecto.id}-${proyecto.urlDocumento || ''}-${proyecto.nombreDocumento || ''}`}
                src={urlDocumentoAdaptada}
                className="w-full flex-1 bg-white"
                title={`Documento del proyecto ${proyecto.nombre}`}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-sm">No se ha subido ningún documento para este proyecto.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El Subdecanato puede adjuntar el documento en formato PDF al editar el proyecto.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
