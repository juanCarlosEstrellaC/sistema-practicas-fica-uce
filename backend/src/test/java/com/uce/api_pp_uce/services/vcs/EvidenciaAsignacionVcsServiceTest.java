package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.vcs.AprobarHorasSubdecanatoDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaRevisionTutorDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ResultadoAprobacionHorasDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.EvidenciaAsignacionVcs;
import com.uce.api_pp_uce.entities.vcs.ProcesoVinculacion;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProcesoVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.mapeadores.vcs.AsignacionProyectoComunitarioMapeador;
import com.uce.api_pp_uce.mapeadores.vcs.EvidenciaAsignacionVcsMapeador;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.EvidenciaAsignacionVcsRepository;
import com.uce.api_pp_uce.repositories.vcs.ProcesoVinculacionRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.vcs.impl.AsignacionProyectoComunitarioServiceImpl;
import com.uce.api_pp_uce.services.vcs.impl.EvidenciaAsignacionVcsServiceImpl;
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
class EvidenciaAsignacionVcsServiceTest {

    @Mock
    private EvidenciaAsignacionVcsRepository evidenciaRepository;
    @Mock
    private AsignacionProyectoComunitarioRepository asignacionRepository;
    @Mock
    private ProyectoComunitarioRepository proyectoRepository;
    @Mock
    private ProcesoVinculacionRepository procesoRepository;
    @Mock
    private NotificacionService notificacionService;
    @Mock
    private EvidenciaAsignacionVcsMapeador evidenciaMapeador;
    @Mock
    private AsignacionProyectoComunitarioMapeador asignacionMapeador;
    @Mock
    private com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository procesoPracticaRepository;
    @Mock
    private com.uce.api_pp_uce.repositories.UsuarioRepository usuarioRepository;

    @InjectMocks
    private EvidenciaAsignacionVcsServiceImpl evidenciaService;

    @InjectMocks
    private AsignacionProyectoComunitarioServiceImpl asignacionService;

    private Usuario estudiante;
    private Usuario tutor;
    private ProyectoComunitario proyecto;
    private ProcesoVinculacion proceso;
    private AsignacionProyectoComunitario asignacion;
    private EvidenciaAsignacionVcs evidencia;

    @BeforeEach
    void setUp() {
        estudiante = new Usuario();
        estudiante.setId(10L);
        estudiante.setNombres("Carlos");
        estudiante.setApellidos("Estrella");
        estudiante.setRol(RolUsuario.ESTUDIANTE);

        tutor = new Usuario();
        tutor.setId(20L);
        tutor.setNombres("Docente");
        tutor.setApellidos("Tutor");
        tutor.setRol(RolUsuario.TUTOR_ACADEMICO);

        proyecto = new ProyectoComunitario();
        proyecto.setId(1L);
        proyecto.setNombre("Alfabetización Digital");
        proyecto.setEstado(EstadoProyecto.ACTIVO);
        proyecto.setTutorAcademico(tutor);

        proceso = new ProcesoVinculacion();
        proceso.setId(100L);
        proceso.setEstudiante(estudiante);
        proceso.setHorasRequeridas(160);
        proceso.setHorasAcumuladas(80);
        proceso.setEstado(EstadoProcesoVcs.EN_CURSO);

        asignacion = new AsignacionProyectoComunitario();
        asignacion.setId(50L);
        asignacion.setProyectoComunitario(proyecto);
        asignacion.setProcesoVinculacion(proceso);
        asignacion.setHorasAsignadas(80);
        asignacion.setHorasCompletadas(0);
        asignacion.setEstado(EstadoAsignacionVcs.EN_CURSO);
        asignacion.setFaseActual(FaseActualAsignacion.ASIGNACION);

        evidencia = new EvidenciaAsignacionVcs();
        evidencia.setId(200L);
        evidencia.setAsignacion(asignacion);
        evidencia.setEstudiante(estudiante);
        evidencia.setNombreArchivo("bitacora_firmada.pdf");
        evidencia.setUrlArchivo("/archivos/vcs/evidencias/evi1.pdf");
        evidencia.setHorasReportadas(80);
        evidencia.setEstadoTutor(EstadoRevisionVcs.PENDIENTE);
        evidencia.setFechaSubida(LocalDateTime.now());
    }

    @Test
    @DisplayName("Iniciar desarrollo pasa fase a DESARROLLO y proyecto a ACTIVO")
    void iniciarDesarrolloExitoso() {
        when(asignacionRepository.findById(50L)).thenReturn(Optional.of(asignacion));
        when(asignacionRepository.save(any(AsignacionProyectoComunitario.class))).thenReturn(asignacion);
        when(asignacionMapeador.aDto(asignacion)).thenReturn(new AsignacionProyectoComunitarioDto(
                50L, 100L, 10L, "Carlos Estrella", "1720000000", "estudiante@uce.edu.ec",
                1L, "Alfabetización Digital", 20L, "Docente Tutor", "tutor@uce.edu.ec",
                1L, "Sistemas", 2L, "2026-2026", 80, 0, 80, 160,
                null, null, EstadoAsignacionVcs.EN_CURSO, FaseActualAsignacion.DESARROLLO, false, null, LocalDateTime.now()
        ));

        AsignacionProyectoComunitarioDto resultado = asignacionService.iniciarDesarrollo(50L);

        assertNotNull(resultado);
        assertEquals(FaseActualAsignacion.DESARROLLO, asignacion.getFaseActual());
        verify(asignacionRepository).save(asignacion);
    }

