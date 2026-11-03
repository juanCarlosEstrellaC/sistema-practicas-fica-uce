import { describe, it, expect } from 'vitest';
import {
  obtenerEtiquetaFaseDePractica,
  obtenerNumeroFaseDePractica,
  obtenerEtiquetaRol,
  obtenerEtiquetaTipoDocumento,
} from './etiquetas';

describe('Utilidades de Etiquetas (lib/utilidades/etiquetas.ts)', () => {
  it('debe retornar etiquetas de fase de practicas', () => {
    expect(obtenerEtiquetaFaseDePractica('CONVOCATORIA')).toBe('Postulacion');
    expect(obtenerEtiquetaFaseDePractica('DESARROLLO')).toBe('Desarrollo de Practicas');
    expect(obtenerNumeroFaseDePractica('ASIGNACION')).toBe(2);
  });

  it('debe retornar etiquetas legibles de roles', () => {
    expect(obtenerEtiquetaRol('ESTUDIANTE')).toBe('Estudiante');
    expect(obtenerEtiquetaRol('TUTOR_ACADEMICO')).toBe('Tutor Academico');
    expect(obtenerEtiquetaRol('SUBDECANO')).toBe('Subdecano');
  });

  it('debe retornar etiquetas legibles de documentos', () => {
    expect(obtenerEtiquetaTipoDocumento('CV')).toBe('Hoja de Vida (CV)');
    expect(obtenerEtiquetaTipoDocumento('INFORME_FINAL')).toBe('Informe Final');
  });
});
