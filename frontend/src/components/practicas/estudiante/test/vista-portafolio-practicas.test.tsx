import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { VistaPortafolioPracticas } from '../vista-portafolio-practicas';
import { DocumentoDto } from '@/lib/tipos/pp/general-pp';

vi.mock('@/lib/servicios/documento.servicio', () => ({
  subirArchivo: vi.fn(),
}));

vi.mock('@/lib/acciones/pp/documento-portafolio.acciones', () => ({
  registrarDocumentoPortafolioAccion: vi.fn(),
  resubirDocumentoPortafolioAccion: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VistaPortafolioPracticas (Previsualizacion en la Misma Pestana)', () => {
  const documentosPrueba: DocumentoDto[] = [
    {
      id: 'doc-1',
      tipo: 'CV',
      nombre: 'curriculum_vitae_juan.pdf',
      url: 'https://ejemplo.uce.edu.ec/archivos/cv_juan.pdf',
      estado: 'APROBADO',
      fechaSubida: '2026-10-10T10:00:00Z',
      estudianteId: '10',
      firmado: false,
    },
  ];

  it('debe renderizar los requisitos y el boton de previsualizacion en la misma pestana', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['contenido pdf'], { type: 'application/pdf' }),
    });

    render(
      <VistaPortafolioPracticas
        estudianteId={10}
        documentosIniciales={documentosPrueba}
      />
    );

    // Verifica que el nombre del documento y el requisito esten en pantalla
    expect(screen.getByText('1. Hoja de Vida (CV)')).toBeInTheDocument();
    expect(screen.getByText('curriculum_vitae_juan.pdf')).toBeInTheDocument();

    // El boton "Ver" debe estar presente
    const botonVer = screen.getByRole('button', { name: /ver/i });
    expect(botonVer).toBeInTheDocument();

    // Al hacer clic no debe llamar a window.open ya que abre el modal en la misma pestana
    await act(async () => {
      fireEvent.click(botonVer);
    });
    expect(windowOpenSpy).not.toHaveBeenCalled();

    windowOpenSpy.mockRestore();
  });
});