    @Test
    @DisplayName("Subir una sola evidencia cuando asignación está en DESARROLLO mantiene la fase en DESARROLLO")
    void subirUnaEvidencia_PermaneceEnDesarrollo() {
        asignacion.setFaseActual(FaseActualAsignacion.DESARROLLO);
        EvidenciaVcsNuevoDto dto = new EvidenciaVcsNuevoDto(50L, TipoDocumentoVcs.BITACORA, "bitacora_firmada.pdf", "/archivos/vcs/evidencias/evi1.pdf", 80);

        when(asignacionRepository.findById(50L)).thenReturn(Optional.of(asignacion));
        when(evidenciaRepository.findByAsignacionIdAndTipoDocumento(50L, TipoDocumentoVcs.BITACORA)).thenReturn(Optional.empty());
        when(evidenciaRepository.findByAsignacionIdAndTipoDocumento(50L, TipoDocumentoVcs.INFORME_FINAL)).thenReturn(Optional.empty());
        when(evidenciaMapeador.aEntidad(dto)).thenReturn(new EvidenciaAsignacionVcs());
        when(evidenciaRepository.save(any(EvidenciaAsignacionVcs.class))).thenReturn(evidencia);
        when(evidenciaMapeador.aDto(evidencia)).thenReturn(new EvidenciaVcsDto(
                200L, 50L, 10L, "Carlos Estrella", "1720000000",
                1L, "Alfabetización Digital", TipoDocumentoVcs.BITACORA, "bitacora_firmada.pdf", "/archivos/vcs/evidencias/evi1.pdf",
                80, EstadoRevisionVcs.PENDIENTE, null, LocalDateTime.now(), null
        ));

        EvidenciaVcsDto resultado = evidenciaService.subirEvidencia(dto, estudiante);

        assertNotNull(resultado);
        assertEquals(FaseActualAsignacion.DESARROLLO, asignacion.getFaseActual());
        assertEquals(EstadoRevisionVcs.PENDIENTE, resultado.estadoTutor());
        verify(evidenciaRepository).save(any(EvidenciaAsignacionVcs.class));
    }

    @Test
    @DisplayName("Subir segunda evidencia requerida transiciona asignación a FINALIZACION")
    void subirAmbasEvidencias_TransicionaAFinalizacion() {
        asignacion.setFaseActual(FaseActualAsignacion.DESARROLLO);
        EvidenciaVcsNuevoDto dto = new EvidenciaVcsNuevoDto(50L, TipoDocumentoVcs.INFORME_FINAL, "informe_final.pdf", "/archivos/vcs/evidencias/inf.pdf", 80);

        EvidenciaAsignacionVcs bitacoraPrevia = new EvidenciaAsignacionVcs();
        bitacoraPrevia.setTipoDocumento(TipoDocumentoVcs.BITACORA);

        when(asignacionRepository.findById(50L)).thenReturn(Optional.of(asignacion));
        when(evidenciaRepository.findByAsignacionIdAndTipoDocumento(50L, TipoDocumentoVcs.BITACORA)).thenReturn(Optional.of(bitacoraPrevia));
        when(evidenciaRepository.findByAsignacionIdAndTipoDocumento(50L, TipoDocumentoVcs.INFORME_FINAL)).thenReturn(Optional.empty());
        when(evidenciaMapeador.aEntidad(dto)).thenReturn(new EvidenciaAsignacionVcs());
        when(evidenciaRepository.save(any(EvidenciaAsignacionVcs.class))).thenReturn(evidencia);
        when(evidenciaMapeador.aDto(evidencia)).thenReturn(new EvidenciaVcsDto(
                201L, 50L, 10L, "Carlos Estrella", "1720000000",
                1L, "Alfabetización Digital", TipoDocumentoVcs.INFORME_FINAL, "informe_final.pdf", "/archivos/vcs/evidencias/inf.pdf",
                80, EstadoRevisionVcs.PENDIENTE, null, LocalDateTime.now(), null
        ));

        EvidenciaVcsDto resultado = evidenciaService.subirEvidencia(dto, estudiante);

        assertNotNull(resultado);
        assertEquals(FaseActualAsignacion.FINALIZACION, asignacion.getFaseActual());
        verify(asignacionRepository).save(asignacion);
    }

