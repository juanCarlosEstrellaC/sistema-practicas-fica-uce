"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GestorUsuarios } from '@/components/gestor-usuarios'
import { GestorCarreras } from '@/components/gestor-carreras'
import { GestorPeriodos } from '@/components/gestor-periodos'
import { RolUsuario, RespuestaPaginada, PeriodoAcademico } from '@/lib/tipos/general'
import { UsuarioDto, CarreraDto, PeriodoAcademicoDto } from '@/lib/tipos/pp/general-pp'
import { Users, GraduationCap, CalendarDays } from 'lucide-react'

interface GestorIngresoDatosProps {
  rol?: RolUsuario;
  usuarioId?: string;
  mostrarCabecera?: boolean;
  usuariosIniciales?: RespuestaPaginada<UsuarioDto>;
  estadisticasUsuariosIniciales?: { total: number; estudiantes: number; personalAcademico: number };
  carrerasIniciales?: CarreraDto[];
  periodosIniciales?: RespuestaPaginada<PeriodoAcademico | PeriodoAcademicoDto>;
}

export function GestorIngresoDatos({
  rol,
  usuarioId,
  mostrarCabecera = true,
  usuariosIniciales,
  estadisticasUsuariosIniciales,
  carrerasIniciales,
  periodosIniciales,
}: GestorIngresoDatosProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="usuarios" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
          {mostrarCabecera && (
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Ingreso de Datos y Catálogos
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Catálogos institucionales: usuarios, carreras y periodos académicos.
              </p>
            </div>
          )}

          <TabsList className="bg-muted/60 p-1 sm:p-1.5 rounded-xl border border-border/80 grid grid-cols-3 gap-1 sm:gap-1.5 w-full lg:w-auto h-auto min-w-0">
            <TabsTrigger
              value="usuarios"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all min-w-0"
            >
              <Users className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger
              value="carreras"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all min-w-0"
            >
              <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Carreras</span>
            </TabsTrigger>
            <TabsTrigger
              value="periodos"
              aria-label="Periodos Académicos"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all min-w-0"
            >
              <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">Periodos Académicos</span>
                <span className="sm:hidden">Periodos</span>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="usuarios" className="m-0 focus-visible:outline-hidden">
          <GestorUsuarios
            usuarioIdActual={usuarioId}
            usuariosIniciales={usuariosIniciales}
            estadisticasIniciales={estadisticasUsuariosIniciales}
            carrerasIniciales={carrerasIniciales}
          />
        </TabsContent>

        <TabsContent value="carreras" className="m-0 focus-visible:outline-hidden">
          <GestorCarreras />
        </TabsContent>

        <TabsContent value="periodos" className="m-0 focus-visible:outline-hidden">
          <GestorPeriodos periodosIniciales={periodosIniciales} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

