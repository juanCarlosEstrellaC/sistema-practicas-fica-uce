import { describe, it, expect } from 'vitest';
import { esquemaUsuario, esquemaActualizarPerfil } from '../usuario.esquema';

describe('esquemaUsuario (Validacion Zod)', () => {
  it('debe validar un usuario con datos institucionales correctos', () => {
    const usuarioValido = {
      tipoIdentificacion: 'CEDULA' as const,
      identificacion: '1723456789',
      nombres: 'Carlos Alberto',
      apellidos: 'Gomez Andrade',
      correo: 'carlos.gomez@uce.edu.ec',
      rol: 'ESTUDIANTE' as const,
      carreraId: 1,
      telefono: '0987654321',
    };

    const resultado = esquemaUsuario.safeParse(usuarioValido);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar si la cedula no tiene 10 digitos', () => {
    const usuarioInvalido = {
      tipoIdentificacion: 'CEDULA' as const,
      identificacion: '123',
      nombres: 'Carlos',
      apellidos: 'Gomez',
      correo: 'carlos.gomez@uce.edu.ec',
      rol: 'ESTUDIANTE' as const,
    };

    const resultado = esquemaUsuario.safeParse(usuarioInvalido);
    expect(resultado.success).toBe(false);
  });

  it('debe fallar si el correo no es @uce.edu.ec', () => {
    const usuarioInvalido = {
      tipoIdentificacion: 'CEDULA' as const,
      identificacion: '1723456789',
      nombres: 'Carlos',
      apellidos: 'Gomez',
      correo: 'carlos.gomez@yahoo.es',
      rol: 'DOCENTE' as any,
    };

    const resultado = esquemaUsuario.safeParse(usuarioInvalido);
    expect(resultado.success).toBe(false);
  });
});

describe('esquemaActualizarPerfil', () => {
  it('debe validar un numero celular ecuatoriano valido de 10 digitos', () => {
    const res = esquemaActualizarPerfil.safeParse({ telefono: '0991234567' });
    expect(res.success).toBe(true);
  });

  it('debe permitir telefono vacio o nulo', () => {
    const res = esquemaActualizarPerfil.safeParse({ telefono: '' });
    expect(res.success).toBe(true);
  });

  it('debe rechazar telefono no ecuatoriano o con longitud incorrecta', () => {
    const res = esquemaActualizarPerfil.safeParse({ telefono: '1234567' });
    expect(res.success).toBe(false);
  });
});

