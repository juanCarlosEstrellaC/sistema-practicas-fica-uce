import { z } from 'zod';

export const TIPOS_DOCUMENTO_PP = [
  'CV',
  'DOCUMENTO_IDENTIDAD',
  'CARTA_ASIGNACION',
  'SEGUIMIENTO_TA',
  'INFORME_FINAL',
  'CERTIFICADO_CUMPLIMIENTO',
  'AVAL',
  'MATRIZ_CACES',
  'EVIDENCIA',
] as const;

export const esquemaDocumentoPortafolio = z.object({
  tipo: z.enum(TIPOS_DOCUMENTO_PP, {
    required_error: 'Debe especificar el tipo de documento',
  }),
  nombreArchivo: z
    .string({ required_error: 'El nombre del archivo es obligatorio' })
    .trim()
    .min(3, 'El nombre del archivo debe tener al menos 3 caracteres'),
  urlArchivo: z
    .string({ required_error: 'La URL del archivo es obligatoria' })
    .trim()
    .min(1, 'La URL del archivo no puede estar vacia'),
  estudianteId: z.coerce.number().int().positive('Identificador de estudiante invalido'),
  asignacionId: z.coerce.number().int().positive().optional().nullable(),
  observacion: z.string().trim().optional(),
});

export const esquemaRevisionDocumento = z.object({
  estado: z.enum(['APROBADO', 'RECHAZADO', 'PENDIENTE_REVISION'], {
    required_error: 'Debe seleccionar un estado de revision (APROBADO, RECHAZADO o PENDIENTE_REVISION)',
  }),
  observacion: z.string().trim().optional(),
});

export type FormularioDocumentoPortafolio = z.infer<typeof esquemaDocumentoPortafolio>;
export type FormularioRevisionDocumento = z.infer<typeof esquemaRevisionDocumento>;
