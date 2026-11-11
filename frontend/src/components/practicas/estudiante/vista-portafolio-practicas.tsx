'use client';

import { useState, useRef } from 'react';
import { DocumentoDto, AsignacionDto, TipoDocumento } from '@/lib/tipos/pp/general-pp';
import { BadgeEstadoDocumentoPp } from '@/components/practicas/badges/badge-estado-documento-pp';
import { subirArchivo, CARPETAS_ARCHIVOS } from '@/lib/servicios/documento.servicio';
import {
  registrarDocumentoPortafolioAccion,
  resubirDocumentoPortafolioAccion,
} from '@/lib/acciones/pp/documento-portafolio.acciones';
import { cn } from '@/lib/utils';
import { formatearFecha } from '@/lib/utilidades/fechas';
import { adaptarUrlProxy } from '@/lib/utilidades/proxy-url';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BotonPrevisualizarDocumento } from '@/components/comunes/boton-previsualizar-documento';
import { obtenerUrlPrevisualizacionDocumentoPortafolio } from '@/lib/utilidades/proxy-url';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface RequisitoPortafolio {
  tipo: TipoDocumento;
  nombre: string;
  descripcion: string;
  requerido: boolean;
  etapaMinima: string;
}

const REQUISITOS_PORTAFOLIO: RequisitoPortafolio[] = [
  {
    tipo: 'CV',
    nombre: '1. Hoja de Vida (CV)',
    descripcion: 'Formato estándar con datos personales y académicos actualizados en PDF.',
    requerido: true,
    etapaMinima: 'CONVOCATORIA',
  },
  {
    tipo: 'DOCUMENTO_IDENTIDAD',
    nombre: '2. Cédula y Certificado de Votación',
    descripcion: 'Documento de identidad a color escaneado en PDF legible.',
    requerido: true,
    etapaMinima: 'CONVOCATORIA',
  },
  {
    tipo: 'CARTA_ASIGNACION',
    nombre: '3. Carta de Asignación',
    descripcion: 'Documento oficial generado por la Dirección de Carrera y firmado.',
    requerido: true,
    etapaMinima: 'ASIGNACION',
  },
  {
    tipo: 'SEGUIMIENTO_TA',
    nombre: '4. Registro de Asistencia / Seguimiento',
    descripcion: 'Bitácora y hojas de control de actividades firmadas por el tutor.',
    requerido: true,
    etapaMinima: 'DESARROLLO',
  },
  {
    tipo: 'INFORME_FINAL',
    nombre: '5. Informe Final de Prácticas',
    descripcion: 'Informe consolidado de actividades desarrolladas y resultados.',
    requerido: true,
    etapaMinima: 'FINALIZACION',
  },
  {
    tipo: 'CERTIFICADO_CUMPLIMIENTO',
    nombre: '6. Certificado de Cumplimiento de la Empresa',
    descripcion: 'Certificado oficial emitido y sellado por la institución receptora.',
    requerido: true,
    etapaMinima: 'FINALIZACION',
  },
  {
    tipo: 'AVAL',
    nombre: '7. Aval de Prácticas Preprofesionales',
    descripcion: 'Aval emitido por el Subdecanato tras la aprobación de la práctica.',
    requerido: false,
    etapaMinima: 'FINALIZACION',
  },
];

interface VistaPortafolioPracticasProps {
  estudianteId: number;
  asignacionActiva?: AsignacionDto | null;
  documentosIniciales: DocumentoDto[];
  onDocumentoActualizado?: () => void;
}

