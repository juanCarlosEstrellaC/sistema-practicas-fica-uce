'use client';

import {
  ModalPrevisualizarDocumento,
  ModalPrevisualizarDocumentoProps,
} from '@/components/comunes/modal-previsualizar-documento';

export interface ModalPrevisualizarDocumentoVcsProps {
  abierto: boolean;
  abrirModal: (abierto: boolean) => void;
  titulo?: string;
  urlDocumento?: string | null;
  nombreArchivoDescarga?: string;
}

export function ModalPrevisualizarDocumentoVcs({
  abierto,
  abrirModal,
  titulo = 'Visualización de Documento',
  urlDocumento,
  nombreArchivoDescarga = 'documento_vcs.pdf',
}: ModalPrevisualizarDocumentoVcsProps) {
  return (
    <ModalPrevisualizarDocumento
      abierto={abierto}
      abrirModal={abrirModal}
      titulo={titulo}
      subtitulo="Documento oficial de Vinculación con la Sociedad • Universidad Central del Ecuador"
      urlDocumento={urlDocumento}
      nombreArchivoDescarga={nombreArchivoDescarga}
    />
  );
}
