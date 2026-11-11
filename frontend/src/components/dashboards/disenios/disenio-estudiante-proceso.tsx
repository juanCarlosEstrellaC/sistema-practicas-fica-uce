"use client"

import React from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { type ResumenEstudianteDashboardDto } from '@/lib/acciones/metricas.acciones'
import { cn } from '@/lib/utils'

interface PropiedadesDisenioEstudianteProceso {
  datosEstudiante: ResumenEstudianteDashboardDto
}

export function DisenioEstudianteProceso({ datosEstudiante }: PropiedadesDisenioEstudianteProceso) {
  // Cálculos de Prácticas
  const horasPracticaComp = datosEstudiante.horasPracticaCompletadas || 0
  const horasPracticaAsig = datosEstudiante.horasPracticaAsignadas || 240
  const horasPracticaFaltantes = Math.max(0, horasPracticaAsig - horasPracticaComp)
  const pctPractica = Math.min(100, Math.round((horasPracticaComp / (horasPracticaAsig || 1)) * 100))

  // Cálculos de Vinculación
  const horasVinculacionComp = datosEstudiante.horasVinculacionCompletadas || 0
  const horasVinculacionAsig = datosEstudiante.horasVinculacionAsignadas || 160
  const horasVinculacionFaltantes = Math.max(0, horasVinculacionAsig - horasVinculacionComp)
  const pctVinculacion = Math.min(100, Math.round((horasVinculacionComp / (horasVinculacionAsig || 1)) * 100))

  // Totales consolidados de ambos procesos
  const totalHorasRequeridas = horasPracticaAsig + horasVinculacionAsig
  const totalHorasCompletadas = horasPracticaComp + horasVinculacionComp
  const totalHorasFaltantes = Math.max(0, totalHorasRequeridas - totalHorasCompletadas)
  const pctGlobal = Math.min(100, Math.round((totalHorasCompletadas / (totalHorasRequeridas || 1)) * 100))

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. TIRA HORIZONTAL DE KPIS CONSOLIDADOS DEL ESTUDIANTE */}
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-border/60">
          {/* 1. Avance Prácticas Preprofesionales */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <Briefcase className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Avance Prácticas Preprofesionales</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {pctPractica}%
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{horasPracticaComp}h</span> de {horasPracticaAsig}h requeridas
            </p>
          </div>

          {/* 2. Horas Validadas de Prácticas */}
          <div className="space-y-1 md:pl-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Horas Validadas de Prácticas</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400">
              {horasPracticaComp}h
            </p>
            <p className="text-xs text-muted-foreground">
              {horasPracticaFaltantes === 0
                ? '¡Requisitos 100% cumplidos!'
                : `${horasPracticaFaltantes}h pendientes de ${horasPracticaAsig}h`}
            </p>
          </div>

          {/* 3. Avance Vinculación con la Sociedad */}
          <div className="space-y-1 md:pl-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Avance Vinculación con la Sociedad</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {pctVinculacion}%
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{horasVinculacionComp}h</span> de {horasVinculacionAsig}h requeridas
            </p>
          </div>

          {/* 4. Horas Validadas de Vinculación */}
          <div className="space-y-1 md:pl-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Horas Validadas de Vinculación</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {horasVinculacionComp}h
            </p>
            <p className="text-xs text-muted-foreground">
              {horasVinculacionFaltantes === 0
                ? '¡Requisitos 100% cumplidos!'
                : `${horasVinculacionFaltantes}h pendientes de ${horasVinculacionAsig}h`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. DOS PANELES MAESTROS EN SPLIT (Prácticas y Vinculación) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PANEL DE PRÁCTICAS PREPROFESIONALES */}
        <div className="rounded-2xl border border-sky-500/20 bg-card p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Prácticas Preprofesionales</h2>
                  <p className="text-xs text-muted-foreground">
                    {datosEstudiante.institucionPractica || 'Sin institución asignada'}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:bg-sky-500/10">
                <Link href="/dashboard/practicas/mi-practica">
                  <span>Ver Mi Práctica</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {/* Barra de Progreso y Balance de Horas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">
                  {horasPracticaComp} / {horasPracticaAsig} Horas Validadas
                </span>
                <span className="text-sky-600 dark:text-sky-400">{pctPractica}%</span>
              </div>
              <Progress value={pctPractica} className="h-2.5" />
              <p className="text-xs text-muted-foreground">
                {horasPracticaFaltantes > 0 ? (
                  <>
                    Te faltan <strong className="text-foreground">{horasPracticaFaltantes} horas</strong> para completar tu requisito de prácticas.
                  </>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ¡Has completado las {horasPracticaAsig} horas de prácticas requeridas!
                  </span>
                )}
              </p>
            </div>

          </div>

          {/* Pie del Panel */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Fase actual: <strong className="text-foreground">{datosEstudiante.fasePractica || 'No iniciada'}</strong></span>
          </div>
        </div>

        {/* PANEL DE VINCULACIÓN CON LA SOCIEDAD */}
        <div className="rounded-2xl border border-emerald-500/20 bg-card p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Vinculación con la Sociedad</h2>
                  <p className="text-xs text-muted-foreground">
                    {datosEstudiante.proyectoVinculacion || 'Sin proyecto comunitario asignado'}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10">
                <Link href="/dashboard/vinculacion/mi-proyecto">
                  <span>Ver Mi Proyecto</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {/* Barra de Progreso y Balance de Horas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">
                  {horasVinculacionComp} / {horasVinculacionAsig} Horas Validadas
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">{pctVinculacion}%</span>
              </div>
              <Progress value={pctVinculacion} className="h-2.5" />
              <p className="text-xs text-muted-foreground">
                {horasVinculacionFaltantes > 0 ? (
                  <>
                    Te faltan <strong className="text-foreground">{horasVinculacionFaltantes} horas</strong> comunitarias para completar tu requisito.
                  </>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ¡Has cumplido con las {horasVinculacionAsig} horas comunitarias de vinculación!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Pie del Panel */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Fase actual: <strong className="text-foreground">{datosEstudiante.faseVinculacion || 'No iniciada'}</strong></span>
          </div>
        </div>
      </div>


    </div>
  )
}
