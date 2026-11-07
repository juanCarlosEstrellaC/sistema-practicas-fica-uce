import { z } from 'zod';

export const esquemaLogin = z.object({
  correo: z
    .string()
    .trim()
    .min(1, 'El correo institucional es requerido')
    .email('Formato de correo electronico invalido')
    .refine((val) => val.endsWith('@uce.edu.ec'), {
      message: 'Debe ingresar un correo institucional (@uce.edu.ec)',
    }),
  contrasenia: z
    .string()
    .min(1, 'La contrasenia es requerida'),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;