    @Test
    @DisplayName("Lanzar excepción al intentar subir evidencias en fase ASIGNACION")
    void subirEvidenciaEnFaseAsignacionFalla() {
        asignacion.setFaseActual(FaseActualAsignacion.ASIGNACION);
        EvidenciaVcsNuevoDto dto = new EvidenciaVcsNuevoDto(50L, TipoDocumentoVcs.BITACORA, "bitacora.pdf", "/archivos/evi.pdf", 80);

        when(asignacionRepository.findById(50L)).thenReturn(Optional.of(asignacion));

        assertThrows(NegocioException.class, () -> evidenciaService.subirEvidencia(dto, estudiante));
        verify(evidenciaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Revisión de evidencia por el Tutor Académico")
    void revisionEvidenciaTutorExitoso() {
        EvidenciaRevisionTutorDto revisionDto = new EvidenciaRevisionTutorDto(EstadoRevisionVcs.APROBADO, "Actividades conformes.");

        when(evidenciaRepository.findById(200L)).thenReturn(Optional.of(evidencia));
        when(evidenciaRepository.save(any(EvidenciaAsignacionVcs.class))).thenReturn(evidencia);
        when(evidenciaMapeador.aDto(evidencia)).thenReturn(new EvidenciaVcsDto(
                200L, 50L, 10L, "Carlos Estrella", "1720000000",
                1L, "Alfabetización Digital", TipoDocumentoVcs.BITACORA, "bitacora_firmada.pdf", "/archivos/vcs/evidencias/evi1.pdf",
                80, EstadoRevisionVcs.APROBADO, "Actividades conformes.", LocalDateTime.now(), LocalDateTime.now()
        ));

        EvidenciaVcsDto resultado = evidenciaService.revisarEvidenciaTutor(200L, revisionDto);

        assertNotNull(resultado);
        assertEquals(EstadoRevisionVcs.APROBADO, resultado.estadoTutor());
        verify(evidenciaRepository).save(evidencia);
        verify(notificacionService).enviar(eq(10L), anyString(), anyString(), any(), anyString());
    }

    @Test
    @DisplayName("Aprobación final de horas por Subdecanato culmina el ProcesoVinculacion")
    void aprobarHorasSubdecanatoCulminaProceso() {
        asignacion.setDocumentosValidados(true);
        AprobarHorasSubdecanatoDto dto = new AprobarHorasSubdecanatoDto(80, "Aprobación oficial", null);

        when(asignacionRepository.findById(50L)).thenReturn(Optional.of(asignacion));

        ResultadoAprobacionHorasDto resultado = asignacionService.aprobarHorasSubdecanato(50L, dto);

        assertNotNull(resultado);
        assertEquals(EstadoAsignacionVcs.APROBADO, resultado.estadoAsignacion());
        assertEquals(80, resultado.horasAprobadas());
        assertEquals(160, resultado.horasAcumuladas());
        assertEquals(EstadoProcesoVcs.COMPLETADO, resultado.estadoProceso());
        assertTrue(resultado.procesoCulminado());
        verify(procesoRepository).save(proceso);
        verify(asignacionRepository).save(asignacion);
    }

    @Test
    @DisplayName("Lanzar excepción al intentar subir evidencia con usuario no autorizado")
    void subirEvidencia_UsuarioNoAutorizado_LanzaNegocioException() {
        asignacion.setFaseActual(FaseActualAsignacion.DESARROLLO);
        EvidenciaVcsNuevoDto dto = new EvidenciaVcsNuevoDto(50L, TipoDocumentoVcs.BITACORA, "bitacora.pdf", "/archivos/evi.pdf", 80);

        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(99L);
        otroUsuario.setRol(RolUsuario.TUTOR_ACADEMICO);

        when(asignacionRepository.findById(50L)).thenReturn(Optional.of(asignacion));

        NegocioException ex = assertThrows(NegocioException.class, () -> evidenciaService.subirEvidencia(dto, otroUsuario));
        assertTrue(ex.getMessage().contains("No tienes permiso"));
        verify(evidenciaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Permitir a SUBDECANO subir evidencia en nombre del estudiante")
    void subirEvidencia_Subdecano_Permitido() {
        asignacion.setFaseActual(FaseActualAsignacion.DESARROLLO);
        EvidenciaVcsNuevoDto dto = new EvidenciaVcsNuevoDto(50L, TipoDocumentoVcs.BITACORA, "bitacora.pdf", "/archivos/evi.pdf", 80);

        Usuario subdecano = new Usuario();
        subdecano.setId(99L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        when(asignacionRepository.findById(50L)).thenReturn(Optional.of(asignacion));
        when(evidenciaMapeador.aEntidad(dto)).thenReturn(new EvidenciaAsignacionVcs());
        when(evidenciaRepository.save(any(EvidenciaAsignacionVcs.class))).thenReturn(evidencia);
        when(evidenciaMapeador.aDto(evidencia)).thenReturn(new EvidenciaVcsDto(
                200L, 50L, 10L, "Carlos Estrella", "1720000000",
                1L, "Alfabetización Digital", TipoDocumentoVcs.BITACORA, "bitacora.pdf", "/archivos/evi.pdf",
                80, EstadoRevisionVcs.PENDIENTE, null, LocalDateTime.now(), null
        ));

        EvidenciaVcsDto resultado = evidenciaService.subirEvidencia(dto, subdecano);

        assertNotNull(resultado);
        verify(evidenciaRepository).save(any(EvidenciaAsignacionVcs.class));
    }
}
