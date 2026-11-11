import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TablaEstudiantes } from '../estudiantes/tabla-estudiantes';
import { AsignacionPracticaDetalleDto } from '@/lib/tipos/pp/general-pp';

const pushMock = vi.fn();
let mockFaseFiltro: string | null = null;

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'faseActual' || key === 'fase') return mockFaseFiltro;
      if (key === 'sort') return 'id,desc';
      return null;
    },
    has: (_key: string) => false,
    toString: () => '',
  }),
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard/practicas/estudiantes',
}));

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
  useAutenticacion: () => ({
    usuario: { id: '1', nombre: 'Director Carrera', rol: 'DIRECTOR_CARRERA' },
  }),
}));

vi.mock('../estudiantes/modal-editar-asignacion-practica', () => ({
  ModalEditarAsignacionPractica: () => null,
}));

vi.mock('../estudiantes/modal-cancelar-asignacion-practica', () => ({
  ModalCancelarAsignacionPractica: ({ abierto, asignacion }: any) => {
    if (!abierto || !asignacion) return null;
    return (
      <div data-testid="modal-cancelar-practica">
        <span>Cancelar Práctica de {asignacion.estudiante?.nombres}</span>
      </div>
    );
  },
}));

vi.mock('../estudiantes/modal-reprobar-asignacion-practica', () => ({
  ModalReprobarAsignacionPractica: ({ abierto, asignacion }: any) => {
    if (!abierto || !asignacion) return null;
    return (
      <div data-testid="modal-reprobar-practica">
        <span>Reprobar Práctica de {asignacion.estudiante?.nombres}</span>
      </div>
    );
  },
}));

vi.mock('../estudiantes/modal-detalle-estudiante', () => ({
  ModalDetalleEstudiante: ({ abierto, alCerrar, asignacion }: any) => {
    if (!abierto || !asignacion) return null;
    return (
      <div data-testid="modal-detalle-estudiante">
        <span>Detalle: {asignacion.estudiante?.nombres}</span>
        <button onClick={alCerrar}>Cerrar Detalle</button>
      </div>
    );
  },
}));

