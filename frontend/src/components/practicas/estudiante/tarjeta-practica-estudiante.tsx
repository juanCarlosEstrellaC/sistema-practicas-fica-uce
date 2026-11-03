'use client';

import { AsignacionDto, DocumentoDto, TipoDocumento, FaseActualPractica } from '@/lib/tipos/pp/general-pp';
import { BadgeEstadoPractica } from '@/components/practicas/badges/badge-estado-practica';
import { BadgeFasePractica } from '@/components/practicas/badges/badge-fase-practica';
import { BarraProgresoPp } from '@/components/practicas/barra-progreso-pp';
import { AlertaEstadoProceso } from '@/components/practicas/estudiantes/alerta-estado-proceso';
import { ItemDocumentoPortafolioPp } from '@/components/practicas/item-documento-portafolio-pp';
import { GridMetricasPractica } from './grid-metricas-practica';
import { TarjetaAvalPractica } from './tarjeta-aval-practica';
import { cn } from '@/lib/utils';
import { formatearFechaCorta } from '@/lib/utilidades/fechas';
import {
  adaptarUrlProxy,
  obtenerUrlPrevisualizacionCartaAsignacionPp,
} from '@/lib/utilidades/proxy-url';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

interface TarjetaPracticaEstudianteProps {
  asig: AsignacionDto;
  numeroPractica: number;
  estaColapsado: boolean;
  documentos: DocumentoDto[];
  subiendoDoc: Record<string, boolean>;
  onAlternarColapso: (id: string) => void;
  onSubirArchivo: (asig: AsignacionDto, tipo: TipoDocumento, archivo: File, docExistente?: DocumentoDto) => void;
  onPrevisualizar?: (e: React.MouseEvent, url: string, nombreDoc: string) => void;
  onDescargar: (e: React.MouseEvent, url: string, nombreArchivo: string) => void;
  referenciasInput: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
}

interface ConfiguracionDocProcesoPp {
  tipo: TipoDocumento;
  nombre: string;
  descripcion: string;
  subeEstudiante: boolean;
  emisorTexto: string;
  faseMinima: FaseActualPractica;
  faseMinimaTexto: string;
}

const ORDEN_FASES: Record<string, number> = {
  CONVOCATORIA: 0,
  ASIGNACION: 1,
  DESARROLLO: 2,
  FINALIZACION: 3,
};

const DOCUMENTOS_PROCESO_PP: ConfiguracionDocProcesoPp[] = [
  {
    tipo: 'CV',
    nombre: '1. Hoja de Vida (CV)',
    descripcion: 'Formato estándar FICA con datos académicos y personales en formato PDF.',
    subeEstudiante: true,
    emisorTexto: 'Subido por el Estudiante',
    faseMinima: 'CONVOCATORIA',
    faseMinimaTexto: 'Convocatoria',
  },
  {
    tipo: 'DOCUMENTO_IDENTIDAD',
    nombre: '2. Cédula y Certificado de Votación',
    descripcion: 'Documento de identidad a color escaneado en formato PDF legible.',
    subeEstudiante: true,
    emisorTexto: 'Subido por el Estudiante',
    faseMinima: 'CONVOCATORIA',
    faseMinimaTexto: 'Convocatoria',
  },
  {
    tipo: 'CARTA_ASIGNACION',
    nombre: '3. Carta de Asignación',
    descripcion: 'Documento oficial emitido y firmado por la Coordinación de Prácticas.',
    subeEstudiante: false,
    emisorTexto: 'Generado por Coordinación',
    faseMinima: 'ASIGNACION',
    faseMinimaTexto: 'Asignación',
  },
  {
    tipo: 'SEGUIMIENTO_TA',
    nombre: '4. Registro de Asistencia y Seguimiento',
    descripcion: 'Control de asistencia y seguimiento de avance evaluado por el Tutor Académico.',
    subeEstudiante: false,
    emisorTexto: 'Gestionado por Tutor Académico',
    faseMinima: 'DESARROLLO',
    faseMinimaTexto: 'Desarrollo',
  },
  {
    tipo: 'INFORME_FINAL',
    nombre: '5. Informe Final de Prácticas',
    descripcion: 'Informe técnico consolidado de actividades y cumplimiento en la institución.',
    subeEstudiante: false,
    emisorTexto: 'Gestionado / Validado por Tutor Académico',
    faseMinima: 'DESARROLLO',
    faseMinimaTexto: 'Desarrollo',
  },
  {
    tipo: 'CERTIFICADO_CUMPLIMIENTO',
    nombre: '6. Certificado de Cumplimiento Institucional',
    descripcion: 'Certificado oficial emitido por la empresa o institución receptora de la práctica.',
    subeEstudiante: false,
    emisorTexto: 'Emitido por Institución Receptora',
    faseMinima: 'DESARROLLO',
    faseMinimaTexto: 'Desarrollo',
  },
];

