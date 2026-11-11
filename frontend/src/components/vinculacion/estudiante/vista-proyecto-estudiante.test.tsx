import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { VistaProyectoEstudiante } from './vista-proyecto-estudiante';
import { VistaProgresoGeneralVcs } from './vista-progreso-general-vcs';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/acciones/vcs/evidencia-vcs.acciones', () => ({
  subirEvidenciaAccion: vi.fn(),
  obtenerEvidenciasPorAsignacionAccion: vi.fn().mockResolvedValue({ exito: true, data: [] }),
}));

vi.mock('@/lib/servicios/documento.servicio', () => ({
  subirArchivo: vi.fn(),
  CARPETAS_ARCHIVOS: { VINCULACION: 'vinculacion' },
}));

describe('Validacion de horas de VCS antes y despues de emision de certificado', () => {
  const asignacionEnValidacion: AsignacionProyectoDto = {
    id: 1,
    proyectoId: 10,
    nombreProyecto: 'Proyecto Comunitario de Alfabetización Digital',
    estudianteId: 100,
    nombreCompletoEstudiante: 'Estudiante Ejemplo',
    identificacionEstudiante: '1720000000',
    correoEstudiante: 'estudiante@uce.edu.ec',
    tutorId: 200,
    nombreCompletoTutor: 'Jaime Oswaldo Salvador Meneses',
    correoTutor: 'jsalvador@uce.edu.ec',
    periodoAcademicoId: 1,
    nombrePeriodoAcademico: '2026-2026',
    carreraId: 1,
    nombreCarrera: 'Ingeniería en Computación',
    fechaInicio: '2026-01-15',
    horasAsignadas: 80,
    horasCompletadas: 0,
    estado: 'EN_CURSO',
    faseActual: 'FINALIZACION',
    documentosValidados: true,
  };

  const asignacionAprobadaConCertificado: AsignacionProyectoDto = {
    ...asignacionEnValidacion,
    horasCompletadas: 80,
    estado: 'APROBADO',
    urlCertificado: '/archivos/certificado.pdf',
  };

  it('no debe mostrar horas como aprobadas si Subdecanato aún no emite el certificado ni aprueba', () => {
    render(<VistaProyectoEstudiante asignaciones={[asignacionEnValidacion]} />);

    // Título de la tarjeta debe ser "Horas en Validación", no "Horas Aprobadas"
    expect(screen.getByText('Horas en Validación')).toBeInTheDocument();
    expect(screen.queryByText('Horas Aprobadas')).not.toBeInTheDocument();

    // El valor de horas en validación debe ser 0h
    expect(screen.getByText('0h')).toBeInTheDocument();

    // El subtítulo debe indicar que espera el certificado de Subdecanato
    expect(
      screen.getByText('Validadas por Tutor • Esperando Certificado')
    ).toBeInTheDocument();
    expect(screen.queryByText('Acreditadas por Subdecanato')).not.toBeInTheDocument();

    // El certificado debe permanecer Bloqueado
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
  });

  it('debe reflejar horas aprobadas y certificado emitido cuando Subdecanato aprueba', () => {
    render(<VistaProyectoEstudiante asignaciones={[asignacionAprobadaConCertificado]} />);

    expect(screen.getByText('Horas Aprobadas')).toBeInTheDocument();
    // Debe haber 2 menciones de 80h: Horas Asignadas y Horas Aprobadas
    expect(screen.getAllByText('80h')).toHaveLength(2);
    expect(screen.getByText('Acreditadas por Subdecanato')).toBeInTheDocument();
    expect(screen.getByText('Emitido')).toBeInTheDocument();
    expect(screen.getByText('Ver Certificado')).toBeInTheDocument();
  });

  it('en VistaProgresoGeneralVcs no debe contabilizar horas validadas si falta emision de certificado', () => {
    render(<VistaProgresoGeneralVcs asignaciones={[asignacionEnValidacion]} />);

    // El resumen de horas validadas y la barra tienen '0 horas'
    expect(screen.getAllByText('0 horas').length).toBeGreaterThanOrEqual(1);
    // Y las horas en curso deben ser 80 horas
    expect(screen.getByText('80 horas')).toBeInTheDocument();

    // El certificado no debe estar disponible para previsualizar
    expect(screen.queryByText('Certificado de Vinculación')).not.toBeInTheDocument();
  });

  it('en VistaProgresoGeneralVcs debe contabilizar 80 horas validadas cuando está aprobado', () => {
    render(<VistaProgresoGeneralVcs asignaciones={[asignacionAprobadaConCertificado]} />);

    // Debe mostrar 80 horas en Horas Validadas y 80 horas en Horas Restantes
    expect(screen.getAllByText('80 horas')).toHaveLength(2);
    expect(screen.getByText('50% (80 / 160 h)')).toBeInTheDocument();
  });

  it('debe bloquear la subida de evidencias cuando el periodo académico está inactivo', () => {
    const asignacionEnDesarrollo: AsignacionProyectoDto = {
      ...asignacionEnValidacion,
      faseActual: 'DESARROLLO',
      documentosValidados: false,
      periodoAcademicoId: 99,
    };

    render(
      <VistaProyectoEstudiante
        asignaciones={[asignacionEnDesarrollo]}
        periodosInactivosIds={[99]}
      />
    );

    expect(screen.getAllByText('Periodo cerrado')).toHaveLength(2);
    expect(screen.queryByText('Subir Archivo')).not.toBeInTheDocument();
  });
});
