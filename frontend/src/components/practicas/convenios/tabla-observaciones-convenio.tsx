'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ObservacionDto } from '@/lib/tipos/pp/general-pp';
import { obtenerObservacionPorIdAccion } from '@/lib/acciones/pp/observacion.acciones';
import { desglosarDescripcionObservacion } from '@/lib/utilidades/observaciones';
import { formatearFecha } from '@/lib/utilidades/fechas';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { ModalProcesarObservacion } from './modal-procesar-observacion';
import { Paginador } from '@/components/paginador';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
} from 'lucide-react';

export interface TablaObservacionesConvenioProps {
  observaciones: ObservacionDto[];
  totalPaginas: number;
  totalElementos: number;
  paginaActual: number;
  elementosPorPagina: number;
  esSubdecano: boolean;
  filtroTexto: string;
  filtroTipo: string;
  filtroEstado: string;
  onCambioFiltroTexto: (texto: string) => void;
  onCambioFiltroTipo: (tipo: string) => void;
  onCambioFiltroEstado: (estado: string) => void;
  onCambioPagina: (pagina: number) => void;
  onCambioElementosPorPagina: (elementos: number) => void;
  alProcesarExitoso?: () => void;
}

export function TablaObservacionesConvenio({
  observaciones,
  totalPaginas,
  totalElementos,
  paginaActual,
  elementosPorPagina,
  esSubdecano,
  filtroTexto,
  filtroTipo,
  filtroEstado,
  onCambioFiltroTexto,
  onCambioFiltroTipo,
  onCambioFiltroEstado,
  onCambioPagina,
  onCambioElementosPorPagina,
  alProcesarExitoso,
}: TablaObservacionesConvenioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [observacionSeleccionada, setObservacionSeleccionada] = useState<ObservacionDto | null>(null);

  // Apertura directa por notificación mediante searchParams (deep-linking resiliente a la paginación)
  useEffect(() => {
    const observacionIdParam = searchParams.get('observacionId');
    const abrirObservacionParam = searchParams.get('abrirObservacion');

    if (observacionIdParam && (abrirObservacionParam === 'true' || observacionIdParam)) {
      const obsId = Number(observacionIdParam);
      const encontrada = observaciones.find((o) => Number(o.id) === obsId);
      if (encontrada) {
        setObservacionSeleccionada(encontrada);
      } else {
        obtenerObservacionPorIdAccion(obsId).then((res) => {
          if (res) {
            setObservacionSeleccionada(res);
          }
        });
      }
    }
  }, [searchParams, observaciones]);

  const obtenerNombreRemitente = (obs?: ObservacionDto | null) => {
    if (!obs) return 'Remitente';
    if (obs.remitente) {
      const nombres = obs.remitente.nombres || '';
      const apellidos = obs.remitente.apellidos || '';
      const nombreCompleto = `${nombres} ${apellidos}`.trim();
      if (nombreCompleto) return nombreCompleto;
    }
    if (obs.remitenteNombre) return obs.remitenteNombre;
    return `Usuario (ID: ${obs.remitenteId})`;
  };

  const obtenerCarreraRemitente = (obs?: ObservacionDto | null) => {
    if (!obs) return '';
    return obs.carreraNombre || obs.remitente?.carreraNombre || '';
  };

  const [campoOrden, setCampoOrden] = useState<'empresa' | 'tipo' | 'remitente' | 'estado' | 'descripcion'>('empresa');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: 'empresa' | 'tipo' | 'remitente' | 'estado' | 'descripcion') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'empresa' | 'tipo' | 'remitente' | 'estado' | 'descripcion') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const observacionesOrdenadas = useMemo(() => {
    return [...observaciones].sort((a, b) => {
      if (campoOrden === 'empresa') {
        const valA = (a.empresa || '').toLowerCase();
        const valB = (b.empresa || '').toLowerCase();
        return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (campoOrden === 'tipo') {
        const valA = (a.tipo || '').toLowerCase();
        const valB = (b.tipo || '').toLowerCase();
        return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (campoOrden === 'remitente') {
        const valA = obtenerNombreRemitente(a).toLowerCase();
        const valB = obtenerNombreRemitente(b).toLowerCase();
        return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (campoOrden === 'estado') {
        const valA = (a.estado || '').toLowerCase();
        const valB = (b.estado || '').toLowerCase();
        return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        const valA = (a.descripcion || '').toLowerCase();
        const valB = (b.descripcion || '').toLowerCase();
        return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
    });
  }, [observaciones, campoOrden, direccionOrden]);

  const renderBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'APROBADA':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold gap-1 py-0.5 px-2 text-xs shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Aprobada
          </Badge>
        );
      case 'RECHAZADA':
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-semibold gap-1 py-0.5 px-2 text-xs shadow-2xs"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Rechazada
          </Badge>
        );
      case 'PENDIENTE':
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 font-semibold gap-1 py-0.5 px-2 text-xs shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Pendiente
          </Badge>
        );
    }
  };

  const renderBadgeTipo = (tipo: string) => {
    const esAnulacion = tipo === 'ANULACION';
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium px-2 py-0.5 gap-1 shadow-2xs',
          esAnulacion
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        )}
      >
        {esAnulacion ? (
          <>
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Anulación
          </>
        ) : (
          <>
            <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Nuevo Convenio
          </>
        )}
      </Badge>
    );
  };

  const cerrarModal = () => {
    setObservacionSeleccionada(null);
    if (searchParams.has('abrirObservacion') || searchParams.has('observacionId')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('abrirObservacion');
      params.delete('observacionId');
      const nuevaConsulta = params.toString();
      router.replace(nuevaConsulta ? `${pathname}?${nuevaConsulta}` : pathname);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por institución o empresa..."
              value={filtroTexto}
              onChange={(e) => onCambioFiltroTexto(e.target.value)}
              className="pl-9 h-9 w-full placeholder:truncate"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 justify-end">
            <div className="w-full sm:w-[170px] min-w-0">
              <Select value={filtroTipo} onValueChange={onCambioFiltroTipo}>
                <SelectTrigger className="h-9 w-full">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="NUEVA">Nuevo Convenio</SelectItem>
                  <SelectItem value="ANULACION">Anulación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[170px] min-w-0">
              <Select value={filtroEstado} onValueChange={onCambioFiltroEstado}>
                <SelectTrigger className="h-9 w-full">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="APROBADA">Aprobada</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Cabecera del Listado (Patrón VCS) */}
      <CabeceraListado
        titulo="Listado de Sugerencias y Observaciones"
        total={totalElementos}
        etiquetaTotal="Total de sugerencias registradas"
      />

      {/* 1. VISTA MÓVIL: Tarjetas Modulares (md:hidden) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {observacionesOrdenadas.length === 0 ? (
          <div className="rounded-xl border border-border/70 bg-card p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center opacity-60">
              <Clock className="w-8 h-8 mb-2" />
              <p className="font-medium">
                {esSubdecano
                  ? 'No existen observaciones o trámites pendientes.'
                  : 'No ha registrado observaciones que coincidan con la búsqueda.'}
              </p>
            </div>
          </div>
        ) : (
          observacionesOrdenadas.map((obs) => {
            const desglose = desglosarDescripcionObservacion(obs.descripcion);

            return (
              <div
                key={obs.id}
                onClick={() => setObservacionSeleccionada(obs)}
                className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                {/* Cabecera Tarjeta: Empresa y Estado */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate" title={obs.empresa}>
                      {obs.empresa}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0 opacity-70" />
                      {formatearFecha(obs.fecha, false)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {renderBadgeEstado(obs.estado)}
                    {renderBadgeTipo(obs.tipo)}
                  </div>
                </div>

                {/* Remitente si es Subdecano */}
                {esSubdecano && (
                  <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2 text-muted-foreground">
                    <span className="text-[11px] font-medium">Remitente:</span>
                    <div className="flex items-center gap-1.5 max-w-[200px] truncate">
                      <AvatarUsuario
                        nombre={obtenerNombreRemitente(obs)}
                        urlFoto={obs.remitente?.urlAvatar}
                        tamano="xs"
                      />
                      <span className="font-semibold text-foreground truncate text-xs">
                        {obtenerNombreRemitente(obs)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Descripción / Justificación y Motivo de Rechazo */}
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Propuesta / Justificación
                  </span>
                  <p className="text-xs text-foreground/90 font-medium leading-relaxed line-clamp-2" title={desglose.descripcion}>
                    {desglose.descripcion || (
                      <span className="italic text-muted-foreground">Sin justificación detallada</span>
                    )}
                  </p>

                  {desglose.motivoRechazo && (
                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                      <div className="min-w-0">
                        <span className="font-semibold block text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400">
                          Motivo de rechazo
                        </span>
                        <p className="text-foreground/90 font-normal text-xs mt-0.5 line-clamp-2" title={desglose.motivoRechazo}>
                          {desglose.motivoRechazo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón Ver Detalle */}
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-9 text-xs font-semibold text-primary hover:bg-primary/10 justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setObservacionSeleccionada(obs);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Ver y Procesar Trámite</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. VISTA ESCRITORIO: Tabla estructurada (hidden md:block) */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
              <TableHead
                className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group min-w-[200px]"
                onClick={() => alternarOrden('empresa')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('empresa');
                  }
                }}
                aria-sort={campoOrden === 'empresa' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Institución / Empresa"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Institución / Empresa</span>
                  {renderIconoOrden('empresa')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold cursor-pointer hover:text-primary transition-colors select-none group w-[140px]"
                onClick={() => alternarOrden('tipo')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('tipo');
                  }
                }}
                aria-sort={campoOrden === 'tipo' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Tipo"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Tipo</span>
                  {renderIconoOrden('tipo')}
                </div>
              </TableHead>
              {esSubdecano && (
                <TableHead
                  className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group min-w-[170px]"
                  onClick={() => alternarOrden('remitente')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('remitente');
                    }
                  }}
                  aria-sort={campoOrden === 'remitente' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Remitente"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Remitente</span>
                    {renderIconoOrden('remitente')}
                  </div>
                </TableHead>
              )}
              <TableHead
                className="text-center font-semibold cursor-pointer hover:text-primary transition-colors select-none group w-[130px]"
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
                className="font-semibold cursor-pointer hover:text-primary transition-colors select-none group min-w-[250px]"
                onClick={() => alternarOrden('descripcion')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('descripcion');
                  }
                }}
                aria-sort={campoOrden === 'descripcion' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Descripción"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Descripción / Justificación</span>
                  {renderIconoOrden('descripcion')}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold pr-4 w-[90px]">
                <span>Acción</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {observacionesOrdenadas.length > 0 ? (
              observacionesOrdenadas.map((obs) => {
                const desglose = desglosarDescripcionObservacion(obs.descripcion);

                return (
                  <TableRow
                    key={obs.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setObservacionSeleccionada(obs)}
                  >
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground leading-snug truncate" title={obs.empresa}>
                          {obs.empresa}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0 opacity-70" />
                          {formatearFecha(obs.fecha, false)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {renderBadgeTipo(obs.tipo)}
                    </TableCell>

                    {esSubdecano && (
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <AvatarUsuario
                            nombre={obtenerNombreRemitente(obs)}
                            urlFoto={obs.remitente?.urlAvatar}
                            tamano="xs"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                              {obtenerNombreRemitente(obs)}
                            </p>
                            {obtenerCarreraRemitente(obs) && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={obtenerCarreraRemitente(obs)}>
                                {obtenerCarreraRemitente(obs)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className="text-center">
                      {renderBadgeEstado(obs.estado)}
                    </TableCell>

                    <TableCell className="min-w-[260px] max-w-[380px]">
                      <div className="space-y-1.5 py-1">
                        <p
                          className="text-xs text-foreground/90 font-medium leading-relaxed line-clamp-2"
                          title={desglose.descripcion}
                        >
                          {desglose.descripcion || (
                            <span className="italic text-muted-foreground">Sin justificación detallada</span>
                          )}
                        </p>

                        {desglose.motivoRechazo && (
                          <div className="flex items-start gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-rose-700 dark:text-rose-400 text-[11px] leading-snug">
                            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                            <div className="min-w-0">
                              <span className="font-semibold text-rose-700 dark:text-rose-400">Motivo de rechazo:</span>{' '}
                              <span className="text-foreground/85 font-normal line-clamp-2" title={desglose.motivoRechazo}>
                                {desglose.motivoRechazo}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setObservacionSeleccionada(obs);
                        }}
                        title="Ver trámite y observaciones"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={esSubdecano ? 6 : 5}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <Clock className="w-7 h-7 mb-2" />
                    <p className="text-sm">
                      {esSubdecano
                        ? 'No existen observaciones o trámites pendientes.'
                        : 'No ha registrado observaciones que coincidan con la búsqueda.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Paginador
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        onCambioPagina={onCambioPagina}
        elementosPorPagina={elementosPorPagina}
        onCambioElementosPorPagina={onCambioElementosPorPagina}
      />

      {/* Modal de Detalle y Procesamiento Modular */}
      <ModalProcesarObservacion
        observacion={observacionSeleccionada}
        abierto={Boolean(observacionSeleccionada)}
        esSubdecano={esSubdecano}
        alCerrar={cerrarModal}
        alProcesarExitoso={alProcesarExitoso}
      />
    </div>
  );
}
