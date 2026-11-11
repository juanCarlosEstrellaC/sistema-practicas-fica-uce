'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';
import { RespuestaPaginada } from '@/lib/tipos/general';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';
import { ModalCrearProyecto } from './modal-crear-proyecto';
import { ModalEliminarProyecto } from './modal-eliminar-proyecto';
import { ModalReportesProyecto } from './modal-reportes-proyecto';
import { ModalDetalleProyecto } from './modal-detalle-proyecto';
import { BadgeEstadoProyecto } from './badge-estado-proyecto';
import { Paginador } from '@/components/paginador';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import {
  EsqueletoFilasTablaProyectos,
  EsqueletoTarjetasProyectos,
} from '@/components/esqueletos/esqueleto-tabla';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Calendar, FolderGit2, Plus, ArrowUpDown, ArrowUp, ArrowDown, FileText, Play, CheckCircle2, Loader2 } from 'lucide-react';
import { TienePermiso } from '@/components/autenticacion/tiene-permiso';
import { PERMISOS, tienePermiso } from '@/lib/seguridad/permisos';
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion';
import { iniciarProyectoComunitarioAccion, obtenerProyectoComunitarioPorIdAccion } from '@/lib/acciones/vcs/proyecto-comunitario.acciones';
import { toast } from 'sonner';

interface TablaProyectosProps {
  paginaProyectos: RespuestaPaginada<ProyectoComunitarioDto>;
  carreras: CarreraDto[];
  periodoId?: number;
  nombrePeriodo?: string;
  esPeriodoInactivo?: boolean;
}

