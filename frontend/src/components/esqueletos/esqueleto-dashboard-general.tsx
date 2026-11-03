import React from 'react'
import { type RolUsuario } from '@/lib/tipos/general'
import { EsqueletoDashboardSubdecano } from './esqueleto-dashboard-subdecano'
import { EsqueletoDashboardDirectorCoordinador } from './esqueleto-dashboard-director-coordinador'
import { EsqueletoDashboardTutor } from './esqueleto-dashboard-tutor'
import { EsqueletoDashboardEstudiante } from './esqueleto-dashboard-estudiante'

export interface EsqueletoDashboardGeneralProps {
  rol?: RolUsuario | string | null
  mostrarCabecera?: boolean
}

/**
 * Orquestador y despachador reactivo de esqueletos de carga para el Dashboard Principal:
 * Despacha de forma exacta el esqueleto del perfil institucional solicitado:
 * - ESTUDIANTE -> EsqueletoDashboardEstudiante
 * - TUTOR_ACADEMICO -> EsqueletoDashboardTutor
 * - DIRECTOR_CARRERA / COORDINADOR_PRACTICAS -> EsqueletoDashboardDirectorCoordinador
 * - SUBDECANO (o general por omisión) -> EsqueletoDashboardSubdecano
 */
export function EsqueletoDashboardGeneral({
  rol,
  mostrarCabecera = true,
}: EsqueletoDashboardGeneralProps) {
  switch (rol) {
    case 'ESTUDIANTE':
      return <EsqueletoDashboardEstudiante mostrarCabecera={mostrarCabecera} />
    case 'TUTOR_ACADEMICO':
      return <EsqueletoDashboardTutor mostrarCabecera={mostrarCabecera} />
    case 'DIRECTOR_CARRERA':
    case 'COORDINADOR_PRACTICAS':
      return <EsqueletoDashboardDirectorCoordinador mostrarCabecera={mostrarCabecera} />
    case 'SUBDECANO':
    default:
      return <EsqueletoDashboardSubdecano mostrarCabecera={mostrarCabecera} />
  }
}
