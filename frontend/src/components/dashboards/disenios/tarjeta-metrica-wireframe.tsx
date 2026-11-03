"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VarianteColorTarjeta = 'cielo' | 'verde' | 'ambar' | 'morado' | 'azul' | 'neutral'

interface PropiedadesTarjetaMetricaWireframe {
  valor: number | string
  etiqueta: string
  descripcion?: string
  icono?: React.ElementType
  varianteColor?: VarianteColorTarjeta
  href?: string
  className?: string
  colorValor?: string
}

const ESTILOS_COLOR: Record<
  VarianteColorTarjeta,
  {
    iconoBg: string
    hoverBorde: string
    valorHover: string
    gradienteFondo: string
  }
> = {
  cielo: {
    iconoBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    hoverBorde: 'hover:border-sky-500/40 hover:shadow-sky-500/5',
    valorHover: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
    gradienteFondo: 'from-sky-500/5 to-transparent',
  },
  verde: {
    iconoBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    hoverBorde: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
    valorHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    gradienteFondo: 'from-emerald-500/5 to-transparent',
  },
  ambar: {
    iconoBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hoverBorde: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
    valorHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    gradienteFondo: 'from-amber-500/5 to-transparent',
  },
  morado: {
    iconoBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    hoverBorde: 'hover:border-purple-500/40 hover:shadow-purple-500/5',
    valorHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    gradienteFondo: 'from-purple-500/5 to-transparent',
  },
  azul: {
    iconoBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    hoverBorde: 'hover:border-blue-500/40 hover:shadow-blue-500/5',
    valorHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    gradienteFondo: 'from-blue-500/5 to-transparent',
  },
  neutral: {
    iconoBg: 'bg-muted text-muted-foreground border-border/70',
    hoverBorde: 'hover:border-primary/40',
    valorHover: 'group-hover:text-primary',
    gradienteFondo: 'from-muted/20 to-transparent',
  },
}

export function TarjetaMetricaWireframe({
  valor,
  etiqueta,
  descripcion,
  icono: Icono,
  varianteColor = 'neutral',
  href,
  className,
  colorValor,
}: PropiedadesTarjetaMetricaWireframe) {
  const estilos = ESTILOS_COLOR[varianteColor]

  const contenido = (
    <div
      title={`${etiqueta}: ${valor}${descripcion ? ` (${descripcion})` : ''}`}
      className={cn(
        'group relative rounded-2xl border border-border/80 bg-gradient-to-br bg-card p-3.5 sm:p-4 flex items-center gap-3 sm:gap-3.5 transition-all duration-200 shadow-xs min-w-0 select-none overflow-hidden h-full',
        estilos.gradienteFondo,
        href && [
          'cursor-pointer active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md',
          estilos.hoverBorde,
        ],
        className
      )}
    >
      {/* Icono a la izquierda */}
      {Icono && (
        <div
          className={cn(
            'p-2.5 sm:p-3 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs',
            estilos.iconoBg
          )}
        >
          <Icono className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
        </div>
      )}

      {/* Contenido a la derecha: Número arriba, etiqueta abajo legible, descripción */}
      <div className="flex flex-col justify-center min-w-0 flex-1 space-y-0.5">
        <span
          className={cn(
            'text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-none transition-colors',
            estilos.valorHover,
            colorValor
          )}
        >
          {valor}
        </span>
        <span className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2 break-words">
          {etiqueta}
        </span>
        {descripcion && (
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug line-clamp-2 mt-0.5 break-words">
            {descripcion}
          </p>
        )}
      </div>

      {/* Flecha sutil en la esquina superior derecha */}
      {href && (
        <div className="absolute top-2.5 right-2.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:text-foreground transition-all">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block min-w-0 h-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        {contenido}
      </Link>
    )
  }

  return contenido
}
