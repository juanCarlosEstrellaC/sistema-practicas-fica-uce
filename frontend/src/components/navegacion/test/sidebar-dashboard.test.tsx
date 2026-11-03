import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SidebarDashboard } from '@/components/navegacion/sidebar-dashboard';
import { Usuario } from '@/lib/tipos/general';

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

describe('SidebarDashboard - Rediseño estilo Mailtrap', () => {
  const usuarioDirector: Usuario = {
    id: '1',
    nombre: 'Director Ejemplo',
    correo: 'director@uce.edu.ec',
    rol: 'DIRECTOR_CARRERA',
    carreraId: '1',
  };

  const usuarioSubdecano: Usuario = {
    id: '2',
    nombre: 'Subdecano Ejemplo',
    correo: 'subdecano@uce.edu.ec',
    rol: 'SUBDECANO',
  };

  it('debe contener las rutas dedicadas de Asignar Prácticas y Tutores Académicos sin ?tab= para COORDINADOR_PRACTICAS', () => {
    const usuarioCpp: Usuario = {
      id: '3',
      nombre: 'Coordinador Ejemplo',
      correo: 'coordinador@uce.edu.ec',
      rol: 'COORDINADOR_PRACTICAS',
      carreraId: '1',
    };

    render(
      <SidebarDashboard
        colapsado={false}
        alCambiarColapsado={vi.fn()}
        usuario={usuarioCpp}
        tema="claro"
        alAlternarTema={vi.fn()}
        alCambiarRol={vi.fn()}
        alRestablecerSimulacion={vi.fn()}
        alCerrarSesion={vi.fn()}
      />
    );

    const enlaceAsignaciones = screen.getByRole('link', { name: /asignar prácticas/i });
    expect(enlaceAsignaciones).toBeInTheDocument();
    expect(enlaceAsignaciones).toHaveAttribute('href', '/dashboard/practicas/asignaciones');

    const enlacesTutores = screen.getAllByRole('link', { name: /tutores académicos/i });
    expect(enlacesTutores).toHaveLength(2);
    expect(enlacesTutores[0]).toHaveAttribute('href', '/dashboard/practicas/tutores');
    expect(enlacesTutores[1]).toHaveAttribute('href', '/dashboard/vinculacion/tutores');
  });

  it('debe permitir fijar y desfijar mediante el botón Pin', () => {
    const mockCambiarColapsado = vi.fn();
    render(
      <SidebarDashboard
        colapsado={false}
        alCambiarColapsado={mockCambiarColapsado}
        usuario={usuarioSubdecano}
        tema="claro"
        alAlternarTema={vi.fn()}
        alCambiarRol={vi.fn()}
        alRestablecerSimulacion={vi.fn()}
        alCerrarSesion={vi.fn()}
      />
    );

    const botonPin = screen.getByTitle('Desfijar menú lateral');
    expect(botonPin).toBeInTheDocument();
    fireEvent.click(botonPin);
    expect(mockCambiarColapsado).toHaveBeenCalledWith(true);
  });

  it('debe renderizar los enlaces con aria-label en modo colapsado para accesibilidad y soporte de tooltip', () => {
    render(
      <SidebarDashboard
        colapsado={true}
        alCambiarColapsado={vi.fn()}
        usuario={usuarioSubdecano}
        tema="claro"
        alAlternarTema={vi.fn()}
        alCambiarRol={vi.fn()}
        alRestablecerSimulacion={vi.fn()}
        alCerrarSesion={vi.fn()}
      />
    );

    // En modo colapsado, los enlaces tienen aria-label con el nombre de la ruta
    expect(screen.getAllByRole('link', { name: /dashboard general/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /prácticas asignadas/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /gestión de convenios/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ingreso de datos/i })[0]).toBeInTheDocument();
  });

  it('debe contener los submenús de Tutores Académicos en PP y VCS para SUBDECANO y COORDINADOR_PRACTICAS', () => {
    const usuarioCpp: Usuario = {
      id: '3',
      nombre: 'Coordinador Ejemplo',
      correo: 'coordinador@uce.edu.ec',
      rol: 'COORDINADOR_PRACTICAS',
      carreraId: '1',
    };

    const { rerender } = render(
      <SidebarDashboard
        colapsado={false}
        alCambiarColapsado={vi.fn()}
        usuario={usuarioSubdecano}
        tema="claro"
        alAlternarTema={vi.fn()}
        alCambiarRol={vi.fn()}
        alRestablecerSimulacion={vi.fn()}
        alCerrarSesion={vi.fn()}
      />
    );

    let enlacesTutores = screen.getAllByRole('link', { name: /tutores académicos/i });
    expect(enlacesTutores).toHaveLength(2);
    expect(enlacesTutores[0]).toHaveAttribute('href', '/dashboard/practicas/tutores');
    expect(enlacesTutores[1]).toHaveAttribute('href', '/dashboard/vinculacion/tutores');

    rerender(
      <SidebarDashboard
        colapsado={false}
        alCambiarColapsado={vi.fn()}
        usuario={usuarioCpp}
        tema="claro"
        alAlternarTema={vi.fn()}
        alCambiarRol={vi.fn()}
        alRestablecerSimulacion={vi.fn()}
        alCerrarSesion={vi.fn()}
      />
    );

    enlacesTutores = screen.getAllByRole('link', { name: /tutores académicos/i });
    expect(enlacesTutores).toHaveLength(2);
    expect(enlacesTutores[0]).toHaveAttribute('href', '/dashboard/practicas/tutores');
    expect(enlacesTutores[1]).toHaveAttribute('href', '/dashboard/vinculacion/tutores');
  });
});
