import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FiltrosConvenios } from '../filtros-convenios';

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'busqueda' ? '' : null),
    toString: () => '',
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard/practicas/convenios',
}));

describe('FiltrosConvenios (Componente Modular UI)', () => {
  it('debe renderizar el input de búsqueda y el selector de estados', () => {
    render(<FiltrosConvenios />);

    expect(screen.getByPlaceholderText('Buscar por institución o responsable...')).toBeInTheDocument();
    expect(screen.getByText('Todos los estados')).toBeInTheDocument();
  });
});
