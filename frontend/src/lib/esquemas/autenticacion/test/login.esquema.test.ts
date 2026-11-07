import { describe, it, expect } from 'vitest';
import { esquemaLogin } from '../login.esquema';

describe('esquemaLogin (Validacion Zod)', () => {
  it('debe validar credenciales con formato y dominio institucional correcto', () => {
    const credenciales = {
      correo: 'estudiante.prueba@uce.edu.ec',
      contrasenia: 'MiClaveSegura2026!',
    };

    const resultado = esquemaLogin.safeParse(credenciales);
    expect(resultado.success).toBe(true);
  });

  it('debe fallar si el correo no pertenece al dominio @uce.edu.ec', () => {
    const credenciales = {
      correo: 'usuario@gmail.com',
      contrasenia: 'clave1234',
    };

    const resultado = esquemaLogin.safeParse(credenciales);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const error = resultado.error.errors.find((e) => e.path.includes('correo'));
      expect(error?.message).toContain('@uce.edu.ec');
    }
  });

  it('debe fallar si la contrasenia esta vacia', () => {
    const credenciales = {
      correo: 'docente@uce.edu.ec',
      contrasenia: '',
    };

    const resultado = esquemaLogin.safeParse(credenciales);
    expect(resultado.success).toBe(false);
  });
});

