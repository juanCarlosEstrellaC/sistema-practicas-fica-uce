"use client"

import { cn } from '@/lib/utils'
import { FaseActualAsignacion } from '@/lib/tipos/vcs/asignacion-proyecto'
import { CheckCircle2 } from 'lucide-react'

interface PropsBarraProgresoVcs {
  faseActual: FaseActualAsignacion
  finalizado?: boolean
  clasePersonalizada?: string
}

const fases: { clave: FaseActualAsignacion; nombre: string }[] = [
  { clave: 'ASIGNACION', nombre: '1. Asignación' },
  { clave: 'DESARROLLO', nombre: '2. Desarrollo' },
  { clave: 'FINALIZACION', nombre: '3. Finalización' },
]

export function BarraProgresoVcs({ faseActual, finalizado, clasePersonalizada }: PropsBarraProgresoVcs) {
  const indiceActual = finalizado ? fases.length : fases.findIndex((f) => f.clave === faseActual)

  return (
    <div className={cn("relative w-full py-3", clasePersonalizada)}>
      {/* Línea de fondo */}
      <div className="absolute top-[28px] left-[16.66%] right-[16.66%] h-1 bg-border -translate-y-1/2 z-0 rounded-full" />

      {/* Línea de progreso coloreada */}
      <div
        className="absolute top-[28px] left-[16.66%] h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]"
        style={{
          width: `${
            finalizado
              ? 66.66
              : indiceActual > 0
              ? (indiceActual / (fases.length - 1)) * 66.66
              : 0
          }%`,
        }}
      />

      {/* Círculos e indicadores de fase */}
      <div className="flex justify-between items-start relative z-10">
        {fases.map((fase, indice) => {
          const completado = finalizado || indice < indiceActual
          const actual = !finalizado && indice === indiceActual

          return (
            <div key={fase.clave} className="flex flex-col items-center w-1/3">
              {/* Indicador circular */}
              <div className="h-8 flex items-center justify-center mb-2">
                {completado ? (
                  <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center relative">
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
                  "text-xs text-center transition-colors px-1 max-w-[120px]",
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
          )
        })}
      </div>
    </div>
  )
}
