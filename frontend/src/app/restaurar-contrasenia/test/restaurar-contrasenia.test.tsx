import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import RestaurarContraseniaPage from '../page';

const mockPush = vi.fn();
let mockToken: string | null = 'token-valido-123';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (param: string) => (param === 'token' ? mockToken : null),
  }),
}));

vi.mock('@/lib/acciones/autenticacion.acciones', () => ({
  restaurarContraseniaAccion: vi.fn(),
}));

import { restaurarContraseniaAccion } from '@/lib/acciones/autenticacion.acciones';

describe('RestaurarContraseniaPage (Flujo de Recuperación)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken = 'token-valido-123';
  });

  it('debe mostrar mensaje de error si no se proporciona token en la URL', () => {
    mockToken = null;
    render(<RestaurarContraseniaPage />);

    expect(screen.getByText('Token inválido o no proporcionado.')).toBeInTheDocument();
  });

  it('debe renderizar los campos de nueva contraseña y confirmación cuando hay token', () => {
    render(<RestaurarContraseniaPage />);

    expect(screen.getAllByText('Restablecer Contraseña')[0]).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si las contraseñas no coinciden', async () => {
    render(<RestaurarContraseniaPage />);

    const inputNueva = screen.getByLabelText('Nueva Contraseña');
    const inputConfirmar = screen.getByLabelText('Confirmar Contraseña');

    fireEvent.change(inputNueva, { target: { value: 'Segura#2026!Abc' } });
    fireEvent.change(inputConfirmar, { target: { value: 'Diferente@2026!' } });

    // El botón estará deshabilitado porque no coinciden
    const botonEnviar = screen.getByRole('button', { name: 'Restablecer Contraseña' });
    expect(botonEnviar).toBeDisabled();
  });

  it('debe ejecutar la restauración exitosamente y mostrar la pantalla de confirmación', async () => {
    vi.mocked(restaurarContraseniaAccion).mockResolvedValue({
      exito: true,
      mensaje: 'Contraseña actualizada exitosamente',
    });

    render(<RestaurarContraseniaPage />);

    const inputNueva = screen.getByLabelText('Nueva Contraseña');
    const inputConfirmar = screen.getByLabelText('Confirmar Contraseña');

    fireEvent.change(inputNueva, { target: { value: 'Segura#2026!Abc' } });
    fireEvent.change(inputConfirmar, { target: { value: 'Segura#2026!Abc' } });

    const botonEnviar = screen.getByRole('button', { name: 'Restablecer Contraseña' });
    expect(botonEnviar).not.toBeDisabled();

    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText('Contraseña actualizada exitosamente.')).toBeInTheDocument();
      expect(screen.getByText('Ir al inicio de sesión')).toBeInTheDocument();
    });

    expect(restaurarContraseniaAccion).toHaveBeenCalledWith('token-valido-123', 'Segura#2026!Abc');

    fireEvent.click(screen.getByText('Ir al inicio de sesión'));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('debe mostrar mensaje de error si el backend rechaza la restauración', async () => {
    vi.mocked(restaurarContraseniaAccion).mockResolvedValue({
      exito: false,
      mensaje: 'El token ha expirado',
    });

    render(<RestaurarContraseniaPage />);

    const inputNueva = screen.getByLabelText('Nueva Contraseña');
    const inputConfirmar = screen.getByLabelText('Confirmar Contraseña');

    fireEvent.change(inputNueva, { target: { value: 'Segura#2026!Abc' } });
    fireEvent.change(inputConfirmar, { target: { value: 'Segura#2026!Abc' } });

    const botonEnviar = screen.getByRole('button', { name: 'Restablecer Contraseña' });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText('El token ha expirado')).toBeInTheDocument();
    });
  });
});
