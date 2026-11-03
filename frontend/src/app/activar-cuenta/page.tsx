"use client"

import { useState, useEffect, Suspense, useContext } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { activarCuentaAccion } from '@/lib/acciones/autenticacion.acciones'
import { ValidadorFortalezaContrasenia, evaluarFortalezaContrasenia } from '@/components/comunes/validador-fortaleza-contrasenia'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { ContextoAutenticacion } from '@/lib/contextos/contexto-autenticacion'

function FormularioActivarCuenta() {
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

  useEffect(() => {
    if (!token) {
      setError('El enlace de activacion es invalido o ha expirado. Por favor solicite uno nuevo o contacte al administrador.')
    }
  }, [token])

  const { esFuerte } = evaluarFortalezaContrasenia(nuevaContrasenia)

  const manejarEnvio = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setError('')

    if (!token) {
      setError('Token de activacion inexistente o no proporcionado.')
      return
    }

    if (!nuevaContrasenia || !confirmarContrasenia) {
      setError('Por favor complete todos los campos')
      return
    }

    if (nuevaContrasenia !== confirmarContrasenia) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!esFuerte) {
      setError('La contraseña debe cumplir con todos los criterios de seguridad')
      return
    }

    setCargando(true)
    try {
      const datosFormulario = new FormData()
      datosFormulario.append('token', token)
      datosFormulario.append('nuevaContrasenia', nuevaContrasenia)

      const resultado = await activarCuentaAccion(datosFormulario)
      if (resultado.exito) {
        await authContexto?.cerrarSesion?.().catch(() => {})
        toast.success('¡Cuenta activada con éxito! Ingrese con sus nuevas credenciales.')
        router.push('/')
        return
      } else {
        setError(resultado.mensaje || 'Error al activar la cuenta')
        setCargando(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexion al activar la cuenta')
      setCargando(false)
    }
  }

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          Activar Cuenta Institucional
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Bienvenido al Sistema de Gestion de Practicas y Vinculacion FICA-UCE. Configure su contraseña para poder acceder al sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={manejarEnvio} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

            <div className="space-y-2">
              <Label htmlFor="nuevaContrasenia" className="text-foreground">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="nuevaContrasenia"
                  type={mostrarContrasenia ? 'text' : 'password'}
                  placeholder="Minimo 8 caracteres"
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
              <Label htmlFor="confirmarContrasenia" className="text-foreground">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmarContrasenia"
                  type={mostrarConfirmarContrasenia ? 'text' : 'password'}
                  placeholder="Repita su nueva contraseña"
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
              {cargando ? 'Guardando contraseña...' : 'Activar Cuenta'}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full text-muted-foreground hover:text-primary mt-2"
              onClick={() => router.push('/')}
            >
              Regresar al portal principal
            </Button>
          </form>
      </CardContent>
    </Card>
  )
}

export default function ActivarCuentaPagina() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <Card className="p-8 text-center border-border">
            <Spinner className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Cargando verificación de seguridad...</p>
          </Card>
        }>
          <FormularioActivarCuenta />
        </Suspense>
      </div>
    </div>
  )
}
