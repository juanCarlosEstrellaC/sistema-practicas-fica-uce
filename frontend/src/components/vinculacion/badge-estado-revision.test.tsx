import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BadgeEstadoRevision } from './badge-estado-revision';

describe('BadgeEstadoRevision (Componente UI)', () => {
    it('debe renderizar la insignia de estado PENDIENTE correctamente', () => {
        render(<BadgeEstadoRevision estado="PENDIENTE" />);
        expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('debe renderizar la insignia de estado APROBADO correctamente', () => {
        render(<BadgeEstadoRevision estado="APROBADO" />);
        expect(screen.getByText('Aprobado')).toBeInTheDocument();
    });

    it('debe renderizar la insignia de estado OBSERVADO correctamente', () => {
        render(<BadgeEstadoRevision estado="OBSERVADO" />);
        expect(screen.getByText('Observado')).toBeInTheDocument();
    });

    it('no debe renderizar nada si el estado es nulo o indefinido', () => {
        const { container } = render(<BadgeEstadoRevision estado={null} />);
        expect(container.firstChild).toBeNull();
    });
});
