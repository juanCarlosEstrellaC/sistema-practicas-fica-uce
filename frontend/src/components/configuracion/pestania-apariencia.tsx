'use client';

import { useTema } from '@/lib/contextos/contexto-tema';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PestaniaApariencia() {
  const { tema, setTema } = useTema();

  const opcionesTema = [
    {
      id: 'claro',
      titulo: 'Modo Claro',
      descripcion: 'Interfaz con fondo claro.',
      icono: Sun,
    },
    {
      id: 'oscuro',
      titulo: 'Modo Oscuro',
      descripcion: 'Paleta con tonalidades oscuras para reducir fatiga visual.',
      icono: Moon,
    },
    {
      id: 'sistema',
      titulo: 'Tema del Sistema',
      descripcion: 'Sincroniza automáticamente con la configuración del dispositivo.',
      icono: Monitor,
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Encabezado de la pestaña */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <Palette className="h-5 w-5 text-primary" />
          Preferencia de Apariencia
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Personalice el tema visual del entorno de trabajo según su preferencia y comodidad de lectura.
        </p>
      </div>

      {/* Selector General de Modo (Claro / Oscuro / Sistema) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {opcionesTema.map((opcion) => {
          const esSeleccionado = tema === opcion.id;
          const Icono = opcion.icono;

          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setTema(opcion.id)}
              className={cn(
                'relative flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer',
                esSeleccionado
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30'
              )}
            >
              {esSeleccionado && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}

              <div
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center mb-3',
                  esSeleccionado
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icono className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-bold text-foreground">{opcion.titulo}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {opcion.descripcion}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

