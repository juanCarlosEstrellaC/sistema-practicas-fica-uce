'use client';

import { Usuario, UsuarioSesion } from '@/lib/tipos/general';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PestaniaPerfil } from './pestania-perfil';
import { PestaniaSeguridad } from './pestania-seguridad';
import { PestaniaApariencia } from './pestania-apariencia';
import { User, Lock, Palette } from 'lucide-react';

export interface VistaConfiguracionProps {
  usuario: Usuario | UsuarioSesion;
}

export function VistaConfiguracion({ usuario }: VistaConfiguracionProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="perfil" className="space-y-6">
        {/* Cabecera con título a la izquierda y selector horizontal a la derecha */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Configuración
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Administre su perfil, seguridad y apariencia del sistema
            </p>
          </div>

          <TabsList className="bg-muted/60 p-1 sm:p-1.5 rounded-xl border border-border/80 grid grid-cols-3 gap-1 sm:gap-1.5 w-full lg:w-auto h-auto min-w-0">
            <TabsTrigger
              value="perfil"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:min-w-[110px] text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all min-w-0 cursor-pointer"
            >
              <User className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">Perfil</span>
            </TabsTrigger>

            <TabsTrigger
              value="seguridad"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:min-w-[110px] text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all min-w-0 cursor-pointer"
            >
              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Seguridad</span>
            </TabsTrigger>

            <TabsTrigger
              value="apariencia"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:min-w-[110px] text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all min-w-0 cursor-pointer"
            >
              <Palette className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Apariencia</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="perfil" className="m-0 focus-visible:outline-hidden">
          <PestaniaPerfil usuario={usuario} />
        </TabsContent>

        <TabsContent value="seguridad" className="m-0 focus-visible:outline-hidden">
          <PestaniaSeguridad />
        </TabsContent>

        <TabsContent value="apariencia" className="m-0 focus-visible:outline-hidden">
          <PestaniaApariencia />
        </TabsContent>
      </Tabs>
    </div>
  );
}