export function VistaPortafolioPracticas({
  estudianteId,
  asignacionActiva,
  documentosIniciales,
  onDocumentoActualizado,
}: VistaPortafolioPracticasProps) {
  const [documentos, setDocumentos] = useState<DocumentoDto[]>(documentosIniciales);
  const [cargandoDoc, setCargandoDoc] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const manejarClickSubir = (tipo: string) => {
    inputRefs.current[tipo]?.click();
  };

  const manejarArchivoSeleccionado = async (tipo: TipoDocumento, archivo: File, docExistente?: DocumentoDto) => {
    setCargandoDoc((prev) => ({ ...prev, [tipo]: true }));
    try {
      // 1. Subir archivo físico al backend (valida límite de 10 MB en documento.servicio)
      const urlArchivo = await subirArchivo(archivo, CARPETAS_ARCHIVOS.PORTAFOLIOS);
      if (!urlArchivo) {
        throw new Error('No se recibió la URL del archivo cargado');
      }

      // 2. Registrar o actualizar en la base de datos mediante Server Action
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
          asignacionId: asignacionActiva?.id ? Number(asignacionActiva.id) : undefined,
        });

        if (!res.exito || !res.data) {
          throw new Error(res.mensaje || 'Error al registrar el documento');
        }

        setDocumentos((prev) => [...prev, res.data!]);
        toast.success(`Documento "${archivo.name}" cargado con éxito`);
      }

      if (onDocumentoActualizado) onDocumentoActualizado();
    } catch (error: any) {
      console.error('Error al subir documento:', error);
      toast.error(error.message || 'Error al procesar el archivo');
    } finally {
      setCargandoDoc((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="p-5 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Portafolio Digital de Prácticas Preprofesionales
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Cargue los documentos requeridos para su proceso. Formato permitido: PDF (máx. 10 MB por archivo).
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs px-2.5 py-1">
            {documentos.length} de {REQUISITOS_PORTAFOLIO.filter((r) => r.requerido).length} requeridos
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0 space-y-3">
        <div className="divide-y rounded-xl border bg-card overflow-hidden">
          {REQUISITOS_PORTAFOLIO.map((req) => {
            const docCargado = documentos.find((d) => d.tipo === req.tipo);
            const estaCargando = !!cargandoDoc[req.tipo];
            const esSubidoPorEstudiante = req.tipo === 'CV' || req.tipo === 'DOCUMENTO_IDENTIDAD';
            const yaEstaAprobado = docCargado?.estado === 'APROBADO';

            return (
              <div
                key={req.tipo}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                {/* Info del requisito */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">{req.nombre}</h4>
                    {req.requerido ? (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        Obligatorio
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Informativo
                      </Badge>
                    )}
                    {docCargado?.estado && <BadgeEstadoDocumentoPp estado={docCargado.estado} />}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{req.descripcion}</p>

                  {docCargado?.nombre && (
                    <p className="text-xs font-medium text-foreground flex items-center gap-1.5 pt-0.5">
                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-sm">{docCargado.nombre}</span>
                      {docCargado.fechaSubida && (
                        <span className="text-muted-foreground font-normal">
                          · {formatearFecha(docCargado.fechaSubida)}
                        </span>
                      )}
                    </p>
                  )}

                  {docCargado?.observacion && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-500/10 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{docCargado.observacion}</span>
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    ref={(el) => {
                      inputRefs.current[req.tipo] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        manejarArchivoSeleccionado(req.tipo, file, docCargado);
                        e.target.value = '';
                      }
                    }}
                  />

                  {docCargado?.url && (
                    <BotonPrevisualizarDocumento
                      url={
                        docCargado.id
                          ? obtenerUrlPrevisualizacionDocumentoPortafolio(docCargado.id)
                          : docCargado.url
                      }
                      titulo={docCargado.nombre || req.nombre}
                      nombreArchivo={docCargado.nombre}
                      texto="Ver"
                      variante="outline"
                      tamano="sm"
                      className="h-8 text-xs bg-card"
                    />
                  )}

                  {esSubidoPorEstudiante && !yaEstaAprobado && (
                    <Button
                      variant={docCargado ? 'outline' : 'default'}
                      size="sm"
                      className="h-8 text-xs"
                      disabled={estaCargando}
                      onClick={() => manejarClickSubir(req.tipo)}
                    >
                      {estaCargando ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Subiendo...
                        </>
                      ) : docCargado ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                          Reemplazar
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          Subir PDF
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
