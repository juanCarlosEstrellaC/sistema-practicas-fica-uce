import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor'
import {
  obtenerUsuariosPaginadosAccion,
  obtenerEstadisticasUsuariosAccion,
} from '@/lib/acciones/usuario.acciones'
import { obtenerCarrerasAccion } from '@/lib/acciones/carrera.acciones'
import { GestorIngresoDatos } from '@/components/dashboards/gestor-ingreso-datos'

export const metadata: Metadata = {
  title: 'Administración del Sistema - Ingreso de Datos Maestros',
  description: 'Gestión global y parametrización de usuarios, carreras y periodos académicos en la FICA UCE.',
}

export default async function PaginaIngresoDatos() {
  const usuario = await obtenerUsuarioServidor()
  if (!usuario) {
    redirect('/')
  }

  // El ingreso y parametrización de datos maestros es exclusivo de la máxima autoridad de facultad (Subdecano)
  if (usuario.rol !== 'SUBDECANO') {
    redirect('/dashboard')
  }

  const [usuariosIniciales, estadisticasUsuarios, carrerasIniciales] =
    await Promise.all([
      obtenerUsuariosPaginadosAccion({ pagina: 0, tamanio: 10, estado: 'ACTIVO' }),
      obtenerEstadisticasUsuariosAccion(),
      obtenerCarrerasAccion(0, 100),
    ])

  return (
    <div className="space-y-6">
      <GestorIngresoDatos
        rol={usuario.rol}
        usuarioId={String(usuario.id)}
        usuariosIniciales={usuariosIniciales}
        estadisticasUsuariosIniciales={estadisticasUsuarios}
        carrerasIniciales={carrerasIniciales.content || []}
      />
    </div>
  )
}
