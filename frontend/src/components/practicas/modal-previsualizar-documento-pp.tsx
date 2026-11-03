'use client';

import {
  ModalPrevisualizarDocumento,
  ModalPrevisualizarDocumentoProps,
} from '@/components/comunes/modal-previsualizar-documento';

export interface ModalPrevisualizarDocumentoPpProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  titulo?: string;
  urlDocumento?: string | null;
  nombreArchivoDescarga?: string;
}

export function ModalPrevisualizarDocumentoPp({
  abierto,
  abrirModal,
  titulo = 'Visualización de Documento',
  urlDocumento,
  nombreArchivoDescarga = 'documento_practica.pdf',
}: ModalPrevisualizarDocumentoPpProps) {
  return (
    <ModalPrevisualizarDocumento
      abierto={abierto}
      abrirModal={abrirModal}
      titulo={titulo}
      subtitulo="Documento oficial de Prácticas Preprofesionales • Universidad Central del Ecuador"
      urlDocumento={urlDocumento}
      nombreArchivoDescarga={nombreArchivoDescarga}
    />
  );
}
