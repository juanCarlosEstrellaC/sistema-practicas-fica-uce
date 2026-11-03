'use client';

import { useState, useTransition } from 'react';
import { ConvenioDto } from '@/lib/tipos/pp/general-pp';
import { crearObservacionAccion } from '@/lib/acciones/pp/observacion.acciones';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Building, AlertTriangle, Send, Loader2 } from 'lucide-react';

export interface ModalSugerirConvenioProps {
  abierto: boolean;
  alCerrar: () => void;
  usuarioId: string;
  carreraId?: string;
  convenioAAnular?: ConvenioDto | null;
  alExito?: () => void;
}

export function ModalSugerirConvenio({
  abierto,
  alCerrar,
  usuarioId,
  carreraId = '1',
  convenioAAnular,
  alExito,
}: ModalSugerirConvenioProps) {
  const [estaPendiente, iniciarTransicion] = useTransition();
  const esAnulacion = Boolean(convenioAAnular);

  const [empresa, setEmpresa] = useState(convenioAAnular?.institucion || '');
  const [contacto, setContacto] = useState(convenioAAnular?.tutorInstitucional || '');
  const [correo, setCorreo] = useState(convenioAAnular?.correoTutor || '');
  const [descripcion, setDescripcion] = useState('');

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    const institucionFinal = esAnulacion ? (convenioAAnular?.institucion || '') : empresa.trim();
    if (!institucionFinal) {
      toast.error('El nombre de la empresa o institución es obligatorio');
      return;
    }
    if (!descripcion.trim()) {
      toast.error('Debe detallar el motivo o justificación de la propuesta');
      return;
    }

    iniciarTransicion(async () => {
      const respuesta = await crearObservacionAccion({
        tipo: esAnulacion ? 'ANULACION' : 'NUEVA',
        remitenteId: usuarioId,
        carreraId,
        convenioId: esAnulacion ? String(convenioAAnular?.id) : undefined,
        empresa: institucionFinal,
        contacto: esAnulacion ? convenioAAnular?.tutorInstitucional : contacto.trim(),
        correo: esAnulacion ? convenioAAnular?.correoTutor : correo.trim(),
        descripcion: descripcion.trim(),
      });

      if (!respuesta.exito) {
        toast.error(respuesta.mensaje);
        return;
      }

      toast.success(
        esAnulacion
          ? 'Solicitud de anulación enviada al Subdecanato'
          : 'Propuesta de nuevo convenio enviada al Subdecanato'
      );
      setDescripcion('');
      alCerrar();
      if (alExito) {
        alExito();
      }
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={(ab) => !ab && !estaPendiente && alCerrar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {esAnulacion ? (
              <>
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span>Sugerir Anulación de Convenio</span>
              </>
            ) : (
              <>
                <Building className="w-5 h-5 text-primary" />
                <span>Sugerir Nuevo Convenio</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {esAnulacion ? (
              <>
                Se enviará una solicitud al Subdecano para anular el convenio con{' '}
                <strong className="text-foreground">{convenioAAnular?.institucion}</strong>.
              </>
            ) : (
              'Envíe una propuesta de convenio institucional para evaluación del Subdecanato.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={manejarEnvio} className="space-y-3.5 py-2">
          {!esAnulacion && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="sug-empresa">Nombre de la Institución / Empresa *</Label>
                <Input
                  id="sug-empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej: Banco Central del Ecuador"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sug-contacto">Persona de Contacto</Label>
                <Input
                  id="sug-contacto"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  placeholder="Ej: Elena Morales"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sug-correo">Correo Electrónico de Contacto</Label>
                <Input
                  id="sug-correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="contacto@institucion.gob.ec"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="sug-desc">
              {esAnulacion ? 'Motivo de la anulación *' : 'Justificación / Descripción *'}
            </Label>
            <Textarea
              id="sug-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={
                esAnulacion
                  ? 'Explique detalladamente las razones por las cuales se sugiere la anulación...'
                  : 'Describa por qué sería provechoso este convenio para los estudiantes de la carrera...'
              }
              rows={4}
              required
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={alCerrar}
              disabled={estaPendiente}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={esAnulacion ? 'destructive' : 'default'}
              disabled={estaPendiente}
            >
              {estaPendiente ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Propuesta
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
