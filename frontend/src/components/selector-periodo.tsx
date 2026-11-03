'use client';

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PeriodoAcademico } from '@/lib/tipos/general'
import { PeriodoAcademicoDto } from '@/lib/tipos/pp/general-pp'
import { obtenerPeriodosAcademicosAccion } from '@/lib/acciones/periodo-academico.acciones'

export interface SelectorPeriodoProps {
  periodoSeleccionado: string;
  onPeriodoChange: (periodo: string) => void;
  periodos?: (PeriodoAcademico | PeriodoAcademicoDto)[];
  id?: string;
  className?: string;
}

export function SelectorPeriodo({
  periodoSeleccionado,
  onPeriodoChange,
  periodos: periodosProp,
  id = "period-select",
  className = "w-[150px] bg-background border border-input rounded-md h-9 shadow-sm"
}: SelectorPeriodoProps) {
  const [listaPeriodos, setListaPeriodos] = useState<(PeriodoAcademico | PeriodoAcademicoDto)[]>(periodosProp || [])

  useEffect(() => {
    if (periodosProp && periodosProp.length > 0) {
      setListaPeriodos(periodosProp)
      return
    }

    let cancelado = false
    const cargarPeriodos = async () => {
      try {
        const respuesta = await obtenerPeriodosAcademicosAccion()
        if (!cancelado && respuesta.content) {
          setListaPeriodos(respuesta.content)
        }
      } catch (error) {
        console.error('Error al obtener periodos en SelectorPeriodo:', error)
      }
    }

    cargarPeriodos()
    return () => {
      cancelado = true
    }
  }, [periodosProp])

  const periodosOrdenados = [...listaPeriodos].sort((a, b) => {
    if (a.estado === 'ACTIVO' && b.estado !== 'ACTIVO') return -1;
    if (b.estado === 'ACTIVO' && a.estado !== 'ACTIVO') return 1;
    return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
  });

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Label htmlFor={id} className="hidden sm:inline-block text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
        Periodo:
      </Label>
      <Select value={periodoSeleccionado} onValueChange={onPeriodoChange}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          {periodosOrdenados.map(period => (
            <SelectItem key={period.id} value={String(period.id)}>
              <span className="flex items-center justify-between w-full gap-2">
                <span>{period.nombre}</span>
                {period.estado === 'INACTIVO' ? (
                  <span className="text-[10px] text-muted-foreground font-normal">(Inactivo)</span>
                ) : (
                  <span className="text-[10px] text-primary font-semibold">(Activo)</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
