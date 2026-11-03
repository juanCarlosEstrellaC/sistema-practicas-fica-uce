'use client';

import { useState, useMemo } from 'react';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';
import { BadgeEstadoConvenio } from '@/components/practicas/badges/badge-estado-convenio';
import { Paginador } from '@/components/paginador';
import { cn } from '@/lib/utils';
import { formatearFecha } from '@/lib/utilidades/fechas';
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
import { Clock, Edit, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Plus, Building2 } from 'lucide-react';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import {
  EsqueletoFilasTablaConvenios,
  EsqueletoTarjetasConvenios,
} from '@/components/esqueletos/esqueleto-tabla';

export interface TablaConveniosProps {
  convenios: ConvenioDto[];
  totalPaginas: number;
  totalElementos: number;
  paginaActual: number;
  elementosPorPagina: number;
  esSubdecano: boolean;
  estaCargando?: boolean;
  alVerDetalle: (convenio: ConvenioDto) => void;
  alEditar?: (convenio: ConvenioDto) => void;
  alEliminar?: (convenio: ConvenioDto) => void;
  alSugerirAnulacion?: (convenio: ConvenioDto) => void;
  alAbrirNuevoConvenio?: () => void;
  alAbrirSugerirConvenio?: () => void;
  onCambioPagina: (pagina: number) => void;
  onCambioElementosPorPagina: (elementos: number) => void;
}

