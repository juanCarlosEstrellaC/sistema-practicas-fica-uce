'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Paginador } from '@/components/paginador';
import { BadgeEstadoPractica } from '@/components/practicas/badges/badge-estado-practica';
import { BadgeFasePractica } from '@/components/practicas/badges/badge-fase-practica';
import { ModalDetalleEstudiante } from './modal-detalle-estudiante';
import { ModalEditarAsignacionPractica } from './modal-editar-asignacion-practica';
import { ModalEliminarAsignacionPractica } from './modal-eliminar-asignacion-practica';
import { ModalCancelarAsignacionPractica } from './modal-cancelar-asignacion-practica';
import { ModalReprobarAsignacionPractica } from './modal-reprobar-asignacion-practica';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import { CeldaUsuarioTabla } from '@/components/comunes/celda-usuario-tabla';
import { CeldaEntidadTutor } from '@/components/comunes/celda-entidad-tutor';
import {
  EsqueletoFilasTablaEstudiantes,
  EsqueletoTarjetasEstudiantes,
} from '@/components/esqueletos/esqueleto-tabla';
import { AsignacionPracticaDetalleDto } from '@/lib/tipos/pp/general-pp';
import { RespuestaPaginada } from '@/lib/tipos/general';
import {
  actualizarAsignacionPracticaAccion,
  obtenerAsignacionPracticaPorIdAccion,
} from '@/lib/acciones/pp/asignacion-practica.acciones';
import {
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Ban,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface TablaEstudiantesProps {
  paginaAsignaciones: RespuestaPaginada<AsignacionPracticaDetalleDto>;
  rol?: 'SUBDECANO' | 'DIRECTOR_CARRERA' | 'COORDINADOR_PRACTICAS' | 'TUTOR_ACADEMICO' | string;
  esInactivo?: boolean;
  alSeleccionarEstudiante?: (id: string) => void;
  alEditarAsignacion?: (id: string) => void;
  alEliminarAsignacion?: (id: string) => void;
}

function adaptarAsignacionParaDialogo(asignacion: AsignacionPracticaDetalleDto | any) {
  if (!asignacion) return null;
  const estudiante = {
    id: asignacion.estudiante?.id || asignacion.estudianteId,
    nombre:
      `${asignacion.estudiante?.nombres || asignacion.estudianteNombres || ''} ${asignacion.estudiante?.apellidos || asignacion.estudianteApellidos || ''}`.trim() ||
      'Estudiante',
    nombres: asignacion.estudiante?.nombres || asignacion.estudianteNombres,
    apellidos: asignacion.estudiante?.apellidos || asignacion.estudianteApellidos,
    identificacion: asignacion.estudiante?.identificacion || asignacion.estudianteIdentificacion,
    correo: asignacion.estudiante?.correo || asignacion.estudianteCorreo,
    carrera: asignacion.estudiante?.carreraNombre || asignacion.carreraNombre,
    urlAvatar: asignacion.estudiante?.urlAvatar || asignacion.urlAvatar,
  };

  const tutor = asignacion.tutorAcademico
    ? {
        id: asignacion.tutorAcademico.id,
        nombres: asignacion.tutorAcademico.nombres,
        apellidos: asignacion.tutorAcademico.apellidos,
        correo: asignacion.tutorAcademico.correo,
      }
    : null;

  const convenio = {
    id: asignacion.convenioId,
    institucion: asignacion.institucion || asignacion.convenioInstitucion,
  };

  return {
    id: asignacion.id,
    estudianteId: String(estudiante.id),
    estudiante,
    asignacion,
    convenio,
    tutor,
    documentos: [],
    horasCompletadas: asignacion.horasCompletadas || 0,
    horasAsignadas: asignacion.horasAsignadas || 240,
    horasRequeridas: asignacion.horasRequeridas || asignacion.estudiante?.horasRequeridas || 240,
    horasAcumuladas: asignacion.horasAcumuladas || asignacion.estudiante?.horasAcumuladas || 0,
    estado: asignacion.estado || 'POSTULANDO',
    puedeEditar: asignacion.puedeEditar ?? false,
  };
}

export function TablaEstudiantes({
  paginaAsignaciones,
  rol = 'DIRECTOR_CARRERA',
  esInactivo = false,
  alSeleccionarEstudiante,
  alEditarAsignacion,
  alEliminarAsignacion,
}: TablaEstudiantesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaPendiente, iniciarTransicion] = useTransition();

  const [asignacionDetalle, setAsignacionDetalle] = useState<AsignacionPracticaDetalleDto | null>(null);
  const [asignacionAEditar, setAsignacionAEditar] = useState<AsignacionPracticaDetalleDto | null>(null);
  const [asignacionAEliminar, setAsignacionAEliminar] = useState<AsignacionPracticaDetalleDto | null>(null);
  const [asignacionACancelar, setAsignacionACancelar] = useState<AsignacionPracticaDetalleDto | null>(null);
  const [asignacionAReprobar, setAsignacionAReprobar] = useState<AsignacionPracticaDetalleDto | null>(null);

  // Ordenamiento por URL
  const sortActual = searchParams.get('sort') || 'id,desc';
  const [campoSort, direccionSort] = sortActual.split(',');

  const alternarOrden = (campo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const nuevaDireccion = campoSort === campo && direccionSort === 'asc' ? 'desc' : 'asc';
    params.set('sort', `${campo},${nuevaDireccion}`);
    params.set('page', '0');
    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
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

  // Deep-linking resiliente ante notificaciones y parametros de URL
  useEffect(() => {
    const asignacionIdParam = searchParams.get('asignacionId');
    const openEstudianteParam = searchParams.get('openEstudiante') || searchParams.get('estudianteId');
    const abrirDetalleParam = searchParams.get('abrirDetalle');

    if (asignacionIdParam) {
      const idNumero = Number(asignacionIdParam);
      const asignacionLocal = paginaAsignaciones?.content?.find((a) => Number(a.id) === idNumero);
      if (asignacionLocal) {
        setAsignacionDetalle(asignacionLocal);
      } else {
        obtenerAsignacionPracticaPorIdAccion(idNumero).then((res) => {
          if (res) setAsignacionDetalle(res as any);
        });
      }
    } else if (openEstudianteParam || (abrirDetalleParam === 'true' && openEstudianteParam)) {
      const idEst = String(openEstudianteParam);
      const asignacionPorEstudiante = paginaAsignaciones?.content?.find(
        (a) => String(a.estudiante?.id) === idEst || String((a as any).estudianteId) === idEst
      );
      if (asignacionPorEstudiante) {
        setAsignacionDetalle(asignacionPorEstudiante);
      }
    }
  }, [searchParams, paginaAsignaciones]);

  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', nuevaPagina.toString());
    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const cambiarElementosPorPagina = (nuevoTamanio: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('size', nuevoTamanio.toString());
    params.set('page', '0');
    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const cerrarModalDetalle = () => {
    setAsignacionDetalle(null);
    const params = new URLSearchParams(searchParams.toString());
    if (
      params.has('asignacionId') ||
      params.has('abrirDetalle') ||
      params.has('estudianteId') ||
      params.has('openEstudiante')
    ) {
      params.delete('asignacionId');
      params.delete('abrirDetalle');
      params.delete('estudianteId');
      params.delete('openEstudiante');
      const consulta = params.toString() ? `?${params.toString()}` : '';
      router.replace(`${pathname}${consulta}`, { scroll: false });
    }
  };

  const manejarSeleccionarFila = (item: AsignacionPracticaDetalleDto) => {
    if (alSeleccionarEstudiante && item.estudiante?.id) {
      alSeleccionarEstudiante(String(item.estudiante.id));
    }
    setAsignacionDetalle(item);
  };

  const manejarGuardarEdicion = async (id: string, datos: any) => {
    try {
      const res = await actualizarAsignacionPracticaAccion(Number(id), {
        convenioId: datos.convenioId,
        tutorId: datos.tutorId,
        horas: datos.horas,
      });
      if (res.exito) {
        toast.success(res.mensaje || 'Asignación actualizada correctamente');
        setAsignacionAEditar(null);
        router.refresh();
      } else {
        toast.error(res.mensaje || 'Error al actualizar la asignación');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error inesperado al guardar la asignación');
    }
  };

  const esCoordinador = rol === 'COORDINADOR_PRACTICAS';
  const esTutor = rol === 'TUTOR_ACADEMICO';
  const contenidoOriginal = paginaAsignaciones?.content || [];
  const listaAsignaciones = esTutor
    ? contenidoOriginal.filter((a) => a.cartaAsignacionEnviada !== false)
    : contenidoOriginal;
  const totalAsignaciones = esTutor
    ? Math.max(0, (paginaAsignaciones?.totalElements || 0) - (contenidoOriginal.length - listaAsignaciones.length))
    : paginaAsignaciones?.totalElements || 0;

  useEffect(() => {
    if (!asignacionDetalle?.id) return;
    const actualizada = listaAsignaciones.find((a) => String(a.id) === String(asignacionDetalle.id));
    if (actualizada && actualizada !== asignacionDetalle) {
      setAsignacionDetalle(actualizada);
    }
  }, [listaAsignaciones, asignacionDetalle]);

  const faseFiltro = searchParams.get('faseActual') || searchParams.get('fase');
  const estaEnFaseFinalizacion = faseFiltro === 'FINALIZACION';

  const mostrarColumnaCarrera = rol === 'SUBDECANO';
  const mostrarColumnaAcciones =
    !estaEnFaseFinalizacion && (esCoordinador || esTutor) && !esInactivo;

  return (
    <div className="space-y-4">
      {/* Cabecera de la tabla y Conteo Reutilizable */}
      <CabeceraListado
        titulo="Listado de Asignaciones"
        total={totalAsignaciones}
      />

      {/* Tabla (Desktop) y Tarjetas (Mobile) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
                <TableHead
                  className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('estudiante.nombres')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('estudiante.nombres');
                    }
                  }}
                  aria-sort={campoSort === 'estudiante.nombres' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Estudiante"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Estudiante</span>
                    {renderIconoOrden('estudiante.nombres')}
                  </div>
                </TableHead>
                {mostrarColumnaCarrera && (
                  <TableHead
                    className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                    onClick={() => alternarOrden('estudiante.carrera.nombre')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        alternarOrden('estudiante.carrera.nombre');
                      }
                    }}
                    aria-sort={campoSort === 'estudiante.carrera.nombre' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                    title="Ordenar por Carrera"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Carrera</span>
                      {renderIconoOrden('estudiante.carrera.nombre')}
                    </div>
                  </TableHead>
                )}
                <TableHead
                  className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('convenio.institucion')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('convenio.institucion');
                    }
                  }}
                  aria-sort={campoSort === 'convenio.institucion' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Institución y Tutor"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Institución y Tutor</span>
                    {renderIconoOrden('convenio.institucion')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('horasCompletadas')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('horasCompletadas');
                    }
                  }}
                  aria-sort={campoSort === 'horasCompletadas' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Progreso"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Progreso</span>
                    {renderIconoOrden('horasCompletadas')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-center cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('fase')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('fase');
                    }
                  }}
                  aria-sort={campoSort === 'fase' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Fase"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Fase</span>
                    {renderIconoOrden('fase')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-center cursor-pointer hover:text-primary transition-colors select-none group"
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
                {mostrarColumnaAcciones && (
                  <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {estaPendiente ? (
                <EsqueletoFilasTablaEstudiantes
                  filas={paginaAsignaciones?.size || 10}
                  mostrarColumnaCarrera={mostrarColumnaCarrera}
                  mostrarColumnaAcciones={mostrarColumnaAcciones}
                />
              ) : listaAsignaciones.length > 0 ? (
                listaAsignaciones.map((item) => {
                  const horasAsignadas = item.horasAsignadas || 240;
                  const horasCompletadas = item.horasCompletadas || 0;
                  const porcentaje = Math.min(
                    100,
                    Math.round((horasCompletadas / horasAsignadas) * 100)
                  );
                  const nombreEstudiante = `${item.estudiante?.nombres || ''} ${item.estudiante?.apellidos || ''}`.trim() || 'Estudiante';
                  const identificacion = item.estudiante?.identificacion || 'Sin identificación';
                  const nombreTutor = item.tutorAcademico
                    ? `${item.tutorAcademico.nombres || ''} ${item.tutorAcademico.apellidos || ''}`.trim()
                    : null;
                  const estaFinalizadaNegativa = item.estado === 'REPROBADO' || item.estado === 'CANCELADO';
                  const tieneBotonCoordinador =
                    esCoordinador && (item.fase === 'ASIGNACION' || item.estado === 'EN_CURSO');
                  const tieneBotonTutor = esTutor && item.estado === 'EN_CURSO';
                  const tieneAccionesFila =
                    tieneBotonCoordinador ||
                    tieneBotonTutor;

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => manejarSeleccionarFila(item)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <TableCell>
                        <CeldaUsuarioTabla
                          nombre={nombreEstudiante}
                          identificacion={identificacion !== 'Sin identificación' ? identificacion : null}
                          correo={item.estudiante?.correo}
                          urlAvatar={item.estudiante?.urlAvatar}
                        />
                      </TableCell>

                      {mostrarColumnaCarrera && (
                        <TableCell className="text-sm text-muted-foreground">
                          {item.estudiante?.carreraNombre || '-'}
                        </TableCell>
                      )}

                      <TableCell>
                        <CeldaEntidadTutor
                          titulo={item.institucion || '-'}
                          nombreTutor={nombreTutor}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1.5 w-28">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-foreground">
                              {horasCompletadas} / {horasAsignadas}h
                            </span>
                            <span className="text-muted-foreground">{porcentaje}%</span>
                          </div>
                          <Progress value={porcentaje} className="h-1.5" />
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <BadgeFasePractica fase={item.fase} />
                      </TableCell>

                      <TableCell className="text-center">
                        <BadgeEstadoPractica estado={item.estado} />
                      </TableCell>

                      {mostrarColumnaAcciones && (
                        <TableCell className="text-right">
                          {estaFinalizadaNegativa ? (
                            <span className="text-xs text-muted-foreground font-medium italic">
                              No disponible
                            </span>
                          ) : tieneAccionesFila ? (
                            <>
                              {esCoordinador && (
                                <div className="flex justify-end gap-1">
                                  {item.estado === 'EN_CURSO' && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAsignacionACancelar(item);
                                      }}
                                      title="Cancelar práctica preprofesional"
                                      aria-label="Cancelar práctica preprofesional"
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {item.fase !== 'DESARROLLO' && item.fase !== 'FINALIZACION' && (
                                    <>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                                        disabled={!item.puedeEditar}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (alEditarAsignacion) {
                                            alEditarAsignacion(String(item.id));
                                          } else {
                                            setAsignacionAEditar(item);
                                          }
                                        }}
                                        title={item.puedeEditar ? 'Editar Asignación' : 'No modificable'}
                                        aria-label={item.puedeEditar ? 'Editar Asignación' : 'No modificable'}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        disabled={!item.puedeEditar}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (alEliminarAsignacion) {
                                            alEliminarAsignacion(String(item.id));
                                          } else {
                                            setAsignacionAEliminar(item);
                                          }
                                        }}
                                        title={item.puedeEditar ? 'Eliminar Asignación' : 'No modificable'}
                                        aria-label={item.puedeEditar ? 'Eliminar Asignación' : 'No modificable'}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                              {esTutor && item.estado === 'EN_CURSO' && (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 gap-1.5 shadow-2xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAsignacionAReprobar(item);
                                    }}
                                    title="Reprobar práctica preprofesional"
                                  >
                                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>Reprobar</span>
                                  </Button>
                                </div>
                              )}
                            </>
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
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={mostrarColumnaCarrera ? (mostrarColumnaAcciones ? 7 : 6) : (mostrarColumnaAcciones ? 6 : 5)}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No se encontraron asignaciones</p>
                      <p className="text-xs text-muted-foreground/80">
                        Intente cambiar los filtros o verifique las postulaciones de estudiantes.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Vista Móvil */}
        <div className="md:hidden divide-y divide-border">
          {estaPendiente ? (
            <EsqueletoTarjetasEstudiantes
              tarjetas={Math.min(paginaAsignaciones?.size || 4, 4)}
            />
          ) : listaAsignaciones.length === 0 ? (
            <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <UserCheck className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No se encontraron asignaciones</p>
              <p className="text-xs text-muted-foreground/80">
                Intente cambiar los filtros o verifique las postulaciones de estudiantes.
              </p>
            </div>
          ) : (
            listaAsignaciones.map((item) => {
              const horasAsignadas = item.horasAsignadas || 240;
              const horasCompletadas = item.horasCompletadas || 0;
              const porcentaje = Math.min(
                100,
                Math.round((horasCompletadas / horasAsignadas) * 100)
              );
              const nombreEstudiante = `${item.estudiante?.nombres || ''} ${item.estudiante?.apellidos || ''}`.trim() || 'Estudiante';
              const identificacion = item.estudiante?.identificacion || 'Sin identificación';
              const nombreTutor = item.tutorAcademico
                ? `${item.tutorAcademico.nombres || ''} ${item.tutorAcademico.apellidos || ''}`.trim()
                : null;
              const estaFinalizadaNegativa = item.estado === 'REPROBADO' || item.estado === 'CANCELADO';

              return (
                <div
                  key={item.id}
                  className="p-4 space-y-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Encabezado: Estudiante + Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CeldaUsuarioTabla
                        nombre={nombreEstudiante}
                        identificacion={identificacion !== 'Sin identificación' ? identificacion : null}
                        correo={item.estudiante?.correo}
                        urlAvatar={item.estudiante?.urlAvatar}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <BadgeEstadoPractica estado={item.estado} />
                      <BadgeFasePractica fase={item.fase} />
                    </div>
                  </div>

                  {/* Carrera para Subdecano */}
                  {mostrarColumnaCarrera && item.estudiante?.carreraNombre && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Carrera: </span>
                      <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.estudiante.carreraNombre}
                      </span>
                    </div>
                  )}

                  {/* Institución y Tutor */}
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50 min-w-0">
                    <CeldaEntidadTutor
                      titulo={item.institucion || '-'}
                      nombreTutor={nombreTutor}
                    />
                  </div>

                  {/* Progreso */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Horas Acumuladas:</span>
                      <span className="font-semibold text-foreground">
                        {horasCompletadas} / {horasAsignadas}h{' '}
                        <span className="text-muted-foreground font-normal">({porcentaje}%)</span>
                      </span>
                    </div>
                    <Progress value={porcentaje} className="h-1.5" />
                  </div>

                  {/* Acciones */}
                  <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => manejarSeleccionarFila(item)}
                      className="flex-1 min-h-[40px] text-xs font-medium text-foreground gap-1.5"
                    >
                      <span>Ver Ficha Completa</span>
                    </Button>

                    {estaFinalizadaNegativa ? (
                      <span className="text-xs text-muted-foreground font-medium italic py-1">
                        No disponible
                      </span>
                    ) : (
                      <>
                        {esCoordinador && !esInactivo && (
                          <>
                            {item.estado === 'EN_CURSO' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAsignacionACancelar(item);
                                }}
                                title="Cancelar práctica preprofesional"
                                aria-label="Cancelar práctica preprofesional"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            {item.fase !== 'DESARROLLO' && item.fase !== 'FINALIZACION' && (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                                  disabled={!item.puedeEditar}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (alEditarAsignacion) {
                                      alEditarAsignacion(String(item.id));
                                    } else {
                                      setAsignacionAEditar(item);
                                    }
                                  }}
                                  title={item.puedeEditar ? 'Editar Asignación' : 'No modificable'}
                                  aria-label={item.puedeEditar ? 'Editar Asignación' : 'No modificable'}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                  disabled={!item.puedeEditar}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (alEliminarAsignacion) {
                                      alEliminarAsignacion(String(item.id));
                                    } else {
                                      setAsignacionAEliminar(item);
                                    }
                                  }}
                                  title={item.puedeEditar ? 'Eliminar Asignación' : 'No modificable'}
                                  aria-label={item.puedeEditar ? 'Eliminar Asignación' : 'No modificable'}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </>
                        )}

                        {esTutor && !esInactivo && item.estado === 'EN_CURSO' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAsignacionAReprobar(item);
                            }}
                            title="Reprobar práctica preprofesional"
                          >
                            <XCircle className="h-4 w-4 shrink-0" />
                            <span>Reprobar</span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Paginador sincronizado con servidor y URL */}
      {paginaAsignaciones.totalPages > 0 && (
        <Paginador
          paginaActual={paginaAsignaciones.number}
          totalPaginas={paginaAsignaciones.totalPages}
          onCambioPagina={cambiarPagina}
          elementosPorPagina={paginaAsignaciones.size}
          onCambioElementosPorPagina={cambiarElementosPorPagina}
        />
      )}

      {/* Modal de Detalle del Estudiante */}
      <ModalDetalleEstudiante
        abierto={Boolean(asignacionDetalle)}
        alCerrar={cerrarModalDetalle}
        asignacion={asignacionDetalle}
        rol={rol}
        esInactivo={esInactivo}
      />

      {/* Modal de Edición de Asignación */}
      <ModalEditarAsignacionPractica
        asignacion={adaptarAsignacionParaDialogo(asignacionAEditar)}
        onClose={() => setAsignacionAEditar(null)}
        onSave={manejarGuardarEdicion}
      />

      {/* Modal Modular de Confirmación de Eliminación */}
      <ModalEliminarAsignacionPractica
        abierto={Boolean(asignacionAEliminar)}
        alCambiarAbierto={(abierto) => !abierto && setAsignacionAEliminar(null)}
        asignacion={asignacionAEliminar}
        alEliminadoExitoso={() => {
          setAsignacionAEliminar(null);
          router.refresh();
        }}
      />

      {/* Modal de Cancelación de Asignación / Práctica */}
      <ModalCancelarAsignacionPractica
        abierto={Boolean(asignacionACancelar)}
        alCambiarAbierto={(abierto) => !abierto && setAsignacionACancelar(null)}
        asignacion={asignacionACancelar}
        alConfirmar={() => {
          setAsignacionACancelar(null);
          router.refresh();
        }}
      />

      {/* Modal de Reprobación de Práctica (Tutor Académico) */}
      <ModalReprobarAsignacionPractica
        abierto={Boolean(asignacionAReprobar)}
        alCambiarAbierto={(abierto) => !abierto && setAsignacionAReprobar(null)}
        asignacion={asignacionAReprobar}
        alConfirmar={() => {
          setAsignacionAReprobar(null);
          router.refresh();
        }}
      />
    </div>
  );
}
