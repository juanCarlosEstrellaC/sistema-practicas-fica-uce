import { useState, useEffect } from 'react';

/**
 * Hook personalizado para retrasar la actualizacion de un valor (debounce).
 * Permite ejecutar busquedas dinamicas mientras el usuario escribe sin saturar el servidor.
 * 
 * @param valor El valor a observar (ej. texto de busqueda).
 * @param retrasoMs Tiempo de espera en milisegundos antes de emitir el nuevo valor (default: 400ms).
 */
export function useDebounce<T>(valor: T, retrasoMs: number = 400): T {
  const [valorDebounce, setValorDebounce] = useState<T>(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setValorDebounce(valor);
    }, retrasoMs);

    return () => {
      clearTimeout(temporizador);
    };
  }, [valor, retrasoMs]);

  return valorDebounce;
}
