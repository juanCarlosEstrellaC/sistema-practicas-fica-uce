'use client';

import { DocumentoPortafolioItem, EstadoDocumentoPortafolio } from './tipos-portafolio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { cn } from '@/lib/utils';
import {
  adaptarUrlProxy,
  obtenerUrlDescargaDocumentoPortafolio,
} from '@/lib/utilidades/proxy-url';
import { obtenerEtiquetaFaseDePractica } from '@/lib/utilidades/etiquetas';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  Download,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface TarjetaDocumentoPortafolioProps {
  documento: DocumentoPortafolioItem;
  disponible: boolean;
  puedeResubir: boolean;
  alSeleccionarParaSubir: (documento: DocumentoPortafolioItem) => void;
  esDestacado?: boolean;
  rol?: string;
}

export function TarjetaDocumentoPortafolio({
  documento,
  disponible,
  puedeResubir,
  alSeleccionarParaSubir,
  esDestacado = false,
  rol,
}: TarjetaDocumentoPortafolioProps) {
  const esDocTutoria =
    documento.tipo === 'SEGUIMIENTO_TA' ||
    documento.tipo === 'INFORME_FINAL' ||
    documento.tipo === 'CERTIFICADO_CUMPLIMIENTO';

  const puedeVerObservacion = esDocTutoria
    ? rol === 'TUTOR_ACADEMICO' || rol === 'COORDINADOR_PRACTICAS'
    : true;

  const urlDescargaFinal = documento.dbId
    ? obtenerUrlDescargaDocumentoPortafolio(documento.dbId)
    : (documento.url || '');

  const manejarDescarga = async (e: React.MouseEvent, url: string, nombreArchivo: string) => {
    e.preventDefault();
    e.stopPropagation();
    const urlFinal = adaptarUrlProxy(url);
    try {
      const respuesta = await fetch(urlFinal);
      if (!respuesta.ok) throw new Error('Error al descargar');
      const blob = await respuesta.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = blobUrl;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(enlace);
    } catch {
      toast.error('No se pudo descargar el archivo.');
    }
  };

  const obtenerIconoEstado = (estado: EstadoDocumentoPortafolio) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'subido':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'rechazado':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const obtenerBadgeEstado = (estado: EstadoDocumentoPortafolio) => {
    switch (estado) {
      case 'aprobado':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap">
            Aprobado
          </Badge>
        );
      case 'subido':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0 whitespace-nowrap">
            En Revisión
          </Badge>
        );
      case 'rechazado':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 shrink-0 whitespace-nowrap">
            Rechazado
          </Badge>
        );
      default:
        return <Badge variant="outline" className="shrink-0 whitespace-nowrap">Pendiente</Badge>;
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border transition-all duration-300',
        disponible ? 'bg-card hover:bg-muted/30 shadow-2xs' : 'bg-muted/20 opacity-65',
        esDestacado ? 'ring-2 ring-primary border-primary bg-primary/5 animate-pulse' : 'border-border/70'
      )}
    >
      <div className="flex items-start md:items-center gap-3.5 p-3.5 flex-col md:flex-row">
        <div
          className={cn(
            'p-2 rounded-lg shrink-0 hidden md:flex items-center justify-center',
            disponible ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          {disponible ? obtenerIconoEstado(documento.estado) : <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className={cn(
                'p-1.5 rounded-md md:hidden shrink-0',
                disponible ? 'bg-primary/10' : 'bg-muted'
              )}
            >
              {disponible ? obtenerIconoEstado(documento.estado) : <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <h3 className="font-semibold text-foreground text-xs sm:text-sm truncate">
              {documento.nombre}
            </h3>
          </div>

          <p
            className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed"
            title={documento.descripcion}
          >
            {documento.descripcion}
          </p>

          {documento.fechaSubida && documento.estado !== 'pendiente' && disponible && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Subido: {documento.fechaSubida}
              {documento.fechaRevision && ` | Revisado: ${documento.fechaRevision}`}
            </p>
          )}

          {!disponible && (
            <p className="text-[10px] text-muted-foreground mt-1 italic">
              Disponible en fase: {obtenerEtiquetaFaseDePractica(documento.etapaMinima)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap sm:flex-nowrap justify-end">
          {disponible && obtenerBadgeEstado(documento.estado)}

          {!disponible && (
            <Button size="sm" variant="ghost" disabled className="text-xs h-8 italic">
              <Lock className="w-3.5 h-3.5 mr-1" />
              Bloqueado
            </Button>
          )}

          {/* Documento rechazado con permiso para resubir: Botonera con las 3 opciones (Previsualizar, Descargar, Corregir y Resubir) */}
          {disponible && puedeResubir && documento.estado === 'rechazado' && (
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
              {documento.url && (
                <>
                  <BotonPrevisualizarDocumento
                    url={documento.url}
                    titulo={documento.archivoNombre || documento.nombre}
                    subtitulo="Documento oficial de Prácticas Preprofesionales • Universidad Central del Ecuador"
                    tamano="icon"
                    variante="outline"
                    className="h-8 w-8 shrink-0"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    title="Descargar documento"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) =>
                      manejarDescarga(
                        e,
                        urlDescargaFinal,
                        documento.archivoNombre || `${documento.id}.pdf`
                      )
                    }
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs gap-1.5 shadow-2xs"
                onClick={() => alSeleccionarParaSubir(documento)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Corregir y Resubir
              </Button>
            </div>
          )}

          {/* Documento pendiente que se puede subir por primera vez */}
          {disponible && puedeResubir && documento.estado === 'pendiente' && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8"
              onClick={() => alSeleccionarParaSubir(documento)}
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Subir
            </Button>
          )}

          {/* Documento rechazado en modo solo lectura (sin permiso para resubir por este rol) */}
          {disponible && !puedeResubir && documento.estado === 'rechazado' && (
            <div className="flex items-center gap-1.5 shrink-0">
              {documento.url && (
                <>
                  <BotonPrevisualizarDocumento
                    url={documento.url}
                    titulo={documento.archivoNombre || documento.nombre}
                    tamano="icon"
                    variante="outline"
                    className="h-8 w-8 shrink-0"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    title="Descargar documento"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) =>
                      manejarDescarga(
                        e,
                        urlDescargaFinal,
                        documento.archivoNombre || `${documento.id}.pdf`
                      )
                    }
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
              {documento.comentario && puedeVerObservacion && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-8 text-destructive hover:bg-destructive/10"
                  onClick={() => alSeleccionarParaSubir(documento)}
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                  Ver Detalles
                </Button>
              )}
            </div>
          )}

          {/* Documento subido o aprobado */}
          {disponible && (documento.estado === 'subido' || documento.estado === 'aprobado') && (
            <div className="flex items-center gap-1.5 shrink-0">
              {documento.url ? (
                <>
                  <BotonPrevisualizarDocumento
                    url={documento.url}
                    titulo={documento.archivoNombre || documento.nombre}
                    tamano="icon"
                    variante="outline"
                    className="h-8 w-8 shrink-0"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    title="Descargar documento"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) =>
                      manejarDescarga(
                        e,
                        urlDescargaFinal,
                        documento.archivoNombre || `${documento.id}.pdf`
                      )
                    }
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                  Sin archivo
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
