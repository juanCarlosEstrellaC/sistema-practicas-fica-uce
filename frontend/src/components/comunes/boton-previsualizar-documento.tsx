'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalPrevisualizarDocumento } from './modal-previsualizar-documento';

export interface BotonPrevisualizarDocumentoProps {
  url?: string | null;
  titulo?: string;
  nombreArchivo?: string;
  subtitulo?: string;
  texto?: string;
  icono?: React.ReactNode;
  variante?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  tamano?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  deshabilitado?: boolean;
  onClickAdicional?: () => void;
  children?: React.ReactNode;
}

export function BotonPrevisualizarDocumento({
  url,
  titulo = 'Visualización de Documento',
  nombreArchivo,
  subtitulo,
  texto = 'Ver Documento',
  icono,
  variante = 'outline',
  tamano = 'sm',
  className,
  deshabilitado = false,
  onClickAdicional,
  children,
}: BotonPrevisualizarDocumentoProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const manejarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;

    if (onClickAdicional) {
      onClickAdicional();
    }
    setModalAbierto(true);
  };

  const esIcono = tamano === 'icon';

  return (
    <>
      <Button
        type="button"
        variant={variante}
        size={tamano}
        disabled={deshabilitado || !url}
        onClick={manejarClick}
        title={texto}
        className={cn(
          'h-8 text-xs gap-1.5 shadow-2xs border-emerald-600/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 shrink-0',
          esIcono && 'w-8 p-0',
          className
        )}
      >
        {children || (
          <>
            {icono || <Eye className="h-3.5 w-3.5" />}
            {esIcono ? <span className="sr-only">{texto}</span> : <span>{texto}</span>}
          </>
        )}
      </Button>

      {modalAbierto && (
        <ModalPrevisualizarDocumento
          abierto={modalAbierto}
          alCerrar={() => setModalAbierto(false)}
          titulo={titulo}
          subtitulo={subtitulo}
          urlDocumento={url}
          nombreArchivoDescarga={nombreArchivo || titulo}
        />
      )}
    </>
  );
}
