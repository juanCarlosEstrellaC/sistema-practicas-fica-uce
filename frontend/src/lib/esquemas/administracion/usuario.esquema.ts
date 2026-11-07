import { z } from 'zod';

export const rolesUsuarioEnum = z.enum([
  'SUBDECANO',
  'DIRECTOR_CARRERA',
  'COORDINADOR_PRACTICAS',
  'TUTOR_ACADEMICO',
  'ESTUDIANTE',
]);

export const tipoIdentificacionEnum = z.enum(['CEDULA', 'PASAPORTE']);

export const esquemaUsuario = z.object({
  tipoIdentificacion: tipoIdentificacionEnum,
  identificacion: z
    .string()
    .trim()
    .min(1, 'La identificacion es requerida')
    .refine(
      (val) => /^\d{10}$/.test(val) || val.length >= 5,
      'La identificacion debe tener un formato valido (10 digitos numericos para cedula)'
    ),
  nombres: z
    .string()
    .trim()
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .max(100, 'Los nombres no pueden exceder 100 caracteres'),
  apellidos: z
    .string()
    .trim()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(100, 'Los apellidos no pueden exceder 100 caracteres'),
  correo: z
    .string()
    .trim()
    .min(1, 'El correo institucional es requerido')
    .email('Formato de correo electronico invalido')
    .refine((val) => val.endsWith('@uce.edu.ec'), {
      message: 'Debe ser un correo institucional (@uce.edu.ec)',
    }),
  rol: rolesUsuarioEnum,
  carreraId: z.number().int().positive().nullable().optional(),
  telefono: z
    .string()
    .trim()
    .regex(/^09\d{8}$/, 'El telefono debe tener 10 digitos e iniciar con 09')
    .nullable()
    .optional()
    .or(z.literal('')),
});

export const esquemaActualizarPerfil = z.object({
  telefono: z
    .string()
    .trim()
    .regex(/^09\d{8}$/, 'El telefono debe tener 10 digitos e iniciar con 09')
    .nullable()
    .optional()
    .or(z.literal('')),
});

export type DatosUsuario = z.infer<typeof esquemaUsuario>;
export type DatosActualizarPerfil = z.infer<typeof esquemaActualizarPerfil>;

