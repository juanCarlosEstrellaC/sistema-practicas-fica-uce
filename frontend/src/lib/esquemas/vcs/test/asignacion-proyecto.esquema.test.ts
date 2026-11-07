import { describe, it, expect } from 'vitest';
import {
  esquemaAsignacionProyectoComunitario,
  esquemaAsignacionProyectoComunitarioActualizar,
  esquemaFiltrosAsignacionProyecto,
} from '../asignacion-proyecto.esquema';

describe('esquemas de asignacion a proyectos comunitarios (Zod Validation)', () => {
  describe('esquemaAsignacionProyectoComunitario (Asignacion Masiva)', () => {
    it('debe validar exitosamente cuando todos los campos son correctos', () => {
      const datosValidos = {
        estudiantesId: [1, 2, 3],
        proyectoComunitarioId: 10,
        horasAsignadas: 160,
        carreraId: 1,
        periodoAcademicoId: 2,
      };

      const resultado = esquemaAsignacionProyectoComunitario.safeParse(datosValidos);
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.estudiantesId).toEqual([1, 2, 3]);
        expect(resultado.data.horasAsignadas).toBe(160);
      }
    });

    it('debe convertir strings numericos a numeros gracias a coerce', () => {
      const datosConStrings = {
        estudiantesId: ['1', '2'],
        proyectoComunitarioId: '10',
        horasAsignadas: '160',
        carreraId: 1,
        periodoAcademicoId: 2,
      };

      const resultado = esquemaAsignacionProyectoComunitario.safeParse(datosConStrings);
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.estudiantesId).toEqual([1, 2]);
        expect(resultado.data.proyectoComunitarioId).toBe(10);
        expect(resultado.data.horasAsignadas).toBe(160);
      }
    });

    it('debe fallar si el arreglo de estudiantes esta vacio', () => {
      const datosInvalidos = {
        estudiantesId: [],
        proyectoComunitarioId: 10,
        horasAsignadas: 160,
        carreraId: 1,
        periodoAcademicoId: 2,
      };

      const resultado = esquemaAsignacionProyectoComunitario.safeParse(datosInvalidos);
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('Debe seleccionar al menos un estudiante');
      }
    });

    it('debe fallar si las horas asignadas son menores o iguales a cero', () => {
      const datosHorasCero = {
        estudiantesId: [1],
        proyectoComunitarioId: 10,
        horasAsignadas: 0,
        carreraId: 1,
        periodoAcademicoId: 2,
      };

      const resultado = esquemaAsignacionProyectoComunitario.safeParse(datosHorasCero);
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('El número de horas debe ser mayor a cero');
      }
    });

    it('debe fallar si las horas asignadas superan las 160 horas reglamentarias', () => {
      const datosHorasExcesivas = {
        estudiantesId: [1],
        proyectoComunitarioId: 10,
        horasAsignadas: 161,
        carreraId: 1,
        periodoAcademicoId: 2,
      };

      const resultado = esquemaAsignacionProyectoComunitario.safeParse(datosHorasExcesivas);
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('El número de horas no puede superar 160');
      }
    });
  });

  describe('esquemaAsignacionProyectoComunitarioActualizar (Actualizar Asignacion)', () => {
    it('debe validar exitosamente la actualizacion con datos validos', () => {
      const datosValidos = {
        proyectoComunitarioId: 5,
        horasAsignadas: 120,
      };

      const resultado = esquemaAsignacionProyectoComunitarioActualizar.safeParse(datosValidos);
      expect(resultado.success).toBe(true);
    });

    it('debe fallar si el proyecto o las horas son invalidos', () => {
      const datosInvalidos = {
        proyectoComunitarioId: -1,
        horasAsignadas: 0,
      };

      const resultado = esquemaAsignacionProyectoComunitarioActualizar.safeParse(datosInvalidos);
      expect(resultado.success).toBe(false);
    });

    it('debe fallar si las horas asignadas en actualizacion superan las 160 horas', () => {
      const datosHorasExcesivas = {
        proyectoComunitarioId: 5,
        horasAsignadas: 200,
      };

      const resultado = esquemaAsignacionProyectoComunitarioActualizar.safeParse(datosHorasExcesivas);
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('El número de horas no puede superar 160');
      }
    });
  });

  describe('esquemaFiltrosAsignacionProyecto (Filtros de Tabla)', () => {
    it('debe aplicar valores por defecto para page, size y sort cuando se envia objeto vacio', () => {
      const resultado = esquemaFiltrosAsignacionProyecto.safeParse({});
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.page).toBe(0);
        expect(resultado.data.size).toBe(10);
        expect(resultado.data.sort).toBe('fechaCreacion,desc');
      }
    });

    it('debe parsear y coaccionar strings de searchParams correctamente', () => {
      const searchParams = {
        carreraId: '1',
        periodoAcademicoId: '3',
        proyectoId: '5',
        estado: 'EN_CURSO',
        faseActual: 'ASIGNACION',
        busqueda: '  Juan Perez  ',
        page: '2',
        size: '20',
      };

      const resultado = esquemaFiltrosAsignacionProyecto.safeParse(searchParams);
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.carreraId).toBe(1);
        expect(resultado.data.periodoAcademicoId).toBe(3);
        expect(resultado.data.proyectoId).toBe(5);
        expect(resultado.data.estado).toBe('EN_CURSO');
        expect(resultado.data.faseActual).toBe('ASIGNACION');
        expect(resultado.data.busqueda).toBe('Juan Perez');
        expect(resultado.data.page).toBe(2);
        expect(resultado.data.size).toBe(20);
      }
    });

    it('debe fallar si el estado no pertenece al enum permitido', () => {
      const searchParamsInvalidos = {
        estado: 'ESTADO_INVENTADO',
      };

      const resultado = esquemaFiltrosAsignacionProyecto.safeParse(searchParamsInvalidos);
      expect(resultado.success).toBe(false);
    });

    it('debe fallar si la fase actual no pertenece al enum permitido', () => {
      const searchParamsInvalidos = {
        faseActual: 'FASE_INEXISTENTE',
      };

      const resultado = esquemaFiltrosAsignacionProyecto.safeParse(searchParamsInvalidos);
      expect(resultado.success).toBe(false);
    });
  });
});
