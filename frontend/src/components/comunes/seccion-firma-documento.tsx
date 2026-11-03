'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, X, ArrowLeft, FileCheck, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export interface SeccionFirmaDocumentoProps {
  archivoFirmado: File | null;
  alCambiarArchivo: (archivo: File | null) => void;
  alDescargar: () => void;
  deshabilitado?: boolean;
  idInput?: string;
  etiquetaDocumento?: string;
}

export function SeccionFirmaDocumento({
  archivoFirmado,
  alCambiarArchivo,
  alDescargar,
  deshabilitado = false,
  idInput = 'subir-aval-firmado',
  etiquetaDocumento = 'documento',
}: SeccionFirmaDocumentoProps) {
  const [metodoFirma, setMetodoFirma] = useState<'seleccion' | 'firmaec' | 'manual'>('seleccion');

  const procesarArchivoFirmado = (archivo?: File) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.pdf') && archivo.type !== 'application/pdf') {
      toast.error('Solo se permiten documentos en formato PDF');
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      toast.error('El documento firmado no debe superar los 10 MB');
      return;
    }
    alCambiarArchivo(archivo);
    toast.success('Documento firmado cargado correctamente');
  };

  const limpiarArchivo = () => {
    alCambiarArchivo(null);
  };

  if (metodoFirma === 'seleccion') {
    return (
      <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2 border border-border/60">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Método de firma
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={deshabilitado}
          className="w-full h-10 justify-center font-medium text-xs transition-all hover:border-primary/50"
          onClick={() => setMetodoFirma('firmaec')}
        >
          FirmaEC
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={deshabilitado}
          className="w-full h-10 justify-center font-medium text-xs transition-all hover:border-primary/50"
          onClick={() => setMetodoFirma('manual')}
        >
          Sin FirmaEC (firma manual)
        </Button>
      </div>
    );
  }

  const esFirmaEc = metodoFirma === 'firmaec';

  return (
    <div className="p-3 bg-muted/30 rounded-lg flex flex-col gap-2.5 border border-border/60">
      <div className="flex items-center justify-between pb-0.5">
        <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
          {esFirmaEc ? (
            <>
              <ShieldCheck className="w-4 h-4 text-primary" />
              FirmaEC (firma electrónica)
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4 text-primary" />
              Firma manual
            </>
          )}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          onClick={() => setMetodoFirma('seleccion')}
          disabled={deshabilitado}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </Button>
      </div>

      {/* Instrucciones de firma */}
      <div className="bg-background/85 p-2.5 rounded-md text-xs space-y-1.5 leading-relaxed border border-border/50">
        <span className="font-semibold text-foreground block text-xs">
          Instrucciones de firma:
        </span>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
          <li>
            <strong className="text-foreground">Descargar PDF:</strong> use el botón &ldquo;Descargar&rdquo; a continuación.
          </li>
          <li>
            <strong className="text-foreground">Firmar documento:</strong>
            {esFirmaEc ? (
              <ul className="list-disc list-inside pl-3 pt-0.5 space-y-0.5 text-[10.5px]">
                <li>Abra el PDF en el aplicativo oficial <strong className="text-foreground">FirmaEC</strong>.</li>
                <li>Aplique su firma electrónica institucional (token o archivo .p12/.pfx).</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside pl-3 pt-0.5 space-y-0.5 text-[10.5px]">
                <li>Desde el editor de PDF del visor (añadiendo imagen o rúbrica).</li>
                <li>O en físico con <strong className="text-foreground">esferográfico azul</strong>.</li>
              </ul>
            )}
          </li>
          <li>
            <strong className="text-foreground">Subir:</strong> cargue el archivo PDF firmado para validarlo.
          </li>
        </ol>
      </div>

      {/* Botones de acción: Descargar y Subir */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs gap-1.5"
          onClick={alDescargar}
          disabled={deshabilitado}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          Descargar
        </Button>

        <div className="relative">
          <Input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            id={idInput}
            disabled={deshabilitado}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                procesarArchivoFirmado(e.target.files[0]);
              }
            }}
          />
          <Label
            htmlFor={idInput}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              procesarArchivoFirmado(e.dataTransfer.files?.[0]);
            }}
            className="flex items-center justify-center w-full h-8 px-2 border rounded-md cursor-pointer text-xs font-medium bg-background hover:bg-accent transition-colors select-none text-foreground"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Subir</span>
          </Label>
        </div>
      </div>

      {/* Archivo cargado */}
      {archivoFirmado && (
        <div className="flex items-center justify-between min-w-0 w-full p-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 overflow-hidden">
          <span className="truncate min-w-0 flex-1 font-medium mr-2" title={archivoFirmado.name}>
            {archivoFirmado.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10"
            onClick={limpiarArchivo}
            title="Quitar archivo firmado"
            disabled={deshabilitado}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
