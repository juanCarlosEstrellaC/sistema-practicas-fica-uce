'use client';

import { Award, Lock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';

interface TarjetaAvalPracticaProps {
  desbloqueado: boolean;
  horasValidadas: number;
  institucion: string;
  urlAval: string;
  nombreAval: string;
  alDescargar: (e: React.MouseEvent) => void;
}

export function TarjetaAvalPractica({
  desbloqueado,
  horasValidadas,
  institucion,
  urlAval,
  nombreAval,
  alDescargar,
}: TarjetaAvalPracticaProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all duration-200',
        desbloqueado
          ? 'bg-card border-border shadow-2xs'
          : 'bg-muted/20 border-dashed border-border/80 text-muted-foreground'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
              desbloqueado ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            {desbloqueado ? <Award className="h-5 w-5" /> : <Lock className="h-5 w-5 opacity-60" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-bold',
                  desbloqueado ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                7. Aval Oficial de Acreditación de Horas Practica Preprofesional
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {desbloqueado
                ? `Subdecanato ha aprobado y emitido oficialmente el Aval de cumplimiento de las ${horasValidadas} horas reglamentarias para esta práctica preprofesional.`
                : 'Se desbloqueará automáticamente una vez que el Coordinador valide el portafolio y el Subdecanato apruebe y emita oficialmente el Aval de cumplimiento.'}
            </p>
          </div>
        </div>

        {/* Botones de acción del Aval */}
        {desbloqueado ? (
          <div className="flex items-center gap-2 shrink-0">
            <BotonPrevisualizarDocumento
              titulo={nombreAval}
              subtitulo="Documento oficial de Prácticas Preprofesionales • Universidad Central del Ecuador"
              url={urlAval}
              nombreArchivo={nombreAval}
              texto="Ver Aval"
            />

            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 shadow-2xs bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={alDescargar}
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            disabled
            variant="outline"
            className="h-8 text-xs gap-1.5 opacity-60 cursor-not-allowed bg-muted/40 shrink-0"
            title="Disponible cuando Subdecanato emita el Aval en Fase de Finalización"
          >
            <Lock className="h-3.5 w-3.5" />
            Bloqueado
          </Button>
        )}
      </div>
    </div>
  );
}
