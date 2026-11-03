'use client';

import { useState, useEffect } from 'react';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export interface ModalPrevisualizarDocumentoProps {
  abierto: boolean;
  alCerrar?: () => void;
  abrirModal?: (abierto: boolean) => void;
  titulo?: string;
  subtitulo?: string;
  urlDocumento?: string | null;
  nombreArchivoDescarga?: string;
}

export function ModalPrevisualizarDocumento({
  abierto,
  alCerrar,
  abrirModal,
  titulo = 'Visualización de Documento',
  subtitulo = 'Documento oficial • Universidad Central del Ecuador',
  urlDocumento,
  nombreArchivoDescarga = 'documento.pdf',
}: ModalPrevisualizarDocumentoProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const nombreSugerido =
    nombreArchivoDescarga !== 'documento.pdf'
      ? nombreArchivoDescarga
      : urlDocumento
      ? urlDocumento.split('/').pop()?.split('?')[0] || 'documento.pdf'
      : 'documento.pdf';

  const extension = (nombreSugerido || urlDocumento || '')
    .split('?')[0]
    .split('.')
    .pop()
    ?.toLowerCase();

  const esHojaCalculo = extension === 'xlsx' || extension === 'xls' || extension === 'ods';
  const esWord = extension === 'docx' || extension === 'doc';
  const esPdf = extension === 'pdf' || (!extension && (!urlDocumento || urlDocumento.includes('.pdf')));

  const manejarCierre = (estadoAbierto: boolean) => {
    if (!estadoAbierto) {
      if (alCerrar) alCerrar();
      if (abrirModal) abrirModal(false);
    }
  };

  useEffect(() => {
    let activo = true;
    let urlObjetoCreado: string | null = null;

    async function cargarBlob() {
      if (!urlDocumento) {
        setBlobUrl(null);
        return;
      }

      // Si es hoja de cálculo o documento de Word, no es necesario crear un blob para previsualizar iframe
      if (esHojaCalculo || esWord) {
        setBlobUrl(null);
        setCargando(false);
        return;
      }

      setCargando(true);
      const urlFinal = adaptarUrlProxy(urlDocumento);

      try {
        const respuesta = await fetch(urlFinal, { cache: 'no-store' });
        if (!respuesta.ok) throw new Error('Error al cargar vista previa del documento');
        const blob = await respuesta.blob();

        if (activo) {
          urlObjetoCreado = window.URL.createObjectURL(blob);
          setBlobUrl(urlObjetoCreado);
        }
      } catch (error) {
        console.error('Error al obtener blob de previsualización:', error);
        if (activo) {
          setBlobUrl(null);
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (abierto) {
      cargarBlob();
    } else {
      setBlobUrl(null);
    }

    return () => {
      activo = false;
      if (urlObjetoCreado) {
        window.URL.revokeObjectURL(urlObjetoCreado);
      }
    };
  }, [urlDocumento, abierto, esHojaCalculo, esWord]);

  const manejarDescarga = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!urlDocumento) return;

    try {
      const urlFinal = adaptarUrlProxy(urlDocumento);
      const respuesta = await fetch(urlFinal);
      if (!respuesta.ok) throw new Error('Error al descargar archivo');
      const blob = await respuesta.blob();
      const enlaceBlob = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = enlaceBlob;
      enlace.download = nombreSugerido;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      window.URL.revokeObjectURL(enlaceBlob);
      toast.success('Documento descargado con éxito');
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast.error('No se pudo descargar el archivo');
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={manejarCierre}>
      <DialogContent className="w-[92vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl h-[85vh] max-h-[860px] flex flex-col p-4 sm:p-5 overflow-hidden bg-background border shadow-2xl">
        <DialogHeader className="pb-0 pr-8">
          <div className="space-y-1">
            <DialogTitle className="text-base font-bold text-foreground truncate flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{titulo}</span>
            </DialogTitle>
            {subtitulo && (
              <DialogDescription className="text-xs text-muted-foreground truncate">
                {subtitulo}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 w-full h-full min-h-[450px] relative bg-muted/20 rounded-lg overflow-hidden">
          {cargando ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-xs">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                Cargando previsualización segura...
              </span>
            </div>
          ) : esPdf && blobUrl ? (
            <iframe
              src={`${blobUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-none rounded-lg"
              title="Vista previa del documento"
            />
          ) : esHojaCalculo || esWord ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6 bg-muted/10">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {esHojaCalculo ? (
                  <FileSpreadsheet className="h-12 w-12" />
                ) : (
                  <FileText className="h-12 w-12" />
                )}
              </div>
              <div className="max-w-md space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Documento de {esHojaCalculo ? 'Hoja de Cálculo' : 'Ofimática'} ({extension?.toUpperCase()})
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Los archivos en formato {extension?.toUpperCase()} no admiten previsualización incrustada en el navegador. Puede descargarlo directamente para visualizarlo o editarlo en su suite ofimática.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => manejarDescarga()}
                className="mt-2 gap-2 shadow-xs"
              >
                <Download className="h-4 w-4" />
                Descargar {nombreSugerido}
              </Button>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground p-6 text-center">
              <AlertCircle className="h-8 w-8 opacity-40" />
              <p className="text-sm font-medium">No se pudo cargar la vista previa</p>
              <p className="text-xs">Puede descargar el archivo directamente para visualizarlo.</p>
            </div>
          )}
        </div>

        <DialogFooter className=" flex flex-row items-center justify-between gap-2">
   
          <div className="flex items-center gap-2 ml-auto">
            {urlDocumento && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={manejarDescarga}
                className="h-8 text-xs gap-1.5 shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Descargar</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => manejarCierre(false)}
              className="h-8 text-xs px-4"
            >
              Cerrar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
