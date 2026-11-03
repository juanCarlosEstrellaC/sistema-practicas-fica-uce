import { z } from 'zod';

export const esquemaAsignacionProyectoComunitario = z.object({
    estudiantesId: z.array(z.coerce.number().int().positive()).min(1, 'Debe seleccionar al menos un estudiante'),
    proyectoComunitarioId: z.coerce.number().int().positive('Debe seleccionar un proyecto comunitario'),
    horasAsignadas: z.coerce.number().int().positive('El número de horas debe ser mayor a cero').max(500, 'El número de horas no puede superar 500'),
    carreraId: z.number().int().positive(),
    periodoAcademicoId: z.number().int().positive()
});

export const esquemaAsignacionProyectoComunitarioActualizar = z.object({
    proyectoComunitarioId: z.coerce.number().int().positive('Debe seleccionar un proyecto comunitario'),
    horasAsignadas: z.coerce.number().int().positive('El número de horas debe ser mayor a cero').max(500, 'El número de horas no puede superar 500')
});

export const esquemaFiltrosAsignacionProyecto = z.object({
    carreraId: z.coerce.number().int().positive().optional(),
    periodoAcademicoId: z.coerce.number().int().positive().optional(),
    proyectoId: z.coerce.number().int().positive().optional(),
    estado: z.enum(['EN_CURSO', 'APROBADO', 'REPROBADO', 'CANCELADO']).optional(),
    faseActual: z.enum(['ASIGNACION', 'DESARROLLO', 'EVALUACION', 'FINALIZADO']).optional(),
    busqueda: z.string().trim().optional(),
    page: z.coerce.number().int().nonnegative().default(0),
    size: z.coerce.number().int().positive().default(10),
    sort: z.string().default('fechaCreacion,desc'),
});

export type FormularioAsignacionMasiva = z.infer<typeof esquemaAsignacionProyectoComunitario>;
export type FormularioAsignacionActualizar = z.infer<typeof esquemaAsignacionProyectoComunitarioActualizar>;
export type FiltrosAsignacionProyectoValidado = z.infer<typeof esquemaFiltrosAsignacionProyecto>;
