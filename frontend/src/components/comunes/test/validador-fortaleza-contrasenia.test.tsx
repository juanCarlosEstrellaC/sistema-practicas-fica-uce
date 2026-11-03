import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  ValidadorFortalezaContrasenia,
  evaluarFortalezaContrasenia,
} from '../validador-fortaleza-contrasenia';

describe('ValidadorFortalezaContrasenia (NIST SP 800-63B)', () => {
  it('debe evaluar como no fuerte una contrasenia vacia o incompleta', () => {
    const vacia = evaluarFortalezaContrasenia('');
    expect(vacia.esFuerte).toBe(false);
    expect(vacia.tieneLongitud).toBe(false);

    const incompleta = evaluarFortalezaContrasenia('Clave123');
    expect(incompleta.tieneLongitud).toBe(true);
    expect(incompleta.tieneMayuscula).toBe(true);
    expect(incompleta.tieneMinuscula).toBe(true);
    expect(incompleta.tieneNumero).toBe(true);
    expect(incompleta.tieneEspecial).toBe(false);
    expect(incompleta.esFuerte).toBe(false);
  });

  it('debe evaluar como fuerte una contrasenia que cumple todos los criterios de sintaxis NIST', () => {
    const valida = evaluarFortalezaContrasenia('Segura#2026!Abc');
    expect(valida.esFuerte).toBe(true);
    expect(valida.tieneLongitud).toBe(true);
    expect(valida.tieneMayuscula).toBe(true);
    expect(valida.tieneMinuscula).toBe(true);
    expect(valida.tieneNumero).toBe(true);
    expect(valida.tieneEspecial).toBe(true);
  });

  it('debe admitir espacios en blanco como caracter especial para frases de contrasenia', () => {
    const conEspacio = evaluarFortalezaContrasenia('Clave Segura 2026');
    expect(conEspacio.tieneEspecial).toBe(true);
    expect(conEspacio.esFuerte).toBe(true);
  });

  it('debe rechazar contrasenias que superen los 64 caracteres', () => {
    const larga = 'A#1' + 'a'.repeat(65);
    const resultado = evaluarFortalezaContrasenia(larga);
    expect(resultado.tieneLongitud).toBe(false);
    expect(resultado.esFuerte).toBe(false);
  });

  it('debe renderizar visualmente los requisitos en el componente UI', () => {
    render(<ValidadorFortalezaContrasenia contrasenia="Segura#2026" />);

    expect(
      screen.getByText('Requisitos de seguridad (NIST SP 800-63B):')
    ).toBeInTheDocument();
    expect(screen.getByText('Entre 8 y 64 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Al menos una letra mayúscula (A-Z)')).toBeInTheDocument();
    expect(screen.getByText('Al menos una letra minúscula (a-z)')).toBeInTheDocument();
    expect(screen.getByText('Al menos un número (0-9)')).toBeInTheDocument();
    expect(screen.getByText('Al menos un carácter especial (!@#$%^&* o espacio)')).toBeInTheDocument();
    expect(
      screen.getByText('No tener palabras institucionales ni secuencias (ej. uce, central, 1234, qwerty)')
    ).toBeInTheDocument();
  });

  it('debe rechazar contrasenias que contengan palabras institucionales obvias', () => {
    const conUce = evaluarFortalezaContrasenia('Uce#2026Segura!');
    expect(conUce.sinPalabrasInstitucionalesNiSecuencias).toBe(false);
    expect(conUce.esFuerte).toBe(false);

    const conCentral = evaluarFortalezaContrasenia('Central#2026Abc');
    expect(conCentral.sinPalabrasInstitucionalesNiSecuencias).toBe(false);
    expect(conCentral.esFuerte).toBe(false);
  });

  it('debe rechazar contrasenias con secuencias de teclado o alfanumericas', () => {
    const conTeclado = evaluarFortalezaContrasenia('Clave#qwerty26!');
    expect(conTeclado.sinPalabrasInstitucionalesNiSecuencias).toBe(false);
    expect(conTeclado.esFuerte).toBe(false);

    const conNumeros = evaluarFortalezaContrasenia('Clave#1234Xyz!');
    expect(conNumeros.sinPalabrasInstitucionalesNiSecuencias).toBe(false);
    expect(conNumeros.esFuerte).toBe(false);

    const conRepetidos = evaluarFortalezaContrasenia('Claveeee#2026!');
    expect(conRepetidos.sinPalabrasInstitucionalesNiSecuencias).toBe(false);
    expect(conRepetidos.esFuerte).toBe(false);
  });
});
