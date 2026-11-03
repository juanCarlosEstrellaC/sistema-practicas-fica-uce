'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, RotateCcw } from 'lucide-react';

export interface FiltrosTutoresPracticasProps {
  esSubdecano?: boolean;
  carreras?: CarreraDto[];
}

export function FiltrosTutoresPracticas({
  esSubdecano = false,
  carreras = [],
}: FiltrosTutoresPracticasProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaPendiente, iniciarTransicion] = useTransition();

  const busquedaUrl = searchParams?.get('busqueda') || '';
  const [textoBusqueda, setTextoBusqueda] = useState(busquedaUrl);
  const busquedaDebounce = useDebounce(textoBusqueda, 500);
  const esPrimeraCarga = useRef(true);

  // Sincronizar input si los searchParams cambian externamente
  useEffect(() => {
    setTextoBusqueda(busquedaUrl);
  }, [busquedaUrl]);

  // Aplicar busqueda automatica con debounce
  useEffect(() => {
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false;
      return;
    }
    const busquedaActual = searchParams?.get('busqueda') || '';
    if (busquedaDebounce !== busquedaActual) {
      aplicarFiltro('busqueda', busquedaDebounce);
    }
  }, [busquedaDebounce]);

  const aplicarFiltro = (clave: string, valor: string | null) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('page', '0');

    if (valor && valor !== 'TODOS' && valor.trim() !== '') {
      params.set(clave, valor.trim());
    } else {
      params.delete(clave);
    }

    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    iniciarTransicion(() => {
      const params = new URLSearchParams();
      const periodoId = searchParams?.get('periodoId');
      if (periodoId) {
        params.set('periodoId', periodoId);
      }
      const consulta = params.toString();
      router.push(consulta ? `${pathname}?${consulta}` : pathname);
    });
  };

  const carreraSeleccionada = searchParams?.get('carreraId');
  const asignacionSeleccionada = searchParams?.get('conAsignaciones') || 'TODOS';

  const tieneFiltrosActivos =
    Boolean(searchParams?.get('busqueda')) ||
    (Boolean(carreraSeleccionada) && carreraSeleccionada !== 'TODOS') ||
    (Boolean(asignacionSeleccionada) && asignacionSeleccionada !== 'TODOS');

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3 min-w-0">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0">
        {/* Busqueda a la izquierda */}
        <div className="relative flex-1 min-w-0 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary shrink-0 pointer-events-none transition-colors" />
          <Input
            placeholder="Buscar tutor por nombre, cédula o correo..."
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                aplicarFiltro('busqueda', textoBusqueda);
              }
            }}
            className="pl-9 pr-9 h-9 w-full min-w-0 placeholder:truncate text-xs sm:text-sm"
          />
          {textoBusqueda && (
            <button
              onClick={() => {
                setTextoBusqueda('');
                aplicarFiltro('busqueda', null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm"
              title="Borrar búsqueda"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Grupo de selectores a la derecha */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 justify-end">
          {/* Selector de Carrera si es Subdecano */}
          {esSubdecano && carreras.length > 0 && (
            <div className="w-full sm:w-[220px] min-w-0">
              <Select
                value={carreraSeleccionada || 'TODOS'}
                onValueChange={(val) => aplicarFiltro('carreraId', val)}
              >
                <SelectTrigger className="h-9 w-full min-w-0 truncate text-xs sm:text-sm">
                  <SelectValue placeholder="Todas las carreras" className="truncate text-left block" />
                </SelectTrigger>
                <SelectContent className="max-w-[320px]">
                  <SelectItem value="TODOS">Todas las carreras</SelectItem>
                  {carreras.map((carrera) => (
                    <SelectItem key={carrera.id} value={carrera.id.toString()}>
                      <span className="truncate">{carrera.nombre}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selector de Asignaciones / Carga */}
          <div className="w-full sm:w-[200px] min-w-0">
            <Select
              value={asignacionSeleccionada}
              onValueChange={(val) => aplicarFiltro('conAsignaciones', val)}
            >
              <SelectTrigger className="h-9 w-full min-w-0 truncate text-xs sm:text-sm">
                <SelectValue placeholder="Todos los tutores" className="truncate text-left block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los tutores</SelectItem>
                <SelectItem value="CON_ASIGNACIONES">Con estudiantes</SelectItem>
                <SelectItem value="SIN_ASIGNACIONES">Sin estudiantes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boton Limpiar */}
          {tieneFiltrosActivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0 text-xs sm:text-sm"
              disabled={estaPendiente}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
