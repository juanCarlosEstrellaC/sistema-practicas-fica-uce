import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { PestaniaSeguridad } from '../pestania-seguridad';

const mockValidarMiContraseniaAccion = vi.fn();
const mockCambiarMiContraseniaAccion = vi.fn();

vi.mock('@/lib/acciones/usuario.acciones', () => ({
  validarMiContraseniaAccion: (pass: string) => mockValidarMiContraseniaAccion(pass),
  cambiarMiContraseniaAccion: (actual: string, nueva: string) => mockCambiarMiContraseniaAccion(actual, nueva),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PestaniaSeguridad (Componente Modular de Seguridad y NIST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar inicialmente la tarjeta de Contraseña de Acceso con el botón "Cambiar contraseña"', () => {
    render(<PestaniaSeguridad />);

    expect(screen.getByRole('heading', { level: 2, name: /seguridad de la cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeInTheDocument();
    // No debe mostrarse el botón suelto de verificar en la vista inicial
    expect(screen.queryByRole('button', { name: /^verificar$/i })).not.toBeInTheDocument();
  });

  it('debe abrir el menú modal al hacer clic en "Cambiar contraseña" y mostrar el Paso 1 de verificación', async () => {
    render(<PestaniaSeguridad />);

    const botonCambiar = screen.getByRole('button', { name: /cambiar contraseña/i });
    await act(async () => {
      fireEvent.click(botonCambiar);
    });

    expect(screen.getByRole('heading', { level: 2, name: /cambiar contraseña/i })).toBeInTheDocument();
    expect(screen.getByText(/Paso 1: Verificación de Identidad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña Actual/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^verificar$/i })).toBeInTheDocument();
    expect(screen.queryByText(/Paso 2: Definir Nueva Contraseña/i)).not.toBeInTheDocument();
  });

  it('debe verificar la contraseña actual y desbloquear el Paso 2 dentro del modal', async () => {
    mockValidarMiContraseniaAccion.mockResolvedValueOnce({
      exito: true,
      esValida: true,
    });

    render(<PestaniaSeguridad />);

    // Abrir menú modal
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    });

    const inputActual = screen.getByLabelText(/Contraseña Actual/i);
    fireEvent.change(inputActual, { target: { value: 'PassActual123*' } });

    const botonVerificar = screen.getByRole('button', { name: /^verificar$/i });
    await act(async () => {
      fireEvent.click(botonVerificar);
    });

    expect(mockValidarMiContraseniaAccion).toHaveBeenCalledWith('PassActual123*');
    expect(screen.getByText(/Paso 2: Definir Nueva Contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nueva Contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Nueva Contraseña/i)).toBeInTheDocument();
  });

  it('debe validar los criterios NIST y permitir actualizar la contraseña con el botón "Cambiar contraseña"', async () => {
    mockValidarMiContraseniaAccion.mockResolvedValueOnce({
      exito: true,
      esValida: true,
    });
    mockCambiarMiContraseniaAccion.mockResolvedValueOnce({
      exito: true,
      mensaje: 'Contraseña actualizada con éxito',
    });

    render(<PestaniaSeguridad />);

    // Abrir menú modal
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    });

    // Paso 1
    const inputActual = screen.getByLabelText(/Contraseña Actual/i);
    fireEvent.change(inputActual, { target: { value: 'PassActual123*' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^verificar$/i }));
    });

    // Paso 2
    const inputNueva = screen.getByLabelText(/^Nueva Contraseña/i);
    const inputConfirmar = screen.getByLabelText(/Confirmar Nueva Contraseña/i);

    // Contraseña fuerte NIST: >8 caracteres, mayúscula, minúscula, número, especial
    fireEvent.change(inputNueva, { target: { value: 'Segura#2026!Abc' } });
    fireEvent.change(inputConfirmar, { target: { value: 'Segura#2026!Abc' } });

    // Botón final en el footer del diálogo
    const botonesCambiar = screen.getAllByRole('button', { name: /cambiar contraseña/i });
    const botonConfirmarCambio = botonesCambiar[botonesCambiar.length - 1];
    expect(botonConfirmarCambio).toBeEnabled();

    await act(async () => {
      fireEvent.click(botonConfirmarCambio);
    });

    expect(mockCambiarMiContraseniaAccion).toHaveBeenCalledWith('PassActual123*', 'Segura#2026!Abc');
  });

  it('debe alternar la visibilidad de la contraseña actual con el botón del ojito', async () => {
    render(<PestaniaSeguridad />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    });

    const inputActual = screen.getByLabelText(/Contraseña Actual/i);
    expect(inputActual).toHaveAttribute('type', 'password');

    const botonOjito = screen.getByRole('button', { name: /mostrar clave/i });
    fireEvent.click(botonOjito);
    expect(inputActual).toHaveAttribute('type', 'text');

    fireEvent.click(botonOjito);
    expect(inputActual).toHaveAttribute('type', 'password');
  });

  it('debe mostrar aviso cuando las contraseñas nuevas no coinciden y permitir pegar en confirmar', async () => {
    mockValidarMiContraseniaAccion.mockResolvedValueOnce({
      exito: true,
      esValida: true,
    });

    render(<PestaniaSeguridad />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    });

    const inputActual = screen.getByLabelText(/Contraseña Actual/i);
    fireEvent.change(inputActual, { target: { value: 'PassActual123*' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^verificar$/i }));
    });

    const inputNueva = screen.getByLabelText(/^Nueva Contraseña/i);
    const inputConfirmar = screen.getByLabelText(/Confirmar Nueva Contraseña/i);

    fireEvent.change(inputNueva, { target: { value: 'Segura#2026!Abc' } });
    fireEvent.change(inputConfirmar, { target: { value: 'Diferente#2026!' } });

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();

    // Simular pegar el valor correcto en el campo de confirmación
    fireEvent.change(inputConfirmar, { target: { value: 'Segura#2026!Abc' } });
    expect(screen.queryByText(/las contraseñas no coinciden/i)).not.toBeInTheDocument();
    expect(screen.getByText(/las contraseñas coinciden/i)).toBeInTheDocument();
  });
});
