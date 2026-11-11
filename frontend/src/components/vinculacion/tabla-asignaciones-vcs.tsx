'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  AsignacionProyectoComunitarioDto,
  ProyectoResumenDto,
} from '@/lib/tipos/vcs/asignacion-proyecto';
import { RespuestaPaginada } from '@/lib/tipos/general';
import { ModalEditarAsignacionVcs } from './modal-editar-asignacion-vcs';
import { ModalEliminarAsignacionVcs } from './modal-eliminar-asignacion-vcs';
import { ModalReprobarAsignacionVcs } from './modal-reprobar-asignacion-vcs';
import { ModalCancelarAsignacionVcs } from './modal-cancelar-asignacion-vcs';
import { ModalAprobarHorasSubdecano } from './modal-aprobar-horas-subdecano';
import { ModalPrevisualizarDocumentoVcs } from './modal-previsualizar-documento-vcs';
import { ModalDetalleEstudianteVcs } from './modal-detalle-estudiante-vcs';
import { BadgeEstadoAsignacion } from './badge-estado-asignacion';
import { BadgeFaseAsignacion } from './badge-fase-asignacion';
import { Paginador } from '@/components/paginador';
import { obtenerAsignacionProyectoPorIdAccion } from '@/lib/acciones/vcs/asignacion-proyecto.acciones';
import { ResultadoAprobacionHoras } from '@/lib/tipos/vcs/evidencia-vcs';
import { toast } from 'sonner';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import { CeldaUsuarioTabla } from '@/components/comunes/celda-usuario-tabla';
import { CeldaEntidadTutor } from '@/components/comunes/celda-entidad-tutor';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Edit2,
  Trash2,
  UserCheck,
  User,
  Building,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  CheckCircle2,
  Award,
  FileText,
  Clock,
  XCircle,
  Ban,
} from 'lucide-react';
import Link from 'next/link';
import { TienePermiso } from '@/components/autenticacion/tiene-permiso';
import { PERMISOS, tienePermiso } from '@/lib/seguridad/permisos';
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion';

interface TablaAsignacionesVcsProps {
  paginaAsignaciones: RespuestaPaginada<AsignacionProyectoComunitarioDto>;
  proyectos: ProyectoResumenDto[];
  esInactivo?: boolean;
}

