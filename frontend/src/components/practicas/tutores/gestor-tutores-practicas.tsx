'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Users, UserCheck, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import { DialogoDetalleTutor } from './dialogo-detalle-tutor';
import { FiltrosTutoresPracticas } from './filtros-tutores-practicas';
import { CarreraDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';

export interface GestorTutoresPracticasProps {
  carreraId?: number;
  periodoId?: number;
  esInactivo?: boolean;
  tutoresIniciales?: TutorResumenDto[];
  carreraNombre?: string;
  esSubdecano?: boolean;
  carreras?: CarreraDto[];
}

export function GestorTutoresPracticas({
  carreraId,
  periodoId,
  esInactivo,
  tutoresIniciales = [],
  carreraNombre,
  esSubdecano = false,
  carreras = [],
}: GestorTutoresPracticasProps) {
  const searchParams = useSearchParams();
  const busqueda = searchParams?.get('busqueda') || '';
  const [tutorDetalleId, setTutorDetalleId] = useState<string | null>(null);
  const [campoOrden, setCampoOrden] = useState<'nombre' | 'carga' | 'estudiantes'>('nombre');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: 'nombre' | 'carga' | 'estudiantes') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'nombre' | 'carga' | 'estudiantes') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const tutoresFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const filtrados = !termino
      ? tutoresIniciales
      : tutoresIniciales.filter((tutor) => {
          const nombreCompleto = `${tutor.nombres || ''} ${tutor.apellidos || ''}`.toLowerCase();
          const correo = (tutor.correo || '').toLowerCase();
          const especialidad = (tutor.especialidad || '').toLowerCase();
          return (
            nombreCompleto.includes(termino) ||
            correo.includes(termino) ||
            especialidad.includes(termino)
          );
        });

    return [...filtrados].sort((a, b) => {
      if (campoOrden === 'nombre') {
        const nombreA = `${a.nombres || ''} ${a.apellidos || ''}`.toLowerCase();
        const nombreB = `${b.nombres || ''} ${b.apellidos || ''}`.toLowerCase();
        return direccionOrden === 'asc'
          ? nombreA.localeCompare(nombreB)
          : nombreB.localeCompare(nombreA);
      } else if (campoOrden === 'carga') {
        const cargaA = a.estudiantes?.length || 0;
        const cargaB = b.estudiantes?.length || 0;
        return direccionOrden === 'asc' ? cargaA - cargaB : cargaB - cargaA;
      } else {
        const estA = (a.estudiantes || []).map((e: any) => `${e.nombres || ''} ${e.apellidos || ''}`.trim()).join(', ').toLowerCase();
        const estB = (b.estudiantes || []).map((e: any) => `${e.nombres || ''} ${e.apellidos || ''}`.trim()).join(', ').toLowerCase();
        return direccionOrden === 'asc' ? estA.localeCompare(estB) : estB.localeCompare(estA);
      }
    });
  }, [tutoresIniciales, busqueda, campoOrden, direccionOrden]);

  const datosTutorDetalle = useMemo(() => {
    return tutorDetalleId
      ? tutoresIniciales.find((u) => String(u.id) === String(tutorDetalleId)) || null
      : null;
  }, [tutoresIniciales, tutorDetalleId]);

  const totalTutores = tutoresIniciales.length;
  const totalAsignados = tutoresIniciales.reduce(
    (acumulado: number, t: any) => acumulado + (t.estudiantes?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <CabeceraListado
        titulo="Tutores Académicos"
        total={totalTutores}
        etiquetaTotal="Total de tutores registrados"
        metricasExtra={
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <UserCheck className="w-3 h-3" />
              {totalTutores} {totalTutores === 1 ? 'Docente' : 'Docentes'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Users className="w-3 h-3" />
              {totalAsignados} {totalAsignados === 1 ? 'Estudiante asignado' : 'Estudiantes asignados'}
            </span>
          </div>
        }
      />

      {/* Barra de Filtros Unificada */}
      <FiltrosTutoresPracticas
        esSubdecano={esSubdecano}
        carreras={carreras}
      />

      {/* Tabla de Tutores Desktop */}
      <div className="hidden md:block rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('nombre')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('nombre');
                  }
                }}
                aria-sort={campoOrden === 'nombre' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Tutor Académico"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Tutor Académico</span>
                  {renderIconoOrden('nombre')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('carga')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('carga');
                  }
                }}
                aria-sort={campoOrden === 'carga' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Carga Asignada"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Carga Asignada</span>
                  {renderIconoOrden('carga')}
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('estudiantes')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('estudiantes');
                  }
                }}
                aria-sort={campoOrden === 'estudiantes' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Estudiantes"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Estudiantes bajo supervisión</span>
                  {renderIconoOrden('estudiantes')}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutoresFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <Search className="w-8 h-8 mb-2" />
                    <p className="font-medium">No se encontraron tutores académicos.</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      {busqueda
                        ? 'Intente ajustar el criterio de búsqueda.'
                        : 'No existen tutores registrados para este periodo.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tutoresFiltrados.map((tutor) => {
                const asignacionesTutor = tutor.estudiantes || [];
                const totalTutorAsignados = asignacionesTutor.length;
                const nombreCompleto =
                  `${tutor.nombres || ''} ${tutor.apellidos || ''}`.trim() || 'Tutor';

                return (
                  <TableRow key={tutor.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarUsuario
                          nombre={nombreCompleto}
                          tamano="sm"
                        />
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-semibold text-foreground leading-tight truncate">
                            {nombreCompleto}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5 truncate">
                            {tutor.correo || 'Sin correo institucional'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          totalTutorAsignados >= 10
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }
                      >
                        {totalTutorAsignados}/10
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[45%]">
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[36px]">
                        {totalTutorAsignados > 0 ? (
                          asignacionesTutor.map((est: any) => (
                            <Badge
                              key={est.id}
                              variant="outline"
                              className="text-[11px] font-normal bg-background/80"
                            >
                              {est.nombres} {est.apellidos}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground/70 italic">
                            Sin estudiantes asignados
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-primary hover:bg-primary/10"
                        onClick={() => setTutorDetalleId(String(tutor.id))}
                        title="Ver detalle del tutor"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil (md:hidden) */}
      <div className="md:hidden space-y-3">
        {tutoresFiltrados.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Users className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No se encontraron tutores académicos</p>
            <p className="text-xs text-muted-foreground/80">
              {busqueda
                ? 'Intente ajustar el criterio de búsqueda.'
                : 'No existen tutores registrados para este periodo.'}
            </p>
          </div>
        ) : (
          tutoresFiltrados.map((tutor) => {
            const asignacionesTutor = tutor.estudiantes || [];
            const totalTutorAsignados = asignacionesTutor.length;
            const nombreCompleto =
              `${tutor.nombres || ''} ${tutor.apellidos || ''}`.trim() || 'Tutor';

            return (
              <div
                key={tutor.id}
                className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-3"
              >
                {/* Cabecera Tarjeta: Tutor + Carga */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AvatarUsuario nombre={nombreCompleto} tamano="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate" title={nombreCompleto}>
                        {nombreCompleto}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tutor.correo || 'Sin correo institucional'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'shrink-0 text-xs font-semibold',
                      totalTutorAsignados >= 10
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        : 'bg-primary/10 text-primary border-primary/20'
                    )}
                  >
                    {totalTutorAsignados}/10
                  </Badge>
                </div>

                {/* Estudiantes bajo supervisión */}
                <div className="border-t border-b border-border/50 py-2.5 space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Estudiantes bajo supervisión ({totalTutorAsignados}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {totalTutorAsignados > 0 ? (
                      asignacionesTutor.map((est: any) => (
                        <Badge
                          key={est.id}
                          variant="outline"
                          className="text-[10px] font-normal bg-muted/40"
                        >
                          {est.nombres} {est.apellidos}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground/70 italic">
                        Sin estudiantes asignados
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full min-h-[38px] text-xs font-medium text-primary hover:bg-primary/10 gap-1.5"
                    onClick={() => setTutorDetalleId(String(tutor.id))}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalle y Carga</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DialogoDetalleTutor
        tutor={datosTutorDetalle}
        onClose={() => setTutorDetalleId(null)}
        carreraNombre={carreraNombre}
        periodoId={periodoId}
      />
    </div>
  );
}