export function TarjetaPracticaEstudiante({
  asig,
  numeroPractica,
  estaColapsado,
  documentos,
  subiendoDoc,
  onAlternarColapso,
  onSubirArchivo,
  onPrevisualizar,
  onDescargar,
  referenciasInput,
}: TarjetaPracticaEstudianteProps) {
  const horasValidadas = asig.horasCompletadas || 0;
  const horasAsignadas = asig.horasAsignadas || 0;

  const fasePractica = asig.fase || 'ASIGNACION';
  const ordenFaseActual = ORDEN_FASES[fasePractica] ?? 1;

  // Aval oficial: solo se desbloquea si el documento fue generado y emitido en BD
  const avalDoc = documentos.find(
    (d) => d.tipo === 'AVAL' && (!d.asignacionId || String(d.asignacionId) === String(asig.id))
  );

  const avalDesbloqueado = Boolean(
    avalDoc?.url &&
      (asig.estado === 'APROBADO' || asig.estado === 'COMPLETADO' || avalDoc?.estado === 'APROBADO')
  );

  // La práctica se considera oficialmente culminada/aprobada si cuenta con su Aval emitido
  const esAprobado = avalDesbloqueado;
  const esCompletado = esAprobado;

  const tutorNombreCompleto = asig.tutorAcademico
    ? `${asig.tutorAcademico.nombres} ${asig.tutorAcademico.apellidos}`
    : 'Por asignar';

  const urlAval = avalDoc?.url || '';
  const nombreAval =
    avalDoc?.nombre || `Aval_Practicas_${asig.institucion || 'Institucion'}.pdf`.replace(/\s+/g, '_');

  return (
    <Card className="border-border shadow-xs overflow-hidden transition-all duration-200 p-0 py-0 gap-0">
      {/* Cabecera Colapsable */}
      <div
        onClick={() => onAlternarColapso(asig.id)}
        className={cn(
          'p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 select-none transition-colors',
          !estaColapsado ? 'border-b border-border/60' : 'border-b-0'
        )}
      >
        <div className="space-y-1.5 flex-1 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Práctica #{numeroPractica}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              Semestre: {asig.semestre ? `${asig.semestre}°` : 'No especificado'}
            </span>
            <BadgeEstadoPractica estado={asig.estado} />
            <BadgeFasePractica fase={asig.fase} />
          </div>

          <h2 className="text-lg font-bold text-foreground leading-snug">
            {asig.institucion || 'Institución Receptora de Prácticas'}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span>
                <strong className="text-foreground">Tutor Académico:</strong> {tutorNombreCompleto}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>
                <strong className="text-foreground">Inicio:</strong> {formatearFechaCorta(asig.fechaInicio)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>
                <strong className="text-foreground">Horas:</strong>{' '}
                {esAprobado
                  ? `${horasValidadas} / ${horasAsignadas}h`
                  : fasePractica === 'FINALIZACION'
                  ? `${horasValidadas} / ${horasAsignadas}h (en validación)`
                  : `${horasValidadas} / ${horasAsignadas}h`}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de alternar colapso */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {estaColapsado ? (
              <>
                <span>Ver detalles</span>
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Ocultar</span>
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Contenido Expandido */}
      {!estaColapsado && (
        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Alerta de estado del proceso */}
          <AlertaEstadoProceso
            fase={asig.fase}
            estado={asig.estado}
            validadoCpp={Boolean(asig.validadoCpp)}
            tieneCarta={ordenFaseActual >= 2 || documentos.some((d) => d.tipo === 'CARTA_ASIGNACION')}
            rol="ESTUDIANTE"
          />

          {/* 1. Línea de Progreso del Proceso */}
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Línea de Progreso del Proceso
              </span>
              <span className="text-xs font-bold text-foreground">
                {esAprobado
                  ? 'Estado: Práctica Culminada y Aprobada'
                  : `Fase actual: ${fasePractica}`}
              </span>
            </div>
            <BarraProgresoPp faseActual={asig.fase} finalizado={esCompletado} />
          </div>

          {/* 2. Grid de 3 Métricas */}
          <GridMetricasPractica
            horasAsignadas={horasAsignadas}
            horasValidadas={horasValidadas}
            tutorNombreCompleto={tutorNombreCompleto}
            correoTutor={asig.tutorAcademico?.correo}
            esAprobado={esAprobado}
            fase={asig.fase}
            validadoCpp={asig.validadoCpp}
          />

          {/* 3. Portafolio de Requisitos y Documentos */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-1 border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Portafolio de Evidencias y Documentos
              </h3>
              <p className="text-xs text-muted-foreground">
                Cargue su Hoja de Vida y Cédula en formato PDF. Los demás documentos son gestionados y habilitados progresivamente según la fase de su práctica por su Tutor Académico, Institución Receptora y Subdecanato.
              </p>
            </div>

            <div className="space-y-3">
              {DOCUMENTOS_PROCESO_PP.map((configDoc) => {
                const docsTipo = documentos
                  .filter((d) => d.tipo === configDoc.tipo)
                  .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

                const docCargado =
                  docsTipo.find((d) => d.asignacionId && String(d.asignacionId) === String(asig.id)) ||
                  docsTipo.find((d) => !d.asignacionId) ||
                  docsTipo[0];

                const ordenMinimoDoc = ORDEN_FASES[configDoc.faseMinima] ?? 0;
                const bloqueadoPorFase = ordenFaseActual < ordenMinimoDoc;

                const esDocValidacionCpp = ['SEGUIMIENTO_TA', 'INFORME_FINAL', 'CERTIFICADO_CUMPLIMIENTO'].includes(configDoc.tipo);
                const bloqueadoPorValidacionCpp = esDocValidacionCpp && !asig.validadoCpp;

                const urlEfectiva = bloqueadoPorValidacionCpp
                  ? undefined
                  : (docCargado?.url ||
                      (configDoc.tipo === 'CARTA_ASIGNACION' && !bloqueadoPorFase
                        ? obtenerUrlPrevisualizacionCartaAsignacionPp(asig.id)
                        : undefined));

                const claveCarga = `${asig.id}_${configDoc.tipo}`;
                const estaSubiendo = subiendoDoc[claveCarga] ?? false;
                const nombreDescarga = docCargado?.nombre || `${configDoc.tipo.toLowerCase()}.pdf`;

                return (
                  <ItemDocumentoPortafolioPp
                    key={configDoc.tipo}
                    titulo={configDoc.nombre}
                    descripcion={configDoc.descripcion}
                    tipo={configDoc.tipo}
                    subeEstudiante={configDoc.subeEstudiante}
                    emisorTexto={configDoc.emisorTexto}
                    faseMinimaTexto={configDoc.faseMinimaTexto}
                    bloqueadoPorFase={bloqueadoPorFase}
                    bloqueadoPorValidacionCpp={bloqueadoPorValidacionCpp}
                    documento={docCargado}
                    urlDocumento={urlEfectiva}
                    estaSubiendo={estaSubiendo}
                    alSeleccionarArchivo={(archivo) =>
                      onSubirArchivo(asig, configDoc.tipo, archivo, docCargado)
                    }
                    alDescargar={(e) => {
                      if (urlEfectiva) {
                        onDescargar(e, urlEfectiva, nombreDescarga);
                      }
                    }}
                    referenciaInput={(el) => {
                      referenciasInput.current[claveCarga] = el;
                    }}
                    rol="ESTUDIANTE"
                  />
                );
              })}

              {/* Item 7: Aval Oficial */}
              <TarjetaAvalPractica
                desbloqueado={avalDesbloqueado}
                horasValidadas={horasValidadas}
                institucion={asig.institucion || 'Institución'}
                urlAval={urlAval}
                nombreAval={nombreAval}
                alDescargar={(e) => onDescargar(e, urlAval, nombreAval)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
