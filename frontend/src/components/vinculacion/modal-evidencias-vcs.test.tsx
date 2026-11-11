import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalEvidenciasVcs } from './modal-evidencias-vcs';
import { AsignacionProyectoDto } from '@/lib/tipos/vcs/asignacion-proyecto';
import * as accionesEvidencia from '@/lib/acciones/vcs/evidencia-vcs.acciones';
import * as accionesAsignacion from '@/lib/acciones/vcs/asignacion-proyecto.acciones';

vi.mock('@/lib/acciones/vcs/evidencia-vcs.acciones', () => ({
    obtenerEvidenciasPorAsignacionAccion: vi.fn(),
    revisarEvidenciaTutorAccion: vi.fn(),
}));

vi.mock('@/lib/acciones/vcs/asignacion-proyecto.acciones', () => ({
    enviarASubdecanatoAccion: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ModalEvidenciasVcs', () => {
    const asignacionMock: AsignacionProyectoDto = {
        id: 100,
        estudianteId: 10,
        nombreCompletoEstudiante: 'Juan Carlos Estrella Caicedo',
        identificacionEstudiante: '1723522403',
        correoEstudiante: 'juan@uce.edu.ec',
        proyectoId: 1,
        carreraId: 1,
        nombreCarrera: 'Computación',
        periodoAcademicoId: 1,
        nombrePeriodoAcademico: '2026-2026',
        nombreProyecto: 'Alfabetización Digital',
        tutorId: 20,
        nombreCompletoTutor: 'Ing. Jaime Salvador',
        horasAsignadas: 80,
        horasCompletadas: 0,
        faseActual: 'FINALIZACION',
        estado: 'EN_CURSO',
        fechaInicio: '2026-03-01',
        documentosValidados: false,
    };

    const evidenciasAprobadasMock = [
        {
            id: 1,
            asignacionId: 100,
            tipoDocumento: 'BITACORA',
            nombreArchivo: 'Bitacora.pdf',
            urlArchivo: '/archivos/bitacora.pdf',
            horasReportadas: 40,
            estadoTutor: 'APROBADO',
            fechaSubida: '2026-11-02T10:00:00',
        },
        {
            id: 2,
            asignacionId: 100,
            tipoDocumento: 'INFORME_FINAL',
            nombreArchivo: 'Informe.pdf',
            urlArchivo: '/archivos/informe.pdf',
            horasReportadas: 40,
            estadoTutor: 'APROBADO',
            fechaSubida: '2026-11-02T10:00:00',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe permitir al Tutor presionar el botón "Terminar validación y enviar a Subdecanato" cuando ambos documentos están aprobados', async () => {
        vi.mocked(accionesEvidencia.obtenerEvidenciasPorAsignacionAccion).mockResolvedValue({
            exito: true,
            mensaje: 'OK',
            data: evidenciasAprobadasMock as any,
        });

        vi.mocked(accionesAsignacion.enviarASubdecanatoAccion).mockResolvedValue({
            exito: true,
            mensaje: 'Documentos validados y enviados a Subdecanato con éxito',
            data: { ...asignacionMock, documentosValidados: true },
        });

        const alActualizarMock = vi.fn();
        const abrirModalMock = vi.fn();

        render(
            <ModalEvidenciasVcs
                abierto={true}
                abrirModal={abrirModalMock}
                asignacion={asignacionMock}
                alActualizar={alActualizarMock}
            />
        );

        // Esperar a que cargue y aparezca el botón habilitado
        const botonEnviar = await screen.findByRole('button', {
            name: /Terminar validación y enviar a Subdecanato/i,
        });

        expect(botonEnviar).toBeInTheDocument();
        expect(botonEnviar).not.toBeDisabled();

        // Al hacer clic, debe llamar a la acción de enviar a Subdecanato y no hacerlo automáticamente
        fireEvent.click(botonEnviar);

        await waitFor(() => {
            expect(accionesAsignacion.enviarASubdecanatoAccion).toHaveBeenCalledWith(100);
            expect(alActualizarMock).toHaveBeenCalled();
            expect(abrirModalMock).toHaveBeenCalledWith(false);
        });
    });

    it('debe mostrar el botón deshabilitado indicando "Información ya enviada a Subdecanato" si documentosValidados es true', async () => {
        vi.mocked(accionesEvidencia.obtenerEvidenciasPorAsignacionAccion).mockResolvedValue({
            exito: true,
            mensaje: 'OK',
            data: evidenciasAprobadasMock as any,
        });

        render(
            <ModalEvidenciasVcs
                abierto={true}
                abrirModal={vi.fn()}
                asignacion={{ ...asignacionMock, documentosValidados: true }}
            />
        );

        const botonEnviado = await screen.findByRole('button', {
            name: /Información ya enviada a Subdecanato/i,
        });

        expect(botonEnviado).toBeInTheDocument();
        expect(botonEnviado).toBeDisabled();
    });

    it('debe mantener deshabilitado el botón si falta aprobar algún documento', async () => {
        vi.mocked(accionesEvidencia.obtenerEvidenciasPorAsignacionAccion).mockResolvedValue({
            exito: true,
            mensaje: 'OK',
            data: [
                evidenciasAprobadasMock[0],
                { ...evidenciasAprobadasMock[1], estadoTutor: 'PENDIENTE' },
            ] as any,
        });

        render(
            <ModalEvidenciasVcs
                abierto={true}
                abrirModal={vi.fn()}
                asignacion={asignacionMock}
            />
        );

        const botonPendiente = await screen.findByRole('button', {
            name: /Pendiente de aprobar todos los documentos/i,
        });

        expect(botonPendiente).toBeInTheDocument();
        expect(botonPendiente).toBeDisabled();
    });

    it('no debe emparejar ni aprobar ambos documentos cuando el nombre del archivo contiene el tipo del otro documento', async () => {
        const evidenciaInforme = {
            id: 2,
            asignacionId: 100,
            tipoDocumento: 'INFORME_FINAL',
            nombreArchivo: 'Informe Final - bitacora.pdf',
            urlArchivo: '/evidencias-vcs/2/preview',
            horasReportadas: 40,
            estadoTutor: 'PENDIENTE',
            fechaSubida: '2026-11-02T12:00:00',
        };
        const evidenciaBitacora = {
            id: 1,
            asignacionId: 100,
            tipoDocumento: 'BITACORA',
            nombreArchivo: 'Bitácora de Actividades - informe_final.pdf',
            urlArchivo: '/evidencias-vcs/1/preview',
            horasReportadas: 40,
            estadoTutor: 'PENDIENTE',
            fechaSubida: '2026-11-02T10:00:00',
        };

        vi.mocked(accionesEvidencia.obtenerEvidenciasPorAsignacionAccion)
            .mockResolvedValueOnce({
                exito: true,
                mensaje: 'OK',
                data: [evidenciaInforme, evidenciaBitacora] as any,
            })
            .mockResolvedValueOnce({
                exito: true,
                mensaje: 'OK',
                data: [
                    evidenciaInforme,
                    { ...evidenciaBitacora, estadoTutor: 'APROBADO' },
                ] as any,
            });

        vi.mocked(accionesEvidencia.revisarEvidenciaTutorAccion).mockResolvedValue({
            exito: true,
            mensaje: 'OK',
            data: { ...evidenciaBitacora, estadoTutor: 'APROBADO' } as any,
        });

        render(
            <ModalEvidenciasVcs
                abierto={true}
                abrirModal={vi.fn()}
                asignacion={asignacionMock}
            />
        );

        const botonAprobar = await screen.findByRole('button', {
            name: /Validar y Aprobar/i,
        });
        fireEvent.click(botonAprobar);

        await waitFor(() => {
            expect(accionesEvidencia.revisarEvidenciaTutorAccion).toHaveBeenCalledTimes(1);
            expect(accionesEvidencia.revisarEvidenciaTutorAccion).toHaveBeenCalledWith(1, {
                estadoTutor: 'APROBADO',
                observaciones: '',
            });
        });

        await waitFor(() => {
            expect(screen.getAllByText('Aprobado')).toHaveLength(1);
            expect(screen.getAllByText('Pendiente').length).toBeGreaterThanOrEqual(1);
            expect(
                screen.getByRole('button', { name: /Pendiente de aprobar todos los documentos/i })
            ).toBeDisabled();
        });
    });
});
