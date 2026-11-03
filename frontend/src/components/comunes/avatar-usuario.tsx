'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { obtenerIniciales } from '@/lib/utilidades/formato-texto';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';

export type TamanoAvatar = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarUsuarioProps {
  nombre?: string | null;
  apellido?: string | null;
  urlFoto?: string | null;
  tamano?: TamanoAvatar;
  className?: string;
  claseTexto?: string;
  alt?: string;
}

const TAMANOS_MAPA: Record<TamanoAvatar, { contenedor: string; texto: string }> = {
  xs: { contenedor: 'h-7 w-7', texto: 'text-[10px]' },
  sm: { contenedor: 'h-8 w-8', texto: 'text-xs' },
  md: { contenedor: 'h-10 w-10', texto: 'text-sm' },
  lg: { contenedor: 'h-12 w-12', texto: 'text-base' },
  xl: { contenedor: 'w-14 h-14', texto: 'text-base font-bold' },
  '2xl': { contenedor: 'w-28 h-28', texto: 'text-2xl font-bold' },
};

export const obtenerInicialesEstandar = obtenerIniciales;

export function AvatarUsuario({
  nombre,
  apellido,
  urlFoto,
  tamano = 'sm',
  className,
  claseTexto,
  alt,
}: AvatarUsuarioProps) {
  const iniciales = obtenerInicialesEstandar(nombre, apellido);
  const configTamano = TAMANOS_MAPA[tamano] || TAMANOS_MAPA.sm;
  const textoAlt = alt || `${nombre || ''} ${apellido || ''}`.trim() || 'Avatar de usuario';
  const urlFotoFinal = urlFoto ? adaptarUrlProxy(urlFoto) : undefined;

  return (
    <Avatar
      className={cn(
        configTamano.contenedor,
        'shrink-0 border border-border/60 shadow-2xs relative select-none',
        className
      )}
    >
      {urlFotoFinal && <AvatarImage src={urlFotoFinal} alt={textoAlt} className="object-cover" />}
      <AvatarFallback
        className={cn(
          'bg-primary/10 text-primary font-bold tracking-tight',
          configTamano.texto,
          claseTexto
        )}
      >
        {iniciales}
      </AvatarFallback>
    </Avatar>
  );
}
