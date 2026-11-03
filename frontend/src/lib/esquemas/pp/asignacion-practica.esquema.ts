import { z } from 'zod';

export const esquemaAsignacionPractica = z
  .object({
    estudianteId: z.coerce
      .number({ required_error: 'Debe seleccionar un estudiante' })
      .int('El identificador del estudiante debe ser un entero')
      .positive('Debe seleccionar un estudiante valido'),
    convenioId: z.coerce
      .number({ required_error: 'Debe seleccionar un convenio' })
      .int('El identificador del convenio debe ser un entero')
      .positive('Debe seleccionar un convenio valido'),
    tutorAcademicoId: z.coerce.number().int().positive().optional().nullable(),
    periodoAcademicoId: z.coerce
      .number({ required_error: 'Debe seleccionar un periodo academico' })
      .int('El periodo academico debe ser un entero')
      .positive('Debe seleccionar un periodo valido'),
    horasAsignadas: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({
          required_error: 'Las horas asignadas son obligatorias',
          invalid_type_error: 'Las horas asignadas deben ser un numero valido',
        })
        .int('Las horas deben ser un numero entero')
        .positive('Las horas asignadas deben ser mayores a 0')
        .max(500, 'Las horas asignadas no pueden exceder las 500 horas')
    ),
    fechaInicio: z.string().optional().or(z.literal('')),
    fechaFin: z.string().optional().or(z.literal('')),
    semestre: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? 1 : Number(val)),
      z
        .number({ invalid_type_error: 'El semestre debe ser un numero valido' })
        .int('El semestre debe ser un numero entero')
        .min(1, 'El semestre minimo es 1')
        .max(10, 'El semestre maximo es 10')
        .optional()
        .default(1)
    ),
    sectorReceptora: z.string().trim().optional().or(z.literal('')),
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

export const esquemaAsignacionMasivaPractica = z.object({
  estudianteIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Debe seleccionar al menos un estudiante'),
  convenioId: z.coerce
    .number({ required_error: 'Debe seleccionar un convenio' })
    .int()
    .positive('Debe seleccionar un convenio valido'),
  tutorAcademicoId: z.coerce.number().int().positive().optional().nullable(),
  periodoAcademicoId: z.coerce
    .number({ required_error: 'Debe seleccionar un periodo academico' })
    .int()
    .positive('Debe seleccionar un periodo valido'),
  horasAsignadas: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: 'Las horas asignadas son obligatorias',
        invalid_type_error: 'Las horas asignadas deben ser un numero valido',
      })
      .int('Las horas deben ser un numero entero')
      .positive('Las horas deben ser mayores a 0')
      .max(500, 'Las horas asignadas no pueden exceder las 500 horas')
  ),
});

export const esquemaActualizarAsignacionPractica = z.object({
  convenioId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: 'Debe seleccionar un convenio',
        invalid_type_error: 'Debe seleccionar un convenio valido',
      })
      .int('El identificador del convenio debe ser un entero')
      .positive('Debe seleccionar un convenio valido')
  ),
  tutorId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z
      .number({ invalid_type_error: 'El tutor debe ser un identificador valido' })
      .int('El identificador del tutor debe ser un entero')
      .positive('Debe seleccionar un tutor valido')
      .nullable()
      .optional()
  ),
  periodoAcademicoId: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        invalid_type_error: 'Debe seleccionar un periodo valido',
      })
      .int('El periodo academico debe ser un entero')
      .positive('Debe seleccionar un periodo valido')
      .optional()
      .nullable()
  ),
  horas: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: 'Las horas asignadas son obligatorias',
        invalid_type_error: 'Las horas deben ser un numero entero valido',
      })
      .int('Las horas deben ser un numero entero')
      .positive('Las horas asignadas deben ser mayores a 0')
      .max(500, 'Las horas asignadas no pueden exceder las 500 horas')
  ),
});

export type FormularioAsignacionPractica = z.infer<typeof esquemaAsignacionPractica>;
export type FormularioAsignacionMasivaPractica = z.infer<typeof esquemaAsignacionMasivaPractica>;
export type FormularioActualizarAsignacionPractica = z.infer<
  typeof esquemaActualizarAsignacionPractica
>;
