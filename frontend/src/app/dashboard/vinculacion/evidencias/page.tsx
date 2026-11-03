import { Metadata } from 'next';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import {
  obtenerAsignacionesPorEstudianteAccion,
  obtenerEvidenciasPorAsignacionAccion,
} from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { VistaPortafolioEvidencias } from '@/components/vinculacion/estudiante/vista-portafolio-evidencias';

export const metadata: Metadata = {
  title: 'Portafolio de Evidencias - Vinculación con la Sociedad',
  description: 'Gestión y registro de bitácoras, informes y evidencias de proyectos comunitarios.',
};

interface PaginaEvidenciasProps {
  searchParams: Promise<{ asignacionId?: string }>;
}

export default async function PaginaPortafolioEvidencias({ searchParams }: PaginaEvidenciasProps) {
  const usuario = await obtenerUsuarioServidor();
  const estudianteId = usuario?.id ? Number(usuario.id) : 0;
  const params = await searchParams;

  const resAsignaciones = await obtenerAsignacionesPorEstudianteAccion(estudianteId);
  const asignaciones = resAsignaciones.data || [];

  const asignacionActivaId = params.asignacionId
    ? Number(params.asignacionId)
    : asignaciones.length > 0
    ? asignaciones[0].id
    : undefined;

  let evidenciasIniciales: any[] = [];
  if (asignacionActivaId) {
    const resEvidencias = await obtenerEvidenciasPorAsignacionAccion(asignacionActivaId);
    if (resEvidencias.exito && resEvidencias.data) {
      evidenciasIniciales = resEvidencias.data;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Portafolio de Evidencias y Bitácoras
        </h1>
        <p className="text-sm text-muted-foreground">
          Cargue y consulte sus bitácoras de actividades, hoja de control de asistencia e informes de vinculación con la sociedad.
        </p>
      </div>

      <VistaPortafolioEvidencias
        asignaciones={asignaciones}
        evidenciasIniciales={evidenciasIniciales}
        asignacionActivaId={asignacionActivaId}
      />
    </div>
  );
}
