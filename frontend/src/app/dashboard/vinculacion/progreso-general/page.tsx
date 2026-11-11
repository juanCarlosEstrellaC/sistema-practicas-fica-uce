import { Metadata } from 'next';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { obtenerAsignacionesPorEstudianteAccion } from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import { obtenerCarreraPorIdAccion } from '@/lib/acciones/carrera.acciones';
import { VistaProgresoGeneralVcs } from '@/components/vinculacion/estudiante/vista-progreso-general-vcs';

export const metadata: Metadata = {
  title: 'Progreso General - Vinculación con la Sociedad',
  description: 'Resumen global del avance de horas reglamentarias e historial de proyectos comunitarios.',
};

export default async function PaginaProgresoGeneralVcs() {
  const usuario = await obtenerUsuarioServidor();
  const estudianteId = usuario?.id ? Number(usuario.id) : 0;
  const carreraId = usuario?.carreraId ? Number(usuario.carreraId) : undefined;

  const [resAsignaciones, carrera] = await Promise.all([
    obtenerAsignacionesPorEstudianteAccion(estudianteId),
    carreraId ? obtenerCarreraPorIdAccion(carreraId) : Promise.resolve(null),
  ]);
  const asignaciones = resAsignaciones.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Progreso General en Vinculación con la Sociedad
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulte el acumulado total de horas reglamentarias, el estado de sus proyectos comunitarios y sus certificados de acreditación.
        </p>
      </div>

      <VistaProgresoGeneralVcs
        asignaciones={asignaciones}
        horasRequeridasCarrera={carrera?.horasProyectosComunitarios || 160}
      />
    </div>
  );
}
