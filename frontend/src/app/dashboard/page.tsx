import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor'
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones'
import { obtenerMetricasDashboardGeneralAccion } from '@/lib/acciones/metricas.acciones'
import { VistaDashboardGeneral } from '@/components/dashboards/vista-dashboard-general'

export const metadata: Metadata = {
  title: 'Panel Principal - Prácticas y Vinculación',
  description: 'Dashboard general unificado de Prácticas Preprofesionales y Vinculación con la Sociedad en la FICA UCE.',
}

interface PaginaDashboardProps {
  searchParams: Promise<{
    periodoId?: string
  }>
}

export default async function PaginaDashboard({ searchParams }: PaginaDashboardProps) {
  const usuario = await obtenerUsuarioServidor()
  if (!usuario) {
    redirect('/')
  }

  const parametros = await searchParams

  // 1. Resolver periodo académico en el servidor
  const { periodoActual, periodoAcademicoId, esInactivo } =
    await resolverPeriodoAcademicoServidor(
      parametros.periodoId,
      '/dashboard'
    )

  // 2. Determinar filtros según el rol del usuario autenticado
  const esSubdecano = usuario.rol === 'SUBDECANO'
  const esTutor = usuario.rol === 'TUTOR_ACADEMICO'
  const esEstudiante = usuario.rol === 'ESTUDIANTE'

  const carreraId = esSubdecano
    ? undefined
    : usuario.carreraId
      ? Number(usuario.carreraId)
      : undefined

  const tutorId = esTutor && usuario.id ? Number(usuario.id) : undefined
  const estudianteId = esEstudiante && usuario.id ? Number(usuario.id) : undefined

  // 3. Obtener métricas reales consolidadas de PP y VCS
  const metricas = await obtenerMetricasDashboardGeneralAccion({
    periodoId: periodoAcademicoId ? Number(periodoAcademicoId) : undefined,
    carreraId,
    tutorId,
    rol: usuario.rol,
    estudianteId,
    identificacionEstudiante: esEstudiante ? usuario.identificacion : undefined,
  })

  return (
    <VistaDashboardGeneral
      metricas={metricas}
      usuario={usuario}
      periodoActual={periodoActual}
      esInactivo={esInactivo}
    />
  )
}
