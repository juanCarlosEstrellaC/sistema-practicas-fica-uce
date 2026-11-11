'use client';

import Link from 'next/link';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { BadgeEstadoAsignacion } from '@/components/vinculacion/badge-estado-asignacion';
import { BadgeFaseAsignacion } from '@/components/vinculacion/badge-fase-asignacion';
import { CelebracionConfetiVcs } from '@/components/vinculacion/celebracion-confeti-vcs';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderGit2,
  Calendar,
  UserCheck,
  Clock,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Award,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface VistaProgresoGeneralVcsProps {
  asignaciones: AsignacionProyectoDto[];
  horasRequeridasCarrera?: number;
}

export function VistaProgresoGeneralVcs({
  asignaciones,
  horasRequeridasCarrera = 160,
}: VistaProgresoGeneralVcsProps) {
  // Cálculo de horas acumuladas de todos los proyectos
  const primeraAsignacion = asignaciones[0] || null;
  const horasRequeridas = primeraAsignacion?.horasRequeridasEstudiante || horasRequeridasCarrera || 160;

  // Horas convalidadas (sumatoria de horas de proyectos aprobados o acumulado del proceso)
  const horasSumadas = asignaciones.reduce((acumulado, asig) => {
    if (asig.estado === 'APROBADO') {
      return acumulado + (asig.horasCompletadas || asig.horasAsignadas || 0);
    }
    return acumulado;
  }, 0);
  const horasAprobadasTotales = Math.max(
    primeraAsignacion?.horasAcumuladasEstudiante || 0,
    horasSumadas
  );

  // Horas actualmente en curso
  const horasEnCursoTotales = asignaciones.reduce((acumulado, asig) => {
    if (asig.estado === 'EN_CURSO') {
      return acumulado + (asig.horasAsignadas || 0);
    }
    return acumulado;
  }, 0);

  const horasFaltantes = Math.max(0, horasRequeridas - horasAprobadasTotales);
  const porcentajeAvance = Math.min(100, Math.round((horasAprobadasTotales / (horasRequeridas || 1)) * 100));
  const esCulminadoTotal = horasAprobadasTotales >= horasRequeridas && horasRequeridas > 0;

  if (asignaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
        <FolderGit2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-bold text-foreground">Sin registros de vinculación con la sociedad</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1">
          Aún no cuenta con proyectos comunitarios asignados para el cumplimiento de horas de vinculación reglamentarias.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Celebración si cumplió el 100% de horas */}
      {esCulminadoTotal && (
        <CelebracionConfetiVcs
          tipo="CULMINACION_TOTAL"
          horasAcumuladas={horasAprobadasTotales}
          horasRequeridas={horasRequeridas}
        />
      )}

      {/* Resumen Global de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requerimiento Total
              </span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-foreground mt-2">{horasRequeridas} horas</p>
            <p className="text-xs text-muted-foreground mt-1">Reglamento de graduación</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horas Validadas
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {horasAprobadasTotales} horas
            </p>
            <p className="text-xs text-muted-foreground mt-1">Aprobadas por Subdecanato</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horas en Curso
              </span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-2">
              {horasEnCursoTotales} horas
            </p>
            <p className="text-xs text-muted-foreground mt-1">En proyectos activos</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horas Restantes
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-foreground mt-2">{horasFaltantes} horas</p>
            <p className="text-xs text-muted-foreground mt-1">
              {horasFaltantes === 0 ? '¡Meta completada!' : 'Por cumplir en vinculación'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Progreso Global Consolidado */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Avance General de Vinculación con la Sociedad
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Cumplimiento acumulado de horas a través de sus proyectos comunitarios registrados.
              </CardDescription>
            </div>
            <span className="text-sm font-bold text-primary">
              {porcentajeAvance}% ({horasAprobadasTotales} / {horasRequeridas} h)
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                esCulminadoTotal ? 'bg-emerald-600' : 'bg-primary'
              }`}
              style={{ width: `${porcentajeAvance}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
            <span>0 horas</span>
            <span>Meta reglamentaria: {horasRequeridas} horas</span>
          </div>
        </CardContent>
      </Card>

      {/* Historial y Desglose de Proyectos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Historial de Proyectos Comunitarios ({asignaciones.length})
          </h2>
          <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1.5 shadow-2xs">
            <Link href="/dashboard/vinculacion/mi-proyecto">
              <FolderGit2 className="h-3.5 w-3.5" />
              Ver Mis Proyectos
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {asignaciones.map((asig, indice) => {
            const esAprobado = asig.estado === 'APROBADO';
            const esFinalizacion = asig.faseActual === 'FINALIZACION';
            const horasValidadasProyecto = esAprobado
              ? (asig.horasCompletadas || asig.horasAsignadas || 0)
              : 0;

            const numeroProyecto = asignaciones.length - indice;

            return (
              <Card key={asig.id} className="border-border shadow-xs hover:border-primary/40 transition-colors p-0 py-0 gap-0">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del Proyecto */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Proyecto #{numeroProyecto}
                        </span>
                        <BadgeEstadoAsignacion estado={asig.estado} />
                        <BadgeFaseAsignacion fase={asig.faseActual} />
                      </div>

                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {asig.nombreProyecto}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            <strong className="text-foreground">Tutor:</strong> {asig.nombreCompletoTutor || 'Por asignar'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            <strong className="text-foreground">Periodo:</strong> {asig.nombrePeriodoAcademico}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>
                            <strong className="text-foreground">Aporte:</strong>{' '}
                            {esAprobado
                              ? `${horasValidadasProyecto} / ${asig.horasAsignadas} horas`
                              : esFinalizacion
                              ? `${horasValidadasProyecto} / ${asig.horasAsignadas} horas (en validación)`
                              : `${horasValidadasProyecto} / ${asig.horasAsignadas} horas`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                      <Button asChild size="sm" className="h-9 text-xs gap-1.5 shadow-2xs">
                        <Link href={`/dashboard/vinculacion/mi-proyecto?id=${asig.id}`}>
                          Ver Proyecto
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
