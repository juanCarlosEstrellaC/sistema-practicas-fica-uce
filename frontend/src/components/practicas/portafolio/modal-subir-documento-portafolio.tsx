'use client';

import { useState, useRef } from 'react';
import { DocumentoPortafolioItem } from './tipos-portafolio';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import {
  registrarDocumentoPortafolioAccion,
  resubirDocumentoPortafolioAccion,
} from '@/lib/acciones/pp/documento-portafolio.acciones';

interface ModalSubirDocumentoPortafolioProps {
  documento: DocumentoPortafolioItem | null;
  abierto: boolean;
  alCerrar: () => void;
  estudianteId: string;
  asignacionId?: string;
  alDocumentoActualizado: () => void;
  esSoloLectura?: boolean;
}

export function ModalSubirDocumentoPortafolio({
  documento,
  abierto,
  alCerrar,
  estudianteId,
  asignacionId,
  alDocumentoActualizado,
  esSoloLectura = false,
}: ModalSubirDocumentoPortafolioProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState<boolean>(false);
  const [subiendo, setSubiendo] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const extensionesPermitidas = ['.pdf', '.doc', '.docx'];
  const LIMITE_TAMANIO_BYTES = 10 * 1024 * 1024; // 10 MB

  const validarArchivo = (f: File): boolean => {
    const nombre = f.name.toLowerCase();
    const esValido = extensionesPermitidas.some((ext) => nombre.endsWith(ext));
    if (!esValido) {
      toast.error('Formato no permitido. Solo se permiten archivos PDF y Word (DOC, DOCX).');
      return false;
    }
    if (f.size > LIMITE_TAMANIO_BYTES) {
      toast.error('El archivo excede el tamaño máximo permitido de 10 MB.');
      return false;
    }
    return true;
  };

  if (!documento) return null;

  const manejarEnvio = async () => {
    if (!archivo) {
      toast.error('Debe seleccionar un archivo para continuar.');
      return;
    }

    setSubiendo(true);
    try {
      const urlArchivo = await subirArchivo(archivo, CARPETAS_ARCHIVOS.PORTAFOLIOS);

      if (documento.dbId) {
        const res = await resubirDocumentoPortafolioAccion(Number(documento.dbId), {
          nombreArchivo: archivo.name,
          urlArchivo,
        });
        if (res.exito) {
          toast.success('Documento actualizado y enviado a revisión.');
          setArchivo(null);
          alCerrar();
          alDocumentoActualizado();
        } else {
          toast.error(res.mensaje || 'Error al actualizar el documento.');
        }
      } else {
        const res = await registrarDocumentoPortafolioAccion({
          estudianteId: Number(estudianteId),
          tipo: documento.tipo,
          nombreArchivo: archivo.name,
          urlArchivo,
          asignacionId: asignacionId ? Number(asignacionId) : undefined,
        });
        if (res.exito) {
          toast.success('Documento cargado exitosamente.');
          setArchivo(null);
          alCerrar();
          alDocumentoActualizado();
        } else {
          toast.error(res.mensaje || 'Error al cargar el documento.');
        }
      }
    } catch (error) {
      console.error('Error al subir documento del portafolio:', error);
      toast.error('Ocurrió un error inesperado al subir el documento.');
    } finally {
      setSubiendo(false);
    }
  };

  const esModoDetalles = esSoloLectura && documento.estado === 'rechazado';

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && alCerrar()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {esModoDetalles
              ? 'Detalles del Documento'
              : documento.estado === 'pendiente'
              ? 'Subir Documento'
              : 'Resubir Documento'}
          </DialogTitle>
          <DialogDescription className="break-words">{documento.nombre}</DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3.5 w-full min-w-0 overflow-hidden">
          {documento.comentario && documento.estado === 'rechazado' && (
            <div className="p-3.5 bg-destructive/10 border-l-4 border-destructive rounded-r-lg text-xs sm:text-sm flex gap-2.5 items-start min-w-0">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-destructive block mb-0.5">
                  Observación de Revisión:
                </span>
                <p className="text-muted-foreground leading-relaxed break-words">{documento.comentario}</p>
              </div>
            </div>
          )}

          {!esModoDetalles && (
            <div className="space-y-3 w-full min-w-0">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                ref={inputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && validarArchivo(f)) {
                    setArchivo(f);
                    toast.success(`Archivo preparado: ${f.name}`);
                  }
                }}
              />

              <div
                className={cn(
                  'w-full max-w-full overflow-hidden border-2 border-dashed rounded-xl transition-all select-none',
                  archivo
                    ? 'border-primary/60 bg-primary/5 p-3.5 sm:p-4'
                    : 'border-border/80 hover:border-primary/50 hover:bg-muted/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer',
                  arrastrando && !archivo && 'border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.01]'
                )}
                onClick={() => !archivo && inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!archivo) {
                    setArrastrando(true);
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setArrastrando(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setArrastrando(false);
                  if (archivo) return;

                  const archivoSoltado = e.dataTransfer.files?.[0];
                  if (archivoSoltado && validarArchivo(archivoSoltado)) {
                    setArchivo(archivoSoltado);
                    toast.success(`Archivo preparado: ${archivoSoltado.name}`);
                  }
                }}
              >
                {archivo ? (
                  <div className="flex items-center justify-between gap-3 w-full min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                      <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden text-left">
                        <p
                          className="text-xs sm:text-sm font-semibold truncate text-foreground block max-w-full"
                          title={archivo.name}
                        >
                          {archivo.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {(archivo.size / (1024 * 1024)).toFixed(2)} MB • {archivo.name.split('.').pop()?.toUpperCase() || 'DOCUMENTO'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-lg"
                      title="Quitar archivo"
                      aria-label="Quitar archivo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setArchivo(null);
                        if (inputRef.current) inputRef.current.value = '';
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload
                      className={cn(
                        'w-6 h-6 mb-2 transition-all',
                        arrastrando ? 'text-primary scale-110' : 'text-muted-foreground'
                      )}
                    />
                    <p className="font-medium text-xs sm:text-sm text-foreground">
                      {arrastrando ? 'Suelta el archivo aquí' : 'Arrastre el archivo aquí o haga clic para seleccionar'}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PDF, DOC, DOCX (Máximo 10 MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={alCerrar} disabled={subiendo}>
            {esModoDetalles ? 'Cerrar' : 'Cancelar'}
          </Button>

          {!esModoDetalles && (
            <Button
              type="button"
              disabled={!archivo || subiendo}
              onClick={manejarEnvio}
              className="gap-2"
            >
              {subiendo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                'Confirmar y Enviar'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
