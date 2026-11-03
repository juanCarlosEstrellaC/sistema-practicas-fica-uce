'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { BarraProgresoPp } from '@/components/practicas/barra-progreso-pp';
import { BadgeEstadoPractica } from '@/components/practicas/badges/badge-estado-practica';
import { BadgeFasePractica } from '@/components/practicas/badges/badge-fase-practica';
import { ModalEmitirCartaCpp } from './modal-emitir-carta-cpp';
import { ModalGenerarAvalSubdecano } from './modal-generar-aval-subdecano';
import { ModalValidacionDocumentos } from './modal-validacion-documentos';
import { AccionesTutorAcademico } from './acciones-tutor-academico';
import { AlertaEstadoProceso } from './alerta-estado-proceso';
import { Portafolio } from '@/components/practicas/portafolio/portafolio';
import { AsignacionPracticaDetalleDto } from '@/lib/tipos/pp/general-pp';
import { FileText, CheckCircle2, AlertCircle, Building, User, Clock, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { reenviarCartaAsignacionAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';

export interface ModalDetalleEstudianteProps {
  abierto: boolean;
  alCerrar: () => void;
  asignacion: AsignacionPracticaDetalleDto | any | null;
  rol?: 'SUBDECANO' | 'DIRECTOR_CARRERA' | 'COORDINADOR_PRACTICAS' | 'TUTOR_ACADEMICO' | string;
  esInactivo?: boolean;
}

function normalizarRol(rol?: string): string {
  if (!rol) return '';
  const limpio = rol.trim().toUpperCase();
  if (limpio === 'CPP' || limpio === 'COORDINADOR') return 'COORDINADOR_PRACTICAS';
  if (limpio === 'TA' || limpio === 'TUTOR') return 'TUTOR_ACADEMICO';
  if (limpio === 'DC' || limpio === 'DIRECTOR') return 'DIRECTOR_CARRERA';
  if (limpio === 'SUBDECANATO') return 'SUBDECANO';
  return limpio;
}

export function ModalDetalleEstudiante({ abierto, alCerrar, asignacion, rol = 'DIRECTOR_CARRERA', esInactivo = false, }: ModalDetalleEstudianteProps) {
  const router = useRouter();
  const [modalCartaAbierto, setModalCartaAbierto] = useState(false);
  const [modalAvalAbierto, setModalAvalAbierto] = useState(false);
  const [modalValidacionPortafolioAbierto, setModalValidacionPortafolioAbierto] = useState(false);
  const [estaReenviandoCarta, setEstaReenviandoCarta] = useState(false);
  const [versionPortafolio, setVersionPortafolio] = useState(0)
  const [asignacionLocal, setAsignacionLocal] = useState(asignacion);

  useEffect(() => {
    if (!abierto) return;
    setAsignacionLocal(asignacion);
  }, [abierto, asignacion]);

  if (!asignacion) return null;

  const asignacionActual = asignacionLocal || asignacion;
  const estudiante = asignacionActual.estudiante || {};
  const nombreEstudiante = `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim() || estudiante.nombre || 'Estudiante';
  const estudianteId = String(estudiante.id || asignacionActual.estudianteId || '');
  const asignacionId = asignacionActual.id;
  const tutor = asignacionActual.tutorAcademico || asignacionActual.tutor || {};
  const nombreTutor = `${tutor.nombres || ''} ${tutor.apellidos || ''}`.trim() || tutor.nombre || 'No asignado';
  const institucion = asignacionActual.institucion || asignacionActual.convenio?.institucion || 'No asignada';
  const horasAsignadas = asignacionActual.horasAsignadas || 240;
  const horasCompletadas = asignacionActual.horasCompletadas || 0;

  const rolNormalizado = normalizarRol(rol);
  const esDirector = rolNormalizado === 'DIRECTOR_CARRERA';
  const esCpp = rolNormalizado === 'COORDINADOR_PRACTICAS';
  const esSubdecano = rolNormalizado === 'SUBDECANO';
  const esTutor = rolNormalizado === 'TUTOR_ACADEMICO';
  const estaEnCurso = asignacionActual.estado === 'EN_CURSO';

  const tieneAccionesDirector =
    esDirector &&
    !esInactivo &&
    estaEnCurso &&
    asignacionActual.fase === 'ASIGNACION';

  const tieneAccionesCpp =
    esCpp &&
    !esInactivo &&
    estaEnCurso &&
    asignacionActual.fase === 'FINALIZACION' &&
    !asignacionActual.validadoCpp;

  const tieneAccionesSubdecano =
    esSubdecano &&
    !esInactivo &&
    estaEnCurso &&
    asignacionActual.fase === 'FINALIZACION' &&
    Boolean(asignacionActual.validadoCpp);

  const tieneAccionesTutor =
    esTutor &&
    !esInactivo &&
    estaEnCurso &&
    ((asignacionActual.fase === 'ASIGNACION' && Boolean(asignacionActual.cartaAsignacionEnviada)) ||
      asignacionActual.fase === 'DESARROLLO');

  const alActualizar = () => {
    setVersionPortafolio((v) => v + 1);
    router.refresh();
  };

  const manejarReenviarCarta = async () => {
    if (!asignacionId) return;
    setEstaReenviandoCarta(true);
    try {
      const res = await reenviarCartaAsignacionAccion(asignacionId);
      if (res.exito) {
        toast.success(res.mensaje || 'Carta de asignación reenviada exitosamente al Tutor Institucional');
      } else {
        toast.error(res.mensaje || 'Error al reenviar la carta de asignación');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error inesperado al reenviar la carta');
    } finally {
      setEstaReenviandoCarta(false);
    }
  };

  return (
    <>
      <Dialog open={abierto} onOpenChange={(ab) => !ab && alCerrar()}>
        <DialogContent className="w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl h-[88vh] max-h-[820px] flex flex-col p-4 sm:p-5 gap-0 overflow-hidden">
          <DialogHeader className="pr-8 pb-3  shrink-0">
            <DialogTitle className="text-xl font-bold">Información de Práctica Preprofesional</DialogTitle>
          </DialogHeader>

          {esInactivo && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg flex items-center gap-2.5 text-xs sm:text-sm mt-3 shrink-0">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>El periodo académico se encuentra inactivo. Los datos se presentan en modo de solo lectura.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3.5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden items-stretch">
            {/* Columna Izquierda: Información del estudiante y acciones por rol (Fija, sin scroll con portafolio) */}
            <div className="min-w-0 lg:col-span-5 space-y-3.5 shrink-0 overflow-y-auto pr-0.5">
              {/* Encabezado del Estudiante */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                <AvatarUsuario
                  nombre={nombreEstudiante}
                  urlFoto={estudiante.urlAvatar || asignacionActual.urlAvatar}
                  tamano="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground truncate max-w-full">
                      {nombreEstudiante}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{estudiante.correo || 'Sin correo'}</p>
                  <p className="text-xs font-medium text-foreground/80 mt-0.5 truncate">
                    {estudiante.carreraNombre || asignacionActual.carreraNombre || estudiante.identificacion}
                  </p>
                </div>
              </div>

              {/* Barra de Progreso de Fases */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground  tracking-wider">
                  Fase del Proceso
                </p>
                <BarraProgresoPp
                  faseActual={asignacionActual.fase}
                  finalizado={asignacionActual.estado === 'APROBADO' || asignacionActual.estado === 'COMPLETADO'}
                />
              </div>



              {/* Alerta Informativa de Estado del Proceso */}
              <AlertaEstadoProceso
                fase={asignacionActual.fase}
                estado={asignacionActual.estado}
                validadoCpp={asignacionActual.validadoCpp}
                tieneCarta={asignacionActual.cartaAsignacionEnviada}
                estudianteNombre={nombreEstudiante}
                rol={rol}
              />

              {/* Acciones para Director de Carrera */}
              {tieneAccionesDirector && (
                <div className="p-3.5 border rounded-xl bg-card space-y-2.5">
                  <p className="text-xs font-bold text-foreground tracking-wide">
                    Acciones
                  </p>

                  {!asignacionActual.cartaAsignacionEnviada && (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => setModalCartaAbierto(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Visualizar y Emitir Carta de Asignación
                    </Button>
                  )}

                  {asignacionActual.cartaAsignacionEnviada && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
                      onClick={manejarReenviarCarta}
                      disabled={estaReenviandoCarta}
                    >
                      {estaReenviandoCarta ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Reenviar Carta al Tutor Institucional
                    </Button>
                  )}
                </div>
              )}

              {/* Acciones para Coordinador de Prácticas */}
              {tieneAccionesCpp && (
                <div className="p-3.5 border rounded-xl bg-card space-y-2.5">
                  <p className="text-xs font-bold text-foreground tracking-wide">
                    Acciones
                  </p>

                  {asignacionActual.fase === 'FINALIZACION' && !asignacionActual.validadoCpp && (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => setModalValidacionPortafolioAbierto(true)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Validar Documentos del Portafolio
                    </Button>
                  )}
                </div>
              )}

              {/* Acciones para Subdecano */}
              {tieneAccionesSubdecano && (
                <div className="p-3.5 border rounded-xl bg-card space-y-2">
                  <p className="text-xs font-bold text-foreground tracking-wide">
                    Acciones
                  </p>
                  <Button
                    type="button"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setModalAvalAbierto(true)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Previsualizar y Emitir Aval de Cumplimiento
                  </Button>
                </div>
              )}

              {/* Acciones para Tutor Académico */}
              {tieneAccionesTutor && (
                <div className="p-3.5 border rounded-xl bg-card space-y-2">
                  <AccionesTutorAcademico
                    estudianteSeleccionado={estudianteId}
                    datosEstudianteSeleccionado={asignacionActual}
                    esInactivo={esInactivo}
                    alActualizar={alActualizar}
                  />
                </div>
              )}
            </div>

            {/* Columna Derecha: Portafolio del Estudiante (Único contenedor scrolleable) */}
            <div className="min-w-0 lg:col-span-7 border rounded-xl p-3 bg-muted/10 flex flex-col min-h-[350px] lg:min-h-0 lg:h-full overflow-hidden">
              <Portafolio
                key={versionPortafolio}
                estudianteId={estudianteId}
                asignacionId={asignacionId ? String(asignacionId) : undefined}
                asignacionEstado={asignacionActual.estado}
                etapaActual={asignacionActual.fase}
                validadoCpp={asignacionActual.validadoCpp}
                soloLectura
                rol={rolNormalizado}
                permitirResubirIds={
                  esTutor
                    ? ['doc_seguimiento_ta', 'doc_informe_final', 'doc_cert_cumplimiento']
                    : undefined
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submodales Desacoplados */}
      {asignacionId && (
        <>
          <ModalEmitirCartaCpp
            abierto={modalCartaAbierto}
            alCambiarAbierto={setModalCartaAbierto}
            asignacionId={asignacionId}
            nombreEstudiante={nombreEstudiante}
            tutorInstitucional={asignacionActual.tutorInstitucional}
            correoTutorInstitucional={asignacionActual.correoTutorInstitucional}
            institucion={asignacionActual.institucion}
            esInactivo={esInactivo}
            alConfirmar={() => {
              setVersionPortafolio((v) => v + 1)
              alActualizar();
            }}
          />

          <ModalGenerarAvalSubdecano
            abierto={modalAvalAbierto}
            alCambiarAbierto={setModalAvalAbierto}
            asignacionId={asignacionId}
            nombreEstudiante={nombreEstudiante}
            identificacionEstudiante={estudiante.identificacion}
            institucion={institucion}
            tutorAcademico={nombreTutor}
            tutorInstitucional={asignacionActual.tutorInstitucional}
            horasAsignadas={horasAsignadas}
            asignacion={asignacionActual}
            esInactivo={esInactivo}
            alConfirmar={(asigActualizada) => {
              if (asigActualizada) {
                setAsignacionLocal(asigActualizada);
              }
              alActualizar();
            }}
          />

          <ModalValidacionDocumentos
            open={modalValidacionPortafolioAbierto}
            onOpenChange={setModalValidacionPortafolioAbierto}
            documentos={asignacionActual.documentos || []}
            fase="PORTAFOLIO"
            estudianteId={estudianteId}
            nombreEstudiante={nombreEstudiante}
            asignacionId={String(asignacionId)}
            onValidacionCompleta={() => {
              setVersionPortafolio((v) => v + 1)
              setModalValidacionPortafolioAbierto(false);
              alActualizar();
            }}
          />
        </>
      )}
    </>
  );
}