export function TablaConvenios({
  convenios,
  totalPaginas,
  totalElementos,
  paginaActual,
  elementosPorPagina,
  esSubdecano,
  estaCargando = false,
  alVerDetalle,
  alEditar,
  alEliminar,
  alSugerirAnulacion,
  alAbrirNuevoConvenio,
  alAbrirSugerirConvenio,
  onCambioPagina,
  onCambioElementosPorPagina,
}: TablaConveniosProps) {
  const [campoOrden, setCampoOrden] = useState<'institucion' | 'estado' | 'vigencia' | 'cupos'>('institucion');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: 'institucion' | 'estado' | 'vigencia' | 'cupos') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'institucion' | 'estado' | 'vigencia' | 'cupos') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const conveniosOrdenados = useMemo(() => {
    return [...convenios].sort((a, b) => {
      if (campoOrden === 'institucion') {
        const instA = (a.institucion || '').toLowerCase();
        const instB = (b.institucion || '').toLowerCase();
        return direccionOrden === 'asc' ? instA.localeCompare(instB) : instB.localeCompare(instA);
      } else if (campoOrden === 'estado') {
        const estA = (a.estado || '').toLowerCase();
        const estB = (b.estado || '').toLowerCase();
        return direccionOrden === 'asc' ? estA.localeCompare(estB) : estB.localeCompare(estA);
      } else if (campoOrden === 'vigencia') {
        const fechaA = new Date(a.fechaFin || 0).getTime();
        const fechaB = new Date(b.fechaFin || 0).getTime();
        return direccionOrden === 'asc' ? fechaA - fechaB : fechaB - fechaA;
      } else {
        const ocupadosA = a.ocupados || 0;
        const ocupadosB = b.ocupados || 0;
        return direccionOrden === 'asc' ? ocupadosA - ocupadosB : ocupadosB - ocupadosA;
      }
    });
  }, [convenios, campoOrden, direccionOrden]);

  return (
    <div className="space-y-4">
      {/* Barra de cabecera con botón de acción (Patrón VCS) */}
      <CabeceraListado
        titulo="Listado de Convenios Institucionales"
        total={totalElementos}
        etiquetaTotal="Total de convenios registrados"
        accion={
          esSubdecano ? (
            alAbrirNuevoConvenio && (
              <Button onClick={alAbrirNuevoConvenio} className="h-9 gap-1.5 shadow-sm font-semibold">
                <Plus className="h-4 w-4" />
                Nuevo Convenio
              </Button>
            )
          ) : (
            alAbrirSugerirConvenio && (
              <Button onClick={alAbrirSugerirConvenio} className="h-9 gap-1.5 shadow-sm font-semibold">
                <Plus className="h-4 w-4" />
                Sugerir nuevo convenio
              </Button>
            )
          )
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
                  className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('institucion')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('institucion');
                    }
                  }}
                  aria-sort={campoOrden === 'institucion' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Institución"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Institución</span>
                    {renderIconoOrden('institucion')}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('estado')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('estado');
                    }
                  }}
                  aria-sort={campoOrden === 'estado' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Estado"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Estado</span>
                    {renderIconoOrden('estado')}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('vigencia')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('vigencia');
                    }
                  }}
                  aria-sort={campoOrden === 'vigencia' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Vigencia"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Vigencia</span>
                    {renderIconoOrden('vigencia')}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('cupos')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('cupos');
                    }
                  }}
                  aria-sort={campoOrden === 'cupos' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Estudiantes Asignados"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Estudiantes Asignados</span>
                    {renderIconoOrden('cupos')}
                  </div>
                </TableHead>
                <TableHead className="text-right font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estaCargando ? (
                <EsqueletoFilasTablaConvenios
                  filas={elementosPorPagina || 5}
                  mostrarColumnaAcciones={true}
                />
              ) : conveniosOrdenados.length > 0 ? (
                conveniosOrdenados.map((convenio) => {
                  const ocupados = convenio.ocupados || 0;
                  const totalCupos = convenio.cuposTotales || 0;
                  const porcentajeOcupacion =
                    totalCupos > 0 ? (ocupados / totalCupos) * 100 : 0;

                  return (
                    <TableRow
                      key={convenio.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={(e) => {
                        if (!(e.target as HTMLElement).closest('button')) {
                          alVerDetalle(convenio);
                        }
                      }}
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground leading-snug">
                            {convenio.institucion}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {convenio.tutorInstitucional || 'Por designar'}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <BadgeEstadoConvenio estado={convenio.estado} />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium tabular-nums">
                          <Clock className="w-3.5 h-3.5 opacity-70" />
                          {formatearFecha(convenio.fechaFin, false)}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                          <span className="text-xs font-bold tabular-nums text-foreground">
                            {ocupados}/{totalCupos}
                          </span>
                          <Progress
                            value={porcentajeOcupacion}
                            className={cn(
                              'w-24 h-1.5 transition-all',
                              porcentajeOcupacion > 80
                                ? '[&>div]:bg-destructive'
                                : '[&>div]:bg-primary'
                            )}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {(() => {
                            const estaAnulado = convenio.estado === 'ANULADO';

                            if (esSubdecano) {
                              return (
                                <>
                                  {alEditar && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Editar"
                                      className="h-8 w-8 text-primary hover:bg-primary/10"
                                      onClick={() => alEditar(convenio)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {alEliminar && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title={estaAnulado ? 'Convenio ya anulado' : 'Eliminar'}
                                      disabled={estaAnulado}
                                      className={cn(
                                        'h-8 w-8',
                                        estaAnulado
                                          ? 'opacity-30 cursor-not-allowed text-muted-foreground hover:bg-transparent'
                                          : 'text-destructive hover:bg-destructive/10'
                                      )}
                                      onClick={() => !estaAnulado && alEliminar(convenio)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </>
                              );
                            }

                            return (
                              alSugerirAnulacion && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={estaAnulado ? 'Convenio ya anulado' : 'Sugerir anulación'}
                                  disabled={estaAnulado}
                                  className={cn(
                                    'h-8 w-8',
                                    estaAnulado
                                      ? 'opacity-30 cursor-not-allowed text-muted-foreground hover:bg-transparent'
                                      : 'text-destructive hover:bg-destructive/10'
                                  )}
                                  onClick={() => !estaAnulado && alSugerirAnulacion(convenio)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )
                            );
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No se encontraron convenios institucionales</p>
                      <p className="text-xs text-muted-foreground/80">
                        Intente cambiar los filtros o registre un nuevo convenio.
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
          {estaCargando ? (
            <EsqueletoTarjetasConvenios
              tarjetas={Math.min(elementosPorPagina || 3, 3)}
            />
          ) : conveniosOrdenados.length === 0 ? (
            <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Building2 className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No se encontraron convenios institucionales</p>
              <p className="text-xs text-muted-foreground/80">
                Intente cambiar los filtros o registre un nuevo convenio.
              </p>
            </div>
          ) : (
            conveniosOrdenados.map((convenio) => {
              const ocupados = convenio.ocupados || 0;
              const totalCupos = convenio.cuposTotales || 0;
              const porcentajeOcupacion =
                totalCupos > 0 ? (ocupados / totalCupos) * 100 : 0;
              const estaAnulado = convenio.estado === 'ANULADO';

              return (
                <div
                  key={convenio.id}
                  className="p-4 space-y-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Cabecera Tarjeta: Institución + Estado */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground leading-tight">
                        {convenio.institucion}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        Tutor: {convenio.tutorInstitucional || 'Por designar'}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <BadgeEstadoConvenio estado={convenio.estado} />
                    </div>
                  </div>

                  {/* Vigencia */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 opacity-70 shrink-0" />
                    <span>Vigencia hasta: {formatearFecha(convenio.fechaFin, false)}</span>
                  </div>

                  {/* Cupos Asignados */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Estudiantes Asignados:</span>
                      <span className="font-bold text-foreground">
                        {ocupados}/{totalCupos} ({Math.round(porcentajeOcupacion)}%)
                      </span>
                    </div>
                    <Progress
                      value={porcentajeOcupacion}
                      className={cn(
                        'w-full h-1.5 transition-all',
                        porcentajeOcupacion > 80
                          ? '[&>div]:bg-destructive'
                          : '[&>div]:bg-primary'
                      )}
                    />
                  </div>

                  {/* Acciones */}
                  <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alVerDetalle(convenio)}
                      className="flex-1 min-h-[40px] text-xs font-medium text-foreground gap-1.5"
                    >
                      <span>Ver Detalle</span>
                    </Button>

                    {esSubdecano && (
                      <>
                        {alEditar && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Editar convenio"
                            onClick={() => alEditar(convenio)}
                            className="h-9 w-9 p-0 text-primary border-primary/20 hover:bg-primary/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {alEliminar && (
                          <Button
                            variant="outline"
                            size="sm"
                            title={estaAnulado ? 'Convenio ya anulado' : 'Eliminar convenio'}
                            disabled={estaAnulado}
                            onClick={() => !estaAnulado && alEliminar(convenio)}
                            className={cn(
                              'h-9 w-9 p-0',
                              estaAnulado
                                ? 'opacity-30 cursor-not-allowed text-muted-foreground'
                                : 'text-destructive border-destructive/20 hover:bg-destructive/10'
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}

                    {!esSubdecano && alSugerirAnulacion && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={estaAnulado}
                        onClick={() => !estaAnulado && alSugerirAnulacion(convenio)}
                        className={cn(
                          'h-9 w-9 p-0',
                          estaAnulado
                            ? 'opacity-30 cursor-not-allowed text-muted-foreground'
                            : 'text-destructive border-destructive/20 hover:bg-destructive/10'
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Paginador
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambioPagina={onCambioPagina}
        elementosPorPagina={elementosPorPagina}
        onCambioElementosPorPagina={onCambioElementosPorPagina}
      />
    </div>
  );
}
