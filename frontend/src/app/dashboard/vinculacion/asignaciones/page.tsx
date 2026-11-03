import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BannerPeriodoInactivo } from '@/components/banner-periodo-inactivo';
import { AsignadorMasivoProyectos } from '@/components/vinculacion/asignador-masivo-proyectos';
import {
    obtenerEstudiantesDisponiblesAccion,
    obtenerProyectosDisponiblesAccion,
} from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { resolverPeriodoAcademicoServidor } from '@/lib/acciones/periodo-academico.acciones';
import { obtenerUsuarioServidor } from '@/lib/acciones/cliente-servidor';

export const metadata: Metadata = {
    title: 'Asignación de Proyectos Comunitarios - Vinculación',
    description: 'Asignación masiva de estudiantes a proyectos comunitarios de vinculación.',
};

interface PaginaAsignacionesVinculacionProps {
    searchParams: Promise<{ periodoId?: string }>;
}

export default async function PaginaAsignacionesVinculacion({ searchParams }: PaginaAsignacionesVinculacionProps) {
    const usuario = await obtenerUsuarioServidor();
    if (!usuario) {
        redirect('/autenticacion/iniciar-sesion');
    }

    if (usuario.rol === 'ESTUDIANTE') {
        redirect('/dashboard/vinculacion/mi-proyecto');
    }

    if (usuario.rol !== 'COORDINADOR_PRACTICAS') {
        redirect('/dashboard/vinculacion/asignaciones-existentes');
    }

    const parametros = await searchParams;
    const carreraId = usuario.carreraId ? Number(usuario.carreraId) : undefined;

    // 1. Obtener periodo académico resuelto
    const { periodoActual, periodoAcademicoId, esInactivo } = await resolverPeriodoAcademicoServidor(
        parametros.periodoId,
        '/dashboard/vinculacion/asignaciones'
    );

    // 2. Traer datos reales solo cuando el periodo está activo
    const [estudiantes, proyectos] = !esInactivo && periodoAcademicoId
        ? await Promise.all([
            obtenerEstudiantesDisponiblesAccion(carreraId as number, periodoAcademicoId),
            obtenerProyectosDisponiblesAccion(carreraId as number, periodoAcademicoId),
        ])
        : [[], []];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Asignación a Proyectos Comunitarios
                </h1>
                <p className="text-sm text-muted-foreground">
                    Seleccione los estudiantes disponibles y el proyecto comunitario al que serán asignados.
                </p>
            </div>

            {esInactivo ? (
                <BannerPeriodoInactivo
                    nombrePeriodo={periodoActual?.nombre}
                    mensaje="El periodo académico seleccionado se encuentra inactivo. Por tanto, este módulo es de solo lectura y no se pueden realizar nuevas asignaciones de proyectos comunitarios."
                />
            ) : (
                <AsignadorMasivoProyectos
                    estudiantes={estudiantes}
                    proyectosComunitarios={proyectos}
                    periodoAcademicoId={periodoAcademicoId as number}
                    carreraId={carreraId as number}
                />
            )}
        </div>
    );
}
