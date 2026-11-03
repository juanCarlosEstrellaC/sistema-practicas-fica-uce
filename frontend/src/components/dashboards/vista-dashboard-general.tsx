"use client"

import React from 'react'
import { type Usuario, type UsuarioSesion } from '@/lib/tipos/general'
import { type MetricasDashboardGeneralDto } from '@/lib/acciones/metricas.acciones'
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo'
import { DisenioEstudianteProceso } from './disenios/disenio-estudiante-proceso'
import { DisenioSubdecano } from './disenios/disenio-subdecano'
import { DisenioDirectorCoordinador } from './disenios/disenio-director-coordinador'
import { DisenioTutorAcademico } from './disenios/disenio-tutor-academico'

interface VistaDashboardGeneralProps {
  metricas: MetricasDashboardGeneralDto
  usuario: Usuario | UsuarioSesion
  periodoActual?: {
    id: number | string
    nombre: string
    estado?: string
  } | null
  esInactivo?: boolean
}

export function VistaDashboardGeneral({
  metricas,
  usuario,
  periodoActual,
  esInactivo = false,
}: VistaDashboardGeneralProps) {
  const primerNombre =
    'nombres' in usuario && usuario.nombres
      ? usuario.nombres
      : 'nombre' in usuario && usuario.nombre
        ? usuario.nombre
        : ''
  const apellidos = usuario.apellidos || ''
  const nombreUsuario = `${primerNombre} ${apellidos}`.trim() || 'Usuario'

  const rol = usuario.rol
  const esEstudiante = rol === 'ESTUDIANTE'
  const datosEstudiante = metricas.estudiante

  return (
    <div className="space-y-6 pb-8">
      {/* Banner de periodo inactivo */}
      {esInactivo && (
        <BannerPeriodoInactivo nombrePeriodo={periodoActual?.nombre} />
      )}

      {/* Encabezado Principal de Bienvenida */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {rol.replace(/_/g, ' ')}
          </span>
          {periodoActual && (
            <span className="text-xs text-muted-foreground font-medium">
              • Periodo Académico: <strong className="text-foreground">{periodoActual.nombre}</strong>
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bienvenido/a, {nombreUsuario}
        </h1>
        <p className="text-sm text-muted-foreground">
          Panel general de seguimiento a Prácticas Preprofesionales y Vinculación con la Sociedad.
        </p>
      </div>

      {/* VISTA SEGÚN EL ROL AUTENTICADO */}
      {esEstudiante && datosEstudiante && (
        <DisenioEstudianteProceso datosEstudiante={datosEstudiante} />
      )}

      {rol === 'SUBDECANO' && (
        <DisenioSubdecano metricas={metricas} />
      )}

      {rol === 'DIRECTOR_CARRERA' && (
        <DisenioDirectorCoordinador tituloRol="Director" metricas={metricas} />
      )}

      {rol === 'COORDINADOR_PRACTICAS' && (
        <DisenioDirectorCoordinador tituloRol="Coordinador" metricas={metricas} />
      )}

      {rol === 'TUTOR_ACADEMICO' && (
        <DisenioTutorAcademico metricas={metricas} />
      )}
    </div>
  )
}
