'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { BarraProgresoVcs } from '@/components/vinculacion/barra-progreso-vcs';
import { AlertaEstadoProcesoVcs } from '@/components/vinculacion/alerta-estado-proceso-vcs';
import { PortafolioVcs } from '@/components/vinculacion/portafolio/portafolio-vcs';
import { ModalEvidenciasVcs } from '@/components/vinculacion/modal-evidencias-vcs';
import { ModalAprobarHorasSubdecano } from '@/components/vinculacion/modal-aprobar-horas-subdecano';
import { AsignacionProyectoComunitarioDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import {
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FolderGit2,
  UserCheck,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ModalDetalleEstudianteVcsProps {
  abierto: boolean;
  alCerrar: () => void;
  asignacion: AsignacionProyectoComunitarioDto | null;
  rol?: 'SUBDECANO' | 'DIRECTOR_CARRERA' | 'COORDINADOR_PRACTICAS' | 'TUTOR_ACADEMICO' | string;
  esInactivo?: boolean;
}

function normalizarRol(rol?: string): string {
  if (!rol) return '';
  const limpio = rol.trim().toUpperCase();
  if (limpio === 'CPP' || limpio === 'COORDINADOR') return 'COORDINADOR_PRACTICAS';
  if (limpio === 'TA' || limpio === 'TUTOR') return 'TUTOR_ACADEMICO';
  if (limpio === 'DC' || limpio === 'DIRECTOR') return 'DIRECTOR_CARRERA';
  if (limpio === 'SUB' || limpio === 'SUBDECANATO') return 'SUBDECANO';
  return limpio;
}

export function ModalDetalleEstudianteVcs({
  abierto,
  alCerrar,
  asignacion,
  rol = 'DIRECTOR_CARRERA',
  esInactivo = false,
}: ModalDetalleEstudianteVcsProps) {
  const router = useRouter();
  const [modalEvidenciasAbierto, setModalEvidenciasAbierto] = useState(false);
  const [modalAprobarHorasAbierto, setModalAprobarHorasAbierto] = useState(false);
  const [versionPortafolio, setVersionPortafolio] = useState(0);
  const [asignacionLocal, setAsignacionLocal] = useState<AsignacionProyectoComunitarioDto | null>(
    asignacion
  );

  useEffect(() => {
    if (!abierto) return;
    setAsignacionLocal(asignacion);
  }, [abierto, asignacion]);

  if (!asignacion) return null;

  const asignacionActual = asignacionLocal || asignacion;
  const nombreEstudiante = asignacionActual.nombreCompletoEstudiante || 'Estudiante';
  const correoEstudiante = asignacionActual.correoEstudiante || 'Sin correo';
  const carreraOIdentificacion =
    asignacionActual.nombreCarrera || asignacionActual.identificacionEstudiante || '';
  const asignacionId = asignacionActual.id;

  const rolNormalizado = normalizarRol(rol);
  const esSubdecano = rolNormalizado === 'SUBDECANO';
  const esTutor = rolNormalizado === 'TUTOR_ACADEMICO';
  const estaEnCurso = asignacionActual.estado === 'EN_CURSO';

  const tieneAccionesTutor =
    esTutor &&
    !esInactivo &&
    estaEnCurso &&
    (asignacionActual.faseActual === 'DESARROLLO' ||
      (asignacionActual.faseActual === 'FINALIZACION' && !asignacionActual.documentosValidados));

  const tieneAccionesSubdecano =
    esSubdecano &&
    !esInactivo &&
    estaEnCurso &&
    Boolean(asignacionActual.documentosValidados);

  const alActualizar = () => {
    setVersionPortafolio((v) => v + 1);
    router.refresh();
  };

  return (
    <>
      <Dialog open={abierto} onOpenChange={(ab) => !ab && alCerrar()}>
        <DialogContent className="w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl h-[88vh] max-h-[820px] flex flex-col p-4 sm:p-5 gap-0 overflow-hidden">
          <DialogHeader className="pr-8 pb-3 shrink-0">
            <DialogTitle className="text-xl font-bold">
              Información de Vinculación con la Sociedad
            </DialogTitle>
          </DialogHeader>

          {esInactivo && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg flex items-center gap-2.5 text-xs sm:text-sm mt-3 shrink-0">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                El periodo académico se encuentra inactivo. Los datos se presentan en modo de solo lectura.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3.5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden items-stretch">
            {/* Columna Izquierda: Información del estudiante y acciones por rol */}
            <div className="min-w-0 lg:col-span-5 space-y-3.5 shrink-0 overflow-y-auto pr-0.5">
              {/* Encabezado del Estudiante */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                <AvatarUsuario
                  nombre={nombreEstudiante}
                  urlFoto={asignacionActual.urlAvatar}
                  tamano="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground truncate max-w-full">
                      {nombreEstudiante}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{correoEstudiante}</p>
                  <p className="text-xs font-medium text-foreground/80 mt-0.5 truncate">
                    {carreraOIdentificacion}
                  </p>
                </div>
              </div>


              {/* Barra de Progreso de Fases */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider">
                  Fase del Proceso
                </p>
                <BarraProgresoVcs
                  faseActual={asignacionActual.faseActual}
                  finalizado={asignacionActual.estado === 'APROBADO'}
                />
              </div>

              {/* Alerta Informativa de Estado del Proceso */}
              <AlertaEstadoProcesoVcs
                fase={asignacionActual.faseActual}
                estado={asignacionActual.estado}
                documentosValidados={asignacionActual.documentosValidados}
                rol={rolNormalizado}
              />

              {/* Acciones para Tutor Académico */}
              {tieneAccionesTutor && (
                <div className="p-3.5 border rounded-xl bg-card space-y-2.5">
                  <p className="text-xs font-bold text-foreground tracking-wide">Acciones</p>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setModalEvidenciasAbierto(true)}
                  >
                    <FileCheck2 className="w-4 h-4 mr-2" />
                    Validar Documentos del Portafolio
                  </Button>
                </div>
              )}

              {/* Acciones para Subdecano */}
              {tieneAccionesSubdecano && (
                <div className="p-3.5 border rounded-xl bg-card space-y-2">
                  <p className="text-xs font-bold text-foreground tracking-wide">Acciones</p>
                  <Button
                    type="button"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setModalAprobarHorasAbierto(true)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Previsualizar y Emitir Certificado de Horas
                  </Button>
                </div>
              )}
            </div>

            {/* Columna Derecha: Portafolio del Estudiante (Único contenedor scrolleable) */}
            <div className="min-w-0 lg:col-span-7 border rounded-xl p-3 bg-muted/10 flex flex-col min-h-[350px] lg:min-h-0 lg:h-full overflow-hidden">
              <PortafolioVcs
                key={versionPortafolio}
                asignacionId={asignacionId}
                asignacion={asignacionActual}
                etapaActual={asignacionActual.faseActual}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submodales Desacoplados */}
      {asignacionId && (
        <>
          <ModalEvidenciasVcs
            abierto={modalEvidenciasAbierto}
            abrirModal={setModalEvidenciasAbierto}
            asignacion={asignacionActual}
            alActualizar={(actualizada) => {
              if (actualizada) {
                setAsignacionLocal(actualizada);
              }
              alActualizar();
            }}
          />

          <ModalAprobarHorasSubdecano
            abierto={modalAprobarHorasAbierto}
            abrirModal={setModalAprobarHorasAbierto}
            asignacion={asignacionActual}
            alAprobar={(resultado) => {
              if (resultado) {
                setAsignacionLocal({
                  ...asignacionActual,
                  estado: resultado.estadoAsignacion,
                  faseActual: resultado.faseActual,
                  horasCompletadas: resultado.horasAprobadas,
                });
              }
              alActualizar();
            }}
          />
        </>
      )}
    </>
  );
}
