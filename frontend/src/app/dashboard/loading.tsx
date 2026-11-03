"use client"

import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion'
import { EsqueletoDashboardGeneral } from '@/components/esqueletos/esqueleto-dashboard-general'

export default function LoadingDashboard() {
  const { usuario } = useAutenticacion()

  return <EsqueletoDashboardGeneral rol={usuario?.rol} />
}
