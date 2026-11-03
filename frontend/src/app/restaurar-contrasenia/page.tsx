"use client"

import { useState, useEffect, Suspense, useContext } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { restaurarContraseniaAccion } from '@/lib/acciones/autenticacion.acciones'
import { ValidadorFortalezaContrasenia, evaluarFortalezaContrasenia } from '@/components/comunes/validador-fortaleza-contrasenia'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { ContextoAutenticacion } from '@/lib/contextos/contexto-autenticacion'

function FormularioRestaurarContrasenia() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const authContexto = useContext(ContextoAutenticacion)

  const [nuevaContrasenia, setNuevaContrasenia] = useState('')
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('')
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false)
  const [mostrarConfirmarContrasenia, setMostrarConfirmarContrasenia] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token inválido o no proporcionado.')
    }
  }, [token])

  const { esFuerte } = evaluarFortalezaContrasenia(nuevaContrasenia)

  const manejarEnvio = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setError('')

    if (!nuevaContrasenia || !confirmarContrasenia) {
      setError('Por favor complete todos los campos')
      return
    }

    if (nuevaContrasenia !== confirmarContrasenia) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!esFuerte) {
      setError('La contraseña no cumple con los requisitos mínimos de seguridad (NIST SP 800-63B)')
      return
    }

    setCargando(true)
    try {
      const resultado = await restaurarContraseniaAccion(token as string, nuevaContrasenia)
      if (resultado.exito) {
        await authContexto?.cerrarSesion?.().catch(() => {})
        setExito(true)
      } else {
        setError(resultado.mensaje || 'Error al restablecer contraseña')
      }
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Restablecer Contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        {exito ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-foreground font-medium text-lg">Contraseña actualizada exitosamente.</p>
            <p className="text-sm text-muted-foreground pb-4">Su nueva contraseña está lista para ser usada.</p>
            
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Ir al inicio de sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={mostrarContrasenia ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={nuevaContrasenia}
                  onChange={(e) => setNuevaContrasenia(e.target.value)}
                  className="bg-background border-input pr-10"
                  disabled={!token || cargando}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  tabIndex={-1}
                  title={mostrarContrasenia ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-label={mostrarContrasenia ? "Ocultar clave" : "Mostrar clave"}
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  disabled={!token || cargando}
                  onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                >
                  {mostrarContrasenia ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <ValidadorFortalezaContrasenia contrasenia={nuevaContrasenia} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={mostrarConfirmarContrasenia ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmarContrasenia}
                  onChange={(e) => setConfirmarContrasenia(e.target.value)}
                  className={`bg-background border-input pr-10 ${
                    confirmarContrasenia && nuevaContrasenia !== confirmarContrasenia
                      ? 'border-destructive focus-visible:ring-destructive/20'
                      : ''
                  }`}
                  disabled={!token || cargando}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  tabIndex={-1}
                  title={mostrarConfirmarContrasenia ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-label={mostrarConfirmarContrasenia ? "Ocultar clave" : "Mostrar clave"}
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  disabled={!token || cargando}
                  onClick={() => setMostrarConfirmarContrasenia(!mostrarConfirmarContrasenia)}
                >
                  {mostrarConfirmarContrasenia ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {confirmarContrasenia.length > 0 && nuevaContrasenia !== confirmarContrasenia && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1 animate-in fade-in duration-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Las contraseñas no coinciden</span>
                </p>
              )}
              {confirmarContrasenia.length > 0 && nuevaContrasenia === confirmarContrasenia && (
                <p className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1 font-medium mt-1 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Las contraseñas coinciden</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
              disabled={!token || cargando || !esFuerte || nuevaContrasenia !== confirmarContrasenia}
            >
              {cargando ? <Spinner className="w-4 h-4 mr-2" /> : null}
              {cargando ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>
            
            <Button
              type="button"
              variant="link"
              className="w-full text-muted-foreground hover:text-primary mt-2"
              onClick={() => router.push('/')}
            >
              Volver al inicio de sesión
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function RestaurarContraseniaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <Card className="p-8 text-center border-border">
            <Spinner className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Cargando verificación de seguridad...</p>
          </Card>
        }>
          <FormularioRestaurarContrasenia />
        </Suspense>
      </div>
    </div>
  )
}
