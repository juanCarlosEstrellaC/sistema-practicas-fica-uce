import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeEstadoPractica } from '../badge-estado-practica';
import { BadgeFasePractica } from '../badge-fase-practica';
import { BadgeEstadoConvenio } from '../badge-estado-convenio';

describe('Badges de Practicas Preprofesionales (UI)', () => {
  it('BadgeEstadoPractica debe renderizar correctamente los estados', () => {
    const { rerender } = render(<BadgeEstadoPractica estado="EN_CURSO" />);
    expect(screen.getByText('En Curso')).toBeDefined();

    rerender(<BadgeEstadoPractica estado="APROBADO" />);
    const badgeAprobado = screen.getByText('Aprobado');
    expect(badgeAprobado).toBeDefined();
    expect(badgeAprobado).toHaveClass('bg-emerald-500/10', 'text-emerald-600');

    rerender(<BadgeEstadoPractica estado="COMPLETADO" />);
    expect(screen.getByText('Completado')).toBeDefined();

    rerender(<BadgeEstadoPractica estado="CANCELADO" />);
    expect(screen.getByText('Cancelado')).toBeDefined();
  });

  it('BadgeFasePractica debe renderizar las distintas fases', () => {
    const { rerender } = render(<BadgeFasePractica fase="ASIGNACION" />);
    expect(screen.getByText(/asignaci[oó]n/i)).toBeDefined();

    rerender(<BadgeFasePractica fase="DESARROLLO" />);
    expect(screen.getByText(/desarrollo/i)).toBeDefined();

    rerender(<BadgeFasePractica fase="FINALIZACION" />);
    expect(screen.getByText(/finalizaci[oó]n/i)).toBeDefined();
  });

  it('BadgeEstadoConvenio debe renderizar estados de convenios', () => {
    const { rerender } = render(<BadgeEstadoConvenio estado="ACTIVO" />);
    expect(screen.getByText('Activo')).toBeDefined();

    rerender(<BadgeEstadoConvenio estado="POR_EXPIRAR" />);
    expect(screen.getByText('Por Expirar')).toBeDefined();

    rerender(<BadgeEstadoConvenio estado="EXPIRADO" />);
    expect(screen.getByText('Expirado')).toBeDefined();
  });
});
