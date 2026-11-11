import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CelebracionConfetiVcs } from './celebracion-confeti-vcs';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('CelebracionConfetiVcs (Componente UI)', () => {
    it('debe renderizar la celebración de aprobación por periodo', () => {
        render(
            <CelebracionConfetiVcs
                tipo="PERIODO"
                horasAprobadas={80}
                horasAcumuladas={80}
                horasRequeridas={160}
                nombreProyecto="Alfabetización Digital"
            />
        );

        expect(screen.getByText(/Acreditación Oficial de Horas Comunitarias/i)).toBeInTheDocument();
        expect(screen.getAllByText(/80/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Alfabetización Digital/i)).toBeInTheDocument();
    });

    it('debe renderizar la culminación total con mensaje especial y trofeo', () => {
        render(
            <CelebracionConfetiVcs
                tipo="CULMINACION_TOTAL"
                horasAprobadas={80}
                horasAcumuladas={160}
                horasRequeridas={160}
                nombreProyecto="Alfabetización Digital"
            />
        );

        expect(screen.getByText(/¡Felicitaciones! Has completado el requisito de Vinculación con la Sociedad/i)).toBeInTheDocument();
        expect(screen.getAllByText(/160/i).length).toBeGreaterThan(0);
    });

    it('debe cerrarse cuando el usuario presiona el botón de cerrar', () => {
        const onCerrarMock = vi.fn();
        render(
            <CelebracionConfetiVcs
                tipo="PERIODO"
                horasAprobadas={80}
                onCerrar={onCerrarMock}
            />
        );

        const botonCerrar = screen.getByRole('button');
        fireEvent.click(botonCerrar);

        expect(onCerrarMock).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('banner-celebracion-vcs')).not.toBeInTheDocument();
    });
});
