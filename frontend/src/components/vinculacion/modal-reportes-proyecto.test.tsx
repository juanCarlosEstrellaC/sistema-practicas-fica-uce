import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalReportesProyecto } from './modal-reportes-proyecto';
import { ProyectoComunitarioDto } from '@/lib/tipos/vcs/proyecto-comunitario';
import { ReporteProyecto } from '@/lib/tipos/vcs/reporte-proyecto';
import * as accionesReportes from '@/lib/acciones/vcs/reporte-proyecto.acciones';
import * as servicioDocumento from '@/lib/servicios/documento.servicio';
import { toast } from 'sonner';

let usuarioActualMock: any = {
    id: 2,
    nombres: 'Subdecana',
    apellidos: 'FICA',
    correo: 'subdecana@uce.edu.ec',
    rol: 'SUBDECANO',
};

vi.mock('@/lib/contextos/contexto-autenticacion', () => ({
    useAutenticacion: () => ({
        usuario: usuarioActualMock,
        estaAutenticado: true,
        cargando: false,
    }),
}));

vi.mock('@/lib/acciones/vcs/reporte-proyecto.acciones', () => ({
    obtenerReportesPorProyectoAccion: vi.fn(),
    subirReporteProyectoAccion: vi.fn(),
    revisarReporteSubdecanatoAccion: vi.fn(),
}));

