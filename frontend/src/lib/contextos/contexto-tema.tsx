"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Tema = 'claro' | 'oscuro' | 'sistema'
export type VarianteOscura = 'windows-11'

interface TipoContextoTema {
  tema: Tema
  temaActual: 'claro' | 'oscuro' // El que está aplicado realmente
  varianteOscura: VarianteOscura
  alternarTema: () => void
  setTema: (tema: Tema) => void
  setVarianteOscura: (variante: VarianteOscura) => void
}

const ContextoTema = createContext<TipoContextoTema | undefined>(undefined)

export function ProveedorTema({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>('sistema')
  const [temaActual, setTemaActual] = useState<'claro' | 'oscuro'>('claro')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const guardado = localStorage.getItem('tema') as Tema | null
    if (guardado) {
      setTemaState(guardado)
    }
    // Limpieza de variantes obsoletas en almacenamiento local
    localStorage.removeItem('variante_oscura')
  }, [])

  // Sincronizar clases y atributos en el elemento HTML
  useEffect(() => {
    if (!mounted) return

    let temaAplicar: 'claro' | 'oscuro' = 'claro'

    const aplicarTemaOscuro = (esOscuro: boolean) => {
      document.documentElement.classList.toggle('dark', esOscuro)
      document.documentElement.classList.remove('dark-moderno', 'dark-visual-studio')
      if (esOscuro) {
        document.documentElement.classList.add('dark-windows-11')
        document.documentElement.setAttribute('data-dark-theme', 'windows-11')
      } else {
        document.documentElement.classList.remove('dark-windows-11')
        document.documentElement.removeAttribute('data-dark-theme')
      }
    }

    if (tema === 'sistema') {
      const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
      temaAplicar = prefiereOscuro ? 'oscuro' : 'claro'

      const listener = (e: MediaQueryListEvent) => {
        if (tema === 'sistema') {
          const nuevoTema = e.matches ? 'oscuro' : 'claro'
          aplicarTemaOscuro(nuevoTema === 'oscuro')
          setTemaActual(nuevoTema)
        }
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener)

      aplicarTemaOscuro(temaAplicar === 'oscuro')
      setTemaActual(temaAplicar)
      localStorage.setItem('tema', 'sistema')

      return () => {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener)
      }
    } else {
      temaAplicar = tema
      aplicarTemaOscuro(temaAplicar === 'oscuro')
      setTemaActual(temaAplicar)
      localStorage.setItem('tema', tema)
    }
  }, [tema, mounted])

  const alternarTema = () => {
    setTemaState(prev => prev === 'claro' ? 'oscuro' : 'claro')
  }

  const setTema = (nuevoTema: Tema) => {
    setTemaState(nuevoTema)
  }

  const setVarianteOscura = (_nuevaVariante: VarianteOscura) => {
    // Windows 11 es el modo oscuro único predeterminado
  }

  // Evita el flash de tema incorrecto
  if (!mounted) {
    return null
  }

  return (
    <ContextoTema.Provider
      value={{
        tema,
        temaActual,
        varianteOscura: 'windows-11',
        alternarTema,
        setTema,
        setVarianteOscura,
      }}
    >
      {children}
    </ContextoTema.Provider>
  )
}

export function useTema() {
  const contexto = useContext(ContextoTema)
  if (contexto === undefined) {
    throw new Error('useTema debe ser usado dentro de un ProveedorTema')
  }
  return contexto
}