vi.mock('@/lib/acciones/pp/asignacion-practica.acciones', () => ({
  actualizarAsignacionPracticaAccion: vi.fn(),
  obtenerAsignacionPracticaPorIdAccion: vi.fn(),
  cancelarAsignacionPracticaAccion: vi.fn(async () => ({
    exito: true,
    mensaje: 'Práctica preprofesional cancelada exitosamente',
  })),
  reprobarAsignacionPracticaAccion: vi.fn(async () => ({
    exito: true,
    mensaje: 'Práctica preprofesional reprobada exitosamente',
  })),
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

describe('TablaEstudiantes (Componente Modular UI)', () => {
  const asignacionPrueba: AsignacionPracticaDetalleDto = {
    id: 101,
    estudiante: {
      id: 201,
      nombres: 'Carlos',
      apellidos: 'Gomez',
      identificacion: '1723456789',
      correo: 'cgomez@uce.edu.ec',
      carreraNombre: 'Sistemas',
    },
    tutorAcademico: {
      id: 301,
      nombres: 'Dra. Lucia',
      apellidos: 'Perez',
      identificacion: '1709876543',
      correo: 'lperez@uce.edu.ec',
    },
    convenioId: 401,
    institucion: 'Empresa Publica Petroecuador',
    direccion: 'Av. 6 de Diciembre',
    horasAsignadas: 240,
    horasCompletadas: 120,
    fase: 'ASIGNACION',
    estado: 'EN_CURSO',
    puedeEditar: true,
  };

  const paginaAsignacionesPrueba = {
    content: [asignacionPrueba],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: false,
  };

  it('debe renderizar la cabecera con el total de asignaciones registradas', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.getByText('Listado de Asignaciones')).toBeInTheDocument();
    expect(screen.getByText('Total de asignaciones registradas:')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('debe renderizar el estudiante, identificacion, institucion y progreso de horas', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.getAllByText('Carlos Gomez')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/1723456789/)[0]).toBeInTheDocument();
    expect(screen.getAllByText('cgomez@uce.edu.ec')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Empresa Publica Petroecuador')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Tutor: Dra\. Lucia Perez/)[0]).toBeInTheDocument();
    expect(screen.getAllByText('120 / 240h')[0]).toBeInTheDocument();
    expect(screen.getAllByText('50%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('En Curso')[0]).toBeInTheDocument();
  });

  it('debe permitir ordenar al hacer click en la cabecera de Estudiante', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="DIRECTOR_CARRERA"
      />
    );

    fireEvent.click(screen.getByText('Estudiante'));
    expect(pushMock).toHaveBeenCalledWith(
      '/dashboard/practicas/estudiantes?sort=estudiante.nombres%2Casc&page=0'
    );
  });

  it('debe mostrar columna carrera cuando el rol es SUBDECANO', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="SUBDECANO"
      />
    );

    expect(screen.getByText('Carrera')).toBeInTheDocument();
    expect(screen.getAllByText('Sistemas')[0]).toBeInTheDocument();
  });

  it('debe llamar alSeleccionarEstudiante al hacer click en la fila', () => {
    const fnSeleccionar = vi.fn();
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="DIRECTOR_CARRERA"
        alSeleccionarEstudiante={fnSeleccionar}
      />
    );

    fireEvent.click(screen.getAllByText('Carlos Gomez')[0]);
    expect(fnSeleccionar).toHaveBeenCalledWith('201');
  });

  it('debe renderizar botones de cancelar, editar y eliminar para COORDINADOR_PRACTICAS cuando puedeEditar es true y está EN_CURSO', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    expect(screen.getAllByTitle('Cancelar práctica preprofesional')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Cancelar práctica preprofesional')[0]).toHaveClass('text-amber-600');
    expect(screen.getAllByTitle('Editar Asignación')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('Editar Asignación')[0]).toHaveClass('text-primary');
    expect(screen.getAllByTitle('Eliminar Asignación')[0]).toBeInTheDocument();
  });

  it('debe renderizar botones de editar y eliminar deshabilitados junto a cancelar activo para COORDINADOR_PRACTICAS cuando puedeEditar es false en ASIGNACION', () => {
    const asignacionesNoModificables = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          puedeEditar: false,
        },
      ],
    };

    render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionesNoModificables as any}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    expect(screen.getAllByTitle('Cancelar práctica preprofesional')[0]).not.toBeDisabled();
    const botonesNoModificables = screen.getAllByTitle('No modificable');
    expect(botonesNoModificables.length).toBeGreaterThanOrEqual(2);
    expect(botonesNoModificables[0]).toBeDisabled();
    expect(botonesNoModificables[1]).toBeDisabled();
  });

  it('debe mostrar mensaje vacio cuando no hay registros', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={{
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          first: true,
          last: true,
          empty: true,
        }}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.getAllByText('No se encontraron asignaciones')[0]).toBeInTheDocument();
  });

  it('no debe renderizar columna ni botones de acciones para DIRECTOR_CARRERA', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Reenviar Carta al Tutor Institucional')).not.toBeInTheDocument();
  });

  it('debe renderizar botón Cancelar para COORDINADOR_PRACTICAS en fase DESARROLLO en vez de editar y eliminar deshabilitados', () => {
    const asignacionDesarrollo = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          fase: 'DESARROLLO',
          estado: 'EN_CURSO',
          puedeEditar: false,
        },
      ],
    };

    render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionDesarrollo as any}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    const botonesCancelar = screen.getAllByTitle('Cancelar práctica preprofesional');
    expect(botonesCancelar.length).toBeGreaterThanOrEqual(1);
    expect(botonesCancelar[0]).toHaveClass('text-amber-600');
    expect(screen.queryByTitle('Editar Asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar Asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('No modificable')).not.toBeInTheDocument();
  });

  it('debe renderizar botón Cancelar para COORDINADOR_PRACTICAS en fase FINALIZACION y abrir modal de cancelacion al click', () => {
    const asignacionFinalizacion = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          fase: 'FINALIZACION',
          estado: 'EN_CURSO',
          puedeEditar: false,
        },
      ],
    };

    render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionFinalizacion as any}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    const botonesCancelar = screen.getAllByTitle('Cancelar práctica preprofesional');
    expect(botonesCancelar.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(botonesCancelar[0]);
    expect(screen.getByTestId('modal-cancelar-practica')).toBeInTheDocument();
    expect(screen.getByText('Cancelar Práctica de Carlos')).toBeInTheDocument();
  });

  it('no debe renderizar botones de accion y debe mostrar texto "No disponible" cuando la práctica está CANCELADA o REPROBADA', () => {
    const asignacionCancelada = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          fase: 'DESARROLLO',
          estado: 'CANCELADO',
          puedeEditar: false,
        },
      ],
    };

    const { rerender } = render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionCancelada as any}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.queryByTitle('Cancelar práctica preprofesional')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Editar Asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar Asignación')).not.toBeInTheDocument();
    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(1);

    // Probar también con estado REPROBADO
    const asignacionReprobada = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          fase: 'ASIGNACION',
          estado: 'REPROBADO',
          puedeEditar: true,
        },
      ],
    };

    rerender(
      <TablaEstudiantes
        paginaAsignaciones={asignacionReprobada as any}
        rol="DIRECTOR_CARRERA"
      />
    );

    expect(screen.queryByTitle('Cancelar práctica preprofesional')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Editar Asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar Asignación')).not.toBeInTheDocument();
    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(1);
  });

  it('debe renderizar botón Reprobar en estilo rose suave para TUTOR_ACADEMICO cuando la práctica está EN_CURSO', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="TUTOR_ACADEMICO"
      />
    );

    const botonesReprobar = screen.getAllByRole('button', { name: 'Reprobar' });
    expect(botonesReprobar.length).toBeGreaterThanOrEqual(1);
    expect(botonesReprobar[0]).toHaveClass('text-rose-600');
    expect(botonesReprobar[0]).not.toHaveClass('bg-destructive');
    expect(screen.queryByTitle('Editar Asignación')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar Asignación')).not.toBeInTheDocument();
  });

  it('debe abrir modal de reprobación al hacer click en Reprobar para TUTOR_ACADEMICO', () => {
    render(
      <TablaEstudiantes
        paginaAsignaciones={paginaAsignacionesPrueba as any}
        rol="TUTOR_ACADEMICO"
      />
    );

    const botonesReprobar = screen.getAllByRole('button', { name: 'Reprobar' });
    fireEvent.click(botonesReprobar[0]);

    expect(screen.getByTestId('modal-reprobar-practica')).toBeInTheDocument();
    expect(screen.getByText('Reprobar Práctica de Carlos')).toBeInTheDocument();
  });

  it('no debe renderizar botón Reprobar para TUTOR_ACADEMICO cuando la práctica no está EN_CURSO y mostrar No disponible si está REPROBADO', () => {
    const asignacionReprobada = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          estado: 'REPROBADO',
        },
      ],
    };

    render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionReprobada as any}
        rol="TUTOR_ACADEMICO"
      />
    );

    expect(screen.queryByRole('button', { name: 'Reprobar' })).not.toBeInTheDocument();
    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(1);
  });

  it('no debe mostrar asignaciones sin carta enviada cuando el rol es TUTOR_ACADEMICO', () => {
    const asignacionSinCarta = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          cartaAsignacionEnviada: false,
        },
      ],
      totalElements: 1,
    };

    render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionSinCarta as any}
        rol="TUTOR_ACADEMICO"
      />
    );

    expect(screen.queryByText('Carlos Gomez')).not.toBeInTheDocument();
    expect(screen.getAllByText('No se encontraron asignaciones')[0]).toBeInTheDocument();
  });

  it('debe retirar la columna "Acciones" por completo cuando el filtro de fase es FINALIZACION', () => {
    mockFaseFiltro = 'FINALIZACION';

    const asignacionFinalizada = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          fase: 'FINALIZACION',
          estado: 'APROBADO',
        },
      ],
    };

    render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionFinalizada as any}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
    mockFaseFiltro = null;
  });

  it('debe mostrar "-" en la celda de acciones cuando está en fase FINALIZACION y estado APROBADO sin filtro de fase activo', () => {
    mockFaseFiltro = null;

    const asignacionFinalizada = {
      ...paginaAsignacionesPrueba,
      content: [
        {
          ...paginaAsignacionesPrueba.content[0],
          fase: 'FINALIZACION',
          estado: 'APROBADO',
        },
      ],
    };

    render(
      <TablaEstudiantes
        paginaAsignaciones={asignacionFinalizada as any}
        rol="COORDINADOR_PRACTICAS"
      />
    );

    expect(screen.getByText('Acciones')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
