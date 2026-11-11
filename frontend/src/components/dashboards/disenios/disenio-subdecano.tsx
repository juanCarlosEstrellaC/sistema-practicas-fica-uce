"use client"

import React from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Users,
  Building2,
  CalendarDays,
  Briefcase,
  UserCheck,
  UserX,
  Activity,
  CheckCircle2,
  FolderGit2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { TarjetaMetricaWireframe } from './tarjeta-metrica-wireframe'
import { type MetricasDashboardGeneralDto } from '@/lib/acciones/metricas.acciones'

interface PropiedadesDisenioSubdecano {
  metricas: MetricasDashboardGeneralDto
}

export function DisenioSubdecano({ metricas }: PropiedadesDisenioSubdecano) {
  const datosPp = metricas.pp
  const datosVcs = metricas.vcs
  const datosSub = metricas.subdecano

  // Métricas superiores
  const totalEstudiantes = datosPp.totalEstudiantes || 0
  const totalTutores = datosPp.totalTutores || 0
  const totalCarreras = datosSub?.totalCarreras || (datosSub?.desgloseCarreras?.length ?? 5)
  const totalPeriodos = datosSub?.totalPeriodos || 2

  // Métricas Prácticas
  const ppConAsignacion = datosPp.estudiantesAsignados || 0
  const ppSinAsignacion = Math.max(0, totalEstudiantes - ppConAsignacion)
  const ppEnDesarrollo = datosPp.estudiantesEnCurso || 0
  const ppFinalizados = datosPp.estudiantesCompletados || 0
  const ppConveniosActivos = datosPp.totalConvenios || 0

  // Métricas Vinculación
  const vcsTotalProyectos = datosVcs.totalProyectos || 0
  const vcsEnDesarrollo = datosVcs.proyectosEnDesarrollo || 0
  const vcsFinalizados = datosVcs.proyectosFinalizados || 0
  const vcsEstudiantesParticipando = datosVcs.totalAsignaciones || 0
  const vcsProyectosActivos = datosVcs.proyectosActivos || 0

  const desgloseCarreras = datosSub?.desgloseCarreras || []

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TARJETAS GLOBALES SUPERIORES (4 columnas con iconos y colores) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <TarjetaMetricaWireframe
          valor={totalEstudiantes}
          etiqueta="Total Estudiantes"
          descripcion="Población estudiantil total de la facultad"
          icono={GraduationCap}
          varianteColor="cielo"
          href="/dashboard/practicas/estudiantes"
        />
        <TarjetaMetricaWireframe
          valor={totalTutores}
          etiqueta="Tutores Académicos"
          descripcion="Docentes designados para supervisión"
          icono={Users}
          varianteColor="morado"
          href="/dashboard/practicas/tutores"
        />
        <TarjetaMetricaWireframe
          valor={totalCarreras}
          etiqueta="Carreras"
          descripcion="Oferta académica activa en la FICA"
          icono={Building2}
          varianteColor="verde"
          href="/dashboard/administracion/ingreso-datos"
        />
        <TarjetaMetricaWireframe
          valor={totalPeriodos}
          etiqueta="Periodos académicos"
          descripcion="Ciclos académicos registrados"
          icono={CalendarDays}
          varianteColor="ambar"
          href="/dashboard/administracion/ingreso-datos"
        />
      </div>

      {/* 2. PANEL DE PRÁCTICAS PREPROFESIONALES */}
      <div className="rounded-3xl border border-sky-500/20 bg-card p-4 sm:p-6 space-y-5 shadow-xs">
        {/* Cabecera del Panel con Icono y Subtítulo */}
        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Prácticas Preprofesionales
            </h2>
            <p className="text-xs text-muted-foreground">
              Seguimiento institucional de pasantías, empresas y validación de horas.
            </p>
          </div>
        </div>

        {/* Fila de 4 tarjetas con iconos temáticos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <TarjetaMetricaWireframe
            valor={ppConAsignacion}
            etiqueta="Estudiantes con Asignación"
            descripcion="Con entidad y plan de aprendizaje"
            icono={UserCheck}
            varianteColor="cielo"
            href="/dashboard/practicas/estudiantes"
          />
          <TarjetaMetricaWireframe
            valor={ppSinAsignacion}
            etiqueta="Sin Asignación"
            descripcion="Pendientes de asignar entidad"
            icono={UserX}
            varianteColor="ambar"
            href="/dashboard/practicas/estudiantes"
          />
          <TarjetaMetricaWireframe
            valor={ppEnDesarrollo}
            etiqueta="Desarrollo"
            descripcion="En ejecución de horas activas"
            icono={Activity}
            varianteColor="verde"
            href="/dashboard/practicas/estudiantes"
          />
          <TarjetaMetricaWireframe
            valor={ppFinalizados}
            etiqueta="Finalizados"
            descripcion="Horas y portafolio 100% completados"
            icono={CheckCircle2}
            varianteColor="azul"
            href="/dashboard/practicas/estudiantes"
          />
        </div>

        {/* Barra de Convenios Activos */}
        <div className="p-3 rounded-2xl bg-sky-500/5 border border-sky-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-muted-foreground">Convenios Activos:</span>
            <strong className="text-foreground font-bold">{ppConveniosActivos}</strong>
            <span className="text-xs text-muted-foreground hidden md:inline">
              · Entidades receptoras públicas y privadas vigentes
            </span>
          </div>
          <Link
            href="/dashboard/practicas/convenios"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:underline"
          >
            <span>Ver Catálogo de Convenios</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tabla de desglose de Prácticas por Carreras */}
        {desgloseCarreras.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              Desglose Comparativo por Carreras (PP):
            </span>
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 scrollbar-none">
              <table className="w-full text-xs text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4 w-1/3">Indicador</th>
                    {desgloseCarreras.map((c) => (
                      <th key={c.carreraId} className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-background border border-border/60 font-semibold text-foreground">
                          {c.carreraNombre}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-foreground font-medium">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground font-semibold">Estudiantes Totales:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-bold text-foreground">
                        {c.ppTotalEstudiantes}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Estudiantes sin Asignación:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-amber-600 dark:text-amber-400">
                        {c.ppSinAsignacion}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Estudiantes en Desarrollo:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-sky-600 dark:text-sky-400">
                        {c.ppEnDesarrollo}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Estudiantes Finalizados:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-blue-600 dark:text-blue-400">
                        {c.ppFinalizados}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Convenios Activos:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-foreground">
                        {c.ppConveniosActivos}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. PANEL DE VINCULACIÓN CON LA SOCIEDAD */}
      <div className="rounded-3xl border border-emerald-500/20 bg-card p-4 sm:p-6 space-y-5 shadow-xs">
        {/* Cabecera del Panel con Icono y Subtítulo */}
        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Vinculación con la Sociedad
            </h2>
            <p className="text-xs text-muted-foreground">
              Proyectos comunitarios, impacto social y horas de servicio comunitario.
            </p>
          </div>
        </div>

        {/* Fila de 4 tarjetas con iconos temáticos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <TarjetaMetricaWireframe
            valor={vcsTotalProyectos}
            etiqueta="Proyectos"
            descripcion="Proyectos comunitarios registrados"
            icono={FolderGit2}
            varianteColor="verde"
            href="/dashboard/vinculacion/proyectos-comunitarios"
          />
          <TarjetaMetricaWireframe
            valor={vcsEnDesarrollo}
            etiqueta="Desarrollo"
            descripcion="En ejecución de campo activa"
            icono={Activity}
            varianteColor="cielo"
            href="/dashboard/vinculacion/proyectos-comunitarios"
          />
          <TarjetaMetricaWireframe
            valor={vcsFinalizados}
            etiqueta="Finalizados"
            descripcion="Culminados con informe validado"
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

        {/* Barra de Proyectos Activos */}
        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <FolderGit2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-muted-foreground">Proyectos Activos:</span>
            <strong className="text-foreground font-bold">{vcsProyectosActivos}</strong>
            <span className="text-xs text-muted-foreground hidden md:inline">
              · Líneas de acción comunitaria vigentes
            </span>
          </div>
          <Link
            href="/dashboard/vinculacion/proyectos-comunitarios"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline"
          >
            <span>Ver Catálogo de Proyectos</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tabla de desglose de Vinculación por Carreras */}
        {desgloseCarreras.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              Desglose Comparativo por Carreras (VCS):
            </span>
            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/20 scrollbar-none">
              <table className="w-full text-xs text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4 w-1/3">Indicador</th>
                    {desgloseCarreras.map((c) => (
                      <th key={c.carreraId} className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-background border border-border/60 font-semibold text-foreground">
                          {c.carreraNombre}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-foreground font-medium">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground font-semibold">Proyectos Actuales:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-bold text-foreground">
                        {c.vcsProyectosActuales}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Proyectos en Desarrollo:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-sky-600 dark:text-sky-400">
                        {c.vcsProyectosEnDesarrollo}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Proyectos Finalizados:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-blue-600 dark:text-blue-400">
                        {c.vcsProyectosFinalizados}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Estudiantes participando:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-purple-600 dark:text-purple-400">
                        {c.vcsEstudiantesParticipando}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground">Proyectos Activos:</td>
                    {desgloseCarreras.map((c) => (
                      <td key={c.carreraId} className="py-2.5 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400">
                        {c.vcsProyectosActivos}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