export function TablaProyectos({
  paginaProyectos,
  carreras,
  periodoId = 1,
  nombrePeriodo,
  esPeriodoInactivo = false,
}: TablaProyectosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { usuario } = useAutenticacion();
  const [estaPendiente, iniciarTransicion] = useTransition();

  const [estaAbiertoModalDetalle, setEstaAbiertoModalDetalle] = useState(false);
  const [estaAbiertoModalCrear, setEstaAbiertoModalCrear] = useState(false);
  const [estaAbiertoModalEliminar, setEstaAbiertoModalEliminar] = useState(false);
  const [estaAbiertoModalReportes, setEstaAbiertoModalReportes] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ProyectoComunitarioDto | null>(null);
  const [estaIniciandoProyectoId, setEstaIniciandoProyectoId] = useState<number | null>(null);

  useEffect(() => {
    const proyectoIdParam = searchParams.get('proyectoId');
    const abrirReportesParam = searchParams.get('abrirReportes');

    if (proyectoIdParam && abrirReportesParam === 'true') {
      const pId = Number(proyectoIdParam);
      const proyectoEncontrado = paginaProyectos?.content?.find((p) => p.id === pId);
      if (proyectoEncontrado) {
        setProyectoSeleccionado(proyectoEncontrado);
        setEstaAbiertoModalReportes(true);
      } else {
        obtenerProyectoComunitarioPorIdAccion(pId, periodoId).then((res) => {
          if (res) {
            setProyectoSeleccionado(res);
            setEstaAbiertoModalReportes(true);
          }
        });
      }
    }
  }, [searchParams, paginaProyectos, periodoId]);

  const esTutor = usuario?.rol === 'TUTOR_ACADEMICO';
  const puedeEditar = tienePermiso(usuario?.rol, PERMISOS.PROYECTOS_EDITAR);
  const puedeEliminar = tienePermiso(usuario?.rol, PERMISOS.PROYECTOS_ELIMINAR);
  const puedeVerReportes =
    tienePermiso(usuario?.rol, PERMISOS.REPORTES_SUBIR) ||
    tienePermiso(usuario?.rol, PERMISOS.REPORTES_REVISAR);

  const puedeVerAcciones = puedeEditar || puedeEliminar || puedeVerReportes || esTutor;

  const manejarIniciarProyecto = async (proyecto: ProyectoComunitarioDto) => {
    if (esPeriodoInactivo) {
      toast.error('No se puede iniciar el proyecto en un periodo académico inactivo.');
      return;
    }
    try {
      setEstaIniciandoProyectoId(proyecto.id);
      const res = await iniciarProyectoComunitarioAccion(proyecto.id, periodoId);
      if (res.exito) {
        toast.success(res.mensaje || 'Proyecto iniciado con éxito. Estudiantes en fase de desarrollo.');
        router.refresh();
      } else {
        toast.error(res.mensaje || 'No se pudo iniciar el proyecto.');
      }
    } catch (err: any) {
      toast.error('Ocurrió un error al iniciar el proyecto.');
    } finally {
      setEstaIniciandoProyectoId(null);
    }
  };

  const sortActual = searchParams.get('sort') || 'fechaCreacion,desc';
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

  const abrirDetalle = (proyecto: ProyectoComunitarioDto) => {
    setProyectoSeleccionado(proyecto);
    setEstaAbiertoModalDetalle(true);
  };

  const abrirCrear = () => {
    setProyectoSeleccionado(null);
    setEstaAbiertoModalCrear(true);
  };

  const abrirEditar = (proyecto: ProyectoComunitarioDto) => {
    setProyectoSeleccionado(proyecto);
    setEstaAbiertoModalCrear(true);
  };

  const abrirEliminar = (proyecto: ProyectoComunitarioDto) => {
    setProyectoSeleccionado(proyecto);
    setEstaAbiertoModalEliminar(true);
  };

  const abrirReportes = (proyecto: ProyectoComunitarioDto) => {
    setProyectoSeleccionado(proyecto);
    setEstaAbiertoModalReportes(true);
  };

  return (
    <div className="space-y-4">
      {/* Barra de cabecera con botón de acción */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Listado de Proyectos Comunitarios
          </h2>
          <p className="text-xs text-muted-foreground">
            Total de proyectos registrados:{' '}
            <span className="font-semibold text-foreground">{paginaProyectos.totalElements}</span>
          </p>
        </div>

        <TienePermiso roles={PERMISOS.PROYECTOS_CREAR}>
          <Button onClick={abrirCrear} className="h-9 gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </TienePermiso>
      </div>

      {/* Tabla (Desktop) y Tarjetas (Mobile) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
                <TableHead
                  className="w-[32%] font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('nombre')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('nombre');
                    }
                  }}
                  aria-sort={campoSort === 'nombre' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Proyecto"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Proyecto</span>
                    {renderIconoOrden('nombre')}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[23%] font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('carrera.nombre')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('carrera.nombre');
                    }
                  }}
                  aria-sort={campoSort === 'carrera.nombre' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Carrera"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Carrera</span>
                    {renderIconoOrden('carrera.nombre')}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[15%] font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('fechaInicio')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('fechaInicio');
                    }
                  }}
                  aria-sort={campoSort === 'fechaInicio' ? (direccionSort === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Fechas"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Fechas</span>
                    {renderIconoOrden('fechaInicio')}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[12%] font-semibold text-center cursor-pointer hover:text-primary transition-colors select-none group"
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
                  <TableHead className="w-[18%] font-semibold text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {estaPendiente ? (
                <EsqueletoFilasTablaProyectos
                  filas={paginaProyectos?.size || 10}
                  puedeVerAcciones={puedeVerAcciones}
                />
              ) : (!paginaProyectos?.content || paginaProyectos.content.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={puedeVerAcciones ? 5 : 4} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderGit2 className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No se encontraron proyectos comunitarios</p>
                      <p className="text-xs text-muted-foreground/80">
                        Intente cambiar los filtros o registre un nuevo proyecto.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginaProyectos.content.map((proyecto) => (
                  <TableRow
                    key={proyecto.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('button')) {
                        abrirDetalle(proyecto);
                      }
                    }}
                  >
                    {/* Nombre y tutor */}
                    <TableCell>
                      <div className="font-semibold text-sm text-foreground leading-tight">
                        {proyecto.nombre}
                      </div>
                      {proyecto.nombreCompletoTutor && (
                        <div className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                          <span>Tutor: {proyecto.nombreCompletoTutor}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Carrera */}
                    <TableCell>
                      <span className="text-xs font-medium text-foreground/90 bg-muted px-2 py-1 rounded-md">
                        {proyecto.nombreCarrera || `Carrera ID: ${proyecto.carreraId}`}
                      </span>
                    </TableCell>

                    {/* Fechas */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground/60" />
                          {formatearFechaCorta(proyecto.fechaInicio)}
                        </span>
                        <span className="text-[10px] pl-4 text-muted-foreground/70">
                          al {formatearFechaCorta(proyecto.fechaFin)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center">
                      <BadgeEstadoProyecto estado={proyecto.estado} />
                    </TableCell>

                    {/* Acciones */}
                    {puedeVerAcciones && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Iniciar Proyecto (Tutor Académico asignado) */}
                          {esTutor && (
                            proyecto.iniciado ? (
                              <span
                                title="El proyecto ya fue iniciado y está en desarrollo"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-md px-2.5 py-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Iniciado
                              </span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => manejarIniciarProyecto(proyecto)}
                                disabled={
                                  esPeriodoInactivo ||
                                  estaIniciandoProyectoId === proyecto.id ||
                                  proyecto.estado !== 'ACTIVO'
                                }
                                title={
                                  esPeriodoInactivo
                                    ? 'Periodo académico inactivo (modo solo lectura)'
                                    : 'Iniciar Proyecto y habilitar fase de desarrollo a los estudiantes del periodo'
                                }
                                className="h-8 gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-xs"
                              >
                                {estaIniciandoProyectoId === proyecto.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 fill-emerald-600/30 text-emerald-600" />
                                )}
                                Iniciar proyecto
                              </Button>
                            )
                          )}

                          {/* Reportes de Proyecto */}
                          {puedeVerReportes && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirReportes(proyecto)}
                              title="Informes y Seguimiento del Proyecto Comunitario"
                              className="h-7 px-2.5 text-xs font-medium text-primary border-primary/20 hover:bg-primary/10 gap-1.5 shadow-2xs"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Reportes</span>
                            </Button>
                          )}

                          {/* Editar Proyecto */}
                          <TienePermiso roles={PERMISOS.PROYECTOS_EDITAR}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirEditar(proyecto)}
                              title="Editar proyecto"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TienePermiso>

                          {/* Eliminar Proyecto */}
                          <TienePermiso roles={PERMISOS.PROYECTOS_ELIMINAR}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirEliminar(proyecto)}
                              title="Eliminar proyecto"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TienePermiso>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Vista Móvil */}
        <div className="md:hidden divide-y divide-border">
          {estaPendiente ? (
            <EsqueletoTarjetasProyectos
              tarjetas={Math.min(paginaProyectos?.size || 4, 4)}
            />
          ) : (!paginaProyectos?.content || paginaProyectos.content.length === 0) ? (
            <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <FolderGit2 className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No se encontraron proyectos comunitarios</p>
              <p className="text-xs text-muted-foreground/80">
                Intente cambiar los filtros o registre un nuevo proyecto.
              </p>
            </div>
          ) : (
            paginaProyectos.content.map((proyecto) => (
              <div key={proyecto.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                {/* Cabecera Tarjeta: Título + Estado */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground leading-tight">
                      {proyecto.nombre}
                    </h3>
                    {proyecto.nombreCompletoTutor && (
                      <p className="text-xs text-primary font-medium mt-1 truncate">
                        Tutor: {proyecto.nombreCompletoTutor}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <BadgeEstadoProyecto estado={proyecto.estado} />
                  </div>
                </div>

                {/* Carrera y Fechas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs">
                  <span className="font-medium text-foreground/90 bg-muted px-2 py-0.5 rounded-md truncate max-w-full self-start">
                    {proyecto.nombreCarrera || `Carrera ID: ${proyecto.carreraId}`}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    <span>
                      {formatearFechaCorta(proyecto.fechaInicio)} al {formatearFechaCorta(proyecto.fechaFin)}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirDetalle(proyecto)}
                    className="flex-1 min-h-[40px] text-xs font-medium text-foreground gap-1.5"
                  >
                    <span>Ver Detalle</span>
                  </Button>

                  {puedeVerAcciones && (
                    <>
                      {/* Iniciar Proyecto (Tutor) */}
                      {esTutor && (
                        proyecto.iniciado ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-md px-2.5 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Iniciado
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => manejarIniciarProyecto(proyecto)}
                            disabled={
                              esPeriodoInactivo ||
                              estaIniciandoProyectoId === proyecto.id ||
                              proyecto.estado !== 'ACTIVO'
                            }
                            className="flex-1 min-h-[40px] text-xs font-medium text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1.5"
                          >
                            {estaIniciandoProyectoId === proyecto.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5 fill-emerald-600/30 text-emerald-600" />
                            )}
                            <span>Iniciar proyecto</span>
                          </Button>
                        )
                      )}

                      {/* Reportes de Proyecto */}
                      {puedeVerReportes && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirReportes(proyecto)}
                          className="flex-1 min-h-[40px] text-xs font-medium text-primary border-primary/20 hover:bg-primary/10 gap-1.5"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span>Reportes</span>
                        </Button>
                      )}

                      {/* Editar Proyecto */}
                      <TienePermiso roles={PERMISOS.PROYECTOS_EDITAR}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEditar(proyecto)}
                          title="Editar proyecto"
                          className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TienePermiso>

                      {/* Eliminar Proyecto */}
                      <TienePermiso roles={PERMISOS.PROYECTOS_ELIMINAR}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEliminar(proyecto)}
                          title="Eliminar proyecto"
                          className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TienePermiso>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginador */}
      {paginaProyectos.totalPages > 0 && (
        <Paginador
          paginaActual={paginaProyectos.number}
          totalPaginas={paginaProyectos.totalPages}
          onCambioPagina={cambiarPagina}
          elementosPorPagina={paginaProyectos.size}
          onCambioElementosPorPagina={cambiarElementosPorPagina}
        />
      )}

      {/* Modales */}
      <ModalDetalleProyecto
        proyecto={proyectoSeleccionado}
        abierto={estaAbiertoModalDetalle}
        alCerrar={() => setEstaAbiertoModalDetalle(false)}
      />

      <ModalCrearProyecto
        abierto={estaAbiertoModalCrear}
        abrirModal={setEstaAbiertoModalCrear}
        proyectoAEditar={proyectoSeleccionado}
        carreras={carreras}
      />

      <ModalEliminarProyecto
        abierto={estaAbiertoModalEliminar}
        abrirModal={setEstaAbiertoModalEliminar}
        proyecto={proyectoSeleccionado}
      />

      <ModalReportesProyecto
        abierto={estaAbiertoModalReportes}
        abrirModal={(abierto) => {
          setEstaAbiertoModalReportes(abierto);
          if (!abierto) {
            const params = new URLSearchParams(searchParams.toString());
            if (params.has('abrirReportes') || params.has('proyectoId')) {
              params.delete('abrirReportes');
              params.delete('proyectoId');
              const nuevoQuery = params.toString() ? `?${params.toString()}` : '';
              router.replace(`${pathname}${nuevoQuery}`, { scroll: false });
            }
          }
        }}
        proyecto={proyectoSeleccionado}
        periodoId={periodoId}
        nombrePeriodo={nombrePeriodo}
        esPeriodoInactivo={esPeriodoInactivo}
      />
    </div>
  );
}
