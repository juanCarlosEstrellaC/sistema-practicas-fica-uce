'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Usuario, UsuarioSesion } from '@/lib/tipos/general';
import { useAutenticacion } from '@/lib/contextos/contexto-autenticacion';
import { actualizarMiPerfilAccion, subirMiAvatarAccion } from '@/lib/acciones/usuario.acciones';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarUsuario } from '@/components/comunes/avatar-usuario';
import { obtenerEtiquetaRol } from '@/lib/utilidades/etiquetas';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { Upload, Save, Loader2, Phone, Mail, IdCard, GraduationCap, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export interface PestaniaPerfilProps {
  usuario: Usuario | UsuarioSesion;
}

export function PestaniaPerfil({ usuario: usuarioProp }: PestaniaPerfilProps) {
  const { usuario: usuarioContexto, actualizarUsuario } = useAutenticacion();
  const usuario = usuarioContexto || usuarioProp;

  const [telefono, setTelefono] = useState(usuario.telefono || '');
  const [estaGuardando, setEstaGuardando] = useState(false);
  const [estaSubiendoAvatar, setEstaSubiendoAvatar] = useState(false);
  const referenciaArchivo = useRef<HTMLInputElement>(null);

  const primerNombre =
    'nombres' in usuario && usuario.nombres
      ? usuario.nombres
      : 'nombre' in usuario && usuario.nombre
        ? usuario.nombre
        : '';
  const apellidos = usuario.apellidos || '';
  const nombreCompleto = `${primerNombre} ${apellidos}`.trim() || 'Usuario';
  const urlAvatar = 'avatar' in usuario ? usuario.avatar : 'urlAvatar' in usuario ? usuario.urlAvatar : undefined;

  const manejarGuardarPerfil = async () => {
    setEstaGuardando(true);
    try {
      const resultado = await actualizarMiPerfilAccion({ telefono });
      if (resultado.exito) {
        actualizarUsuario({ telefono });
        toast.success(resultado.mensaje || 'Perfil actualizado correctamente');
      } else {
        toast.error(resultado.mensaje || 'Error al actualizar el perfil');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setEstaGuardando(false);
    }
  };

  const manejarSubirAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      toast.error('El archivo seleccionado debe ser una imagen');
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5 MB');
      return;
    }

    setEstaSubiendoAvatar(true);
    try {
      const formularioDatos = new FormData();
      formularioDatos.append('file', archivo);

      const resultado = await subirMiAvatarAccion(formularioDatos);
      if (resultado.exito && resultado.urlAvatar) {
        actualizarUsuario({ avatar: adaptarUrlProxy(resultado.urlAvatar) });
        toast.success('Avatar actualizado exitosamente');
      } else {
        toast.error(resultado.mensaje || 'Error al subir el avatar');
      }
    } catch (error: any) {
      const mensajeOriginal = error?.message || '';
      const esErrorLimiteTamano =
        mensajeOriginal.includes('Body exceeded') ||
        mensajeOriginal.includes('limit') ||
        mensajeOriginal.includes('SizeLimit') ||
        mensajeOriginal.includes('PayloadTooLarge');

      toast.error(
        esErrorLimiteTamano
          ? 'La imagen seleccionada supera el tamaño máximo permitido (máximo 5 MB)'
          : error?.message || 'Error al subir el avatar'
      );
    } finally {
      setEstaSubiendoAvatar(false);
      if (referenciaArchivo.current) {
        referenciaArchivo.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <User className="h-5 w-5 text-primary" />
          Información del Perfil
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Información personal y ávatar de la cuenta
        </p>
      </div>

      <div className="space-y-6">
        {/* Sección de Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-xl bg-muted/30">
          <div className="relative group">
            <AvatarUsuario
              nombre={nombreCompleto}
              urlFoto={urlAvatar}
              tamano="2xl"
              className="border-4 border-background shadow-md overflow-hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h3 className="text-base font-bold text-foreground">{nombreCompleto}</h3>
              <p className="text-xs text-muted-foreground">{usuario.correo}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos admitidos: JPG, PNG o WebP (hasta 5 MB y resolucion maxima de 4096×4096 px).
            </p>
            <div className="pt-1">
              <input
                ref={referenciaArchivo}
                type="file"
                accept="image/*"
                className="hidden"
                id="input-subir-avatar"
                onChange={manejarSubirAvatar}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={estaSubiendoAvatar}
                onClick={() => referenciaArchivo.current?.click()}
                className="gap-2 h-8 text-xs font-semibold"
              >
                {estaSubiendoAvatar ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Subiendo imagen...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Cambiar fotografía</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Campos de Información Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Nombres
            </Label>
            <Input value={primerNombre} disabled className="bg-muted/40 font-medium" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Apellidos
            </Label>
            <Input value={apellidos} disabled className="bg-muted/40 font-medium" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Correo Institucional
            </Label>
            <Input value={usuario.correo} disabled className="bg-muted/40 font-medium" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <IdCard className="h-3.5 w-3.5" /> Cédula o Identificación
            </Label>
            <Input value={usuario.identificacion || 'No registrada'} disabled className="bg-muted/40 font-medium" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Rol en el Sistema
            </Label>
            <Input value={obtenerEtiquetaRol(usuario.rol)} disabled className="bg-muted/40 font-medium capitalize" />
          </div>

          {'carreraNombre' in usuario && usuario.carreraNombre && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Carrera Universitaria
              </Label>
              <Input value={usuario.carreraNombre} disabled className="bg-muted/40 font-medium" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="telefono-perfil" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" /> Teléfono / Celular de Contacto
            </Label>
            <Input
              id="telefono-perfil"
              type="tel"
              placeholder="Ej. 0991234567"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="font-medium"
            />
          </div>
        </div>

        {/* Botón de Guardado */}
        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={manejarGuardarPerfil}
            disabled={estaGuardando}
            className="gap-2 font-semibold shadow-xs"
          >
            {estaGuardando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
