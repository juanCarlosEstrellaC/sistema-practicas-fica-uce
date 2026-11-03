import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SeccionFirmaDocumento } from '../seccion-firma-documento';

describe('SeccionFirmaDocumento (Componente Común de Firma)', () => {
  it('debe renderizar el selector inicial con opciones FirmaEC y Sin FirmaEC (firma manual)', () => {
    render(
      <SeccionFirmaDocumento
        archivoFirmado={null}
        alCambiarArchivo={vi.fn()}
        alDescargar={vi.fn()}
      />
    );

    expect(screen.getByText('Método de firma')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FirmaEC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' })).toBeInTheDocument();
  });

  it('debe cambiar al modo FirmaEC con sus instrucciones y permitir volver', () => {
    render(
      <SeccionFirmaDocumento
        archivoFirmado={null}
        alCambiarArchivo={vi.fn()}
        alDescargar={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'FirmaEC' }));

    expect(screen.getByText(/FirmaEC \(firma electrónica\)/i)).toBeInTheDocument();
    expect(screen.getByText(/aplicativo oficial/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(screen.getByRole('button', { name: 'FirmaEC' })).toBeInTheDocument();
  });

  it('debe cambiar al modo manual, ejecutar descarga y procesar archivo firmado', () => {
    const alDescargar = vi.fn();
    const alCambiarArchivo = vi.fn();

    render(
      <SeccionFirmaDocumento
        archivoFirmado={null}
        alCambiarArchivo={alCambiarArchivo}
        alDescargar={alDescargar}
        idInput="input-test-firma"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sin FirmaEC (firma manual)' }));

    expect(screen.getByText('Firma manual')).toBeInTheDocument();
    expect(screen.getByText(/esferográfico azul/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Descargar' }));
    expect(alDescargar).toHaveBeenCalledTimes(1);

    const input = document.getElementById('input-test-firma') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const archivoMock = new File(['dummy'], 'prueba_firmada.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [archivoMock] } });

    expect(alCambiarArchivo).toHaveBeenCalledWith(archivoMock);
  });
});
