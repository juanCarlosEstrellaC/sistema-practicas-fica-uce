import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AvatarUsuario, obtenerInicialesEstandar } from '../avatar-usuario';

describe('AvatarUsuario (Componente Común Estandarizado)', () => {
  describe('obtenerInicialesEstandar', () => {
    it('debe obtener las iniciales del nombre y apellido', () => {
      expect(obtenerInicialesEstandar('Andres', 'Barrera')).toBe('AB');
      expect(obtenerInicialesEstandar('Juan Carlos', 'Estrella Cruz')).toBe('JE');
    });

    it('debe limpiar títulos académicos comunes como Ing, Dr, Lic', () => {
      expect(obtenerInicialesEstandar('Ing. Carlos Ramos')).toBe('CR');
      expect(obtenerInicialesEstandar('Dr. Sandra Mendoza')).toBe('SM');
      expect(obtenerInicialesEstandar('Lic. Elena Morales')).toBe('EM');
      expect(obtenerInicialesEstandar('Msc. Roberto Gomez')).toBe('RG');
    });

    it('debe procesar nombres compuestos en una sola cadena', () => {
      expect(obtenerInicialesEstandar('Juan Carlos Perez Lopez')).toBe('JP');
      expect(obtenerInicialesEstandar('Esteban Vargas')).toBe('EV');
    });

    it('debe devolver U si no se proporciona nombre ni apellido', () => {
      expect(obtenerInicialesEstandar('', '')).toBe('U');
      expect(obtenerInicialesEstandar(null, null)).toBe('U');
    });
  });

  describe('Renderizado de Componente', () => {
    it('debe renderizar el fallback con las iniciales cuando no hay foto', () => {
      render(<AvatarUsuario nombre="Andres" apellido="Barrera" />);
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('debe renderizar con el tamaño solicitado', () => {
      const { container } = render(<AvatarUsuario nombre="Carlos" apellido="Ramos" tamano="lg" />);
      const avatar = container.querySelector('.h-12.w-12');
      expect(avatar).toBeInTheDocument();
    });

    it('debe renderizar correctamente con urlFoto de archivos_subidos', () => {
      const { container } = render(
        <AvatarUsuario
          nombre="Juan"
          apellido="Estrella"
          urlFoto="/archivos_subidos/avatars/1_prueba.png"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
