"use client"

import { cn } from '@/lib/utils'
import { obtenerEtiquetaFaseDePractica } from '@/lib/utilidades/etiquetas'
import { type FaseActualPractica } from '@/lib/tipos/pp/general-pp'
import { CheckCircle2, Circle } from 'lucide-react'

interface PropsBarraProgreso {
  faseActual: FaseActualPractica
  finalizado?: boolean
  etiquetaFase?: string
}

const fases: FaseActualPractica[] = ['CONVOCATORIA', 'ASIGNACION', 'DESARROLLO', 'FINALIZACION']

export function BarraProgreso({ faseActual, finalizado, etiquetaFase }: PropsBarraProgreso) {
  const indiceActual = finalizado ? fases.length : fases.indexOf(faseActual)

  return (
    <div className={cn("relative w-full py-2", etiquetaFase)}>
      {/* Línea de fondo */}
      <div className="absolute top-[22px] left-[12.5%] right-[12.5%] h-0.5 bg-border -translate-y-1/2 z-0" />

      {/* Línea de progreso */}
      <div
        className="absolute top-[22px] left-[12.5%] h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
        style={{
          width: `${finalizado ? 75 : (indiceActual > 0 ? (indiceActual / (fases.length - 1)) * 75 : 0)}%`
        }}
      />
      {/* Circulos de progreso */}
      <div className="flex justify-between items-start relative z-10">
        {fases.map((fase, indice) => {
          const completado = indice < indiceActual
          const actual = indice === indiceActual
          const proximo = indice > indiceActual

          return (
            <div key={fase} className="flex flex-col items-center w-1/4">
              {/* Indicador de progreso */}
              <div className="h-7 flex items-center justify-center mb-2">
                {completado ? (
                  <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center relative">
                    <CheckCircle2 className="w-6 h-6 text-green-500 fill-background" />
                  </div>
                ) : actual ? (
                  <div className="w-6 h-6 rounded-full border-2 border-primary bg-background flex items-center justify-center relative shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary " />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-background flex items-center justify-center relative">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/10" />
                  </div>
                )}
              </div>

              {/* Texto */}
              <span
                className={cn(
                  "text-xs text-center transition-colors px-1 max-w-[80px]",
                  actual ? "text-primary font-bold" :
                    completado ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {obtenerEtiquetaFaseDePractica(fase)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
