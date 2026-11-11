'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebracionConfetiVcsProps {
    tipo: 'PERIODO' | 'CULMINACION_TOTAL';
    horasAprobadas?: number;
    horasAcumuladas?: number;
    horasRequeridas?: number;
    nombreProyecto?: string;
    onCerrar?: () => void;
}

export function CelebracionConfetiVcs({
    tipo,
    horasAprobadas,
    horasAcumuladas,
    horasRequeridas,
    nombreProyecto,
    onCerrar,
}: CelebracionConfetiVcsProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!visible) return;

        if (tipo === 'CULMINACION_TOTAL') {
            // Partículas con paleta institucional sobria (Azul institucional UCE, esmeralda, dorado mate, plata)
            const duracion = 3 * 1000;
            const fin = Date.now() + duracion;

            const intervalo: any = setInterval(() => {
                const tiempoRestante = fin - Date.now();
                if (tiempoRestante <= 0) {
                    return clearInterval(intervalo);
                }

                const particleCount = 40 * (tiempoRestante / duracion);
                confetti({
                    particleCount,
                    startVelocity: 28,
                    spread: 360,
                    origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() - 0.2 },
                    colors: ['#0B2F64', '#0284C7', '#059669', '#D97706', '#64748B'],
                });
            }, 300);

            return () => clearInterval(intervalo);
        } else {
            // Disparo sobrio por aprobación de periodo
            confetti({
                particleCount: 75,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#0B2F64', '#059669', '#0284C7'],
            });
        }
    }, [tipo, visible]);

    if (!visible) return null;

    const manejarCerrar = () => {
        setVisible(false);
        if (onCerrar) onCerrar();
    };

    const esTotal = tipo === 'CULMINACION_TOTAL';

    return (
        <div
            data-testid="banner-celebracion-vcs"
            className={`relative overflow-hidden rounded-xl p-5 border shadow-sm transition-all duration-300 ${
                esTotal
                    ? 'bg-gradient-to-r from-primary/10 via-card to-background border-primary/30 text-foreground'
                    : 'bg-gradient-to-r from-emerald-500/10 via-card to-background border-emerald-600/30 text-foreground'
            }`}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={manejarCerrar}
                className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
            >
                <X className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-4">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                        esTotal
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-emerald-600 text-white dark:bg-emerald-500'
                    }`}
                >
                    {esTotal ? <GraduationCap className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                </div>

                <div className="space-y-1.5 pr-6">
                    <h3 className="text-base font-bold tracking-tight text-foreground">
                        {esTotal
                            ? '¡Felicitaciones! Has completado el requisito de Vinculación con la Sociedad'
                            : 'Acreditación Oficial de Horas Comunitarias'}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {esTotal ? (
                            <span>
                                Ha completado satisfactoriamente el total reglamentario de horas requeridas (
                                <strong className="font-semibold text-foreground">{horasAcumuladas}</strong> de{' '}
                                <strong className="font-semibold text-foreground">{horasRequeridas} horas</strong>) en la Facultad de Ingeniería y Ciencias Aplicadas - Universidad Central del Ecuador.
                            </span>
                        ) : (
                            <span>
                                El Subdecanato ha validado y acreditado{' '}
                                <strong className="font-semibold text-foreground">{horasAprobadas ?? 0} horas</strong> en el proyecto{' '}
                                <strong className="font-semibold text-foreground">{nombreProyecto || 'Comunitario'}</strong>.
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

