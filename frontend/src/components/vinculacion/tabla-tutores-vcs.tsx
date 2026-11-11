'use client';

import React, { useState } from 'react';
import { TutorResumenVcsDto, ProyectoResumenDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import { ModalAsociarProyectosTutor } from './modal-asociar-proyectos-tutor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserCheck, FolderGit2, Mail, CreditCard, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion';
import { PERMISOS, tienePermiso } from '@/lib/seguridad/permisos';
import { CabeceraListado } from '@/components/comunes/cabecera-listado';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';

interface TablaTutoresVcsProps {
  tutores: TutorResumenVcsDto[];
  proyectos?: ProyectoResumenDto[];
  esInactivo?: boolean;
}

export function TablaTutoresVcs({ tutores, proyectos = [], esInactivo = false }: TablaTutoresVcsProps) {
  const { usuario } = useAutenticacion();
  const [tutorAEditar, setTutorAEditar] = useState<TutorResumenVcsDto | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoOrden, setCampoOrden] = useState<'nombre' | 'asignados' | 'proyectos'>('nombre');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('asc');

  const puedeAsociar = !esInactivo && tienePermiso(usuario?.rol, PERMISOS.TUTORES_ASOCIAR_PROYECTOS);

  const abrirModalAsociacion = (tutor: TutorResumenVcsDto) => {
    setTutorAEditar(tutor);
    setModalAbierto(true);
  };

  const alternarOrden = (campo: 'nombre' | 'asignados' | 'proyectos') => {
    if (campoOrden === campo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setCampoOrden(campo);
      setDireccionOrden('asc');
    }
  };

  const renderIconoOrden = (campo: 'nombre' | 'asignados' | 'proyectos') => {
    if (campoOrden !== campo) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />;
    }
    return direccionOrden === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary transition-transform" />
    );
  };

  const tutoresOrdenados = [...tutores].sort((a, b) => {
    if (campoOrden === 'nombre') {
      const nombreA = `${a.nombres || ''} ${a.apellidos || ''}`.toLowerCase();
      const nombreB = `${b.nombres || ''} ${b.apellidos || ''}`.toLowerCase();
      return direccionOrden === 'asc'
        ? nombreA.localeCompare(nombreB)
        : nombreB.localeCompare(nombreA);
    } else if (campoOrden === 'asignados') {
      const cantidadA = a.proyectos?.length || 0;
      const cantidadB = b.proyectos?.length || 0;
      return direccionOrden === 'asc' ? cantidadA - cantidadB : cantidadB - cantidadA;
    } else {
      const proyA = (a.proyectos || []).map((p) => p.nombre || '').join(', ').toLowerCase();
      const proyB = (b.proyectos || []).map((p) => p.nombre || '').join(', ').toLowerCase();
      return direccionOrden === 'asc' ? proyA.localeCompare(proyB) : proyB.localeCompare(proyA);
    }
  });

  return (
    <div className="space-y-4">
      {/* Cabecera del listado alineada al diseño general */}
      <CabeceraListado
        titulo="Listado de Tutores Académicos"
        total={tutores.length}
        etiquetaTotal="Total de tutores encontrados"
      />

      {/* Tabla (Desktop) y Tarjetas (Mobile) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 select-none">
                <TableHead
                  className="w-[35%] font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('nombre')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('nombre');
                    }
                  }}
                  aria-sort={campoOrden === 'nombre' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Tutor Académico"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Tutor Académico</span>
                    {renderIconoOrden('nombre')}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[12%] font-semibold text-center cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('asignados')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('asignados');
                    }
                  }}
                  aria-sort={campoOrden === 'asignados' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Asignados"
                >
                  <div className="inline-flex items-center justify-center gap-1.5 w-full">
                    <span>Asignados</span>
                    {renderIconoOrden('asignados')}
                  </div>
                </TableHead>
                <TableHead
                  className="w-[41%] font-semibold cursor-pointer hover:text-primary transition-colors select-none group"
                  onClick={() => alternarOrden('proyectos')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarOrden('proyectos');
                    }
                  }}
                  aria-sort={campoOrden === 'proyectos' ? (direccionOrden === 'asc' ? 'ascending' : 'descending') : 'none'}
                  title="Ordenar por Proyectos Asociados"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Proyectos Asociados (Máx. 2)</span>
                    {renderIconoOrden('proyectos')}
                  </div>
                </TableHead>
                {puedeAsociar && (
                  <TableHead className="w-[12%] font-semibold text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutoresOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={puedeAsociar ? 4 : 3} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No se encontraron tutores académicos</p>
                      <p className="text-xs text-muted-foreground/80">
                        Verifique los filtros aplicados o la configuración de tutores de la carrera.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tutoresOrdenados.map((tutor) => {
                  return (
                    <TableRow key={tutor.id} className="hover:bg-muted/30 transition-colors">
                      {/* Tutor Académico con Avatar, Nombre, Cédula y Correo */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarUsuario
                            nombre={tutor.nombres}
                            apellido={tutor.apellidos}
                            tamano="sm"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-semibold text-sm text-foreground leading-tight truncate">
                              {tutor.nombres} {tutor.apellidos}
                            </div>
                            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                              {tutor.identificacion && (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/90">
                                  C.I: {tutor.identificacion}
                                </span>
                              )}
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 text-muted-foreground/70" />
                                {tutor.correo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Proyectos Asignados sobre el máximo de 2 */}
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 font-semibold px-2.5 py-0.5 text-xs"
                        >
                          {tutor.proyectos?.length ?? 0}/2
                        </Badge>
                      </TableCell>

                      {/* Proyectos Asociados */}
                      <TableCell>
                        {tutor.proyectos && tutor.proyectos.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {tutor.proyectos.map((proyecto) => (
                              <Badge
                                key={proyecto.id}
                                variant="outline"
                                className="bg-background text-foreground text-xs py-1 px-2.5 font-normal border-border flex items-center gap-1.5 shadow-none"
                              >
                                <FolderGit2 className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                <span className="truncate max-w-[260px]">{proyecto.nombre}</span>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Sin proyectos asociados
                          </span>
                        )}
                      </TableCell>

                      {/* Acciones para Director de Carrera */}
                      {puedeAsociar && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirModalAsociacion(tutor)}
                            className="h-8 gap-1.5 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                            title="Asociar proyectos a este tutor"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Asociar Proyectos</span>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Vista Móvil */}
        <div className="md:hidden divide-y divide-border">
          {tutoresOrdenados.length === 0 ? (
            <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <UserCheck className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No se encontraron tutores académicos</p>
              <p className="text-xs text-muted-foreground/80">
                Verifique los filtros aplicados o la configuración de tutores de la carrera.
              </p>
            </div>
          ) : (
            tutoresOrdenados.map((tutor) => {
              return (
                <div key={tutor.id} className="p-4 space-y-3 hover:bg-muted/30 transition-colors">
                  {/* Cabecera Tarjeta: Tutor + Cantidad Asignados */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <AvatarUsuario
                        nombre={tutor.nombres}
                        apellido={tutor.apellidos}
                        tamano="sm"
                      />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="font-semibold text-sm text-foreground leading-tight truncate">
                          {tutor.nombres} {tutor.apellidos}
                        </div>
                        {tutor.identificacion && (
                          <div className="text-[11px] text-muted-foreground/90 truncate">
                            C.I: {tutor.identificacion}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <Mail className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{tutor.correo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 font-semibold px-2 py-0.5 text-xs"
                      >
                        {tutor.proyectos?.length ?? 0}/2
                      </Badge>
                    </div>
                  </div>

                  {/* Proyectos Asociados */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-medium text-muted-foreground">Proyectos Asociados:</span>
                    {tutor.proyectos && tutor.proyectos.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {tutor.proyectos.map((proyecto) => (
                          <div
                            key={proyecto.id}
                            className="bg-muted/40 p-2 rounded-md border border-border/50 text-xs text-foreground flex items-center gap-2 min-w-0"
                          >
                            <FolderGit2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{proyecto.nombre}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Sin proyectos asociados
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  {puedeAsociar && (
                    <div className="pt-2 border-t border-border/40">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalAsociacion(tutor)}
                        className="w-full min-h-[38px] gap-1.5 text-xs font-medium text-primary border-primary/20 hover:bg-primary/10"
                      >
                        <Edit className="h-3.5 w-3.5 shrink-0" />
                        <span>Asociar Proyectos</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Asociación de Proyectos */}
      <ModalAsociarProyectosTutor
        abierto={modalAbierto}
        abrirModal={setModalAbierto}
        tutor={tutorAEditar}
        proyectos={proyectos}
      />
    </div>
  );
}
