'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AsignacionDto } from '@/lib/tipos/pp/general-pp';
import { BadgeEstadoPractica } from '@/components/practicas/badges/badge-estado-practica';
import { BadgeFasePractica } from '@/components/practicas/badges/badge-fase-practica';
import { CelebracionConfetiPp } from '@/components/practicas/celebracion-confeti-pp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  UserCheck,
  Clock,
  CheckCircle2,
  GraduationCap,
  Award,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface VistaProgresoGeneralPpProps {
  asignaciones: AsignacionDto[];
  horasRequeridas?: number;
  horasAcumuladas?: number;
}

export function VistaProgresoGeneralPp({
  asignaciones,
  horasRequeridas = 240,
  horasAcumuladas = 0,
}: VistaProgresoGeneralPpProps) {

  // Horas convalidadas / aprobadas (sumatoria de asignaciones completadas)
  const horasAprobadasTotales =
    horasAcumuladas ||
    asignaciones.reduce((acumulado, asig) => {
      if (asig.estado === 'COMPLETADO' || asig.estado === 'APROBADO') {
        return acumulado + (asig.horasCompletadas || asig.horasAsignadas || 0);
      }
      return acumulado;
    }, 0);

  // Horas actualmente en curso
  const horasEnCursoTotales = asignaciones.reduce((acumulado, asig) => {
    if (asig.estado !== 'COMPLETADO' && asig.estado !== 'CANCELADO') {
      return acumulado + (asig.horasAsignadas || 0);
    }
    return acumulado;
  }, 0);

  const horasFaltantes = Math.max(0, horasRequeridas - horasAprobadasTotales);
  const porcentajeAvance = Math.min(
    100,
    Math.round((horasAprobadasTotales / (horasRequeridas || 1)) * 100)
  );
  const esCulminadoTotal = horasAprobadasTotales >= horasRequeridas && horasRequeridas > 0;

  if (asignaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-bold text-foreground">Sin registros de prácticas preprofesionales</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1">
          Aún no cuenta con asignaciones registradas para el cumplimiento de las horas reglamentarias de prácticas preprofesionales.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Celebración si cumplió el 100% de horas */}
      {esCulminadoTotal && (
        <CelebracionConfetiPp
          tipo="CULMINACION_TOTAL"
          horasAcumuladas={horasAprobadasTotales}
          horasRequeridas={horasRequeridas}
        />
      )}

      {/* Resumen Global de 4 Métricas */}
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
            <p className="text-xs text-muted-foreground mt-1">En prácticas activas</p>
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
              {horasFaltantes === 0 ? '¡Meta completada!' : 'Por cumplir en prácticas'}
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
                Avance General de Prácticas Preprofesionales
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Cumplimiento acumulado de horas a través de sus periodos de prácticas registrados.
              </CardDescription>
            </div>
            <span className="text-sm font-bold text-primary">
              {horasAprobadasTotales} / {horasRequeridas}h ({porcentajeAvance}%)
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

      {/* Historial y Desglose de Prácticas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Historial de Prácticas Preprofesionales ({asignaciones.length})
          </h2>
          <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1.5 shadow-2xs">
            <Link href="/dashboard/practicas/mi-practica">
              <Building2 className="h-3.5 w-3.5" />
              Ver Mis Prácticas
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {asignaciones.map((asig, indice) => {
            const horasValidadasPractica = asig.horasCompletadas || 0;
            const numeroPractica = asignaciones.length - indice;

            return (
              <Card
                key={asig.id}
                className="border-border shadow-xs hover:border-primary/40 transition-colors p-0 py-0 gap-0"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información de la Práctica */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Práctica #{numeroPractica}
                        </span>
                        <BadgeEstadoPractica estado={asig.estado} />
                        <BadgeFasePractica fase={asig.fase} />
                      </div>

                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {asig.institucion || 'Institución Receptora'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            <strong className="text-foreground">Tutor:</strong>{' '}
                            {asig.tutorAcademico
                              ? `${asig.tutorAcademico.nombres} ${asig.tutorAcademico.apellidos}`
                              : 'Por asignar'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            <strong className="text-foreground">Semestre:</strong> {asig.semestre || 'No definido'}°
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>
                            <strong className="text-foreground">Aporte:</strong> {horasValidadasPractica} /{' '}
                            {asig.horasAsignadas || 0} horas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                      <Button asChild size="sm" className="h-9 text-xs gap-1.5 shadow-2xs">
                        <Link href={`/dashboard/practicas/mi-practica`}>
                          Ver Práctica
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