export function TablaAsignacionesVcs({
  paginaAsignaciones,
  proyectos,
  esInactivo = false,
}: TablaAsignacionesVcsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { usuario } = useAutenticacion();

  const [estaAbiertoModalEditar, setEstaAbiertoModalEditar] = useState(false);
  const [estaAbiertoModalEliminar, setEstaAbiertoModalEliminar] = useState(false);
  const [estaAbiertoModalReprobar, setEstaAbiertoModalReprobar] = useState(false);
  const [estaAbiertoModalCancelar, setEstaAbiertoModalCancelar] = useState(false);
  const [estaAbiertoModalAprobarHoras, setEstaAbiertoModalAprobarHoras] = useState(false);
  const [estaAbiertoModalCertificado, setEstaAbiertoModalCertificado] = useState(false);
  const [urlCertificadoPreview, setUrlCertificadoPreview] = useState<string | null>(null);
  const [tituloCertificadoPreview, setTituloCertificadoPreview] = useState('Certificado de Horas de Vinculación');
  const [asignacionSeleccionada, setAsignacionSeleccionada] =
    useState<AsignacionProyectoComunitarioDto | null>(null);
  const [asignacionDetalle, setAsignacionDetalle] =
    useState<AsignacionProyectoComunitarioDto | null>(null);

  useEffect(() => {
    const asignacionIdParam = searchParams.get('asignacionId');
    const abrirAprobarHorasParam = searchParams.get('abrirAprobarHoras');
    const abrirEvidenciasParam = searchParams.get('abrirEvidencias');
    const abrirDetalleParam = searchParams.get('abrirDetalle');

    if (asignacionIdParam) {
      const aId = Number(asignacionIdParam);
      const procesarApertura = (asig: AsignacionProyectoComunitarioDto) => {
        if (abrirAprobarHorasParam === 'true') {
          setAsignacionSeleccionada(asig);
          setEstaAbiertoModalAprobarHoras(true);
        } else {
          setAsignacionDetalle(asig);
        }
      };

      const asigEncontrada = paginaAsignaciones?.content?.find((a) => a.id === aId);
      if (asigEncontrada) {
        procesarApertura(asigEncontrada);
      } else {
        obtenerAsignacionProyectoPorIdAccion(aId).then((res) => {
          if (res) {
            procesarApertura(res);
          }
        });
      }
    }
  }, [searchParams, paginaAsignaciones]);

  useEffect(() => {
    if (!asignacionDetalle?.id) return;
    const actualizada = paginaAsignaciones?.content?.find(
      (a) => a.id === asignacionDetalle.id
    );
    if (actualizada && actualizada !== asignacionDetalle) {
      setAsignacionDetalle(actualizada);
    }
  }, [paginaAsignaciones?.content, asignacionDetalle]);

  const cerrarModalDetalle = () => {
    setAsignacionDetalle(null);
    const params = new URLSearchParams(searchParams.toString());
    if (params.has('asignacionId') || params.has('abrirDetalle') || params.has('abrirEvidencias')) {
      params.delete('asignacionId');
      params.delete('abrirDetalle');
      params.delete('abrirEvidencias');
      const nuevoQuery = params.toString() ? `?${params.toString()}` : '';
      router.replace(`${pathname}${nuevoQuery}`, { scroll: false });
    }
  };

  const faseFiltro = searchParams.get('faseActual') || searchParams.get('fase');
  const estaEnFaseFinalizacion = faseFiltro === 'FINALIZACION';

  const esSubdecano = tienePermiso(usuario?.rol, PERMISOS.HORAS_VCS_APROBAR);
  const puedeEditarAsignacion =
    !esInactivo && tienePermiso(usuario?.rol, PERMISOS.ASIGNACIONES_EDITAR);
  const puedeEliminarAsignacion =
    !esInactivo && tienePermiso(usuario?.rol, PERMISOS.ASIGNACIONES_ELIMINAR);
  const puedeReprobarAsignacion =
    !esInactivo && tienePermiso(usuario?.rol, PERMISOS.ASIGNACIONES_REPROBAR);
  const puedeCancelarAsignacion =
    !esInactivo && tienePermiso(usuario?.rol, PERMISOS.ASIGNACIONES_CANCELAR);

  const puedeVerAcciones =
    !estaEnFaseFinalizacion &&
    (esSubdecano || puedeEditarAsignacion || puedeEliminarAsignacion || puedeReprobarAsignacion || puedeCancelarAsignacion);

  const sortActual = searchParams.get('sort') || 'fechaCreacion,desc';
  const [campoSort, direccionSort] = sortActual.split(',');

  const alternarOrden = (campo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const nuevaDireccion = campoSort === campo && direccionSort === 'asc' ? 'desc' : 'asc';
    params.set('sort', `${campo},${nuevaDireccion}`);
    params.set('page', '0');
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderIconoOrden = (campo: string) => {
    if (campoSort !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionSort === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', nuevaPagina.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const cambiarElementosPorPagina = (nuevoTamanio: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('size', nuevoTamanio.toString());
    params.set('page', '0');
    router.push(`${pathname}?${params.toString()}`);
  };

  const abrirEditar = (asignacion: AsignacionProyectoComunitarioDto) => {
    setAsignacionSeleccionada(asignacion);
    setEstaAbiertoModalEditar(true);
  };

  const abrirEliminar = (asignacion: AsignacionProyectoComunitarioDto) => {
    setAsignacionSeleccionada(asignacion);
    setEstaAbiertoModalEliminar(true);
  };

  const abrirReprobar = (asignacion: AsignacionProyectoComunitarioDto) => {
    setAsignacionSeleccionada(asignacion);
    setEstaAbiertoModalReprobar(true);
  };

  const abrirCancelar = (asignacion: AsignacionProyectoComunitarioDto) => {
    setAsignacionSeleccionada(asignacion);
    setEstaAbiertoModalCancelar(true);
  };

  const abrirAprobarHoras = (asignacion: AsignacionProyectoComunitarioDto) => {
    setAsignacionSeleccionada(asignacion);
    setEstaAbiertoModalAprobarHoras(true);
  };

  const abrirVerCertificado = (asignacion: AsignacionProyectoComunitarioDto) => {
    setAsignacionSeleccionada(asignacion);
    setTituloCertificadoPreview(
      `Certificado de Validación de Horas - ${asignacion.nombreCompletoEstudiante}`
    );
    setUrlCertificadoPreview(
      `/api/proxy/asignaciones-proyectos-comunitarios/${asignacion.id}/certificado-horas/preview`
    );
    setEstaAbiertoModalCertificado(true);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera con contador y botón hacia asignación masiva Reutilizable */}
      <CabeceraListado
        titulo="Listado de Asignaciones"
        total={paginaAsignaciones.totalElements}
        accion={
          !esInactivo ? (
            <TienePermiso roles={PERMISOS.ASIGNACIONES_CREAR}>
              <Button asChild className="h-9 gap-1.5 shadow-sm">
                <Link href="/dashboard/vinculacion/asignaciones">
                  <Plus className="h-4 w-4" />
                  Nueva Asignación
                </Link>
              </Button>
            </TienePermiso>
          ) : undefined
        }
      />

      {/* Tabla (Desktop) y Tarjetas (Mobile) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
                <TableHead
                  className={`${puedeVerAcciones ? 'w-[26%]' : 'w-[30%]'} font-semibold cursor-pointer hover:text-primary transition-colors select-none group`}
                  onClick={() => alternarOrden('nombreEstudiante')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('nombreEstudiante');
                    }
                  }}
                  aria-sort={campoSort === 'nombreEstudiante' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Estudiante"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Estudiante</span>
                    {renderIconoOrden('nombreEstudiante')}
                  </div>
                </TableHead>
                <TableHead
                  className={`${puedeVerAcciones ? 'w-[23%]' : 'w-[28%]'} font-semibold cursor-pointer hover:text-primary transition-colors select-none group`}
                  onClick={() => alternarOrden('nombreProyecto')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('nombreProyecto');
                    }
                  }}
                  aria-sort={campoSort === 'nombreProyecto' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Proyecto y Tutor"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Proyecto y Tutor</span>
                    {renderIconoOrden('nombreProyecto')}
                  </div>
                </TableHead>
                <TableHead
                  className={`${puedeVerAcciones ? 'w-[14%]' : 'w-[18%]'} font-semibold cursor-pointer hover:text-primary transition-colors select-none group`}
                  onClick={() => alternarOrden('horasAsignadas')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('horasAsignadas');
                    }
                  }}
                  aria-sort={campoSort === 'horasAsignadas' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Horas"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Horas</span>
                    {renderIconoOrden('horasAsignadas')}
                  </div>
                </TableHead>
                <TableHead
                  className={`${puedeVerAcciones ? 'w-[11%]' : 'w-[12%]'} font-semibold text-center cursor-pointer hover:text-primary transition-colors select-none group`}
                  onClick={() => alternarOrden('faseActual')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('faseActual');
                    }
                  }}
                  aria-sort={campoSort === 'faseActual' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Fase"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Fase</span>
                    {renderIconoOrden('faseActual')}
                  </div>
                </TableHead>
                <TableHead
                  className={`${puedeVerAcciones ? 'w-[10%]' : 'w-[12%]'} font-semibold text-center cursor-pointer hover:text-primary transition-colors select-none group`}
                  onClick={() => alternarOrden('estado')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('estado');
                    }
                  }}
                  aria-sort={campoSort === 'estado' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Estado"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Estado</span>
                    {renderIconoOrden('estado')}
                  </div>
                </TableHead>
                {puedeVerAcciones && (
                  <TableHead className="w-[16%] font-semibold text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!paginaAsignaciones?.content || paginaAsignaciones.content.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={puedeVerAcciones ? 6 : 5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No se encontraron asignaciones</p>
                      <p className="text-xs text-muted-foreground/80">
                        Intente cambiar los filtros o realice una nueva asignación de estudiantes.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginaAsignaciones.content.map((asignacion) => {
                  const porcentaje =
                    asignacion.horasAsignadas > 0
                      ? Math.min(
                        100,
                        Math.round(
                          (asignacion.horasCompletadas / asignacion.horasAsignadas) * 100
                        )
                      )
                      : 0;

                  const estaValidado = asignacion.estado === 'APROBADO';
                  const estaHabilitadoParaAprobar =
                    asignacion.documentosValidados === true && !estaValidado;
                  const estaFinalizadaNegativa =
                    asignacion.estado === 'REPROBADO' || asignacion.estado === 'CANCELADO';
                  const tieneBotonSubdecano = esSubdecano && !estaValidado;
                  const tieneBotonReprobar = puedeReprobarAsignacion && asignacion.estado === 'EN_CURSO';
                  const tieneBotonCancelar = puedeCancelarAsignacion && asignacion.estado === 'EN_CURSO';
                  const tieneBotonEditar = asignacion.faseActual === 'ASIGNACION' && puedeEditarAsignacion;
                  const tieneBotonEliminar = asignacion.faseActual === 'ASIGNACION' && puedeEliminarAsignacion;
                  const tieneAccionesFila =
                    tieneBotonSubdecano ||
                    tieneBotonReprobar ||
                    tieneBotonCancelar ||
                    tieneBotonEditar ||
                    tieneBotonEliminar;

                  return (
                    <TableRow
                      key={asignacion.id}
                      onClick={() => setAsignacionDetalle(asignacion)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      {/* Estudiante */}
                      <TableCell>
                        <CeldaUsuarioTabla
                          nombre={asignacion.nombreCompletoEstudiante}
                          identificacion={asignacion.identificacionEstudiante}
                          correo={asignacion.correoEstudiante}
                          urlAvatar={asignacion.urlAvatar}
                        />
                      </TableCell>

                      {/* Proyecto y Tutor */}
                      <TableCell>
                        <CeldaEntidadTutor
                          titulo={asignacion.nombreProyecto}
                          nombreTutor={asignacion.nombreCompletoTutor}
                        />
                      </TableCell>

                      {/* Horas */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">
                              {asignacion.horasCompletadas} / {asignacion.horasAsignadas}h
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {porcentaje}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Fase Actual */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <BadgeFaseAsignacion fase={asignacion.faseActual} />
                          {asignacion.faseActual === 'DESARROLLO'}
                          {asignacion.faseActual === 'FINALIZACION'}
                        </div>
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="text-center">
                        <BadgeEstadoAsignacion estado={asignacion.estado} />
                      </TableCell>

                      {/* Acciones */}
                      {puedeVerAcciones && (
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {estaFinalizadaNegativa ? (
                            <span className="text-xs text-muted-foreground font-medium italic">
                              No disponible
                            </span>
                          ) : tieneAccionesFila ? (
                            <div className="flex items-center justify-end gap-1">
                              {/* Botón Validar y Aprobar Horas (Subdecano - antes de convalidar) */}
                              {esSubdecano && !estaValidado && (
                                estaHabilitadoParaAprobar ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => abrirAprobarHoras(asignacion)}
                                    title="Validar y convalidar horas de vinculación"
                                    className="h-7 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5 shadow-2xs"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Validar Horas</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    title="Pendiente: El Tutor Académico debe validar los documentos previamente"
                                    className="h-7 px-2.5 text-xs text-muted-foreground border-border bg-muted/40 cursor-not-allowed gap-1.5 opacity-60"
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Pendiente Tutor</span>
                                  </Button>
                                )
                              )}

                 

                              {/* Reprobar Asignación (Tutor Académico en EN_CURSO) */}
                              {puedeReprobarAsignacion && asignacion.estado === 'EN_CURSO' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => abrirReprobar(asignacion)}
                                  title="Reprobar asignación del estudiante (Tutor)"
                                  className="h-7 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 gap-1.5 shadow-2xs"
                                >
                                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                                  <span>Reprobar</span>
                                </Button>
                              )}

                              {/* Cancelar Asignación (Director de Carrera en EN_CURSO) */}
                              {puedeCancelarAsignacion && asignacion.estado === 'EN_CURSO' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => abrirCancelar(asignacion)}
                                  title="Cancelar asignación"
                                  aria-label="Cancelar asignación"
                                  className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Editar Asignación (Fase Asignación) */}
                              {asignacion.faseActual === 'ASIGNACION' && (
                                <TienePermiso roles={PERMISOS.ASIGNACIONES_EDITAR}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => abrirEditar(asignacion)}
                                    title="Editar asignación"
                                    aria-label="Editar asignación"
                                    className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </TienePermiso>
                              )}

                              {/* Eliminar Asignación (Fase Asignación) */}
                              {asignacion.faseActual === 'ASIGNACION' && (
                                <TienePermiso roles={PERMISOS.ASIGNACIONES_ELIMINAR}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => abrirEliminar(asignacion)}
                                    title="Eliminar asignación"
                                    aria-label="Eliminar asignación"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TienePermiso>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium inline-block pr-3">
                              -
                            </span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Vista Móvil */}
        <div className="md:hidden divide-y divide-border">
          {!paginaAsignaciones?.content || paginaAsignaciones.content.length === 0 ? (
            <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <UserCheck className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No se encontraron asignaciones</p>
              <p className="text-xs text-muted-foreground/80">
                Intente cambiar los filtros o realice una nueva asignación de estudiantes.
              </p>
            </div>
          ) : (
            paginaAsignaciones.content.map((asignacion) => {
              const porcentaje =
                asignacion.horasAsignadas > 0
                  ? Math.min(
                    100,
                    Math.round(
                      (asignacion.horasCompletadas / asignacion.horasAsignadas) * 100
                    )
                  )
                  : 0;

              const estaValidado = asignacion.estado === 'APROBADO';
              const estaHabilitadoParaAprobar =
                asignacion.documentosValidados === true && !estaValidado;
              const estaFinalizadaNegativa =
                asignacion.estado === 'REPROBADO' || asignacion.estado === 'CANCELADO';

              return (
                <div key={asignacion.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                  {/* Encabezado de la tarjeta: Estudiante + Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CeldaUsuarioTabla
                        nombre={asignacion.nombreCompletoEstudiante}
                        identificacion={asignacion.identificacionEstudiante}
                        correo={asignacion.correoEstudiante}
                        urlAvatar={asignacion.urlAvatar}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <BadgeEstadoAsignacion estado={asignacion.estado} />
                      <BadgeFaseAsignacion fase={asignacion.faseActual} />
                      {asignacion.faseActual === 'DESARROLLO'}
                      {asignacion.faseActual === 'FINALIZACION'}
                    </div>
                  </div>

                  {/* Proyecto y Tutor */}
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50 min-w-0">
                    <CeldaEntidadTutor
                      titulo={asignacion.nombreProyecto}
                      nombreTutor={asignacion.nombreCompletoTutor}
                    />
                  </div>

                  {/* Progreso de Horas */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Horas Acumuladas:</span>
                      <span className="font-semibold text-foreground">
                        {asignacion.horasCompletadas} / {asignacion.horasAsignadas}h{' '}
                        <span className="text-muted-foreground font-normal">({porcentaje}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>

                  {/* Acciones Subdecano / Tutor */}
                  <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsignacionDetalle(asignacion)}
                      className="flex-1 min-h-[38px] text-xs font-medium text-foreground gap-1.5"
                    >
                      <span>Ver Ficha Completa</span>
                    </Button>

                    {puedeVerAcciones && (
                      estaFinalizadaNegativa ? (
                        <span className="text-xs text-muted-foreground font-medium italic py-1">
                          No disponible
                        </span>
                      ) : (
                        <>
                          {/* Botón Validar y Aprobar Horas (Subdecano) */}
                          {esSubdecano && !estaValidado && (
                            estaHabilitadoParaAprobar ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirAprobarHoras(asignacion)}
                                className="flex-1 min-h-[38px] text-xs font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5"
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Validar Horas</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="flex-1 min-h-[38px] text-xs text-muted-foreground border-border bg-muted/40 cursor-not-allowed gap-1.5 opacity-60"
                              >
                                <Clock className="h-4 w-4 shrink-0" />
                                <span>Pendiente Tutor</span>
                              </Button>
                            )
                          )}

                          {/* Ver Certificado de Vinculación (Subdecano) */}
                          {esSubdecano && estaValidado && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirVerCertificado(asignacion)}
                              className="flex-1 min-h-[38px] text-xs font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5"
                            >
                              <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>Ver Certificado</span>
                            </Button>
                          )}

                          {/* Reprobar Asignación (Tutor Académico en EN_CURSO) */}
                          {puedeReprobarAsignacion && asignacion.estado === 'EN_CURSO' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirReprobar(asignacion)}
                              title="Reprobar asignación del estudiante"
                              className="h-9 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 gap-1.5"
                            >
                              <XCircle className="h-4 w-4 shrink-0" />
                              <span>Reprobar</span>
                            </Button>
                          )}

                          {/* Cancelar Asignación (Director de Carrera en EN_CURSO) */}
                          {puedeCancelarAsignacion && asignacion.estado === 'EN_CURSO' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirCancelar(asignacion)}
                              title="Cancelar asignación"
                              aria-label="Cancelar asignación"
                              className="h-9 w-9 p-0 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Editar Asignación */}
                          {asignacion.faseActual === 'ASIGNACION' && (
                            <TienePermiso roles={PERMISOS.ASIGNACIONES_EDITAR}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirEditar(asignacion)}
                                title="Editar asignación"
                                aria-label="Editar asignación"
                                className="h-9 w-9 p-0 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TienePermiso>
                          )}

                          {/* Eliminar Asignación */}
                          {asignacion.faseActual === 'ASIGNACION' && (
                            <TienePermiso roles={PERMISOS.ASIGNACIONES_ELIMINAR}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirEliminar(asignacion)}
                                title="Eliminar asignación"
                                aria-label="Eliminar asignación"
                                className="h-9 w-9 p-0 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TienePermiso>
                          )}
                        </>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Paginador */}
      {paginaAsignaciones.totalPages > 0 && (
        <Paginador
          paginaActual={paginaAsignaciones.number}
          totalPaginas={paginaAsignaciones.totalPages}
          onCambioPagina={cambiarPagina}
          elementosPorPagina={paginaAsignaciones.size}
          onCambioElementosPorPagina={cambiarElementosPorPagina}
        />
      )}

      {/* Modales */}
      <ModalDetalleEstudianteVcs
        abierto={Boolean(asignacionDetalle)}
        alCerrar={cerrarModalDetalle}
        asignacion={asignacionDetalle}
        rol={usuario?.rol}
        esInactivo={esInactivo}
      />

      <ModalEditarAsignacionVcs
        abierto={estaAbiertoModalEditar}
        abrirModal={setEstaAbiertoModalEditar}
        asignacion={asignacionSeleccionada}
        proyectos={proyectos}
      />

      <ModalEliminarAsignacionVcs
        abierto={estaAbiertoModalEliminar}
        abrirModal={setEstaAbiertoModalEliminar}
        asignacion={asignacionSeleccionada}
      />

      <ModalReprobarAsignacionVcs
        abierto={estaAbiertoModalReprobar}
        abrirModal={setEstaAbiertoModalReprobar}
        asignacion={asignacionSeleccionada}
        alActualizar={() => router.refresh()}
      />

      <ModalCancelarAsignacionVcs
        abierto={estaAbiertoModalCancelar}
        abrirModal={setEstaAbiertoModalCancelar}
        asignacion={asignacionSeleccionada}
        alActualizar={() => router.refresh()}
      />

      <ModalAprobarHorasSubdecano
        abierto={estaAbiertoModalAprobarHoras}
        abrirModal={(abierto) => {
          setEstaAbiertoModalAprobarHoras(abierto);
          if (!abierto) {
            const params = new URLSearchParams(searchParams.toString());
            if (params.has('abrirAprobarHoras') || params.has('asignacionId')) {
              params.delete('abrirAprobarHoras');
              params.delete('asignacionId');
              const nuevoQuery = params.toString() ? `?${params.toString()}` : '';
              router.replace(`${pathname}${nuevoQuery}`, { scroll: false });
            }
          }
        }}
        asignacion={asignacionSeleccionada}
        alAprobar={() => {
          router.refresh();
        }}
      />

      <ModalPrevisualizarDocumentoVcs
        abierto={estaAbiertoModalCertificado}
        abrirModal={setEstaAbiertoModalCertificado}
        titulo={tituloCertificadoPreview}
        urlDocumento={urlCertificadoPreview}
        nombreArchivoDescarga={`${asignacionSeleccionada?.nombreCompletoEstudiante || 'Estudiante'} - Certificado VCS.pdf`}
      />
    </div>
  );
}
