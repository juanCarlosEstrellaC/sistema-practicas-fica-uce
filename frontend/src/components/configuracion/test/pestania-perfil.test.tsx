import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { PestaniaPerfil } from '../pestania-perfil';
import { UsuarioSesion } from '@/lib/tipos/general';

const mockActualizarUsuario = vi.fn();
const mockActualizarMiPerfilAccion = vi.fn();
const mockSubirMiAvatarAccion = vi.fn();

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
  useAutenticacion: () => ({
    usuario: {
      id: 1,
      correo: 'estudiante.test@uce.edu.ec',
      nombres: 'Juan Carlos',
      apellidos: 'Estrella',
      rol: 'ESTUDIANTE',
      identificacion: '1723456789',
      telefono: '0991234567',
      carreraNombre: 'Sistemas de Información',
    },
    actualizarUsuario: mockActualizarUsuario,
  }),
}));

vi.mock('@/lib/acciones/usuario.acciones', () => ({
  actualizarMiPerfilAccion: (datos: any) => mockActualizarMiPerfilAccion(datos),
  subirMiAvatarAccion: (datos: any) => mockSubirMiAvatarAccion(datos),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PestaniaPerfil (Componente Modular de Perfil)', () => {
  const usuarioPrueba: UsuarioSesion = {
    id: 1,
    correo: 'estudiante.test@uce.edu.ec',
    nombres: 'Juan Carlos',
    apellidos: 'Estrella',
    rol: 'ESTUDIANTE',
    identificacion: '1723456789',
    telefono: '0991234567',
    carreraNombre: 'Sistemas de Información',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar la información personal, nombres, correo y rol', () => {
    render(<PestaniaPerfil usuario={usuarioPrueba} />);

    expect(screen.getByText('Juan Carlos Estrella')).toBeInTheDocument();
    expect(screen.getByText('estudiante.test@uce.edu.ec')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Juan Carlos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Estrella')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1723456789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0991234567')).toBeInTheDocument();
  });

  it('debe permitir modificar el teléfono y llamar al Server Action al guardar cambios', async () => {
    mockActualizarMiPerfilAccion.mockResolvedValueOnce({
      exito: true,
      mensaje: 'Perfil actualizado correctamente',
    });

    render(<PestaniaPerfil usuario={usuarioPrueba} />);

    const inputTelefono = screen.getByDisplayValue('0991234567');
    fireEvent.change(inputTelefono, { target: { value: '0987654321' } });
    expect(screen.getByDisplayValue('0987654321')).toBeInTheDocument();

    const botonGuardar = screen.getByRole('button', { name: /guardar cambios/i });
    await act(async () => {
      fireEvent.click(botonGuardar);
    });

    expect(mockActualizarMiPerfilAccion).toHaveBeenCalledWith({ telefono: '0987654321' });
    expect(mockActualizarUsuario).toHaveBeenCalledWith({ telefono: '0987654321' });
  });

  it('debe permitir seleccionar un archivo de imagen para actualizar la fotografía', () => {
    render(<PestaniaPerfil usuario={usuarioPrueba} />);

    const botonCambiarFoto = screen.getByRole('button', { name: /cambiar fotografía/i });
    expect(botonCambiarFoto).toBeInTheDocument();
  });
});
