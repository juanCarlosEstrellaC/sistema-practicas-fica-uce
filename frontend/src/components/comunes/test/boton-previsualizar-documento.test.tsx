import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BotonPrevisualizarDocumento } from '../boton-previsualizar-documento';

// Mock de window.URL.createObjectURL y revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost:3000/mock-blob');
global.URL.revokeObjectURL = vi.fn();

describe('BotonPrevisualizarDocumento (Componente Común UI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['fake-pdf'], { type: 'application/pdf' })),
    } as any);
  });

  it('debe renderizar el botón con texto y estado deshabilitado si no hay URL', () => {
    render(
      <BotonPrevisualizarDocumento
        titulo="Documento de Prueba"
        texto="Ver Documento"
        url={null}
      />
    );

    const boton = screen.getByRole('button', { name: /Ver Documento/i });
    expect(boton).toBeDefined();
    expect(boton.hasAttribute('disabled')).toBe(true);
  });

  it('debe renderizar habilitado cuando cuenta con URL y abrir el modal al hacer click', async () => {
    const fnClick = vi.fn();
    render(
      <BotonPrevisualizarDocumento
        titulo="Certificado Oficial"
        subtitulo="Documento institucional"
        texto="Ver Certificado"
        url="http://localhost:3000/api/proxy/documento/1/preview"
        nombreArchivo="Certificado.pdf"
        onClickAdicional={fnClick}
      />
    );

    const boton = screen.getByRole('button', { name: /Ver Certificado/i });
    expect(boton).toBeDefined();
    expect(boton.hasAttribute('disabled')).toBe(false);

    await act(async () => {
      fireEvent.click(boton);
    });

    expect(fnClick).toHaveBeenCalledTimes(1);

    // Debe mostrar el modal con el título y subtítulo
    expect(screen.getByText('Certificado Oficial')).toBeDefined();
    expect(screen.getByText('Documento institucional')).toBeDefined();
  });
});
