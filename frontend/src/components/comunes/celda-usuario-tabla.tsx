import React from 'react';
import { AvatarUsuario } from './avatar-usuario';

export interface CeldaUsuarioTablaProps {
  nombre: string;
  identificacion?: string | null;
  correo?: string | null;
  urlAvatar?: string | null;
}

export function CeldaUsuarioTabla({
  nombre,
  identificacion,
  correo,
  urlAvatar,
}: CeldaUsuarioTablaProps) {
  const nombreSeguro = nombre?.trim() || 'Usuario';

  return (
    <div className="flex items-start gap-2.5">
      <AvatarUsuario
        nombre={nombreSeguro}
        urlFoto={urlAvatar}
        tamano="sm"
        className="mt-0.5"
      />
      <div className="space-y-0.5 min-w-0">
        <div className="font-semibold text-sm text-foreground leading-tight truncate">
          {nombreSeguro}
        </div>
        {identificacion && (
          <div className="text-xs text-muted-foreground truncate">
            C.I: {identificacion}
          </div>
        )}
        {correo && (
          <div className="text-[11px] text-muted-foreground/80 truncate max-w-[200px]">
            {correo}
          </div>
        )}
      </div>
    </div>
  );
}
