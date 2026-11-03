'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { DocumentoPortafolioVcsItem } from './tipos-portafolio-vcs';

export interface ModalDetalleDocumentoVcsProps {
  documento: DocumentoPortafolioVcsItem | null;
  alCerrar: () => void;
}

export function ModalDetalleDocumentoVcs({
  documento,
  alCerrar,
}: ModalDetalleDocumentoVcsProps) {
  if (!documento) return null;

  return (
    <Dialog open={Boolean(documento)} onOpenChange={(ab) => !ab && alCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Documento</DialogTitle>
          <DialogDescription className="break-words">{documento.nombre}</DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col gap-3.5 w-full min-w-0 overflow-hidden">
          {documento.comentario && documento.estado === 'rechazado' && (
            <div className="p-3.5 bg-destructive/10 border-l-4 border-destructive rounded-r-lg text-xs sm:text-sm flex gap-2.5 items-start min-w-0">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-destructive block mb-0.5">
                  Observación del Tutor:
                </span>
                <p className="text-muted-foreground leading-relaxed break-words">
                  {documento.comentario}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 justify-end sm:justify-end">
          <Button type="button" variant="outline" onClick={alCerrar}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
