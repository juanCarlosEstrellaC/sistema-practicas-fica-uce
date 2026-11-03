'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cambiarMiContraseniaAccion, validarMiContraseniaAccion } from '@/lib/acciones/usuario.acciones';
import { ValidadorFortalezaContrasenia, evaluarFortalezaContrasenia } from '@/components/comunes/validador-fortaleza-contrasenia';
import { Lock, CheckCircle2, ShieldCheck, KeyRound, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PestaniaSeguridad() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [contraseniaActual, setContraseniaActual] = useState('');
  const [contraseniaValidada, setContraseniaValidada] = useState(false);
  const [nuevaContrasenia, setNuevaContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [estaValidando, setEstaValidando] = useState(false);
  const [estaCambiando, setEstaCambiando] = useState(false);
  const [mostrarContraseniaActual, setMostrarContraseniaActual] = useState(false);
  const [mostrarNuevaContrasenia, setMostrarNuevaContrasenia] = useState(false);
  const [mostrarConfirmarContrasenia, setMostrarConfirmarContrasenia] = useState(false);

  const { esFuerte } = evaluarFortalezaContrasenia(nuevaContrasenia);

  const manejarValidarContrasenia = async () => {
    if (!contraseniaActual.trim()) {
      toast.error('Ingrese su contraseña actual');
      return;
    }

    setEstaValidando(true);
    try {
      const resultado = await validarMiContraseniaAccion(contraseniaActual);
      if (resultado.exito && resultado.esValida) {
        setContraseniaValidada(true);
        toast.success('Contraseña actual verificada exitosamente');
      } else {
        toast.error(resultado.mensaje || 'La contraseña actual no es correcta');
        setContraseniaValidada(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al validar contraseña');
      setContraseniaValidada(false);
    } finally {
      setEstaValidando(false);
    }
  };

  const manejarCambioContrasenia = async () => {
    if (!contraseniaActual || !nuevaContrasenia || !confirmarContrasenia) {
      toast.error('Complete todos los campos de contraseña');
      return;
    }

    if (nuevaContrasenia !== confirmarContrasenia) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (!esFuerte) {
      toast.error('La contraseña nueva no cumple con los requisitos de seguridad');
      return;
    }

    setEstaCambiando(true);
    try {
      const resultado = await cambiarMiContraseniaAccion(contraseniaActual, nuevaContrasenia);
      if (resultado.exito) {
        toast.success(resultado.mensaje || 'Contraseña actualizada con éxito');
        reiniciarProceso();
        setModalAbierto(false);
      } else {
        toast.error(resultado.mensaje || 'Error al actualizar la contraseña');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el cambio de contraseña');
    } finally {
      setEstaCambiando(false);
    }
  };

  const reiniciarProceso = () => {
    setContraseniaActual('');
    setNuevaContrasenia('');
    setConfirmarContrasenia('');
    setContraseniaValidada(false);
    setMostrarContraseniaActual(false);
    setMostrarNuevaContrasenia(false);
    setMostrarConfirmarContrasenia(false);
  };

  const manejarCambioModal = (abierto: boolean) => {
    setModalAbierto(abierto);
    if (!abierto) {
      reiniciarProceso();
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la pestaña */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <Lock className="h-5 w-5 text-primary" />
          Seguridad de la Cuenta
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
        </p>
      </div>

      {/* Tarjeta de Acción Principal: Cambiar contraseña */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-muted/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Contraseña de Acceso
            </h3>
          </div>
          
        </div>

        <Button
          onClick={() => setModalAbierto(true)}
          className="gap-2 font-semibold shrink-0 cursor-pointer shadow-xs"
        >
          <KeyRound className="h-4 w-4" />
          <span>Cambiar contraseña</span>
        </Button>
      </div>



      {/* Menú Modal de Cambio de Contraseña */}
      <Dialog open={modalAbierto} onOpenChange={manejarCambioModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Para su seguridad, verifique su contraseña actual y luego defina su nueva credencial de acceso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Paso 1: Verificación de Contraseña Actual */}
            <div className="p-4 rounded-xl bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">
                    Paso 1: Verificación de Identidad
                  </h4>
                </div>
                {contraseniaValidada && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verificada
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 items-end">
                <div className="space-y-1.5 flex-1 w-full">
                  <Label htmlFor="contrasenia-actual" className="text-xs font-semibold text-foreground">
                    Contraseña Actual
                  </Label>
                  <div className="relative">
                    <Input
                      id="contrasenia-actual"
                      type={mostrarContraseniaActual ? 'text' : 'password'}
                      placeholder="Ingrese su contraseña actual"
                      value={contraseniaActual}
                      disabled={contraseniaValidada || estaValidando}
                      onChange={(e) => setContraseniaActual(e.target.value)}
                      className="pr-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !contraseniaValidada) {
                          manejarValidarContrasenia();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      tabIndex={-1}
                      title={mostrarContraseniaActual ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-label={mostrarContraseniaActual ? "Ocultar clave" : "Mostrar clave"}
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                      disabled={estaValidando}
                      onClick={() => setMostrarContraseniaActual(!mostrarContraseniaActual)}
                    >
                      {mostrarContraseniaActual ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {!contraseniaValidada && (
                  <Button
                    type="button"
                    onClick={manejarValidarContrasenia}
                    disabled={estaValidando || !contraseniaActual.trim()}
                    className="shrink-0 font-semibold cursor-pointer"
                  >
                    {estaValidando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Validando...
                      </>
                    ) : (
                      'Verificar'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Paso 2: Nueva Contraseña con Validación NIST */}
            {contraseniaValidada && (
              <div className="p-4 rounded-xl bg-primary/5 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">
                    Paso 2: Definir Nueva Contraseña
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="nueva-contrasenia" className="text-xs font-semibold text-foreground">
                      Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="nueva-contrasenia"
                        type={mostrarNuevaContrasenia ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={nuevaContrasenia}
                        onChange={(e) => setNuevaContrasenia(e.target.value)}
                        className="pr-10"
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        tabIndex={-1}
                        title={mostrarNuevaContrasenia ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-label={mostrarNuevaContrasenia ? "Ocultar clave" : "Mostrar clave"}
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => setMostrarNuevaContrasenia(!mostrarNuevaContrasenia)}
                      >
                        {mostrarNuevaContrasenia ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmar-contrasenia" className="text-xs font-semibold text-foreground">
                      Confirmar Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmar-contrasenia"
                        type={mostrarConfirmarContrasenia ? 'text' : 'password'}
                        placeholder="Repita la nueva contraseña"
                        value={confirmarContrasenia}
                        onChange={(e) => setConfirmarContrasenia(e.target.value)}
                        className={`pr-10 ${
                          confirmarContrasenia && nuevaContrasenia !== confirmarContrasenia
                            ? 'border-destructive focus-visible:ring-destructive/20'
                            : ''
                        }`}
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
                </div>

                {/* Componente NIST de Fortaleza de Contraseña */}
                {nuevaContrasenia && (
                  <div className="pt-1">
                    <ValidadorFortalezaContrasenia contrasenia={nuevaContrasenia} />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => manejarCambioModal(false)}
              disabled={estaCambiando}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={manejarCambioContrasenia}
              disabled={
                !contraseniaValidada ||
                !esFuerte ||
                nuevaContrasenia !== confirmarContrasenia ||
                estaCambiando
              }
              className="gap-2 font-semibold shadow-xs"
            >
              {estaCambiando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Cambiar contraseña</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
