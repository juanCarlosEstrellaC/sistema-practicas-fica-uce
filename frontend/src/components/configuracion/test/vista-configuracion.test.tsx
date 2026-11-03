import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VistaConfiguracion } from '../vista-configuracion';
import { UsuarioSesion } from '@/lib/tipos/general';

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
  useAutenticacion: () => ({
    usuario: {
      id: 1,
      correo: 'estudiante.test@uce.edu.ec',
      nombres: 'Juan Carlos',
      apellidos: 'Estrella',
      rol: 'ESTUDIANTE',
    },
    actualizarUsuario: vi.fn(),
  }),
}));

vi.mock('@/lib/contextos/contexto-tema', () => ({
  useTema: () => ({
    tema: 'sistema',
    setTema: vi.fn(),
  }),
}));

vi.mock('../pestania-perfil', () => ({
  PestaniaPerfil: () => <div data-testid="pestania-perfil">Contenido Perfil</div>,
}));

vi.mock('../pestania-seguridad', () => ({
  PestaniaSeguridad: () => <div data-testid="pestania-seguridad">Contenido Seguridad</div>,
}));

vi.mock('../pestania-apariencia', () => ({
  PestaniaApariencia: () => <div data-testid="pestania-apariencia">Contenido Apariencia</div>,
}));

describe('VistaConfiguracion (Contenedor Modular de Configuración)', () => {
  const usuarioEstudiante: UsuarioSesion = {
    id: 1,
    correo: 'estudiante.test@uce.edu.ec',
    nombres: 'Juan Carlos',
    apellidos: 'Estrella',
    rol: 'ESTUDIANTE',
    identificacion: '1723456789',
    telefono: '0991234567',
  };

  const usuarioSubdecano: UsuarioSesion = {
    id: 2,
    correo: 'subdecano.test@uce.edu.ec',
    nombres: 'Ana',
    apellidos: 'Viteri',
    rol: 'SUBDECANO',
    identificacion: '1712345678',
  };

  it('debe renderizar el título de la página y las pestañas Perfil, Seguridad y Apariencia para estudiante', () => {
    render(<VistaConfiguracion usuario={usuarioEstudiante} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Configuración' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /seguridad/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /apariencia/i })).toBeInTheDocument();
  });

  it('debe renderizar las 3 pestañas principales para roles administrativos (SUBDECANO)', () => {
    render(<VistaConfiguracion usuario={usuarioSubdecano} />);

    expect(screen.getByRole('tab', { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /seguridad/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /apariencia/i })).toBeInTheDocument();
  });

  it('debe renderizar la pestaña de Perfil por defecto', () => {
    render(<VistaConfiguracion usuario={usuarioEstudiante} />);

    expect(screen.getByTestId('pestania-perfil')).toBeInTheDocument();
  });

  it('no debe renderizar el botón de volver', () => {
    render(<VistaConfiguracion usuario={usuarioEstudiante} />);

    expect(screen.queryByRole('button', { name: /volver/i })).not.toBeInTheDocument();
  });
});
