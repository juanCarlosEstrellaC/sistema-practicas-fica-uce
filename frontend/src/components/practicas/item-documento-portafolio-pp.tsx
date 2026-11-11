'use client';

import { DocumentoDto, TipoDocumento } from '@/lib/tipos/pp/general-pp';
import { cn } from '@/lib/utils';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import {
  FileText,
  Upload,
  Download,
  Lock,
  RotateCcw,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';

export interface ItemDocumentoPortafolioPpProps {
  titulo: string;
  descripcion: string;
  tipo: TipoDocumento;
  subeEstudiante: boolean;
  emisorTexto: string;
  faseMinimaTexto: string;
  bloqueadoPorFase: boolean;
  bloqueadoPorValidacionCpp?: boolean;
  documento?: DocumentoDto;
  urlDocumento?: string;
  estaSubiendo: boolean;
  alSeleccionarArchivo: (archivo: File) => void;
  alPrevisualizar?: () => void;
  alDescargar: (e: React.MouseEvent) => void;
  referenciaInput: (el: HTMLInputElement | null) => void;
  rol?: string;
}

export function ItemDocumentoPortafolioPp({
  titulo,
  descripcion,
  tipo,
  subeEstudiante,
  emisorTexto,
  faseMinimaTexto,
  bloqueadoPorFase,
  bloqueadoPorValidacionCpp = false,
  documento,
  urlDocumento,
  estaSubiendo,
  alSeleccionarArchivo,
  alPrevisualizar,
  alDescargar,
  referenciaInput,
  rol = 'ESTUDIANTE',
}: ItemDocumentoPortafolioPpProps) {
  const tieneArchivo = Boolean(urlDocumento || documento?.url);
  const estado = documento?.estado;
  const tieneObservacion = Boolean(documento?.observacion && documento.observacion.trim().length > 0);
  const estadoNormalizado = (estado as string | undefined)?.toUpperCase();
  const esAprobado = estadoNormalizado === 'APROBADO';
  const esRechazado =
    !esAprobado &&
    (estadoNormalizado === 'RECHAZADO' ||
      estadoNormalizado === 'OBSERVADO' ||
      tieneObservacion);
  const esPendienteRevision =
    subeEstudiante && tieneArchivo && (!estado || estado === 'PENDIENTE_REVISION') && !esRechazado;

  const esDocTutoria =
    tipo === 'SEGUIMIENTO_TA' ||
    tipo === 'INFORME_FINAL' ||
    tipo === 'CERTIFICADO_CUMPLIMIENTO';

  const puedeVerObservacion = esDocTutoria
    ? rol === 'TUTOR_ACADEMICO' || rol === 'COORDINADOR_PRACTICAS'
    : true;

  const estaBloqueado =
    bloqueadoPorFase ||
    bloqueadoPorValidacionCpp ||
    (!subeEstudiante && (!tieneArchivo || !urlDocumento));

  const tituloTooltipBloqueado = bloqueadoPorFase
    ? `Disponible en la fase de ${faseMinimaTexto}`
    : bloqueadoPorValidacionCpp
    ? 'Disponible una vez que el Coordinador de Prácticas valide el portafolio'
    : tipo === 'CARTA_ASIGNACION'
    ? 'Disponible una vez que la Dirección de Carrera emita y remita la carta de asignación oficial'
    : 'Documento no disponible';

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all duration-200 space-y-3',
        bloqueadoPorFase
          ? 'bg-muted/20 border-dashed border-border/80 opacity-75 select-none'
          : 'bg-card border-border shadow-2xs'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Informacion del documento */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
              estaBloqueado
                ? 'bg-muted text-muted-foreground'
                : esAprobado || (!subeEstudiante && tieneArchivo)
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : esRechazado
                ? 'bg-destructive/10 text-destructive'
                : tieneArchivo
                ? 'bg-sky-500/10 text-sky-600'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {estaBloqueado ? (
              <Lock className="h-4 w-4 opacity-60" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'text-sm font-bold',
                  bloqueadoPorFase ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {titulo}
              </span>

              {/* Insignias / Badges segun bloqueo y rol (solo documentos 1 y 2 que sube el estudiante) */}
              {subeEstudiante && (
                bloqueadoPorFase ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-muted-foreground border-muted-foreground/30 bg-muted/40"
                  >
                    <Lock className="h-2.5 w-2.5 mr-1 opacity-70" />
                    No disponible (Fase {faseMinimaTexto})
                  </Badge>
                ) : (
                  <>
                    {!tieneArchivo && (
                      <Badge
                        variant="secondary"
                        className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 text-[10px] font-bold"
                      >
                        Pendiente de entrega
                      </Badge>
                    )}
                    {esPendienteRevision && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0 whitespace-nowrap text-[10px] font-bold"
                      >
                        En Revisión
                      </Badge>
                    )}
                    {esAprobado && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap text-[10px] font-bold"
                      >
                        Aprobado
                      </Badge>
                    )}
                    {esRechazado && (
                      <Badge
                        variant="secondary"
                        className="bg-destructive/10 text-destructive border-destructive/20 shrink-0 whitespace-nowrap text-[10px] font-bold"
                      >
                        Con Observaciones
                      </Badge>
                    )}
                  </>
                )
              )}
            </div>

            <p className="text-xs text-muted-foreground">{descripcion}</p>

            {bloqueadoPorValidacionCpp && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-0.5 flex items-center gap-1 font-medium">
                <AlertCircle className="h-3 w-3 shrink-0" />
                Cargado por Tutor Académico. Disponible para visualización cuando Coordinador de Prácticas valide el portafolio.
              </p>
            )}

            {tipo === 'CARTA_ASIGNACION' && estaBloqueado && !bloqueadoPorFase && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-0.5 flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3 shrink-0" />
                Pendiente de emisión y firma por la Dirección de Carrera.
              </p>
            )}

            {!bloqueadoPorFase && !bloqueadoPorValidacionCpp && documento?.fechaSubida && (
              <p className="text-[11px] text-muted-foreground pt-0.5">
                Subido el: {formatearFechaCorta(documento.fechaSubida)}
              </p>
            )}
          </div>
        </div>

        {/* Botones de accion */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Input oculto para subida de archivo */}
          {subeEstudiante && !bloqueadoPorFase && (
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              ref={referenciaInput}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  alSeleccionarArchivo(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          )}

          {estaBloqueado ? (
            <Button
              size="sm"
              disabled
              variant="outline"
              className="h-8 text-xs gap-1.5 opacity-60 cursor-not-allowed bg-muted/40"
              title={tituloTooltipBloqueado}
            >
              <Lock className="h-3.5 w-3.5" />
              Bloqueado
            </Button>
          ) : (
            <>
              {tieneArchivo && Boolean(urlDocumento) && (
                <>
                  <BotonPrevisualizarDocumento
                    titulo={titulo}
                    subtitulo="Documento oficial de Prácticas Preprofesionales • Universidad Central del Ecuador"
                    url={urlDocumento}
                    nombreArchivo={documento?.nombre || `${tipo.toLowerCase()}.pdf`}
                    texto="Ver"
                    className="bg-card text-foreground"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 shadow-2xs bg-card"
                    onClick={alDescargar}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </Button>
                </>
              )}

              {/* Boton de subida exclusivo para CV y Cedula */}
              {subeEstudiante && !esAprobado && (
                !tieneArchivo ? (
                  <Button
                    size="sm"
                    disabled={estaSubiendo}
                    className="h-8 text-xs gap-1.5 shadow-2xs bg-primary hover:bg-primary/90 text-primary-foreground"
                    asChild
                  >
                    <label className="cursor-pointer">
                      {estaSubiendo ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          Subir Archivo
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            alSeleccionarArchivo(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </Button>
                ) : esRechazado ? (
                  <Button
                    size="sm"
                    disabled={estaSubiendo}
                    variant="destructive"
                    className="h-8 text-xs gap-1.5 shadow-2xs"
                    asChild
                  >
                    <label className="cursor-pointer">
                      {estaSubiendo ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Corregir y Resubir
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            alSeleccionarArchivo(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </Button>
                ) : null
              )}
            </>
          )}
        </div>
      </div>

      {/* Alerta si tiene observaciones */}
      {!bloqueadoPorFase && tieneObservacion && puedeVerObservacion && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Observación del Tutor / Revisor:</span>
          </div>
          <p className="text-foreground pl-5 leading-relaxed">{documento?.observacion}</p>
        </div>
      )}
    </div>
  );
}
