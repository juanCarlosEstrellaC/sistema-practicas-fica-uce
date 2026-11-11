"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import { Paginador } from '@/components/paginador';
import { BadgeEstadoMatrizCaces } from './badge-estado-matriz-caces';
import { VistaMatrizCacesCarrera } from './vista-matriz-caces-carrera';
import { obtenerMatricesCacesPorPeriodoAccion } from '@/lib/acciones/pp/matriz-caces.acciones';
import { MatrizCacesDto } from '@/lib/tipos/pp/general-pp';

interface VistaMatricesSubdecanoProps {
  periodoId: number | string;
  periodoNombre?: string;
  esInactivo?: boolean;
}

export function VistaMatricesSubdecano({
  periodoId,
  periodoNombre,
  esInactivo = false,
}: VistaMatricesSubdecanoProps) {
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<{
    id: number;
    nombre: string;
    codigo?: string;
    ciudad?: string;
  } | null>(null);

  const [matrices, setMatrices] = useState<MatrizCacesDto[]>([]);
  const [pagina, setPagina] = useState(0);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState('all');
  const [busqueda, setBusqueda] = useState('');

  const [campoOrden, setCampoOrden] = useState<'carrera' | 'codigo' | 'estado'>('carrera');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const alternarOrden = (campo: 'carrera' | 'codigo' | 'estado') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'carrera' | 'codigo' | 'estado') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const cargarMatrices = async () => {
    setCargando(true);
    try {
      const res = await obtenerMatricesCacesPorPeriodoAccion({
        periodoId,
        page: pagina,
        size: elementosPorPagina,
        estado: filtroEstado === 'all' ? undefined : filtroEstado,
        search: busqueda.trim() || undefined,
      });

      setMatrices(res.content || []);
      setTotalPaginas(res.totalPages || 0);
      setTotalElementos(res.totalElements || 0);
    } catch (error) {
      console.error('Error al cargar matrices de CACES para Subdecano:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMatrices();
  }, [periodoId, pagina, elementosPorPagina, filtroEstado, busqueda]);

  const matricesOrdenadas = useMemo(() => {
    return [...matrices].sort((a, b) => {
      if (campoOrden === 'carrera') {
        const nomA = (a.carreraNombre || '').toLowerCase();
        const nomB = (b.carreraNombre || '').toLowerCase();
        return direccionOrden === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      } else if (campoOrden === 'codigo') {
        const codA = (a.carreraCodigo || '').toLowerCase();
        const codB = (b.carreraCodigo || '').toLowerCase();
        return direccionOrden === 'asc' ? codA.localeCompare(codB) : codB.localeCompare(codA);
      } else {
        const estA = (a.estado || '').toLowerCase();
        const estB = (b.estado || '').toLowerCase();
        return direccionOrden === 'asc' ? estA.localeCompare(estB) : estB.localeCompare(estA);
      }
    });
  }, [matrices, campoOrden, direccionOrden]);

  // Si se seleccionó una carrera para inspeccionar su matriz en detalle
  if (carreraSeleccionada) {
    return (
      <VistaMatrizCacesCarrera
        key={`SUBDECANO-${carreraSeleccionada.id}-${periodoId}`}
        rol="SUBDECANO"
        carreraId={carreraSeleccionada.id}
        carreraNombre={carreraSeleccionada.nombre}
        carreraCodigo={carreraSeleccionada.codigo}
        carreraCiudad={carreraSeleccionada.ciudad || 'Quito'}
        codigoIes="1005"
        periodoId={periodoId}
        periodoNombre={periodoNombre}
        esInactivo={esInactivo}
        alVolver={() => {
          setCarreraSeleccionada(null);
          cargarMatrices();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CabeceraListado
        titulo="Matrices CACES de la Facultad"
        total={totalElementos}
        etiquetaTotal="Matrices por carrera"
      />

      {/* Barra de Filtros */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por carrera..."
              className="pl-8 h-9 bg-background border-border"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(0);
              }}
            />
          </div>

          <Select
            value={filtroEstado}
            onValueChange={(val) => {
              setFiltroEstado(val);
              setPagina(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px] h-9 bg-background border-border">
              <SelectValue placeholder="Estado de la matriz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="ENVIADA_A_DC">Enviada a Dirección</SelectItem>
              <SelectItem value="FIRMADA_POR_DC">Firmada por Dirección</SelectItem>
              <SelectItem value="ENVIADA_A_SUBDECANO">En Revisión (Subdecanato)</SelectItem>
              <SelectItem value="FIRMADA_POR_SUBDECANO">Oficializada</SelectItem>
              <SelectItem value="RECHAZADA">Rechazada</SelectItem>
            </SelectContent>
          </Select>

          {(busqueda || filtroEstado !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('all');
                setPagina(0);
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de Carreras */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
              <TableHead
                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('carrera')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('carrera');
                  }
                }}
                aria-sort={campoOrden === 'carrera' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Carrera"
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>Carrera</span>
                  {renderIconoOrden('carrera')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('codigo')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('codigo');
                  }
                }}
                aria-sort={campoOrden === 'codigo' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Código"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Código</span>
                  {renderIconoOrden('codigo')}
                </div>
              </TableHead>
              <TableHead
                className="text-center font-semibold text-foreground cursor-pointer hover:text-primary transition-colors select-none group"
                onClick={() => alternarOrden('estado')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alternarOrden('estado');
                  }
                }}
                aria-sort={campoOrden === 'estado' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                title="Ordenar por Estado Matriz"
              >
                <div className="inline-flex items-center justify-center gap-1.5 w-full">
                  <span>Estado Matriz</span>
                  {renderIconoOrden('estado')}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Cargando matrices CACES...
                </TableCell>
              </TableRow>
            ) : matricesOrdenadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <Search className="w-8 h-8 mb-2" />
                    <p className="font-medium">No se encontraron matrices CACES.</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">
                      Intente ajustar los filtros de búsqueda.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              matricesOrdenadas.map((m) => {
                const nombreCarrera = m.carreraNombre || `Carrera #${m.carreraId}`;
                const codigoCarrera = m.carreraCodigo || 'S/C';

                return (
                  <TableRow key={m.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-foreground">
                          {nombreCarrera}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-muted text-muted-foreground border border-border">
                        {codigoCarrera}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <BadgeEstadoMatrizCaces estado={m.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold"
                          onClick={() =>
                            setCarreraSeleccionada({
                              id: Number(m.carreraId),
                              nombre: nombreCarrera,
                              codigo: codigoCarrera,
                            })
                          }
                        >
                          Revisar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Paginador
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onCambioPagina={setPagina}
        elementosPorPagina={elementosPorPagina}
        onCambioElementosPorPagina={setElementosPorPagina}
      />
    </div>
  );
}
