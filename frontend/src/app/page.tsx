"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion'
import { useTema } from '@/lib/contextos/contexto-tema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { formatearNombreCorto } from '@/lib/utilidades/formato-texto'
import { Moon, Sun, Eye, EyeOff, GraduationCap, Users, Briefcase, Settings, ShieldCheck } from 'lucide-react'
import { solicitarOlvidoContraseniaAccion } from '@/lib/acciones/autenticacion.acciones'

export default function LoginPage() {
  const router = useRouter()
  const { iniciarSesion, cargando, cerrarSesion } = useAutenticacion()
  const { tema, alternarTema } = useTema()

  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false)
  const [error, setError] = useState('')
  const [mostrarOlvidoContrasenia, setMostrarOlvidoContrasenia] = useState(false)
  const [correoOlvido, setCorreoOlvido] = useState('')
  const [olvidoExito, setOlvidoExito] = useState(false)
  const [cargandoOlvido, setCargandoOlvido] = useState(false)

  useEffect(() => {
    // Si llegamos a la pantalla de login, limpiamos localStorage
    // El middleware se encarga de redirigir a /dashboard si el token es válido
    cerrarSesion()
  }, [cerrarSesion])

  const manejarEnvio = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setError('')

    if (!correo || !contrasenia) {
      setError('Por favor complete todos los campos')
      return
    }

    if (!correo.endsWith('@uce.edu.ec')) {
      setError('Debe usar su correo institucional (@uce.edu.ec)')
      return
    }

    const resultado = await iniciarSesion(correo, contrasenia)

    if (resultado.exito) {
      router.push('/dashboard')
    } else {
      setError(resultado.error || 'Error al iniciar sesión')
    }
  }

  const manejarOlvidoContrasenia = async (e: React.FormEvent) => {
    e.preventDefault()

    const correoLimpio = correoOlvido.trim()
    if (!correoLimpio.endsWith('@uce.edu.ec')) {
      setError('Debe usar un correo institucional (@uce.edu.ec)')
      return
    }

    setCargandoOlvido(true)
    setError('')
    try {
      const res = await solicitarOlvidoContraseniaAccion(correoLimpio)
      if (res.exito) {
        setOlvidoExito(true)
      } else {
        setError(res.mensaje || 'Error al solicitar recuperación de contraseña')
      }
    } catch (err: any) {
      setError(err?.message || 'Error al solicitar recuperación de contraseña')
    } finally {
      setCargandoOlvido(false)
    }
  }

  const manejarLoginRapido = async (emailPredefinido: string) => {
    setCorreo(emailPredefinido)
    setContrasenia('123456')
    setError('')

    const resultado = await iniciarSesion(emailPredefinido, '123456')

    if (resultado.exito) {
      router.push('/dashboard')
    } else {
      setError(resultado.error || 'Error al iniciar sesión')
    }
  }



  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Sistema de Gestión de Prácticas</h1>
              <p className="text-xs text-muted-foreground">FICA - UCE</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={alternarTema}
              aria-label="Cambiar tema"
              title="Cambiar tema"
            >
              {tema === 'oscuro' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!mostrarOlvidoContrasenia ? (
            <Card className="border-border">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-foreground">Iniciar Sesión</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ingrese con su correo institucional
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
                    <Label htmlFor="email" className="text-foreground">Correo Institucional</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@uce.edu.ec"
                      value={correo}
                      onChange={(e) => {
                        setCorreo(e.target.value)
                        if (error) setError('')
                      }}
                      className="bg-background border-input"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={mostrarContrasenia ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={contrasenia}
                        onChange={(e) => {
                          setContrasenia(e.target.value)
                          if (error) setError('')
                        }}
                        className="bg-background border-input pr-10"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title={mostrarContrasenia ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                      >
                        {mostrarContrasenia ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={cargando || error.includes('bloqueada')}
                  >
                    {cargando ? (<Spinner className="w-4 h-4 mr-2" />) : null}
                    {cargando ? 'Ingresando...' : 'Ingresar'}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setMostrarOlvidoContrasenia(true)
                      setError('')
                    }}
                  >
                    ¿Olvidó su contraseña?
                  </Button>
                </form>

                {/* Perfiles predeterminados */}
                <div className="mt-6 pt-6 border-t border-border">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2.5 px-3 border-accent/20 hover:border-accent/50 hover:bg-accent/5 text-xs"
                      onClick={() => manejarLoginRapido('jcestrella@uce.edu.ec')}
                    >
                      <GraduationCap className="w-4 h-4 text-accent" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground">Estudiante</div>
                        <div className="text-[10px] text-muted-foreground">Juan Estrella</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2.5 px-3 border-accent/20 hover:border-accent/50 hover:bg-accent/5 text-xs"
                      onClick={() => manejarLoginRapido('jsalvador@uce.edu.ec')}
                    >
                      <Users className="w-4 h-4 text-accent" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground">Tutor Académico</div>
                        <div className="text-[10px] text-muted-foreground">{formatearNombreCorto('Ing. Jaime Salvador, MSc.')}</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2.5 px-3 border-accent/20 hover:border-accent/50 hover:bg-accent/5 text-xs"
                      onClick={() => manejarLoginRapido('zruiz@uce.edu.ec')}
                    >
                      <Briefcase className="w-4 h-4 text-accent" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground">Director Carrera</div>
                        <div className="text-[10px] text-muted-foreground">{formatearNombreCorto('Ing. Zoila Ruiz, MSc.')}</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2.5 px-3 border-accent/20 hover:border-accent/50 hover:bg-accent/5 text-xs"
                      onClick={() => manejarLoginRapido('gmoncayo@uce.edu.ec')}
                    >
                      <Settings className="w-4 h-4 text-accent" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground">Coordinador Prácticas</div>
                        <div className="text-[10px] text-muted-foreground">{formatearNombreCorto('Ing. Milton Moncayo, PhD.')}</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2.5 px-3 border-accent/20 hover:border-accent/50 hover:bg-accent/5 col-span-1 sm:col-span-2 flex justify-center gap-2 text-xs"
                      onClick={() => manejarLoginRapido('aperez@uce.edu.ec')}
                    >
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <div className="text-left">
                        <span className="font-semibold text-foreground mr-2">Subdecana:</span>
                        <span className="text-muted-foreground">{formatearNombreCorto('Ing. Ana Pérez, PhD.')}</span>
                      </div>
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-foreground">Recuperar Contraseña</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ingrese su correo institucional para recibir instrucciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {olvidoExito ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-foreground">
                      Se ha enviado un correo con instrucciones para recuperar su contraseña.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMostrarOlvidoContrasenia(false)
                        setOlvidoExito(false)
                        setCorreoOlvido('')
                      }}
                    >
                      Volver al inicio de sesión
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={manejarOlvidoContrasenia} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="forgotEmail" className="text-foreground">Correo Institucional</Label>
                      <Input
                        id="forgotEmail"
                        type="email"
                        placeholder="usuario@uce.edu.ec"
                        value={correoOlvido}
                        onChange={(e) => setCorreoOlvido(e.target.value)}
                        className="bg-background border-input"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={cargandoOlvido}
                    >
                      {cargandoOlvido ? <Spinner className="w-4 h-4 mr-2" /> : null}
                      {cargandoOlvido ? 'Enviando...' : 'Enviar Instrucciones'}
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setMostrarOlvidoContrasenia(false)
                        setError('')
                      }}
                    >
                      Volver al inicio de sesión
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Universidad Central del Ecuador</p>
          <p>Facultad de Ingeniería y Ciencias Aplicadas</p>
        </div>
      </footer>
    </div>
  )
}
