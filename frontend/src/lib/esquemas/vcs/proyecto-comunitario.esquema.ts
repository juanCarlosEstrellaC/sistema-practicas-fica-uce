import { z } from 'zod';

export const esquemaProyectoComunitario = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre del proyecto es obligatorio' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres'),
    descripcion: z.string().trim().optional(),
    carreraId: z.coerce
      .number({ required_error: 'Debe seleccionar una carrera' })
      .int('El identificador de carrera debe ser un entero')
      .positive('Debe seleccionar una carrera válida'),
    tutorAcademicoId: z.coerce.number().int().positive().optional().nullable(),
    estado: z.enum(['ACTIVO', 'FINALIZADO', 'CANCELADO', 'INACTIVO']).optional(),
    fechaInicio: z.string().optional().or(z.literal('')),
    fechaFin: z.string().optional().or(z.literal('')),
    urlDocumento: z.string().trim().optional().nullable().or(z.literal('')),
    nombreDocumento: z.string().trim().optional().nullable().or(z.literal('')),
  })
  .refine(
    (datos) => {
      if (datos.fechaInicio && datos.fechaFin) {
        return new Date(datos.fechaFin) >= new Date(datos.fechaInicio);
      }
      return true;
    },
    {
      message: 'La fecha de finalización debe ser posterior o igual a la fecha de inicio',
      path: ['fechaFin'],
    }
  );

export type FormularioProyectoComunitario = z.infer<typeof esquemaProyectoComunitario>;
