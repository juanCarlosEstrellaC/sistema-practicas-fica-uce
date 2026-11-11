package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteRevisionSubdecanatoDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ReporteProyectoVcs;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.ReporteProyectoVcsMapeador;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ReporteProyectoVcsRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.vcs.impl.ReporteProyectoVcsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
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
    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

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
        periodo.setEstado(EstadoPeriodo.ACTIVO);

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
    @DisplayName("Revisión de Informe Definitivo aprobado mantiene el proyecto en estado ACTIVO para futuros periodos")
    void revisionInformeDefinitivoAprobado_MantieneProyectoActivo() {
        reporte.setTipo(TipoReporteProyectoVcs.INFORME_DEFINITIVO);
        ReporteRevisionSubdecanatoDto revisionDto = new ReporteRevisionSubdecanatoDto(
                EstadoRevisionVcs.APROBADO, "Informe final del periodo satisfactorio."
        );

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));
        when(reporteProyectoVcsRepository.save(any(ReporteProyectoVcs.class))).thenReturn(reporte);
        when(reporteProyectoVcsMapeador.aDto(reporte)).thenReturn(new ReporteProyectoDto(
                10L, 1L, "Alfabetización Digital", 2L, "2026-2026",
                5L, "Coordinador VCS", TipoReporteProyectoVcs.INFORME_DEFINITIVO,
                "informe_final.pdf", "/archivos/vcs/reportes/inf_fin.pdf",
                EstadoRevisionVcs.APROBADO, "Informe final del periodo satisfactorio.", LocalDateTime.now(), LocalDateTime.now()
        ));

        ReporteProyectoDto resultado = reporteService.revisarReporteSubdecanato(10L, revisionDto);

        assertNotNull(resultado);
        assertEquals(EstadoRevisionVcs.APROBADO, resultado.estadoSubdecanato());
        assertEquals(EstadoProyecto.ACTIVO, proyecto.getEstado());
        verify(proyectoComunitarioRepository, never()).save(any());
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
    @DisplayName("Lanzar NegocioException al intentar subir reporte en un periodo académico INACTIVO")
    void subirReporte_PeriodoInactivo_LanzaExcepcion() {
        periodo.setEstado(EstadoPeriodo.INACTIVO);
        ReporteProyectoNuevoDto dto = new ReporteProyectoNuevoDto(
                1L, 2L, TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "informe_trimestral.pdf", "/archivos/vcs/reportes/inf1.pdf"
        );

        when(proyectoComunitarioRepository.findById(1L)).thenReturn(Optional.of(proyecto));
        when(periodoAcademicoRepository.findById(2L)).thenReturn(Optional.of(periodo));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                reporteService.subirReporte(dto, coordinador));

        assertTrue(ex.getMessage().contains("periodo académico inactivo"));
        verify(reporteProyectoVcsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Lanzar NegocioException al intentar revisar reporte en un periodo académico INACTIVO")
    void revisarReporteSubdecanato_PeriodoInactivo_LanzaExcepcion() {
        periodo.setEstado(EstadoPeriodo.INACTIVO);
        ReporteRevisionSubdecanatoDto revisionDto = new ReporteRevisionSubdecanatoDto(
                EstadoRevisionVcs.APROBADO, "Informe final."
        );

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                reporteService.revisarReporteSubdecanato(10L, revisionDto));

        assertTrue(ex.getMessage().contains("periodo académico inactivo"));
        verify(reporteProyectoVcsRepository, never()).save(any());
    }

    @Test
    @DisplayName("Listar reportes por proyecto expone URL protegida de preview")
    void listarPorProyecto_ExponeUrlPreviewProtegida() {
        when(reporteProyectoVcsRepository.findByProyectoIdAndPeriodoAcademicoIdOrderByFechaSubidaDesc(1L, 2L))
                .thenReturn(List.of(reporte));
        when(reporteProyectoVcsMapeador.aDto(reporte)).thenReturn(new ReporteProyectoDto(
                10L, 1L, "Alfabetización Digital", 2L, "2026-2026",
                5L, "Coordinador VCS", TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "informe_trimestral.pdf", "/archivos_subidos/vinculacion/inf1.pdf",
                EstadoRevisionVcs.PENDIENTE, null, LocalDateTime.now(), null
        ));

        List<ReporteProyectoDto> resultado = reporteService.listarPorProyecto(1L, 2L);

        assertEquals(1, resultado.size());
        assertEquals("/reportes-proyectos-vcs/10/preview", resultado.get(0).urlArchivo());
    }

    @Test
    @DisplayName("Revertir revision a PENDIENTE limpia observaciones y fechaRevision")
    void revisarReporteSubdecanato_RevertirAPendiente_LimpiaObservaciones() {
        reporte.setEstadoSubdecanato(EstadoRevisionVcs.OBSERVADO);
        reporte.setObservaciones("Corregir portada");
        reporte.setFechaRevision(LocalDateTime.now());

        ReporteRevisionSubdecanatoDto revisionDto = new ReporteRevisionSubdecanatoDto(EstadoRevisionVcs.PENDIENTE, "");

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));
        when(reporteProyectoVcsRepository.save(any(ReporteProyectoVcs.class))).thenReturn(reporte);
        when(reporteProyectoVcsMapeador.aDto(reporte)).thenReturn(new ReporteProyectoDto(
                10L, 1L, "Alfabetización Digital", 2L, "2026-2026",
                5L, "Coordinador VCS", TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "informe_trimestral.pdf", "/archivos_subidos/vinculacion/inf1.pdf",
                EstadoRevisionVcs.PENDIENTE, null, LocalDateTime.now(), null
        ));

        ReporteProyectoDto resultado = reporteService.revisarReporteSubdecanato(10L, revisionDto);

        assertEquals(EstadoRevisionVcs.PENDIENTE, resultado.estadoSubdecanato());
        assertNull(reporte.getObservaciones());
        assertNull(reporte.getFechaRevision());
        verify(notificacionService).enviar(eq(5L), eq("Revisión de Informe VCS"),
                argThat(msg -> msg.contains("pendiente")), any(), contains("abrirReportes=true"));
    }

    @Test
    @DisplayName("Observar reporte sin texto de observaciones lanza NegocioException")
    void revisarReporteSubdecanato_ObservadoSinTexto_LanzaExcepcion() {
        ReporteRevisionSubdecanatoDto revisionDto = new ReporteRevisionSubdecanatoDto(EstadoRevisionVcs.OBSERVADO, "   ");

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));

        assertThrows(NegocioException.class, () -> reporteService.revisarReporteSubdecanato(10L, revisionDto));
        verify(reporteProyectoVcsRepository, never()).save(any());
    }

    @Test
    @DisplayName("obtenerReporteDescarga lee el PDF fisico desde archivos_subidos/vinculacion")
    void obtenerReporteDescarga_ArchivoExistente_RetornaBytes(@TempDir Path tempDir) throws Exception {
        Path carpetaVinculacion = tempDir.resolve("vinculacion");
        Files.createDirectories(carpetaVinculacion);
        byte[] pdfBytes = "%PDF-1.4 contenido".getBytes();
        Files.write(carpetaVinculacion.resolve("reporte_123.pdf"), pdfBytes);

        ReflectionTestUtils.setField(reporteService, "rutaBaseAlmacenamiento", tempDir.toString());
        reporte.setUrlArchivo("/archivos_subidos/vinculacion/reporte_123.pdf");
        reporte.setNombreArchivo("Reporte Trimestral 2027.pdf");

        Usuario subdecano = new Usuario();
        subdecano.setId(99L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));

        ArchivoDescargaDto descarga = reporteService.obtenerReporteDescarga(10L, subdecano);

        assertNotNull(descarga);
        assertArrayEquals(pdfBytes, descarga.contenido());
        assertEquals("Reporte Trimestral 2027.pdf", descarga.nombreArchivo());
        assertEquals("application/pdf", descarga.contentType());
    }

    @Test
    @DisplayName("obtenerReporteDescarga deniega acceso a coordinador de otra carrera (BOLA)")
    void obtenerReporteDescarga_CoordinadorOtraCarrera_DeniegaAcceso() {
        Carrera carreraProyecto = new Carrera();
        carreraProyecto.setId(1);
        proyecto.setCarrera(carreraProyecto);

        Carrera otraCarrera = new Carrera();
        otraCarrera.setId(2);
        Usuario otroCoordinador = new Usuario();
        otroCoordinador.setId(77L);
        otroCoordinador.setRol(RolUsuario.COORDINADOR_PRACTICAS);
        otroCoordinador.setCarrera(otraCarrera);

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));

        assertThrows(AccessDeniedException.class, () -> reporteService.obtenerReporteDescarga(10L, otroCoordinador));
    }

    @Test
    @DisplayName("obtenerReporteDescarga lanza RecursoNoEncontradoException si el PDF fisico no existe")
    void obtenerReporteDescarga_ArchivoNoExiste_LanzaNotFound(@TempDir Path tempDir) {
        ReflectionTestUtils.setField(reporteService, "rutaBaseAlmacenamiento", tempDir.toString());
        reporte.setUrlArchivo("/archivos_subidos/vinculacion/inexistente.pdf");

        Usuario subdecano = new Usuario();
        subdecano.setId(99L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        when(reporteProyectoVcsRepository.findById(10L)).thenReturn(Optional.of(reporte));

        assertThrows(RecursoNoEncontradoException.class, () -> reporteService.obtenerReporteDescarga(10L, subdecano));
    }
}
