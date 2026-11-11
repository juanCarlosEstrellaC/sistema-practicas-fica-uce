import { Metadata } from 'next';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';
import { obtenerAsignacionesPracticasAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { obtenerDocumentosPorEstudianteAccion } from '@/lib/acciones/pp/documento-portafolio.acciones';
import { VistaPracticaEstudiante } from '@/components/practicas/estudiante/vista-practica-estudiante';

export const metadata: Metadata = {
  title: 'Mi Práctica Preprofesional',
  description: 'Seguimiento, portafolio de evidencias y estado de las prácticas asignadas.',
};

export default async function PaginaMiPractica() {
  const usuario = await obtenerUsuarioServidor();
  const estudianteId = usuario?.id ? Number(usuario.id) : 0;

  const [resAsignaciones, documentos] = await Promise.all([
    obtenerAsignacionesPracticasAccion({
      estudianteId,
      requiereCarta: true,
      page: 0,
      size: 100,
    }),
    obtenerDocumentosPorEstudianteAccion(estudianteId),
  ]);

  // UNICAMENTE cuando se envie la carta de asignacion ahi el estudiante recien puede ver la asignacion de pp, antes no.
  const asignaciones = (resAsignaciones.content || []).filter(
    (asig) => asig.cartaAsignacionEnviada !== false
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mis Prácticas Preprofesionales
        </h1>
        <p className="text-sm text-muted-foreground">
          Consulte la información de la institución receptora asignada, gestione sus documentos obligatorios y dé seguimiento a sus horas.
        </p>
      </div>

      <VistaPracticaEstudiante
        estudianteId={estudianteId}
        asignaciones={asignaciones}
        documentosIniciales={documentos}
        carreraId={usuario?.carreraId ? Number(usuario.carreraId) : undefined}
      />
    </div>
  );
}
