"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type Usuario, type RolUsuario } from '../tipos/general'
import { login, logout } from '../servicios/autenticacion.servicio'
import { adaptarUrlProxy } from '../utilidades/proxy-url'

interface TipoContextoAutenticacion {
  usuario: Usuario | null
  cargando: boolean
  iniciarSesion: (correo: string, contrasenia: string) => Promise<{ exito: boolean; error?: string }>
  cerrarSesion: () => Promise<void>
  cambiarRol: (rol: RolUsuario) => void
  actualizarUsuario: (datosActualizados: Partial<Usuario>) => void
}

export const ContextoAutenticacion = createContext<TipoContextoAutenticacion | undefined>(undefined)

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(false)

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const usuarioAlmacenado = localStorage.getItem('usuario')
    if (usuarioAlmacenado) {
      try {
        setUsuario(JSON.parse(usuarioAlmacenado))
      } catch (e) {
        console.error("Error al parsear usuario de localStorage", e)
      }
    }
  }, [])

  const iniciarSesion = useCallback(
    async (correo: string, contrasenia: string): Promise<{ exito: boolean; error?: string }> => {
      setCargando(true)

      try {
        const respuesta = await login(correo, contrasenia);

        if (respuesta.exito && respuesta.data) {
          const dto = respuesta.data;
          const usuarioActual: Usuario = {
            id: String(dto.id),
            correo: dto.correo,
            nombre: `${dto.nombres || ''} ${dto.apellidos || ''}`.trim() || dto.correo,
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            rol: dto.rol as any,
            carreraId: dto.carreraId ? String(dto.carreraId) : undefined,
            identificacion: dto.identificacion,
            tipoIdentificacion: dto.tipoIdentificacion,
            telefono: dto.telefono,
            avatar: dto.urlAvatar ? adaptarUrlProxy(dto.urlAvatar) || undefined : undefined,
            estado: dto.estado,
            horasRequeridas: dto.horasRequeridas,
            horasAcumuladas: dto.horasAcumuladas,
          };
          setUsuario(usuarioActual);
          localStorage.setItem('usuario', JSON.stringify(usuarioActual));
          return { exito: true };
        } else {
          return { exito: false, error: respuesta.mensaje }
        }
      } catch (error) {
        console.error('Error en iniciarSesion:', error)
        const mensajeError = error instanceof Error ? error.message : 'Error al iniciar sesión'
        return { exito: false, error: mensajeError }
      } finally {
        setCargando(false)
      }
    }, [])

  const cerrarSesion = useCallback(async () => {
    await logout().catch(console.error)
    setUsuario(null)
    localStorage.removeItem('usuario')
  }, [])

  const actualizarUsuario = useCallback((datosActualizados: Partial<Usuario>) => {
    setUsuario(usuarioPrev => {
      if (!usuarioPrev) return null
      const nuevoUsuario = { ...usuarioPrev, ...datosActualizados }
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario))
      return nuevoUsuario
    })
  }, [])

  // Cuentas predeterminadas para la simulación (Actualizadas a MAYÚSCULAS)
  const VALORES_SIMULACION: Record<string, string> = {
    ESTUDIANTE: 'jcestrella@uce.edu.ec',
    TUTOR_ACADEMICO: 'jsalvador@uce.edu.ec',
    DIRECTOR_CARRERA: 'zruiz@uce.edu.ec',
    COORDINADOR_PRACTICAS: 'gmoncayo@uce.edu.ec',
    SUBDECANO: 'aperez@uce.edu.ec'
  }

  // Para fines de demostración - cambiar entre roles
  const cambiarRol = useCallback(async (rol: RolUsuario) => {
    const correoPorDefecto = VALORES_SIMULACION[rol]
    await iniciarSesion(correoPorDefecto, '123456')
  }, [iniciarSesion])

  return (
    <ContextoAutenticacion.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, cambiarRol, actualizarUsuario }}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}

export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion)
  if (contexto === undefined) {
    throw new Error('useAutenticacion no se usa dentro de un ProveedorAutenticacion')
  }
  return contexto
}
