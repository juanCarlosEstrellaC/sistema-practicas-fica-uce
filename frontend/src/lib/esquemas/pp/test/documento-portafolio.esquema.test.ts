import { describe, it, expect } from 'vitest';
import {
  esquemaDocumentoPortafolio,
  esquemaRevisionDocumento,
} from '../documento-portafolio.esquema';

describe('esquemaDocumentoPortafolio (Validacion Zod)', () => {
  it('debe validar un documento valido del portafolio', () => {
    const datosValidos = {
      tipo: 'CV' as const,
      nombreArchivo: 'Curriculum_Vitae_Estudiante.pdf',
      urlArchivo: '/archivos_subidos/cv_123.pdf',
      estudianteId: 10,
      asignacionId: 2,
    };

    const resultado = esquemaDocumentoPortafolio.safeParse(datosValidos);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar si el tipo de documento no pertenece a los permitidos', () => {
    const datosInvalidos = {
      tipo: 'TIPO_INEXISTENTE',
      nombreArchivo: 'archivo.pdf',
      urlArchivo: '/archivos/1.pdf',
      estudianteId: 1,
    };

    const resultado = esquemaDocumentoPortafolio.safeParse(datosInvalidos);
    expect(resultado.success).toBe(false);
  });

  it('debe validar correctamente la revision de un documento', () => {
    const datosRevision = {
      estado: 'APROBADO' as const,
      observacion: 'Documento firmado y sellado correctamente.',
    };

    const resultado = esquemaRevisionDocumento.safeParse(datosRevision);
    expect(resultado.success).toBe(true);
  });
});
