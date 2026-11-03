'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarreraDto } from '@/lib/tipos/pp/general-pp';
import { useDebounce } from '@/hooks/use-debounce';

export interface FiltrosEstudiantesProps {
  esSubdecano?: boolean;
  carreras?: CarreraDto[];
}

export function FiltrosEstudiantes({
  esSubdecano = false,
  carreras = [],
}: FiltrosEstudiantesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaPendiente, iniciarTransicion] = useTransition();

  const busquedaUrl = searchParams.get('busqueda') || '';
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
    const busquedaActual = searchParams.get('busqueda') || '';
    if (busquedaDebounce !== busquedaActual) {
      aplicarFiltro('busqueda', busquedaDebounce);
    }
  }, [busquedaDebounce]);

  const aplicarFiltro = (clave: string, valor: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '0');

    if (valor && valor !== 'TODOS' && valor.trim() !== '') {
      params.set(clave, valor.trim());
      if (clave === 'faseActual') {
        params.delete('fase');
      }
    } else {
      params.delete(clave);
      if (clave === 'faseActual') {
        params.delete('fase');
      }
    }

    iniciarTransicion(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const carreraSeleccionada = searchParams.get('carreraId');
  const faseSeleccionada = searchParams.get('faseActual') || searchParams.get('fase') || 'TODOS';
  const estadoSeleccionado = searchParams.get('estado') || 'TODOS';

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    const params = new URLSearchParams();
    const periodoId = searchParams.get('periodoId');
    if (periodoId) {
      params.set('periodoId', periodoId);
    }
    iniciarTransicion(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    });
  };

  const tieneFiltrosActivos =
    Boolean(searchParams.get('busqueda')) ||
    (Boolean(carreraSeleccionada) && carreraSeleccionada !== 'TODOS') ||
    (Boolean(searchParams.get('faseActual') || searchParams.get('fase')) && faseSeleccionada !== 'TODOS') ||
    (Boolean(estadoSeleccionado) && estadoSeleccionado !== 'TODOS');

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-sm space-y-3 min-w-0">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0">
        {/* Busqueda a la izquierda */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const inputEl = e.currentTarget.elements.namedItem('busqueda') as HTMLInputElement | null;
            const valorInput = inputEl?.value ?? textoBusqueda;
            aplicarFiltro('busqueda', valorInput);
          }}
          className="relative w-full md:flex-1 min-w-0 group"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary shrink-0 pointer-events-none transition-colors" />
          <Input
            name="busqueda"
            placeholder="Buscar por estudiante, cédula o institución..."
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            className="pl-9 pr-9 h-9 w-full min-w-0 placeholder:truncate text-xs sm:text-sm"
          />
          {textoBusqueda && (
            <button
              onClick={() => {
                setTextoBusqueda('');
                aplicarFiltro('busqueda', null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/80 transition-all rounded-md"
              type="button"
              title="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Grupo de selectores */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0 justify-end min-w-0">
          {/* Filtro Carrera (Solo visible para Subdecano) */}
          {esSubdecano && carreras && carreras.length > 0 && (
            <div className="w-full sm:w-[190px] min-w-0">
              <Select
                value={carreraSeleccionada || 'TODOS'}
                onValueChange={(val) => aplicarFiltro('carreraId', val)}
              >
                <SelectTrigger className="h-9 w-full min-w-0">
                  <SelectValue placeholder="Todas las carreras" className="truncate text-left block" />
                </SelectTrigger>
                <SelectContent className="max-w-[320px]">
                  <SelectItem value="TODOS">Todas las carreras</SelectItem>
                  {carreras.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <span className="truncate">{c.nombre}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro Fase */}
          <div className="w-full sm:w-[155px] min-w-0">
            <Select
              value={faseSeleccionada}
              onValueChange={(val) => aplicarFiltro('faseActual', val)}
            >
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="Todas las fases" className="truncate text-left block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas las fases</SelectItem>
                <SelectItem value="ASIGNACION">Asignación</SelectItem>
                <SelectItem value="DESARROLLO">Desarrollo</SelectItem>
                <SelectItem value="FINALIZACION">Finalización</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Estado */}
          <div className="w-full sm:w-[155px] min-w-0">
            <Select
              value={estadoSeleccionado}
              onValueChange={(val) => aplicarFiltro('estado', val)}
            >
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="Todos los estados" className="truncate text-left block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="EN_CURSO">En Curso</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limpiar */}
          {tieneFiltrosActivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground w-full sm:w-auto justify-center shrink-0"
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
