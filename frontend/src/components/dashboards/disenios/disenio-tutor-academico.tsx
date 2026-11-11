"use client"

import React from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  Building2,
  UserCheck,
  Activity,
  CheckCircle2,
  FolderGit2,
  ArrowUpRight,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { TarjetaMetricaWireframe } from './tarjeta-metrica-wireframe'
import { type MetricasDashboardGeneralDto } from '@/lib/acciones/metricas.acciones'

interface PropiedadesDisenioTutorAcademico {
  metricas: MetricasDashboardGeneralDto
}

export function DisenioTutorAcademico({ metricas }: PropiedadesDisenioTutorAcademico) {
  const datosPp = metricas.pp
  const datosVcs = metricas.vcs

  // Métricas Prácticas de este tutor
  const ppAsignados = datosPp.estudiantesAsignados || 0
  const ppEnDesarrollo = datosPp.estudiantesEnCurso || 0
  const ppFinalizados = datosPp.estudiantesCompletados || 0
  const ppConveniosActivos = datosPp.totalConvenios || 0

  // Porcentaje de culminación en Prácticas (base: estudiantes asignados al tutor)
  const baseEstudiantesPp = ppAsignados > 0 ? ppAsignados : (ppFinalizados + ppEnDesarrollo)
  const pctPp = baseEstudiantesPp > 0
    ? Math.min(100, Math.round((ppFinalizados / baseEstudiantesPp) * 100))
    : 0

  // Métricas Vinculación de este tutor
  const vcsProyectosAsignados = datosVcs.totalProyectos || 0
  const vcsEnDesarrollo = datosVcs.proyectosEnDesarrollo || 0
  const vcsFinalizados = datosVcs.proyectosFinalizados || 0
  const vcsEstudiantesParticipando = datosVcs.totalAsignaciones || 0
  const vcsProyectosActivos = datosVcs.proyectosActivos || 0

  // Porcentaje de proyectos finalizados en Vinculación (base: proyectos asignados al tutor)
  const baseProyectosVcs = vcsProyectosAsignados > 0
    ? vcsProyectosAsignados
    : (vcsFinalizados + vcsEnDesarrollo)
  const pctVcs = baseProyectosVcs > 0
    ? Math.min(100, Math.round((vcsFinalizados / baseProyectosVcs) * 100))
    : 0

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. DISPOSICIÓN HORIZONTAL ARMONIOSA EN 2 PANELES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* PANEL DE PRÁCTICAS PREPROFESIONALES */}
        <div className="rounded-3xl border border-sky-500/20 bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs">
          <div className="space-y-3">
            {/* Cabecera del Panel */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-border/60">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                  Prácticas Preprofesionales
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  Tutorías de pasantías y validación de horas.
                </p>
              </div>
            </div>

            {/* Barra de progreso de culminación de estudiantes */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Estudiantes finalizados: {ppFinalizados} de {baseEstudiantesPp}
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">{pctPp}%</span>
              </div>
              <Progress
                value={pctPp}
                className="h-2 bg-sky-500/10 [&>[data-slot=progress-indicator]]:bg-sky-500"
              />
            </div>

            {/* Cuadrícula de 3 tarjetas equilibrada con el panel contiguo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="sm:col-span-2">
                <TarjetaMetricaWireframe
                  valor={ppAsignados}
                  etiqueta="Estudiantes Asignados"
                  descripcion="Población de pasantes bajo su tutoría académica directa"
                  icono={UserCheck}
                  varianteColor="cielo"
                  href="/dashboard/practicas/estudiantes"
                />
              </div>
              <TarjetaMetricaWireframe
                valor={ppEnDesarrollo}
                etiqueta="Desarrollo"
                descripcion="En ejecución de horas reglamentarias"
                icono={Activity}
                varianteColor="verde"
                href="/dashboard/practicas/estudiantes"
              />
              <TarjetaMetricaWireframe
                valor={ppFinalizados}
                etiqueta="Finalizados"
                descripcion="100% horas y requisitos acreditados"
                icono={CheckCircle2}
                varianteColor="azul"
                href="/dashboard/practicas/estudiantes"
              />
            </div>
          </div>

          {/* Barra inferior de Convenios Activos */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-sky-500/5 border border-sky-500/15 flex items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-muted-foreground truncate">Convenios Activos:</span>
              <strong className="text-foreground font-bold">{ppConveniosActivos}</strong>
            </div>
            <Link
              href="/dashboard/practicas/convenios"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:underline shrink-0"
            >
              <span>Consultar</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* PANEL DE VINCULACIÓN CON LA SOCIEDAD */}
        <div className="rounded-3xl border border-emerald-500/20 bg-card p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xs">
          <div className="space-y-3">
            {/* Cabecera del Panel */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-border/60">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                  Vinculación con la Sociedad
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  Proyectos comunitarios bajo su supervisión.
                </p>
              </div>
            </div>

            {/* Barra de progreso de proyectos finalizados */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Proyectos finalizados: {vcsFinalizados} de {baseProyectosVcs}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pctVcs}%</span>
              </div>
              <Progress
                value={pctVcs}
                className="h-2 bg-emerald-500/10 [&>[data-slot=progress-indicator]]:bg-emerald-500"
              />
            </div>

            {/* Cuadrícula 2x2 de tarjetas para máxima legibilidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <TarjetaMetricaWireframe
                valor={vcsProyectosAsignados}
                etiqueta="Proyectos Asignados"
                descripcion="En su coordinación"
                icono={FolderGit2}
                varianteColor="verde"
                href="/dashboard/vinculacion/proyectos-comunitarios"
              />
              <TarjetaMetricaWireframe
                valor={vcsEnDesarrollo}
                etiqueta="Desarrollo"
                descripcion="En campo activo"
                icono={Activity}
                varianteColor="cielo"
                href="/dashboard/vinculacion/proyectos-comunitarios"
              />
              <TarjetaMetricaWireframe
                valor={vcsFinalizados}
                etiqueta="Finalizados"
                descripcion="Informe validado"
                icono={CheckCircle2}
                varianteColor="azul"
                href="/dashboard/vinculacion/proyectos-comunitarios"
              />
              <TarjetaMetricaWireframe
                valor={vcsEstudiantesParticipando}
                etiqueta="Estudiantes participando"
                descripcion="Asignados a proyectos comunitarios"
                icono={Users}
                varianteColor="morado"
                href="/dashboard/vinculacion/asignaciones-existentes"
              />
            </div>
          </div>

          {/* Barra inferior de Proyectos Activos */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <FolderGit2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-muted-foreground truncate">Proyectos Activos:</span>
              <strong className="text-foreground font-bold">{vcsProyectosActivos}</strong>
            </div>
            <Link
              href="/dashboard/vinculacion/proyectos-comunitarios"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline shrink-0"
            >
              <span>Consultar</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
