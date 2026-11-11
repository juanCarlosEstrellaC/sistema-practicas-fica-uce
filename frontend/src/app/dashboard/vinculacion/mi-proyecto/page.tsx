import { Metadata } from 'next';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { obtenerPeriodosAcademicosAccion } from '@/lib/acciones/periodo-academico.acciones';
import {
  obtenerAsignacionesPorEstudianteAccion,
  obtenerEvidenciasPorAsignacionAccion,
} from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { VistaProyectoEstudiante } from '@/components/vinculacion/estudiante/vista-proyecto-estudiante';
import { EvidenciaVcs } from '@/lib/tipos/vcs/evidencia-vcs';

export const metadata: Metadata = {
  title: 'Mis Proyectos Comunitarios - Vinculación con la Sociedad',
  description: 'Seguimiento, portafolio de evidencias y estado de proyectos comunitarios asignados.',
};

export default async function PaginaMiProyectoComunitario() {
  const usuario = await obtenerUsuarioServidor();
  const estudianteId = usuario?.id ? Number(usuario.id) : 0;

  const [resAsignaciones, resPeriodos] = await Promise.all([
    obtenerAsignacionesPorEstudianteAccion(estudianteId),
    obtenerPeriodosAcademicosAccion(),
  ]);
  const asignaciones = resAsignaciones.data || [];
  const periodos = resPeriodos.content || [];
  const periodosInactivosIds = periodos
    .filter((p) => p.estado === 'INACTIVO')
    .map((p) => Number(p.id));

  const evidenciasInicialesPorAsignacion: Record<number, EvidenciaVcs[]> = {};
  await Promise.all(
    asignaciones.map(async (asig) => {
      try {
        const res = await obtenerEvidenciasPorAsignacionAccion(asig.id);
        if (res.exito && res.data) {
          evidenciasInicialesPorAsignacion[asig.id] = res.data;
        }
      } catch (e) {
        console.error(`Error obteniendo evidencias en SSR para asignacion ${asig.id}:`, e);
      }
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mis Proyectos Comunitarios
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulte la información de sus proyectos asignados, cargue las evidencias de su portafolio y descargue sus certificados oficiales de horas.
        </p>
      </div>

      <VistaProyectoEstudiante
        asignaciones={asignaciones}
        evidenciasInicialesPorAsignacion={evidenciasInicialesPorAsignacion}
        periodosInactivosIds={periodosInactivosIds}
      />
    </div>
  );
}
