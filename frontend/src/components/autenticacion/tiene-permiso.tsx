'use client';

import { ReactNode } from 'react';
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion';
import { RolUsuario } from '@/lib/tipos/general';
import { tienePermiso } from '@/lib/seguridad/permisos';

interface TienePermisoProps {
  roles: readonly RolUsuario[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente declarativo para renderizar elementos segun el rol del usuario autenticado.
 *
 * @param roles Lista de roles autorizados para ver el contenido
 * @param children Contenido a mostrar si el rol del usuario coincide
 * @param fallback Elemento alternativo a mostrar si no tiene permiso (opcional)
 */
export function TienePermiso({ roles, children, fallback = null }: TienePermisoProps) {
  const { usuario } = useAutenticacion();

  if (!tienePermiso(usuario?.rol, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
