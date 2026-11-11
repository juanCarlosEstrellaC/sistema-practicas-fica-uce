import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TarjetaPracticaEstudiante } from '../tarjeta-practica-estudiante';
import { AsignacionDto, DocumentoDto } from '@/lib/tipos/pp/general-pp';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TarjetaPracticaEstudiante - Validaciones de Documentos 4, 5, 6 y Aval', () => {
  const asignacionBase: AsignacionDto = {
    id: '100',
    convenioId: 'c-1',
    estudiante: {
      id: '10',
      nombres: 'Juan',
      apellidos: 'Pérez',
      identificacion: '1712345678',
      tipoIdentificacion: 'CEDULA',
      correo: 'estudiante@uce.edu.ec',
      telefono: '0999999999',
      carreraNombre: 'Sistemas',
      carreraId: 1,
      urlAvatar: '',
    },
    institucion: 'Empresa Demo S.A.',
    fase: 'FINALIZACION',
    estado: 'EN_CURSO',
    horasAsignadas: 240,
    horasCompletadas: 240,
    validadoCpp: false,
    semestre: 6,
    fechaInicio: '2026-05-01',
    fechaFin: '2026-08-30',
    tutorInstitucional: 'Ing. Carlos Mock',
    reunionRealizada: false,
    periodoAcademicoId: '1',
  };

  const documentosCargadosPorTutor: DocumentoDto[] = [
    {
      id: 'doc-4',
      tipo: 'SEGUIMIENTO_TA',
      nombre: 'monitoreo_seguimiento.pdf',
      url: '/archivos_subidos/seguimiento.pdf',
      estado: 'PENDIENTE_REVISION',
      fechaSubida: '2026-08-20T10:00:00Z',
      estudianteId: '10',
      asignacionId: '100',
      firmado: true,
    },
    {
      id: 'doc-5',
      tipo: 'INFORME_FINAL',
      nombre: 'informe_final.pdf',
      url: '/archivos_subidos/informe.pdf',
      estado: 'PENDIENTE_REVISION',
      fechaSubida: '2026-08-21T10:00:00Z',
      estudianteId: '10',
      asignacionId: '100',
      firmado: true,
    },
    {
      id: 'doc-6',
      tipo: 'CERTIFICADO_CUMPLIMIENTO',
      nombre: 'certificado_cumplimiento.pdf',
      url: '/archivos_subidos/certificado.pdf',
      estado: 'PENDIENTE_REVISION',
      fechaSubida: '2026-08-22T10:00:00Z',
      estudianteId: '10',
      asignacionId: '100',
      firmado: true,
    },
  ];

  it('debe bloquear previsualizacion de docs 4, 5 y 6 y el Aval si CPP no ha validado y Subdecano no ha emitido', () => {
    const refsInput = { current: {} };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionBase}
        numeroPractica={1}
        estaColapsado={false}
        documentos={documentosCargadosPorTutor}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // Los documentos del 3 al 7 no deben mostrar badges
    expect(screen.queryByText(/Pendiente Validación/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No disponible \(Pendiente de emisión\)/i)).not.toBeInTheDocument();

    // Todos los botones inactivos en estudiante deben decir "Bloqueado" y no "Pendiente CPP"
    expect(screen.queryByRole('button', { name: /Pendiente CPP/i })).not.toBeInTheDocument();
    const botonesBloqueados = screen.getAllByRole('button', { name: /Bloqueado/i });
    expect(botonesBloqueados.length).toBeGreaterThanOrEqual(4);
  });

  it('debe permitir ver y descargar docs 4, 5 y 6 una vez que CPP valido el portafolio', () => {
    const refsInput = { current: {} };
    const asignacionValidadaCpp: AsignacionDto = {
      ...asignacionBase,
      validadoCpp: true,
    };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionValidadaCpp}
        numeroPractica={1}
        estaColapsado={false}
        documentos={documentosCargadosPorTutor}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // Los documentos 4, 5 y 6 no deben tener badges
    expect(screen.queryByText('Validado por CPP')).not.toBeInTheDocument();

    // Ahora deben estar disponibles los botones Ver y Descargar para los 3 documentos
    const botonesVer = screen.getAllByRole('button', { name: /Ver/i });
    expect(botonesVer.length).toBeGreaterThanOrEqual(3);

    // El Aval sigue inactivo con su botón Bloqueado
    expect(screen.getByRole('button', { name: /Bloqueado/i })).toBeInTheDocument();
  });

  it('debe desbloquear el Aval unicamente cuando existe en BD y la asignacion esta APROBADA', () => {
    const refsInput = { current: {} };
    const asignacionAprobada: AsignacionDto = {
      ...asignacionBase,
      validadoCpp: true,
      estado: 'APROBADO',
    };

    const docAval: DocumentoDto = {
      id: 'doc-7',
      tipo: 'AVAL',
      nombre: 'Aval_Cumplimiento_100.pdf',
      url: '/archivos_subidos/avales/Aval_Cumplimiento_100.pdf',
      estado: 'APROBADO',
      fechaSubida: '2026-08-25T10:00:00Z',
      estudianteId: '10',
      asignacionId: '100',
      firmado: true,
    };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionAprobada}
        numeroPractica={1}
        estaColapsado={false}
        documentos={[...documentosCargadosPorTutor, docAval]}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // El Aval ahora debe tener los botones Ver Aval y Descargar sin badge
    expect(screen.getByRole('button', { name: /Ver Aval/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Descargar/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar el badge en rojo de Pendiente de entrega para los documentos 1 y 2 cuando no tienen archivo', () => {
    const refsInput = { current: {} };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionBase}
        numeroPractica={1}
        estaColapsado={false}
        documentos={[]}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    const badgesPendientes = screen.getAllByText('Pendiente de entrega');
    expect(badgesPendientes.length).toBe(2);
    badgesPendientes.forEach((badge) => {
      expect(badge.className).toMatch(/rose|destructive/);
    });
  });

  it('no debe mostrar las observaciones de los documentos 4, 5 o 6 al estudiante en su portafolio', () => {
    const refsInput = { current: {} };
    const docsConObservacionTutor: DocumentoDto[] = [
      {
        id: 'doc-4',
        tipo: 'SEGUIMIENTO_TA',
        nombre: 'seguimiento.pdf',
        url: '/archivos/seguimiento.pdf',
        estado: 'RECHAZADO',
        observacion: 'Faltan firmas del tutor institucional',
        fechaSubida: '2026-08-20T10:00:00Z',
        estudianteId: '10',
        asignacionId: '100',
        firmado: false,
      },
      {
        id: 'doc-5',
        tipo: 'INFORME_FINAL',
        nombre: 'informe.pdf',
        url: '/archivos/informe.pdf',
        estado: 'RECHAZADO',
        observacion: 'Corregir resumen ejecutivo',
        fechaSubida: '2026-08-21T10:00:00Z',
        estudianteId: '10',
        asignacionId: '100',
        firmado: false,
      },
    ];

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionBase}
        numeroPractica={1}
        estaColapsado={false}
        documentos={docsConObservacionTutor}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // No debe aparecer ninguna caja de observacion para docs 4 o 5
    expect(screen.queryByText(/Faltan firmas del tutor institucional/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Corregir resumen ejecutivo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Observación del Tutor \/ Revisor:/i)).not.toBeInTheDocument();
  });

  it('debe mostrar las observaciones al estudiante en los documentos 1 y 2 cuando son devueltos con observaciones', () => {
    const refsInput = { current: {} };
    const docsConObservacionEstudiante: DocumentoDto[] = [
      {
        id: 'doc-1',
        tipo: 'CV',
        nombre: 'cv.pdf',
        url: '/archivos/cv.pdf',
        estado: 'RECHAZADO',
        observacion: 'Actualizar experiencia académica y foto',
        fechaSubida: '2026-08-20T10:00:00Z',
        estudianteId: '10',
        asignacionId: '100',
        firmado: false,
      },
    ];

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionBase}
        numeroPractica={1}
        estaColapsado={false}
        documentos={docsConObservacionEstudiante}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // Debe mostrar la insignia "Con Observaciones"
    expect(screen.getByText('Con Observaciones')).toBeInTheDocument();

    // Debe mostrar el texto de la observación
    expect(screen.getByText(/Actualizar experiencia académica y foto/i)).toBeInTheDocument();
    expect(screen.getByText(/Observación del Tutor \/ Revisor:/i)).toBeInTheDocument();

    // Debe mostrar la opción de "Corregir y Resubir"
    expect(screen.getByText(/Corregir y Resubir/i)).toBeInTheDocument();
  });

  it('debe mostrar Horas en Validación y alerta informativa en fase FINALIZACION sin aval emitido', () => {
    const refsInput = { current: {} };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionBase}
        numeroPractica={1}
        estaColapsado={false}
        documentos={documentosCargadosPorTutor}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // No debe decir "Horas Aprobadas" porque el aval aún no se emitió
    expect(screen.queryByText('Horas Aprobadas')).not.toBeInTheDocument();

    // Debe mostrar "Horas en Validación" en 0h con su subtítulo de revisión por CPP
    expect(screen.getByText('Horas en Validación')).toBeInTheDocument();
    expect(screen.getByText('0h')).toBeInTheDocument();
    expect(screen.getByText('En revisión por CPP • Aval pendiente')).toBeInTheDocument();

    // Debe mostrar la alerta informativa de documentos entregados para el estudiante
    expect(screen.getByText('Documentos de cierre entregados')).toBeInTheDocument();
    expect(
      screen.getByText('Sus documentos de finalización están en revisión por parte de la Coordinación de Prácticas.')
    ).toBeInTheDocument();

    // En la cabecera debe indicar 0 / 240h (en validación) hasta la emisión del Aval
    expect(screen.getByText(/0 \/ 240h \(en validación\)/i)).toBeInTheDocument();
  });

  it('debe mostrar Horas Aprobadas y aval cuando el aval ya fue generado y emitido', () => {
    const refsInput = { current: {} };
    const asignacionAprobada: AsignacionDto = {
      ...asignacionBase,
      validadoCpp: true,
      estado: 'APROBADO',
    };

    const docAval: DocumentoDto = {
      id: 'doc-7',
      tipo: 'AVAL',
      nombre: 'Aval_Oficial.pdf',
      url: '/archivos/aval.pdf',
      estado: 'APROBADO',
      fechaSubida: '2026-08-25T10:00:00Z',
      estudianteId: '10',
      asignacionId: '100',
      firmado: true,
    };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionAprobada}
        numeroPractica={1}
        estaColapsado={false}
        documentos={[...documentosCargadosPorTutor, docAval]}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // Ahora sí debe decir "Horas Aprobadas" y el subtítulo con Aval oficial
    expect(screen.getByText('Horas Aprobadas')).toBeInTheDocument();
    expect(screen.getAllByText('240h')).toHaveLength(2);
    expect(screen.getByText('Validadas y acreditadas con Aval')).toBeInTheDocument();
    expect(screen.getByText(/240 \/ 240h/i)).toBeInTheDocument();

    // En cabecera debe decir Estado: Práctica Culminada y Aprobada
    expect(screen.getByText('Estado: Práctica Culminada y Aprobada')).toBeInTheDocument();
  });

  it('debe bloquear la Carta de Asignación y no mostrar Ver/Descargar si el DC aún no la emite (fase ASIGNACION)', () => {
    const refsInput = { current: {} };
    const asignacionEnFaseAsignacionSinCarta: AsignacionDto = {
      ...asignacionBase,
      fase: 'ASIGNACION',
      cartaAsignacionEnviada: false,
    };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionEnFaseAsignacionSinCarta}
        numeroPractica={1}
        estaColapsado={false}
        documentos={[]}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // Carta de Asignación debe mostrar mensaje de pendiente de emisión por DC
    expect(
      screen.getByText(/Pendiente de emisión y firma por la Dirección de Carrera/i)
    ).toBeInTheDocument();

    // No debe haber botón de Ver para Carta de Asignación (ni para ningún documento puesto que ninguno está emitido)
    expect(screen.queryByRole('button', { name: /Ver/i })).not.toBeInTheDocument();

    // Debe mostrar botón Bloqueado para la Carta de Asignación
    const botonesBloqueados = screen.getAllByRole('button', { name: /Bloqueado/i });
    expect(botonesBloqueados.length).toBeGreaterThanOrEqual(1);

    // Tooltip debe indicar que estará disponible cuando DC remita la carta
    const botonCartaBloqueado = botonesBloqueados.find((b) =>
      b.getAttribute('title')?.includes('Dirección de Carrera emita y remita la carta')
    );
    expect(botonCartaBloqueado).toBeDefined();
  });

  it('debe habilitar Ver y Descargar para la Carta de Asignación únicamente cuando el DC la envía (cartaAsignacionEnviada = true)', () => {
    const refsInput = { current: {} };
    const asignacionConCartaEmitida: AsignacionDto = {
      ...asignacionBase,
      fase: 'ASIGNACION',
      cartaAsignacionEnviada: true,
    };

    render(
      <TarjetaPracticaEstudiante
        asig={asignacionConCartaEmitida}
        numeroPractica={1}
        estaColapsado={false}
        documentos={[]}
        subiendoDoc={{}}
        onAlternarColapso={vi.fn()}
        onSubirArchivo={vi.fn()}
        onDescargar={vi.fn()}
        referenciasInput={refsInput}
      />
    );

    // No debe mostrar la advertencia de pendiente por DC
    expect(
      screen.queryByText(/Pendiente de emisión y firma por la Dirección de Carrera/i)
    ).not.toBeInTheDocument();

    // Debe mostrar los botones Ver y Descargar para la Carta de Asignación
    expect(screen.getByRole('button', { name: /Ver/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar/i })).toBeInTheDocument();
  });
});
