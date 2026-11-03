'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface ModalSugerirConvenioProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  alEnviarSugerencia?: (datos: {
    empresa: string;
    contacto: string;
    correo: string;
    descripcion: string;
  }) => Promise<void>;
}

export function ModalSugerirConvenio({
  abierto,
  alCambiarAbierto,
  alEnviarSugerencia,
}: ModalSugerirConvenioProps) {
  const [datos, setDatos] = useState({
    empresa: '',
    contacto: '',
    correo: '',
    descripcion: '',
  });
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async () => {
    if (!datos.empresa.trim() || !datos.correo.trim()) {
      toast.error('Complete el nombre de la empresa y correo de contacto');
      return;
    }

    setEnviando(true);
    try {
      if (alEnviarSugerencia) {
        await alEnviarSugerencia(datos);
      } else {
        toast.success('Sugerencia de convenio enviada a Coordinación');
      }
      alCambiarAbierto(false);
      setDatos({ empresa: '', contacto: '', correo: '', descripcion: '' });
    } catch (error: any) {
      toast.error(error?.message || 'Error al registrar la sugerencia');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Sugerir Nueva Institución / Convenio
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Proponga una empresa o institución para que la coordinación evalúe un nuevo convenio de prácticas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nombre de la Empresa / Institución *
            </label>
            <Input
              placeholder="Ej. Empresa Pública de Telecomunicaciones"
              value={datos.empresa}
              onChange={(e) => setDatos({ ...datos, empresa: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Persona de Contacto</label>
            <Input
              placeholder="Ej. Juan Pérez"
              value={datos.contacto}
              onChange={(e) => setDatos({ ...datos, contacto: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Correo Electrónico de Contacto *
            </label>
            <Input
              type="email"
              placeholder="contacto@empresa.com"
              value={datos.correo}
              onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Descripción o Motivo</label>
            <Textarea
              placeholder="Indique brevemente el área de trabajo o actividades que podría desarrollar..."
              rows={3}
              value={datos.descripcion}
              onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => alCambiarAbierto(false)}>
            Cancelar
          </Button>
          <Button size="sm" disabled={enviando} onClick={manejarEnvio}>
            {enviando ? 'Enviando...' : 'Enviar Sugerencia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
