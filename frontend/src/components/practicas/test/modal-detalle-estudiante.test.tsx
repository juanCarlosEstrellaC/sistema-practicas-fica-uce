import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ModalDetalleEstudiante } from '../estudiantes/modal-detalle-estudiante';
import { AsignacionPracticaDetalleDto } from '@/lib/tipos/pp/general-pp';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/practicas/portafolio/portafolio', () => ({
  Portafolio: (props: any) => (
    <div data-testid="portafolio-mock" data-etapa={props.etapaActual}>
      Portafolio Digital Mock
    </div>
  ),
  default: (props: any) => (
    <div data-testid="portafolio-mock" data-etapa={props.etapaActual}>
      Portafolio Digital Mock
    </div>
  ),
}));

vi.mock('../estudiantes/acciones-tutor-academico', () => ({
  AccionesTutorAcademico: () => <div data-testid="acciones-tutor-mock">Acciones Tutor Mock</div>,
}));

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  reenviarCartaAsignacionAccion: vi.fn(async () => ({
    exito: true,
    mensaje: 'Carta de asignación reenviada exitosamente',
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ModalDetalleEstudiante (Componente Modular UI)', () => {
  const asignacionMock: AsignacionPracticaDetalleDto = {
    id: 50,
    estudiante: {
      id: 10,
      nombres: 'Esteban',
      apellidos: 'Vargas',
      identificacion: '1712345678',
      correo: 'evargas@uce.edu.ec',
      carreraNombre: 'Sistemas',
    },
    tutorAcademico: {
      id: 20,
      nombres: 'Ing. Sandra',
      apellidos: 'Mendoza',
      identificacion: '1798765432',
      correo: 'smendoza@uce.edu.ec',
    },
    institucion: 'Empresa Eléctrica Quito',
    horasAsignadas: 240,
    horasCompletadas: 180,
    fase: 'ASIGNACION',
    estado: 'EN_CURSO',
    validadoCpp: false,
  };

  it('debe renderizar el nombre del estudiante y estado del proceso', () => {
    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionMock}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.getByText('Esteban Vargas')).toBeInTheDocument();
    expect(screen.getByText('evargas@uce.edu.ec')).toBeInTheDocument();
    expect(screen.getByText('Fase del Proceso')).toBeInTheDocument();
    expect(screen.getByText('Carta de Asignación pendiente')).toBeInTheDocument();
    expect(screen.getByTestId('portafolio-mock')).toHaveAttribute('data-etapa', 'ASIGNACION');
  });

  it('debe mostrar el botón para emitir carta al Director de Carrera en fase ASIGNACION', () => {
    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionMock}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.getByText('Visualizar y Emitir Carta de Asignación')).toBeInTheDocument();
  });

  it('debe mostrar y permitir reenviar la carta al tutor institucional al Director de Carrera', async () => {
    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={{ ...asignacionMock, cartaAsignacionEnviada: true }}
        rol="DIRECTOR_CARRERA"
      />
    );

    const botonReenviar = screen.getByText('Reenviar Carta al Tutor Institucional');
    expect(botonReenviar).toBeInTheDocument();
    fireEvent.click(botonReenviar);
  });

  it('debe mostrar el botón para generar aval al Subdecano en fase FINALIZACION cuando está validado por CPP', () => {
    const asignacionFinalizada: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'FINALIZACION',
      validadoCpp: true,
      horasCompletadas: 240,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionFinalizada}
        rol="SUBDECANO"
      />
    );

    expect(screen.getByText('Previsualizar y Emitir Aval de Cumplimiento')).toBeInTheDocument();
  });

  it('debe ocultar el botón para generar aval al Subdecano cuando la práctica ya fue aprobada', () => {
    const asignacionAprobada: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'FINALIZACION',
      estado: 'APROBADO',
      validadoCpp: true,
      horasCompletadas: 240,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionAprobada}
        rol="SUBDECANO"
      />
    );

    expect(screen.queryByText('Previsualizar y Emitir Aval de Cumplimiento')).not.toBeInTheDocument();
  });

  it('debe no renderizar nada si abierto es false', () => {
    const { container } = render(
      <ModalDetalleEstudiante
        abierto={false}
        alCerrar={vi.fn()}
        asignacion={asignacionMock}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.queryByText('Esteban Vargas')).not.toBeInTheDocument();
  });

  it('debe mostrar el aviso informativo de espera de validacion del Coordinador en fase FINALIZACION y ocultar acciones de Tutor Academico', () => {
    const asignacionEnFinalizacion: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'FINALIZACION',
      validadoCpp: false,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionEnFinalizacion}
        rol="TUTOR_ACADEMICO"
      />
    );

    expect(
      screen.getByText('Ha remitido los documentos de cierre exitosamente. Esperando la revisión y validación de la documentación por parte del Coordinador de Prácticas.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('acciones-tutor-mock')).not.toBeInTheDocument();
  });

  it('debe ocultar acciones de Tutor Académico en fase ASIGNACION si la carta de asignación no ha sido emitida', () => {
    const asignacionSinCarta: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'ASIGNACION',
      cartaAsignacionEnviada: false,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionSinCarta}
        rol="TUTOR_ACADEMICO"
      />
    );

    expect(
      screen.getByText('Esperando que la Dirección de Carrera emita y remita la carta de asignación al tutor institucional.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('acciones-tutor-mock')).not.toBeInTheDocument();
  });

  it('debe mostrar acciones de Tutor Académico en fase ASIGNACION si la carta de asignación ya fue emitida', () => {
    const asignacionConCarta: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'ASIGNACION',
      cartaAsignacionEnviada: true,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionConCarta}
        rol="TUTOR_ACADEMICO"
      />
    );

    expect(screen.getByTestId('acciones-tutor-mock')).toBeInTheDocument();
  });

  it('debe ocultar el bloque de acciones para CPP en fase FINALIZACION cuando el portafolio ya fue validado', () => {
    const asignacionValidadaCpp: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'FINALIZACION',
      validadoCpp: true,
      horasCompletadas: 240,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionValidadaCpp}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    // Debe mostrar la alerta informativa de espera a Subdecanato
    expect(screen.getByText('Portafolio validado por su parte')).toBeInTheDocument();
    // No debe existir el bloque ni el título de Acciones
    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    expect(screen.queryByText('Validar Documentos del Portafolio')).not.toBeInTheDocument();
  });

  it('debe ocultar el bloque de acciones para CPP en fase DESARROLLO', () => {
    const asignacionEnDesarrollo: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'DESARROLLO',
      horasCompletadas: 80,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionEnDesarrollo}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
  });

  it('debe ocultar el bloque de acciones para cualquier perfil cuando el estado es APROBADO', () => {
    const asignacionCompletada: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'FINALIZACION',
      estado: 'APROBADO',
      validadoCpp: true,
      horasCompletadas: 240,
    };

    const roles = ['COORDINADOR_PRACTICAS', 'SUBDECANO', 'TUTOR_ACADEMICO', 'DIRECTOR_CARRERA'];

    for (const rol of roles) {
      const { unmount } = render(
        <ModalDetalleEstudiante
          abierto={true}
          alCerrar={vi.fn()}
          asignacion={asignacionCompletada}
          rol={rol}
        />
      );

      expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('debe ocultar el bloque de acciones para Director de Carrera en cualquier fase dentro del modal', () => {
    const asignacionFinal: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'FINALIZACION',
      validadoCpp: false,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionFinal}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
  });

  it('debe mostrar la alerta informativa de culminación cuando la asignación está COMPLETADA o APROBADA', () => {
    const asignacionCulminada: AsignacionPracticaDetalleDto = {
      ...asignacionMock,
      fase: 'FINALIZACION',
      estado: 'APROBADO',
      validadoCpp: true,
      horasCompletadas: 240,
    };

    render(
      <ModalDetalleEstudiante
        abierto={true}
        alCerrar={vi.fn()}
        asignacion={asignacionCulminada}
        rol="SUBDECANO"
      />
    );

    expect(screen.getByText('Prácticas preprofesionales culminadas')).toBeInTheDocument();
    expect(screen.getByText('Proceso completado')).toBeInTheDocument();
    expect(
      screen.getByText(
        'El estudiante completó todas las etapas del proceso. El Aval de Culminación de Prácticas ha sido emitido y debidamente registrado en el portafolio.'
      )
    ).toBeInTheDocument();
  });
});
