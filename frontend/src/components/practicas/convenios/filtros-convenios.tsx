'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

export interface FiltrosConveniosProps {
  esSubdecano?: boolean;
  alAbrirNuevoConvenio?: () => void;
  alAbrirSugerirConvenio?: () => void;
}

export function FiltrosConvenios({
  esSubdecano,
  alAbrirNuevoConvenio,
  alAbrirSugerirConvenio,
}: FiltrosConveniosProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [estaPendiente, iniciarTransicion] = useTransition();
  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get('busqueda') || '');

  const busquedaDebounce = useDebounce(textoBusqueda, 400);
  const esPrimeraCarga = useRef(true);

  useEffect(() => {
    setTextoBusqueda(searchParams.get('busqueda') || '');
  }, [searchParams]);

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
      const params = new URLSearchParams(searchParams.toString());
      params.delete('busqueda');
      params.delete('estado');
      params.set('page', '0');
      const consulta = params.toString();
      router.push(consulta ? `${pathname}?${consulta}` : pathname);
    });
  };

  const tieneFiltrosActivos =
    Boolean(searchParams.get('busqueda')) ||
    (Boolean(searchParams.get('estado')) && searchParams.get('estado') !== 'TODOS');

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 min-w-0">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0">
        {/* Buscador por nombre o tutor */}
        <div className="relative w-full md:flex-1 min-w-0 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary shrink-0 pointer-events-none transition-colors" />
          <Input
            placeholder="Buscar por institución o responsable..."
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
              type="button"
              onClick={() => {
                setTextoBusqueda('');
                aplicarFiltro('busqueda', null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/80 transition-all rounded-md"
              title="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filtros a la derecha */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 justify-end min-w-0">
          {/* Filtro Estado */}
          <div className="w-full sm:w-[180px] min-w-0">
            <Select
              value={searchParams.get('estado') || 'TODOS'}
              onValueChange={(val) => aplicarFiltro('estado', val)}
            >
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="Todos los estados" className="truncate text-left block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="POR_EXPIRAR">Por Vencer</SelectItem>
                <SelectItem value="EXPIRADO">Vencido</SelectItem>
                <SelectItem value="ANULADO">Anulado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boton Limpiar */}
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
