import { z } from 'zod';

export const esquemaSolicitarRestauracion = z.object({
  correo: z
    .string()
    .trim()
    .min(1, 'El correo institucional es requerido')
    .email('Formato de correo electronico invalido')
    .refine((val) => val.endsWith('@uce.edu.ec'), {
      message: 'Debe ingresar un correo institucional (@uce.edu.ec)',
    }),
});

export const esquemaConfirmarRestauracion = z
  .object({
    token: z
      .string()
      .trim()
      .min(32, 'El token de recuperacion debe tener al menos 32 caracteres'),
    nuevaContrasenia: z
      .string()
      .min(8, 'La contrasenia debe tener al menos 8 caracteres (NIST SP 800-63B)')
      .max(128, 'La contrasenia no puede superar 128 caracteres'),
    confirmarContrasenia: z
      .string()
      .min(1, 'Debe confirmar su nueva contrasenia'),
  })
  .refine((datos) => datos.nuevaContrasenia === datos.confirmarContrasenia, {
    message: 'Las contrasenias no coinciden',
    path: ['confirmarContrasenia'],
  });

export const esquemaCambiarContrasenia = z
  .object({
    contraseniaActual: z
      .string()
      .min(1, 'La contrasenia actual es requerida'),
    nuevaContrasenia: z
      .string()
      .min(8, 'La nueva contrasenia debe tener al menos 8 caracteres (NIST SP 800-63B)')
      .max(128, 'La nueva contrasenia no puede superar 128 caracteres'),
    confirmarContrasenia: z
      .string()
      .min(1, 'Debe confirmar su nueva contrasenia'),
  })
  .refine((datos) => datos.nuevaContrasenia === datos.confirmarContrasenia, {
    message: 'Las contrasenias no coinciden',
    path: ['confirmarContrasenia'],
  });

export type DatosSolicitarRestauracion = z.infer<typeof esquemaSolicitarRestauracion>;
export type DatosConfirmarRestauracion = z.infer<typeof esquemaConfirmarRestauracion>;
export type DatosCambiarContrasenia = z.infer<typeof esquemaCambiarContrasenia>;

