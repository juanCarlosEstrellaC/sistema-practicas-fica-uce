'use client';

import { useState, useRef } from 'react';
import { AsignacionDto, DocumentoDto, TipoDocumento } from '@/lib/tipos/pp/general-pp';
import { TarjetaPracticaEstudiante } from './tarjeta-practica-estudiante';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import {
  registrarDocumentoPortafolioAccion,
  resubirDocumentoPortafolioAccion,
} from '@/lib/acciones/pp/documento-portafolio.acciones';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface VistaPracticaEstudianteProps {
  estudianteId: number;
  asignaciones: AsignacionDto[];
  documentosIniciales: DocumentoDto[];
  carreraId?: number;
}

export function VistaPracticaEstudiante({
  estudianteId,
  asignaciones,
  documentosIniciales,
}: VistaPracticaEstudianteProps) {
  // Estado de colapso de cada practica (la primera expandida por defecto)
  const [practicasColapsadas, setPracticasColapsadas] = useState<Record<string, boolean>>(() => {
    const estadoInicial: Record<string, boolean> = {};
    asignaciones.forEach((asig, index) => {
      estadoInicial[asig.id] = index !== 0;
    });
    return estadoInicial;
  });

  // Lista de documentos del portafolio
  const [documentos, setDocumentos] = useState<DocumentoDto[]>(documentosIniciales);

  // Estados de subida de archivos
  const [subiendoDoc, setSubiendoDoc] = useState<Record<string, boolean>>({});
  const referenciasInput = useRef<Record<string, HTMLInputElement | null>>({});

  const alternarColapso = (id: string) => {
    setPracticasColapsadas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const manejarDescarga = async (e: React.MouseEvent, url: string, nombreArchivo: string) => {
    e.preventDefault();
    e.stopPropagation();
    const urlFinal = adaptarUrlProxy(url);
    try {
      const respuesta = await fetch(urlFinal);
      if (!respuesta.ok) throw new Error('Error al descargar');
      const blob = await respuesta.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = blobUrl;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(enlace);
      toast.success('Descarga iniciada con éxito');
    } catch (error) {
      console.error('Error al descargar documento:', error);
      window.open(urlFinal, '_blank');
    }
  };

  const manejarSubirArchivoDirecto = async (
    asig: AsignacionDto,
    tipo: TipoDocumento,
    archivo: File,
    docExistente?: DocumentoDto
  ) => {
    if (archivo.type !== 'application/pdf') {
      toast.error('El archivo debe ser un documento en formato PDF');
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      toast.error('El tamaño máximo permitido es de 10 MB');
      return;
    }

    const claveCarga = `${asig.id}_${tipo}`;
    setSubiendoDoc((prev) => ({ ...prev, [claveCarga]: true }));

    try {
      // 1. Subir archivo fisico
      const urlArchivo = await subirArchivo(archivo, CARPETAS_ARCHIVOS.PORTAFOLIOS);
      if (!urlArchivo) {
        throw new Error('No se pudo obtener la URL del archivo cargado');
      }

      // 2. Guardar registro en backend
      if (docExistente?.id) {
        const res = await resubirDocumentoPortafolioAccion(Number(docExistente.id), {
          nombreArchivo: archivo.name,
          urlArchivo,
        });

        if (!res.exito || !res.data) {
          throw new Error(res.mensaje || 'Error al actualizar el documento');
        }

        setDocumentos((prev) =>
          prev.map((d) => (String(d.id) === String(docExistente.id) ? res.data! : d))
        );
        toast.success(`Documento "${archivo.name}" actualizado correctamente`);
      } else {
        const res = await registrarDocumentoPortafolioAccion({
          tipo,
          nombreArchivo: archivo.name,
          urlArchivo,
          estudianteId,
          asignacionId: asig.id ? Number(asig.id) : undefined,
        });

        if (!res.exito || !res.data) {
          throw new Error(res.mensaje || 'Error al registrar el documento');
        }

        setDocumentos((prev) => {
          const indexExistente = prev.findIndex((d) => d.tipo === tipo);
          if (indexExistente >= 0) {
            return prev.map((d, i) => (i === indexExistente ? res.data! : d));
          }
          return [...prev, res.data!];
        });
        toast.success(`Documento "${archivo.name}" subido con éxito`);
      }
    } catch (err: any) {
      console.error('Error subiendo documento:', err);
      toast.error(err.message || 'Error al procesar la subida del documento');
    } finally {
      setSubiendoDoc((prev) => ({ ...prev, [claveCarga]: false }));
    }
  };

  if (asignaciones.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card">
          <Briefcase className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-bold text-foreground">
            No tienes prácticas preprofesionales asignadas
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1">
            Aún no cuentas con asignaciones registradas en instituciones receptoras para prácticas preprofesionales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {asignaciones.map((asig, indice) => (
        <TarjetaPracticaEstudiante
          key={asig.id}
          asig={asig}
          numeroPractica={asignaciones.length - indice}
          estaColapsado={practicasColapsadas[asig.id] ?? false}
          documentos={documentos}
          subiendoDoc={subiendoDoc}
          onAlternarColapso={alternarColapso}
          onSubirArchivo={manejarSubirArchivoDirecto}
          onDescargar={manejarDescarga}
          referenciasInput={referenciasInput}
        />
      ))}
    </div>
  );
}
