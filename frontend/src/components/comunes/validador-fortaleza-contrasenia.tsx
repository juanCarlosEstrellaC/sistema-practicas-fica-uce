'use client';

import { Check, Circle } from 'lucide-react';

export interface CriteriosFortalezaContrasenia {
  tieneLongitud: boolean;
  tieneMayuscula: boolean;
  tieneMinuscula: boolean;
  tieneNumero: boolean;
  tieneEspecial: boolean;
  sinPalabrasInstitucionalesNiSecuencias: boolean;
  esFuerte: boolean;
}

const PALABRAS_INSTITUCIONALES = [
  'uce',
  'central',
  'ingenieria',
  'quito',
  'facultad',
  'subdecano',
  'subdecana',
  'rectorado',
  'carrera',
  'universidad',
];

const SECUENCIAS_TECLADO = [
  'qwerty',
  'asdfgh',
  'zxcvbn',
  'qwert',
  'asdf',
  'zxcv',
  'poiuy',
  'lkjh',
  'mnbv',
];

const PATRON_REPETITIVOS = /(.)\1{2,}/;

function tieneSecuenciaAlfanumericaConsecutiva(texto: string): boolean {
  for (let i = 0; i <= texto.length - 4; i++) {
    const c1 = texto.charCodeAt(i);
    const c2 = texto.charCodeAt(i + 1);
    const c3 = texto.charCodeAt(i + 2);
    const c4 = texto.charCodeAt(i + 3);

    const esAlfanumerico = (codigo: number) =>
      (codigo >= 48 && codigo <= 57) || // 0-9
      (codigo >= 65 && codigo <= 90) || // A-Z
      (codigo >= 97 && codigo <= 122); // a-z

    if (esAlfanumerico(c1) && esAlfanumerico(c2) && esAlfanumerico(c3) && esAlfanumerico(c4)) {
      const c1Min = c1 >= 65 && c1 <= 90 ? c1 + 32 : c1;
      const c2Min = c2 >= 65 && c2 <= 90 ? c2 + 32 : c2;
      const c3Min = c3 >= 65 && c3 <= 90 ? c3 + 32 : c3;
      const c4Min = c4 >= 65 && c4 <= 90 ? c4 + 32 : c4;

      const esAscendente = c2Min - c1Min === 1 && c3Min - c2Min === 1 && c4Min - c3Min === 1;
      const esDescendente = c1Min - c2Min === 1 && c2Min - c3Min === 1 && c3Min - c4Min === 1;

      if (esAscendente || esDescendente) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Evalua una contrasenia segun los criterios de sintaxis del estandar NIST SP 800-63B
 * y politicas institucionales (sin palabras obvias institucionales ni secuencias).
 */
export function evaluarFortalezaContrasenia(contrasenia: string): CriteriosFortalezaContrasenia {
  const tieneLongitud = contrasenia.length >= 8 && contrasenia.length <= 64;
  const tieneMayuscula = /[A-Z]/.test(contrasenia);
  const tieneMinuscula = /[a-z]/.test(contrasenia);
  const tieneNumero = /[0-9]/.test(contrasenia);
  const tieneEspecial = /[^A-Za-z0-9]/.test(contrasenia);

  const contraseniaMin = contrasenia.toLowerCase();
  const tienePalabraInstitucional = PALABRAS_INSTITUCIONALES.some((palabra) =>
    contraseniaMin.includes(palabra)
  );
  const tieneSecuenciaTeclado = SECUENCIAS_TECLADO.some((secuencia) =>
    contraseniaMin.includes(secuencia)
  );
  const tieneRepetitivos = PATRON_REPETITIVOS.test(contrasenia);
  const tieneSecuencia = tieneSecuenciaAlfanumericaConsecutiva(contrasenia);

  const sinPalabrasInstitucionalesNiSecuencias =
    contrasenia.length > 0 &&
    !tienePalabraInstitucional &&
    !tieneSecuenciaTeclado &&
    !tieneRepetitivos &&
    !tieneSecuencia;

  const esFuerte =
    tieneLongitud &&
    tieneMayuscula &&
    tieneMinuscula &&
    tieneNumero &&
    tieneEspecial &&
    sinPalabrasInstitucionalesNiSecuencias;

  return {
    tieneLongitud,
    tieneMayuscula,
    tieneMinuscula,
    tieneNumero,
    tieneEspecial,
    sinPalabrasInstitucionalesNiSecuencias,
    esFuerte,
  };
}

interface ValidadorFortalezaContraseniaProps {
  contrasenia: string;
}

export function ValidadorFortalezaContrasenia({ contrasenia }: ValidadorFortalezaContraseniaProps) {
  if (!contrasenia || contrasenia.length === 0) {
    return null;
  }

  const {
    tieneLongitud,
    tieneMayuscula,
    tieneMinuscula,
    tieneNumero,
    tieneEspecial,
    sinPalabrasInstitucionalesNiSecuencias,
  } = evaluarFortalezaContrasenia(contrasenia);

  return (
    <div className="text-xs space-y-1.5 mt-3 bg-muted/40 p-3 rounded-lg border border-border/80 text-left animate-in fade-in duration-300">
      <p className="font-semibold text-foreground mb-2">Requisitos de seguridad (NIST SP 800-63B):</p>
      <div
        className={`flex items-center gap-2 transition-colors ${
          tieneLongitud ? 'text-green-600 dark:text-green-500 font-medium' : 'text-muted-foreground'
        }`}
      >
        {tieneLongitud ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
        <span>Entre 8 y 64 caracteres</span>
      </div>
      <div
        className={`flex items-center gap-2 transition-colors ${
          tieneMayuscula ? 'text-green-600 dark:text-green-500 font-medium' : 'text-muted-foreground'
        }`}
      >
        {tieneMayuscula ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
        <span>Al menos una letra mayúscula (A-Z)</span>
      </div>
      <div
        className={`flex items-center gap-2 transition-colors ${
          tieneMinuscula ? 'text-green-600 dark:text-green-500 font-medium' : 'text-muted-foreground'
        }`}
      >
        {tieneMinuscula ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
        <span>Al menos una letra minúscula (a-z)</span>
      </div>
      <div
        className={`flex items-center gap-2 transition-colors ${
          tieneNumero ? 'text-green-600 dark:text-green-500 font-medium' : 'text-muted-foreground'
        }`}
      >
        {tieneNumero ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
        <span>Al menos un número (0-9)</span>
      </div>
      <div
        className={`flex items-center gap-2 transition-colors ${
          tieneEspecial ? 'text-green-600 dark:text-green-500 font-medium' : 'text-muted-foreground'
        }`}
      >
        {tieneEspecial ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
        <span>Al menos un carácter especial (!@#$%^&* o espacio)</span>
      </div>
      <div
        className={`flex items-start gap-2 transition-colors ${
          sinPalabrasInstitucionalesNiSecuencias
            ? 'text-green-600 dark:text-green-500 font-medium'
            : 'text-muted-foreground'
        }`}
      >
        {sinPalabrasInstitucionalesNiSecuencias ? (
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        ) : (
          <Circle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        )}
        <span>No tener palabras institucionales ni secuencias (ej. uce, central, 1234, qwerty)</span>
      </div>
    </div>
  );
}
