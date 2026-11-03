"use client";

import { cn } from "@/lib/utils";
import { FaseActualPractica } from "@/lib/tipos/pp/general-pp";
import { CheckCircle2 } from "lucide-react";

interface PropsBarraProgresoPp {
  faseActual?: FaseActualPractica | string;
  finalizado?: boolean;
  clasePersonalizada?: string;
}

const fases: { clave: FaseActualPractica; nombre: string }[] = [
  { clave: "CONVOCATORIA", nombre: "1. Convocatoria" },
  { clave: "ASIGNACION", nombre: "2. Asignación" },
  { clave: "DESARROLLO", nombre: "3. Desarrollo" },
  { clave: "FINALIZACION", nombre: "4. Finalización" },
];

export function BarraProgresoPp({
  faseActual = "ASIGNACION",
  finalizado,
  clasePersonalizada,
}: PropsBarraProgresoPp) {
  const totalFases = fases.length;
  const maxIndice = totalFases - 1;

  const indiceActual = finalizado
    ? totalFases
    : fases.findIndex((f) => f.clave === faseActual);

  const indiceSeguro = indiceActual >= 0 ? indiceActual : 1;

  // El factor nunca supera 1 para evitar que la barra sobrepase el último nodo (75% del ancho total)
  const factorProgreso = finalizado
    ? 1
    : indiceSeguro > 0
    ? Math.min(indiceSeguro / maxIndice, 1)
    : 0;

  const porcentajeProgreso = factorProgreso * 75;

  return (
    <div className={cn("relative w-full py-3 px-1 overflow-hidden", clasePersonalizada)}>
      {/* Linea de fondo */}
      <div className="absolute top-[28px] left-[12.5%] right-[12.5%] h-1 bg-border -translate-y-1/2 z-0 rounded-full" />

      {/* Linea de progreso coloreada */}
      <div
        className="absolute top-[28px] left-[12.5%] h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]"
        style={{
          width: `${porcentajeProgreso}%`,
          maxWidth: '75%',
        }}
      />

      {/* Circulos e indicadores de fase */}
      <div className="flex justify-between items-start relative z-10 w-full">
        {fases.map((fase, indice) => {
          const completado = finalizado || indice < indiceSeguro;
          const actual = !finalizado && indice === indiceSeguro;

          return (
            <div key={fase.clave} className="flex flex-col items-center w-1/4 min-w-0 px-0.5">
              {/* Indicador circular */}
              <div className="h-8 flex items-center justify-center mb-2">
                {completado ? (
                  <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center relative shadow-2xs">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-background" />
                  </div>
                ) : actual ? (
                  <div className="w-7 h-7 rounded-full border-2 border-primary bg-background flex items-center justify-center relative shadow-[0_0_12px_rgba(var(--primary),0.4)]">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-muted-foreground/30 bg-background flex items-center justify-center relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Etiqueta de la fase */}
              <span
                className={cn(
                  "text-[11px] sm:text-xs text-center transition-colors px-0.5 break-words line-clamp-2 w-full",
                  actual
                    ? "text-primary font-bold"
                    : completado
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {fase.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
