"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit2, Check, X, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Paginador } from '@/components/paginador';
import { CeldaUsuarioTabla } from '@/components/comunes/celda-usuario-tabla';
import { CeldaEntidadTutor } from '@/components/comunes/celda-entidad-tutor';
import { actualizarDatosCacesAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import { toast } from 'sonner';

type CampoOrdenMatriz =
  | 'estudiante'
  | 'institucion'
  | 'sector'
  | 'horas'
  | 'fechaInicio'
  | 'fechaFin'
  | 'observaciones';

interface TablaMatrizCacesProps {
  asignaciones: any[];
  totalPaginas: number;
  paginaActual: number;
  elementosPorPagina: number;
  alCambiarPagina: (pagina: number) => void;
  alCambiarElementosPorPagina: (elementos: number) => void;
  cargando?: boolean;
  esEditable?: boolean;
  alActualizarDatos?: () => void;
  codigoIes?: string;
  codigoCarrera?: string;
  ciudadCarrera?: string;
}

export function TablaMatrizCaces({
  asignaciones,
  totalPaginas,
  paginaActual,
  elementosPorPagina,
  alCambiarPagina,
  alCambiarElementosPorPagina,
  cargando = false,
  esEditable = false,
  alActualizarDatos,
  codigoIes = '1005',
  codigoCarrera,
  ciudadCarrera = 'Quito',
}: TablaMatrizCacesProps) {
  const [idEditando, setIdEditando] = useState<string | number | null>(null);
  const [observacionTemp, setObservacionTemp] = useState('');
  const [estaGuardando, setEstaGuardando] = useState(false);

  const iniciarEdicion = (item: any) => {
    setIdEditando(item.id);
    setObservacionTemp(item.observacionesCaces || item.observaciones || '');
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setObservacionTemp('');
  };

  const guardarEdicion = async (id: string | number) => {
    setEstaGuardando(true);
    try {
      const res = await actualizarDatosCacesAccion(id, observacionTemp);
      if (res.exito) {
        toast.success('Observación CACES actualizada');
        setIdEditando(null);
        alActualizarDatos?.();
      } else {
        toast.error(res.mensaje || 'Error al actualizar observación');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error inesperado');
    } finally {
      setEstaGuardando(false);
    }
  };

  const [campoOrden, setCampoOrden] = useState<CampoOrdenMatriz>('estudiante');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: CampoOrdenMatriz) => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: CampoOrdenMatriz) => {
    if (campoOrden !== campo) {
      return (
        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      );
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const asignacionesOrdenadas = useMemo(() => {
    return [...asignaciones].sort((a: any, b: any) => {
      if (campoOrden === 'estudiante') {
        const nomA = (
          a.estudiante
            ? `${a.estudiante.nombres || ''} ${a.estudiante.apellidos || ''}`
            : `${a.estudianteNombres || ''} ${a.estudianteApellidos || ''}`
        ).toLowerCase();
        const nomB = (
          b.estudiante
            ? `${b.estudiante.nombres || ''} ${b.estudiante.apellidos || ''}`
            : `${b.estudianteNombres || ''} ${b.estudianteApellidos || ''}`
        ).toLowerCase();
        return direccionOrden === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      } else if (campoOrden === 'institucion') {
        const instA = (a.institucion || a.convenioInstitucion || '').toLowerCase();
        const instB = (b.institucion || b.convenioInstitucion || '').toLowerCase();
        return direccionOrden === 'asc' ? instA.localeCompare(instB) : instB.localeCompare(instA);
      } else if (campoOrden === 'sector') {
        const secA = (a.sectorReceptora || '').toLowerCase();
        const secB = (b.sectorReceptora || '').toLowerCase();
        return direccionOrden === 'asc' ? secA.localeCompare(secB) : secB.localeCompare(secA);
      } else if (campoOrden === 'horas') {
        const progA = a.horasCompletadas || 0;
        const progB = b.horasCompletadas || 0;
        return direccionOrden === 'asc' ? progA - progB : progB - progA;
      } else if (campoOrden === 'fechaInicio') {
        const fA = a.fechaInicio || '';
        const fB = b.fechaInicio || '';
        return direccionOrden === 'asc' ? fA.localeCompare(fB) : fB.localeCompare(fA);
      } else if (campoOrden === 'fechaFin') {
        const fA = a.fechaFin || '';
        const fB = b.fechaFin || '';
        return direccionOrden === 'asc' ? fA.localeCompare(fB) : fB.localeCompare(fA);
      } else {
        const obsA = (a.observacionesCaces || a.observaciones || '').toLowerCase();
        const obsB = (b.observacionesCaces || b.observaciones || '').toLowerCase();
        return direccionOrden === 'asc' ? obsA.localeCompare(obsB) : obsB.localeCompare(obsA);
      }
    });
  }, [asignaciones, campoOrden, direccionOrden]);

  return (
    <div className="space-y-4">
      {/* 1. Información CACES en la parte superior de la tabla (sin uppercase y sin _) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-muted/40 border border-border/70 rounded-xl shadow-2xs">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Código IES</span>
          <span className="text-sm font-semibold text-foreground font-mono mt-0.5">
            {codigoIes}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Código carrera</span>
          <span className="text-sm font-semibold text-foreground font-mono mt-0.5">
            {codigoCarrera || '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Ciudad carrera</span>
          <span className="text-sm font-semibold text-foreground mt-0.5">
            {ciudadCarrera || 'Quito'}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
                <TableHead
                  className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('estudiante')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('estudiante');
                    }
                  }}
                  aria-sort={
                    campoOrden === 'estudiante'
                      ? direccionOrden === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  title="Ordenar por Estudiante"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Estudiante</span>
                    {renderIconoOrden('estudiante')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('institucion')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('institucion');
                    }
                  }}
                  aria-sort={
                    campoOrden === 'institucion'
                      ? direccionOrden === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  title="Ordenar por Institución / Tutor"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Institución / Tutor</span>
                    {renderIconoOrden('institucion')}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('sector')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('sector');
                    }
                  }}
                  aria-sort={
                    campoOrden === 'sector'
                      ? direccionOrden === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  title="Ordenar por Sector"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Sector</span>
                    {renderIconoOrden('sector')}
                  </div>
                </TableHead>

                {/* 2. Horas validadas: solo cuántas horas validó, sin barra de progreso ni /numhoras */}
                <TableHead
                  className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('horas')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('horas');
                    }
                  }}
                  aria-sort={
                    campoOrden === 'horas'
                      ? direccionOrden === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  title="Ordenar por Horas validadas"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Horas validadas</span>
                    {renderIconoOrden('horas')}
                  </div>
                </TableHead>

                {/* 2. Columna Fecha inicio */}
                <TableHead
                  className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('fechaInicio')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('fechaInicio');
                    }
                  }}
                  aria-sort={
                    campoOrden === 'fechaInicio'
                      ? direccionOrden === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  title="Ordenar por Fecha inicio"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Fecha inicio</span>
                    {renderIconoOrden('fechaInicio')}
                  </div>
                </TableHead>

                {/* 2. Columna Fecha fin */}
                <TableHead
                  className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('fechaFin')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('fechaFin');
                    }
                  }}
                  aria-sort={
                    campoOrden === 'fechaFin'
                      ? direccionOrden === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  title="Ordenar por Fecha fin"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Fecha fin</span>
                    {renderIconoOrden('fechaFin')}
                  </div>
                </TableHead>

                <TableHead
                  className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('observaciones')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('observaciones');
                    }
                  }}
                  aria-sort={
                    campoOrden === 'observaciones'
                      ? direccionOrden === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  title="Ordenar por Observaciones CACES"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Observaciones CACES</span>
                    {renderIconoOrden('observaciones')}
                  </div>
                </TableHead>
                {esEditable && (
                  <TableHead className="text-right font-semibold text-foreground">Acción</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell
                    colSpan={esEditable ? 8 : 7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Cargando datos de matriz CACES...
                  </TableCell>
                </TableRow>
              ) : asignacionesOrdenadas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={esEditable ? 8 : 7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center opacity-60">
                      <Search className="w-8 h-8 mb-2" />
                      <p className="font-medium">No se encontraron estudiantes para la matriz CACES.</p>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">
                        No hay prácticas registradas en este periodo para la carrera seleccionada.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                asignacionesOrdenadas.map((item: any) => {
                  const nombreEstudiante =
                    item.estudiante
                      ? `${item.estudiante.nombres || ''} ${item.estudiante.apellidos || ''}`.trim()
                      : `${item.estudianteNombres || ''} ${item.estudianteApellidos || ''}`.trim() ||
                        'Estudiante';

                  const identificacion =
                    item.estudiante?.identificacion || item.estudianteIdentificacion || 'S/N';
                  const correo = item.estudiante?.correo || item.estudianteCorreo || '';
                  const urlAvatar = item.estudiante?.urlAvatar;

                  const institucion =
                    item.institucion || item.convenioInstitucion || 'Institución receptora';
                  const tutorNombre =
                    item.tutorAcademico
                      ? `${item.tutorAcademico.nombres || ''} ${item.tutorAcademico.apellidos || ''}`.trim()
                      : `${item.tutorAcademicoNombres || ''} ${item.tutorAcademicoApellidos || ''}`.trim() ||
                        undefined;

                  const sector = item.sectorReceptora || 'PRIVADO';
                  const horasValidadas = item.horasCompletadas || 0;
                  const observacion = item.observacionesCaces || item.observaciones || '—';
                  const estaEnEdicion = idEditando === item.id;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <CeldaUsuarioTabla
                          nombre={nombreEstudiante}
                          identificacion={identificacion}
                          correo={correo}
                          urlAvatar={urlAvatar}
                        />
                      </TableCell>
                      <TableCell>
                        <CeldaEntidadTutor
                          titulo={institucion}
                          nombreTutor={tutorNombre}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {sector}
                        </Badge>
                      </TableCell>
                      {/* 2. Solo cuántas horas validó, sin barra de progreso ni /numhoras */}
                      <TableCell className="text-center">
                        <span className="text-xs font-semibold text-foreground">
                          {horasValidadas} h
                        </span>
                      </TableCell>
                      {/* 2. Fecha inicio */}
                      <TableCell className="text-center">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.fechaInicio ? formatearFechaCorta(item.fechaInicio) : '—'}
                        </span>
                      </TableCell>
                      {/* 2. Fecha fin */}
                      <TableCell className="text-center">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.fechaFin ? formatearFechaCorta(item.fechaFin) : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {estaEnEdicion ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              size={1}
                              className="h-8 text-xs bg-background"
                              value={observacionTemp}
                              onChange={(e) => setObservacionTemp(e.target.value)}
                              disabled={estaGuardando}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10 shrink-0"
                              onClick={() => guardarEdicion(item.id)}
                              disabled={estaGuardando}
                              title="Guardar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:bg-muted shrink-0"
                              onClick={cancelarEdicion}
                              disabled={estaGuardando}
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {observacion}
                          </span>
                        )}
                      </TableCell>
                      {esEditable && (
                        <TableCell className="text-right">
                          {!estaEnEdicion && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1.5 shadow-2xs font-medium"
                              onClick={() => iniciarEdicion(item)}
                              title="Corregir observación CACES"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Corregir</span>
                            </Button>
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
          {cargando ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Cargando datos de matriz CACES...
            </div>
          ) : asignaciones.length === 0 ? (
            <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center opacity-60">
              <Search className="w-8 h-8 mb-2" />
              <p className="font-medium text-sm">No se encontraron estudiantes para la matriz CACES.</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                No hay prácticas registradas en este periodo para la carrera seleccionada.
              </p>
            </div>
          ) : (
            asignaciones.map((item: any) => {
              const nombreEstudiante =
                item.estudiante
                  ? `${item.estudiante.nombres || ''} ${item.estudiante.apellidos || ''}`.trim()
                  : `${item.estudianteNombres || ''} ${item.estudianteApellidos || ''}`.trim() ||
                    'Estudiante';

              const identificacion =
                item.estudiante?.identificacion || item.estudianteIdentificacion || 'S/N';
              const correo = item.estudiante?.correo || item.estudianteCorreo || '';
              const urlAvatar = item.estudiante?.urlAvatar;

              const institucion =
                item.institucion || item.convenioInstitucion || 'Institución receptora';
              const tutorNombre =
                item.tutorAcademico
                  ? `${item.tutorAcademico.nombres || ''} ${item.tutorAcademico.apellidos || ''}`.trim()
                  : `${item.tutorAcademicoNombres || ''} ${item.tutorAcademicoApellidos || ''}`.trim() ||
                    undefined;

              const sector = item.sectorReceptora || 'PRIVADO';
              const horasValidadas = item.horasCompletadas || 0;
              const observacion = item.observacionesCaces || item.observaciones || '—';
              const estaEnEdicion = idEditando === item.id;

              return (
                <div key={item.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                  {/* Encabezado: Estudiante + Sector */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CeldaUsuarioTabla
                        nombre={nombreEstudiante}
                        identificacion={identificacion}
                        correo={correo}
                        urlAvatar={urlAvatar}
                      />
                    </div>
                    <div className="shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    </div>
                  </div>

                  {/* Institución / Tutor */}
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50 min-w-0">
                    <CeldaEntidadTutor
                      titulo={institucion}
                      nombreTutor={tutorNombre}
                    />
                  </div>

                  {/* 2. Horas Validadas (sin barra ni /numhoras) */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Horas validadas:</span>
                    <span className="font-semibold text-foreground">{horasValidadas} h</span>
                  </div>

                  {/* 2. Fechas de práctica: Inicio y Fin */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded-lg border border-border/40">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Fecha inicio:</span>
                      <span className="font-medium text-foreground">
                        {item.fechaInicio ? formatearFechaCorta(item.fechaInicio) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Fecha fin:</span>
                      <span className="font-medium text-foreground">
                        {item.fechaFin ? formatearFechaCorta(item.fechaFin) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Observaciones CACES */}
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Observaciones CACES:
                      </span>
                      {esEditable && !estaEnEdicion && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1 shadow-2xs font-medium"
                          onClick={() => iniciarEdicion(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Corregir</span>
                        </Button>
                      )}
                    </div>

                    {estaEnEdicion ? (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Input
                          className="h-9 text-xs bg-background flex-1 min-w-0 placeholder:truncate"
                          value={observacionTemp}
                          onChange={(e) => setObservacionTemp(e.target.value)}
                          disabled={estaGuardando}
                          placeholder="Ingrese observación CACES..."
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-3 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 shrink-0"
                          onClick={() => guardarEdicion(item.id)}
                          disabled={estaGuardando}
                          title="Guardar"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          <span>Guardar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-2 text-muted-foreground hover:bg-muted shrink-0"
                          onClick={cancelarEdicion}
                          disabled={estaGuardando}
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground bg-muted/30 p-2 rounded-md border border-border/40">
                        {observacion}
                      </p>
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
        onCambioPagina={alCambiarPagina}
        elementosPorPagina={elementosPorPagina}
        onCambioElementosPorPagina={alCambiarElementosPorPagina}
      />
    </div>
  );
}
