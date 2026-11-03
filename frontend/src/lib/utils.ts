import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilidad canonica de Shadcn UI para combinar condicionalmente clases de Tailwind CSS
 * resolviendo conflictos mediante tailwind-merge y clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