vi.mock('@/lib/servicios/documento.servicio', () => ({
    CARPETAS_ARCHIVOS: {
        VINCULACION: 'vinculacion',
    },
    subirArchivo: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ModalReportesProyecto', () => {
    const proyectoMock: ProyectoComunitarioDto = {
        id: 15,
        nombre: 'Alfabetización Digital para Adultos Mayores',
        descripcion: 'Proyecto comunitario',
        carreraId: 1,
        nombreCarrera: 'Ingenieria en Computacion',
        tutorAcademicoId: 20,
        nombreCompletoTutor: 'Ing. Tutor',
        correoTutor: 'tutor@uce.edu.ec',
        estado: 'ACTIVO',
        fechaInicio: '2026-01-01',
        fechaFin: '2027-01-01',
        fechaCreacion: '2026-01-01T10:00:00',
        iniciado: true,
    };

    const reporteTrimestralPendiente: ReporteProyecto = {
        id: 101,
        proyectoId: 15,
        nombreProyecto: 'Alfabetización Digital para Adultos Mayores',
        periodoId: 1,
        nombrePeriodo: '2027',
        coordinadorId: 5,
        nombreCoordinador: 'Milton Giovanny Moncayo Unda',
        tipo: 'TRIMESTRAL_AVANCES',
        nombreArchivo: 'Reporte Trimestral.pdf',
        urlArchivo: '/reportes-proyectos-vcs/101/preview',
        estadoSubdecanato: 'PENDIENTE',
        observaciones: null,
        fechaSubida: '2026-11-11T10:00:00',
        fechaRevision: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        usuarioActualMock = {
            id: 2,
            nombres: 'Subdecana',
            apellidos: 'FICA',
            correo: 'subdecana@uce.edu.ec',
            rol: 'SUBDECANO',
        };
    });

    it('debe renderizar el visor iframe usando /api/proxy/reportes-proyectos-vcs/{id}/preview y descargar usando /descargar', async () => {
        vi.mocked(accionesReportes.obtenerReportesPorProyectoAccion).mockResolvedValue({
            exito: true,
            mensaje: 'OK',
            data: [reporteTrimestralPendiente],
        });

        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            blob: async () => new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
        });
        vi.stubGlobal('fetch', fetchMock);
        const createObjectURLMock = vi.fn(() => 'blob:http://localhost/reporte');
        const revokeObjectURLMock = vi.fn();
        Object.defineProperty(window.URL, 'createObjectURL', { value: createObjectURLMock, configurable: true });
        Object.defineProperty(window.URL, 'revokeObjectURL', { value: revokeObjectURLMock, configurable: true });

        render(
            <ModalReportesProyecto
                abierto={true}
                abrirModal={vi.fn()}
                proyecto={proyectoMock}
                periodoId={1}
                nombrePeriodo="2027"
            />
        );

        const iframe = await screen.findByTitle('Visor Reporte Trimestral.pdf');
        expect(iframe).toHaveAttribute(
            'src',
            '/api/proxy/reportes-proyectos-vcs/101/preview?v=2026-11-11T10%3A00%3A00'
        );

        const botonDescargar = screen.getByRole('button', { name: /Descargar PDF/i });
        fireEvent.click(botonDescargar);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('/api/proxy/reportes-proyectos-vcs/101/descargar');
        });

        vi.unstubAllGlobals();
    });

    it('debe mostrar toast de reversion correcto cuando Subdecano revierte un informe a Pendiente', async () => {
        const reporteAprobado: ReporteProyecto = {
            ...reporteTrimestralPendiente,
            estadoSubdecanato: 'APROBADO',
        };

        vi.mocked(accionesReportes.obtenerReportesPorProyectoAccion)
            .mockResolvedValueOnce({ exito: true, mensaje: 'OK', data: [reporteAprobado] })
            .mockResolvedValueOnce({ exito: true, mensaje: 'OK', data: [reporteTrimestralPendiente] });

        vi.mocked(accionesReportes.revisarReporteSubdecanatoAccion).mockResolvedValue({
            exito: true,
            mensaje: 'OK',
            data: reporteTrimestralPendiente,
        });

        render(
            <ModalReportesProyecto
                abierto={true}
                abrirModal={vi.fn()}
                proyecto={proyectoMock}
                periodoId={1}
                nombrePeriodo="2027"
            />
        );

        const botonRevertir = await screen.findByRole('button', { name: /Revertir a Pendiente/i });
        fireEvent.click(botonRevertir);

        await waitFor(() => {
            expect(accionesReportes.revisarReporteSubdecanatoAccion).toHaveBeenCalledWith(101, {
                estadoSubdecanato: 'PENDIENTE',
                observaciones: '',
            });
            expect(toast.success).toHaveBeenCalledWith('Revisión revertida a Pendiente');
        });
    });

    it('para COORDINADOR_PRACTICAS, sugiere INFORME_DEFINITIVO cuando el trimestral ya esta aprobado y oculta Subir si ambos estan aprobados', async () => {
        usuarioActualMock = {
            id: 5,
            nombres: 'Coordinador',
            apellidos: 'VCS',
            correo: 'cpp@uce.edu.ec',
            rol: 'COORDINADOR_PRACTICAS',
        };

        const trimestralAprobado: ReporteProyecto = {
            ...reporteTrimestralPendiente,
            estadoSubdecanato: 'APROBADO',
        };
        const definitivoAprobado: ReporteProyecto = {
            ...reporteTrimestralPendiente,
            id: 102,
            tipo: 'INFORME_DEFINITIVO',
            nombreArchivo: 'Informe Definitivo.pdf',
            urlArchivo: '/reportes-proyectos-vcs/102/preview',
            estadoSubdecanato: 'APROBADO',
        };

        vi.mocked(accionesReportes.obtenerReportesPorProyectoAccion).mockResolvedValueOnce({
            exito: true,
            mensaje: 'OK',
            data: [trimestralAprobado],
        });

        const { rerender } = render(
            <ModalReportesProyecto
                abierto={true}
                abrirModal={vi.fn()}
                proyecto={proyectoMock}
                periodoId={1}
                nombrePeriodo="2027"
            />
        );

        const botonSubir = await screen.findByRole('button', { name: 'Subir' });
        fireEvent.click(botonSubir);

        // Al abrir el formulario cuando trimestral ya está aprobado, debe seleccionar Informe Final Definitivo automáticamente
        expect(await screen.findByText(/El informe final definitivo debe incluir las firmas/i)).toBeInTheDocument();

        // Ahora verificar que cuando ambos informes están aprobados en el periodo, no aparece el botón Subir
        vi.mocked(accionesReportes.obtenerReportesPorProyectoAccion).mockResolvedValueOnce({
            exito: true,
            mensaje: 'OK',
            data: [definitivoAprobado, trimestralAprobado],
        });

        rerender(
            <ModalReportesProyecto
                abierto={true}
                abrirModal={vi.fn()}
                proyecto={{ ...proyectoMock, id: 16 }}
                periodoId={1}
                nombrePeriodo="2027"
            />
        );

        await screen.findByTitle('Visor Informe Definitivo.pdf');
        expect(screen.queryByRole('button', { name: 'Subir' })).not.toBeInTheDocument();
    });

    it('permite a COORDINADOR_PRACTICAS subir un nuevo reporte trimestral y recarga la lista', async () => {
        usuarioActualMock = {
            id: 5,
            nombres: 'Coordinador',
            apellidos: 'VCS',
            correo: 'cpp@uce.edu.ec',
            rol: 'COORDINADOR_PRACTICAS',
        };

        vi.mocked(accionesReportes.obtenerReportesPorProyectoAccion)
            .mockResolvedValueOnce({ exito: true, mensaje: 'OK', data: [] })
            .mockResolvedValueOnce({ exito: true, mensaje: 'OK', data: [reporteTrimestralPendiente] });

        vi.mocked(servicioDocumento.subirArchivo).mockResolvedValue('/archivos_subidos/vinculacion/nuevo.pdf');
        vi.mocked(accionesReportes.subirReporteProyectoAccion).mockResolvedValue({
            exito: true,
            mensaje: 'OK',
            data: reporteTrimestralPendiente,
        });

        render(
            <ModalReportesProyecto
                abierto={true}
                abrirModal={vi.fn()}
                proyecto={proyectoMock}
                periodoId={1}
                nombrePeriodo="2027"
            />
        );

        const botonPrimerInforme = await screen.findByRole('button', { name: /Subir Primer Informe/i });
        fireEvent.click(botonPrimerInforme);

        const archivo = new File(['%PDF-1.4'], 'Reporte Trimestral.pdf', { type: 'application/pdf' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [archivo] } });

        const botonEnviar = screen.getByRole('button', { name: /Enviar a Revisión/i });
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(servicioDocumento.subirArchivo).toHaveBeenCalledWith(archivo, 'vinculacion');
            expect(accionesReportes.subirReporteProyectoAccion).toHaveBeenCalledWith({
                proyectoId: 15,
                periodoId: 1,
                tipo: 'TRIMESTRAL_AVANCES',
                nombreArchivo: 'Reporte Trimestral.pdf',
                urlArchivo: '/archivos_subidos/vinculacion/nuevo.pdf',
            });
        });

        const iframe = await screen.findByTitle('Visor Reporte Trimestral.pdf');
        expect(iframe).toHaveAttribute(
            'src',
            '/api/proxy/reportes-proyectos-vcs/101/preview?v=2026-11-11T10%3A00%3A00'
        );
    });
});

