package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteRevisionSubdecanatoDto;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ReporteProyectoVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.mapeadores.vcs.ReporteProyectoVcsMapeador;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ReporteProyectoVcsRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.vcs.impl.ReporteProyectoVcsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReporteProyectoVcsServiceTest {

    @Mock
    private ReporteProyectoVcsRepository reporteProyectoVcsRepository;
    @Mock
    private ProyectoComunitarioRepository proyectoComunitarioRepository;
    @Mock
    private PeriodoAcademicoRepository periodoAcademicoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;
    @Mock
    private NotificacionService notificacionService;
    @Mock
    private ReporteProyectoVcsMapeador reporteProyectoVcsMapeador;

    @InjectMocks
    private ReporteProyectoVcsServiceImpl reporteService;

    private ProyectoComunitario proyecto;
    private PeriodoAcademico periodo;
    private Usuario coordinador;
    private ReporteProyectoVcs reporte;

    @BeforeEach
    void setUp() {
        proyecto = new ProyectoComunitario();
        proyecto.setId(1L);
        proyecto.setNombre("Alfabetización Digital");
        proyecto.setEstado(EstadoProyecto.ACTIVO);

        periodo = new PeriodoAcademico();
        periodo.setId(2L);
        periodo.setNombre("2026-2026");

        coordinador = new Usuario();
        coordinador.setId(5L);
        coordinador.setNombres("Coordinador");
        coordinador.setApellidos("VCS");

        reporte = new ReporteProyectoVcs();
        reporte.setId(10L);
        reporte.setProyecto(proyecto);
        reporte.setPeriodoAcademico(periodo);
        reporte.setCoordinador(coordinador);
        reporte.setTipo(TipoReporteProyectoVcs.TRIMESTRAL_AVANCES);
        reporte.setNombreArchivo("informe_trimestral.pdf");
        reporte.setUrlArchivo("/archivos/vcs/reportes/inf1.pdf");
        reporte.setEstadoSubdecanato(EstadoRevisionVcs.PENDIENTE);
        reporte.setFechaSubida(LocalDateTime.now());
    }

    @Test
    @DisplayName("Subir reporte trimestral exitosamente con estado PENDIENTE")
    void subirReporteExitoso() {
        ReporteProyectoNuevoDto dto = new ReporteProyectoNuevoDto(
                1L, 2L, TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "informe_trimestral.pdf", "/archivos/vcs/reportes/inf1.pdf"
        );

        when(proyectoComunitarioRepository.findById(1L)).thenReturn(Optional.of(proyecto));
        when(periodoAcademicoRepository.findById(2L)).thenReturn(Optional.of(periodo));
        when(reporteProyectoVcsMapeador.aEntidad(dto)).thenReturn(new ReporteProyectoVcs());
        when(reporteProyectoVcsRepository.save(any(ReporteProyectoVcs.class))).thenReturn(reporte);
        when(reporteProyectoVcsMapeador.aDto(reporte)).thenReturn(new ReporteProyectoDto(
                10L, 1L, "Alfabetización Digital", 2L, "2026-2026",
                5L, "Coordinador VCS", TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "informe_trimestral.pdf", "/archivos/vcs/reportes/inf1.pdf",
                EstadoRevisionVcs.PENDIENTE, null, LocalDateTime.now(), null
        ));

        ReporteProyectoDto resultado = reporteService.subirReporte(dto, coordinador);

        assertNotNull(resultado);
        assertEquals(EstadoRevisionVcs.PENDIENTE, resultado.estadoSubdecanato());
        assertEquals("informe_trimestral.pdf", resultado.nombreArchivo());
        verify(reporteProyectoVcsRepository).save(any(ReporteProyectoVcs.class));
    }

    @Test
    @DisplayName("Lanzar excepción al intentar subir reporte para un proyecto FINALIZADO")
    void subirReporteProyectoFinalizado() {
        proyecto.setEstado(EstadoProyecto.FINALIZADO);
        ReporteProyectoNuevoDto dto = new ReporteProyectoNuevoDto(
                1L, 2L, TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "informe.pdf", "/archivos/inf.pdf"
        );

        when(proyectoComunitarioRepository.findById(1L)).thenReturn(Optional.of(proyecto));

        assertThrows(NegocioException.class, () -> reporteService.subirReporte(dto, coordinador));
        verify(reporteProyectoVcsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Revisión de Informe Definitivo aprobado cambia el proyecto a FINALIZADO")
    void revisionInformeDefinitivoAprobado() {
        reporte.setTipo(TipoReporteProyectoVcs.INFORME_DEFINITIVO);
        ReporteRevisionSubdecanatoDto revisionDto = new ReporteRevisionSubdecanatoDto(
                EstadoRevisionVcs.APROBADO, "Informe final satisfactorio."
        );

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));
        when(reporteProyectoVcsRepository.save(any(ReporteProyectoVcs.class))).thenReturn(reporte);
        when(reporteProyectoVcsMapeador.aDto(reporte)).thenReturn(new ReporteProyectoDto(
                10L, 1L, "Alfabetización Digital", 2L, "2026-2026",
                5L, "Coordinador VCS", TipoReporteProyectoVcs.INFORME_DEFINITIVO,
                "informe_final.pdf", "/archivos/vcs/reportes/inf_fin.pdf",
                EstadoRevisionVcs.APROBADO, "Informe final satisfactorio.", LocalDateTime.now(), LocalDateTime.now()
        ));

        ReporteProyectoDto resultado = reporteService.revisarReporteSubdecanato(10L, revisionDto);

        assertNotNull(resultado);
        assertEquals(EstadoRevisionVcs.APROBADO, resultado.estadoSubdecanato());
        assertEquals(EstadoProyecto.FINALIZADO, proyecto.getEstado());
        verify(proyectoComunitarioRepository).save(proyecto);
    }

    @Test
    @DisplayName("Revisión de reporte con OBSERVADO actualiza observaciones y notifica")
    void revisionReporteObservado() {
        ReporteRevisionSubdecanatoDto revisionDto = new ReporteRevisionSubdecanatoDto(
                EstadoRevisionVcs.OBSERVADO, "Falta firma del tutor."
        );

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));
        when(reporteProyectoVcsRepository.save(any(ReporteProyectoVcs.class))).thenReturn(reporte);
        when(reporteProyectoVcsMapeador.aDto(reporte)).thenReturn(new ReporteProyectoDto(
                10L, 1L, "Alfabetización Digital", 2L, "2026-2026",
                5L, "Coordinador VCS", TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "informe_trimestral.pdf", "/archivos/vcs/reportes/inf1.pdf",
                EstadoRevisionVcs.OBSERVADO, "Falta firma del tutor.", LocalDateTime.now(), LocalDateTime.now()
        ));

        ReporteProyectoDto resultado = reporteService.revisarReporteSubdecanato(10L, revisionDto);

        assertNotNull(resultado);
        assertEquals(EstadoRevisionVcs.OBSERVADO, resultado.estadoSubdecanato());
        assertEquals(EstadoProyecto.ACTIVO, proyecto.getEstado());
        verify(notificacionService).enviar(eq(5L), anyString(), anyString(), any(), anyString());
    }

    @Test
    @DisplayName("Revisión de Informe Definitivo con estudiantes en curso lanza NegocioException")
    void revisionInformeDefinitivo_ConEstudiantesEnCurso_LanzaExcepcion() {
        reporte.setTipo(TipoReporteProyectoVcs.INFORME_DEFINITIVO);
        ReporteRevisionSubdecanatoDto revisionDto = new ReporteRevisionSubdecanatoDto(
                EstadoRevisionVcs.APROBADO, "Informe final."
        );

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));
        when(asignacionProyectoComunitarioRepository.existsByProyectoComunitarioIdAndEstado(proyecto.getId(), com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs.EN_CURSO))
                .thenReturn(true);

        NegocioException ex = assertThrows(NegocioException.class, () ->
                reporteService.revisarReporteSubdecanato(10L, revisionDto));

        assertTrue(ex.getMessage().contains("asignaciones de estudiantes en curso"));
        verify(proyectoComunitarioRepository, never()).save(any());
    }
}
