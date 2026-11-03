'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Building2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AsignacionDto, TutorResumenDto } from '@/lib/tipos/pp/general-pp';
import { obtenerAsignacionesPracticasAccion } from '@/lib/acciones/pp/asignacion-practica.acciones';

export interface DialogoDetalleTutorProps {
  tutor: TutorResumenDto | any | null;
  onClose: () => void;
  carreraNombre?: string;
  periodoId?: number;
}

export function DialogoDetalleTutor({ tutor, onClose, carreraNombre, periodoId }: DialogoDetalleTutorProps) {
  const [estudiantesDelTutor, setEstudiantesDelTutor] = useState<AsignacionDto[]>(() => {
    if (!tutor?.estudiantes || tutor.estudiantes.length === 0) return [];
    return tutor.estudiantes.map((est: any) => ({
      id: est.id,
      estudiante: {
        id: est.id,
        nombres: est.nombres,
        apellidos: est.apellidos,
        correo: est.correo,
        identificacion: est.identificacion,
      },
      institucion: est.institucion || est.empresa || 'Empresa Receptora',
      fase: est.fase || 'DESARROLLO',
    }));
  });
  const [cargando, setCargando] = useState<boolean>(false);
  const [campoOrden, setCampoOrden] = useState<'estudiante' | 'institucion' | 'fase'>('estudiante');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!tutor?.id) {
      setEstudiantesDelTutor([]);
      return;
    }

    // Inicializar de inmediato con los datos que ya vienen del resumen si están disponibles
    if (tutor.estudiantes && tutor.estudiantes.length > 0) {
      setEstudiantesDelTutor(
        tutor.estudiantes.map((est: any) => ({
          id: est.id,
          estudiante: {
            id: est.id,
            nombres: est.nombres,
            apellidos: est.apellidos,
            correo: est.correo,
            identificacion: est.identificacion,
          },
          institucion: est.institucion || est.empresa || 'Empresa Receptora',
          fase: est.fase || 'DESARROLLO',
        }))
      );
    }

    let cancelado = false;
    const cargarAsignaciones = async () => {
      setCargando(true);
      try {
        const respuesta = await obtenerAsignacionesPracticasAccion({
          tutorId: Number(tutor.id),
          periodoId: periodoId,
          size: 50,
        });
        if (!cancelado) {
          const items = respuesta.content || [];
          if (items.length > 0) {
            setEstudiantesDelTutor(items);
          } else if (!tutor.estudiantes || tutor.estudiantes.length === 0) {
            setEstudiantesDelTutor([]);
          }
        }
      } catch (error) {
        console.error('Error al cargar asignaciones del tutor:', error);
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarAsignaciones();

    return () => {
      cancelado = true;
    };
  }, [tutor?.id, tutor?.estudiantes, periodoId]);

  const alternarOrden = (campo: 'estudiante' | 'institucion' | 'fase') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'estudiante' | 'institucion' | 'fase') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const estudiantesOrdenados = useMemo(() => {
    return [...estudiantesDelTutor].sort((a: any, b: any) => {
      if (campoOrden === 'estudiante') {
        const nombreA = `${a.estudiante?.nombres || ''} ${a.estudiante?.apellidos || ''}`.toLowerCase();
        const nombreB = `${b.estudiante?.nombres || ''} ${b.estudiante?.apellidos || ''}`.toLowerCase();
        return direccionOrden === 'asc' ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
      } else if (campoOrden === 'institucion') {
        const instA = (a.institucion || a.convenio?.institucion || '').toLowerCase();
        const instB = (b.institucion || b.convenio?.institucion || '').toLowerCase();
        return direccionOrden === 'asc' ? instA.localeCompare(instB) : instB.localeCompare(instA);
      } else {
        const faseA = (a.fase || '').toLowerCase();
        const faseB = (b.fase || '').toLowerCase();
        return direccionOrden === 'asc' ? faseA.localeCompare(faseB) : faseB.localeCompare(faseA);
      }
    });
  }, [estudiantesDelTutor, campoOrden, direccionOrden]);

  if (!tutor) return null;

  const nombreTutor =
    tutor.nombres && tutor.apellidos
      ? `${tutor.nombres} ${tutor.apellidos}`.trim()
      : tutor.nombre || 'Tutor Académico';

  const correoTutor = tutor.correo || 'Sin correo institucional';
  const totalSupervisiones = estudiantesDelTutor.length;
  const porcentajeCarga = Math.min(100, Math.round((totalSupervisiones / 10) * 100));

  return (
    <Dialog open={Boolean(tutor)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border">
        {/* Encabezado fijo compacto */}
        <DialogHeader className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <AvatarUsuario
              nombre={nombreTutor}
              tamano="md"
            />
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                {nombreTutor}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate mt-0.5">
                {correoTutor} • Tutor Académico {carreraNombre ? `(${carreraNombre})` : ''}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Cuerpo scrolleable */}
        <div className="p-0 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1">
          {/* Métricas de carga optimizadas y compactas */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <div className="rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5 sm:py-2 text-center shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Estudiantes
              </p>
              <p className="text-base sm:text-lg font-bold text-foreground leading-tight mt-0.5">
                {totalSupervisiones}
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5 sm:py-2 text-center shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Cupo Máximo
              </p>
              <p className="text-base sm:text-lg font-bold text-foreground leading-tight mt-0.5">
                10
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 sm:py-2 text-center shadow-2xs">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate">
                Carga
              </p>
              <p className="text-base sm:text-lg font-bold text-primary leading-tight mt-0.5">
                {porcentajeCarga}%
              </p>
            </div>
          </div>

          {/* Listado de supervisiones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-primary" />
                Listado de Supervisiones Actuales ({totalSupervisiones})
              </h4>
            </div>

            <div className="rounded-xl border border-border overflow-hidden shadow-2xs max-h-[380px] sm:max-h-[440px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/60 sticky top-0 z-10 backdrop-blur-xs">
                  <TableRow className="hover:bg-muted/60 select-none border-b border-border">
                    <TableHead
                      className="h-8 py-1.5 font-semibold text-xs cursor-pointer hover:text-primary transition-colors select-none group"
                      onClick={() => alternarOrden('estudiante')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          alternarOrden('estudiante');
                        }
                      }}
                      aria-sort={campoOrden === 'estudiante' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                      title="Ordenar por Estudiante"
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>Estudiante</span>
                        {renderIconoOrden('estudiante')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="h-8 py-1.5 font-semibold text-xs cursor-pointer hover:text-primary transition-colors select-none group"
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
                      className="h-8 py-1.5 font-semibold text-xs text-right cursor-pointer hover:text-primary transition-colors select-none group"
                      onClick={() => alternarOrden('fase')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          alternarOrden('fase');
                        }
                      }}
                      aria-sort={campoOrden === 'fase' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                      title="Ordenar por Estado del Proceso"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5 w-full">
                        <span>Estado del Proceso</span>
                        {renderIconoOrden('fase')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cargando ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Cargando estudiantes del tutor...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : totalSupervisiones > 0 ? (
                    estudiantesOrdenados.map((item: any) => {
                      const nombreEstudiante =
                        item.estudiante?.nombres && item.estudiante?.apellidos
                          ? `${item.estudiante.nombres} ${item.estudiante.apellidos}`.trim()
                          : item.estudiante?.nombre || 'Estudiante';
                      const correoEstudiante = item.estudiante?.correo || '';
                      const cedulaEstudiante = item.estudiante?.identificacion || '';
                      const institucion =
                        item.institucion ||
                        item.convenio?.institucion ||
                        'Empresa Receptora';

                      const fase = (item.fase || 'DESARROLLO').toUpperCase();
                      const varianteColor =
                        fase === 'FINALIZACION' || fase === 'FINALIZADA'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : fase === 'DESARROLLO'
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="py-2">
                            <p className="text-foreground text-xs font-semibold leading-tight">
                              {nombreEstudiante}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {cedulaEstudiante ? `${cedulaEstudiante} • ` : ''}{correoEstudiante}
                            </p>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1.5 text-xs text-foreground min-w-0">
                              <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-[280px]">{institucion}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-medium px-2 py-0.5 border ${varianteColor}`}
                            >
                              {fase}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-5 text-muted-foreground text-xs">
                        Este tutor no tiene estudiantes asignados en este periodo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
