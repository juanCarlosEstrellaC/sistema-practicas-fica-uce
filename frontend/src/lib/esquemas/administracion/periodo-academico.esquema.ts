import { z } from 'zod';

export const estadoPeriodoEnum = z.enum(['ACTIVO', 'INACTIVO']);

export const esquemaPeriodoAcademico = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, 'El nombre del periodo debe tener al menos 3 caracteres')
      .max(50, 'El nombre del periodo no puede exceder 50 caracteres'),
    fechaInicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido (debe ser YYYY-MM-DD)'),
    fechaFin: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido (debe ser YYYY-MM-DD)'),
    estado: estadoPeriodoEnum.default('ACTIVO'),
  })
  .refine(
    (datos) => {
      const inicio = new Date(datos.fechaInicio);
      const fin = new Date(datos.fechaFin);
      return !isNaN(inicio.getTime()) && !isNaN(fin.getTime()) && fin >= inicio;
    },
    {
      message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
      path: ['fechaFin'],
    }
  );

export type DatosPeriodoAcademico = z.infer<typeof esquemaPeriodoAcademico>;

