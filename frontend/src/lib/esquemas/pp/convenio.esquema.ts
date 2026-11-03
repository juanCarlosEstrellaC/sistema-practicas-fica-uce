import { z } from 'zod';

export const esquemaConvenio = z
  .object({
    institucion: z
      .string({ required_error: 'El nombre de la institucion es obligatorio' })
      .trim()
      .min(3, 'La institucion debe tener al menos 3 caracteres'),
    tipo: z.enum(['PUBLICO', 'PRIVADO'], {
      required_error: 'Debe seleccionar un tipo de convenio (PUBLICO o PRIVADO)',
    }),
    campoEspecifico: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({
          required_error: 'El campo especifico es obligatorio',
          invalid_type_error: 'El campo especifico debe ser un numero valido',
        })
        .min(0, 'El campo especifico debe ser mayor o igual a 0')
    ),
    tutorInstitucional: z
      .string({ required_error: 'El tutor institucional es obligatorio' })
      .trim()
      .min(3, 'El nombre del tutor debe tener al menos 3 caracteres'),
    correoTutor: z
      .string({ required_error: 'El correo del tutor es obligatorio' })
      .trim()
      .email('Debe proporcionar un correo electronico valido'),
    telefonoTutor: z
      .string()
      .trim()
      .regex(/^[0-9+() -]*$/, 'Formato de telefono invalido')
      .optional()
      .or(z.literal('')),
    direccion: z
      .string({ required_error: 'La direccion es obligatoria' })
      .trim()
      .min(5, 'La direccion debe tener al menos 5 caracteres'),
    cuposTotales: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({
          required_error: 'Los cupos totales son obligatorios',
          invalid_type_error: 'Los cupos deben ser un numero valido',
        })
        .int('Los cupos deben ser un numero entero')
        .min(0, 'Los cupos deben ser mayores o iguales a 0')
        .max(1000, 'Los cupos no pueden exceder 1000')
    ),
    estado: z.enum(['ACTIVO', 'POR_EXPIRAR', 'EXPIRADO', 'ANULADO']).optional().default('ACTIVO'),
    fechaInicio: z
      .string({ required_error: 'La fecha de inicio es obligatoria' })
      .min(1, 'La fecha de inicio es obligatoria'),
    fechaFin: z
      .string({ required_error: 'La fecha de fin es obligatoria' })
      .min(1, 'La fecha de fin es obligatoria'),
    urlDocumento: z.string().optional().or(z.literal('')),
    nombreDocumento: z.string().optional().or(z.literal('')),
  })
  .refine(
    (datos) => {
      if (datos.fechaInicio && datos.fechaFin) {
        return new Date(datos.fechaFin) >= new Date(datos.fechaInicio);
      }
      return true;
    },
    {
      message: 'La fecha de finalizacion debe ser posterior o igual a la fecha de inicio',
      path: ['fechaFin'],
    }
  );

export type FormularioConvenio = z.infer<typeof esquemaConvenio>;
