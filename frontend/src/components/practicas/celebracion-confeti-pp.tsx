'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, GraduationCap, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebracionConfetiPpProps {
  tipo: 'PERIODO' | 'CULMINACION_TOTAL';
  horasAprobadas?: number;
  horasAcumuladas?: number;
  horasRequeridas?: number;
  nombreInstitucion?: string;
  onCerrar?: () => void;
}

export function CelebracionConfetiPp({
  tipo,
  horasAprobadas,
  horasAcumuladas,
  horasRequeridas,
  nombreInstitucion,
  onCerrar,
}: CelebracionConfetiPpProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;

    if (tipo === 'CULMINACION_TOTAL') {
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
      data-testid="banner-celebracion-pp"
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
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-base tracking-tight">
              {esTotal
                ? '¡Felicitaciones! Has completado el requisito de Prácticas Preprofesionales'
                : '¡Horas de Prácticas aprobadas con éxito!'}
            </h4>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {esTotal
              ? `Has acumulado ${horasAcumuladas || horasRequeridas || 240} horas de las ${horasRequeridas || 240} reglamentarias de tu carrera. Tu proceso de Prácticas Preprofesionales ha culminado satisfactoriamente.`
              : `Se han validado ${horasAprobadas || 0} horas en tu práctica${nombreInstitucion ? ` en ${nombreInstitucion}` : ''}. ¡Sigue adelante con tu formación profesional!`}
          </p>
        </div>
      </div>
    </div>
  );
}
