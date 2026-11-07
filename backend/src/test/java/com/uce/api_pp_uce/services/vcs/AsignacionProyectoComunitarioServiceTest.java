package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioMasivoDto;
import com.uce.api_pp_uce.dtos.vcs.EstudianteResumenVcsDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioResumenDto;
import com.uce.api_pp_uce.dtos.vcs.TutorResumenVcsDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ProcesoVinculacion;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProcesoVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.AsignacionProyectoComunitarioMapeador;
import com.uce.api_pp_uce.mapeadores.vcs.ProyectoComunitarioMapeador;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProcesoVinculacionRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.EvidenciaAsignacionVcsRepository;
import com.uce.api_pp_uce.entities.vcs.EvidenciaAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.exportadores.vcs.CertificadoHorasVcsPdfExportador;
import com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.vcs.impl.AsignacionProyectoComunitarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.springframework.security.access.AccessDeniedException;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AsignacionProyectoComunitarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;

    @Mock
    private ProyectoComunitarioRepository proyectoComunitarioRepository;

    @Mock
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Mock
    private CarreraRepository carreraRepository;

    @Mock
    private ProcesoVinculacionRepository procesoVinculacionRepository;

    @Mock
    private ProcesoPracticaRepository procesoPracticaRepository;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private CertificadoHorasVcsPdfExportador certificadoHorasVcsPdfExportador;

    @Spy
    private AsignacionProyectoComunitarioMapeador asignacionProyectoComunitarioMapeador = Mappers.getMapper(AsignacionProyectoComunitarioMapeador.class);

    @Mock
    private ProyectoComunitarioMapeador proyectoComunitarioMapeador;

    @Mock
    private EvidenciaAsignacionVcsRepository evidenciaAsignacionVcsRepository;

    @Mock
    private com.uce.api_pp_uce.services.UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private AsignacionProyectoComunitarioServiceImpl asignacionProyectoComunitarioService;

    private Carrera carreraMock;
    private PeriodoAcademico periodoMock;
    private ProyectoComunitario proyectoMock;
    private Usuario estudianteMock;
    private Usuario tutorMock;
    private ProcesoVinculacion procesoMock;
    private AsignacionProyectoComunitario asignacionMock;
    private AsignacionProyectoComunitarioDto asignacionDtoMock;

    @BeforeEach
    void setUp() {
        carreraMock = new Carrera();
        carreraMock.setId(1);
        carreraMock.setNombre("Ingeniería en Sistemas");
        carreraMock.setHorasProyectosComunitarios(160);

        periodoMock = new PeriodoAcademico();
        periodoMock.setId(100L);
        periodoMock.setNombre("2026-2026");
        periodoMock.setEstado(EstadoPeriodo.ACTIVO);

        tutorMock = new Usuario();
        tutorMock.setId(20L);
        tutorMock.setNombres("Carlos");
        tutorMock.setApellidos("Pérez");
        tutorMock.setCorreo("carlos.perez@uce.edu.ec");
        tutorMock.setEstado(EstadoUsuario.ACTIVO);
        tutorMock.setCarrera(carreraMock);

        proyectoMock = new ProyectoComunitario();
        proyectoMock.setId(10L);
        proyectoMock.setNombre("Alfabetización Digital");
        proyectoMock.setCarrera(carreraMock);
        proyectoMock.setTutorAcademico(tutorMock);
        proyectoMock.setEstado(EstadoProyecto.ACTIVO);

        estudianteMock = new Usuario();
        estudianteMock.setId(50L);
        estudianteMock.setNombres("Juan");
        estudianteMock.setApellidos("Estrella");
        estudianteMock.setCorreo("juan.estrella@uce.edu.ec");
        estudianteMock.setEstado(EstadoUsuario.ACTIVO);
        estudianteMock.setCarrera(carreraMock);

        procesoMock = new ProcesoVinculacion();
        procesoMock.setId(1L);
        procesoMock.setEstudiante(estudianteMock);
        procesoMock.setCarrera(carreraMock);
        procesoMock.setHorasRequeridas(160);
        procesoMock.setHorasAcumuladas(0);
        procesoMock.setEstado(EstadoProcesoVcs.EN_CURSO);

        asignacionMock = new AsignacionProyectoComunitario();
        asignacionMock.setId(1000L);
        asignacionMock.setProcesoVinculacion(procesoMock);
        asignacionMock.setProyectoComunitario(proyectoMock);
        asignacionMock.setPeriodoAcademico(periodoMock);
        asignacionMock.setHorasAsignadas(80);
        asignacionMock.setHorasCompletadas(0);
        asignacionMock.setFechaInicio(LocalDate.now());
        asignacionMock.setEstado(EstadoAsignacionVcs.EN_CURSO);
        asignacionMock.setFaseActual(FaseActualAsignacion.ASIGNACION);

        asignacionDtoMock = new AsignacionProyectoComunitarioDto(
                1000L,
                1L,
                50L,
                "Juan Estrella",
                "1723456789",
                "juan.estrella@uce.edu.ec",
                10L,
                "Alfabetización Digital",
                20L,
                "Carlos Pérez",
                "carlos.perez@uce.edu.ec",
                1L,
                "Ingeniería en Sistemas",
                100L,
                "2026-2026",
                80,
                0,
                0,
                80,
                LocalDate.now(),
                null,
                EstadoAsignacionVcs.EN_CURSO,
                FaseActualAsignacion.ASIGNACION,
                false,
                null,
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("Debe buscar asignación por ID exitosamente")
    void buscarPorId_Exito() {
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionProyectoComunitarioMapeador.aDto(asignacionMock)).thenReturn(asignacionDtoMock);

        AsignacionProyectoComunitarioDto resultado = asignacionProyectoComunitarioService.buscarPorId(1000L);

        assertNotNull(resultado);
        assertEquals(1000L, resultado.id());
        assertEquals("Juan Estrella", resultado.nombreCompletoEstudiante());
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException al buscar por ID inexistente")
    void buscarPorId_NoEncontrado() {
        when(asignacionProyectoComunitarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> asignacionProyectoComunitarioService.buscarPorId(999L));
    }

    @Test
    @DisplayName("buscarPorId - Como ESTUDIANTE ajeno debe denegar acceso (403)")
    void buscarPorId_EstudianteAjeno_LanzaAccessDeniedException() {
        Usuario usuarioAjeno = new Usuario();
        usuarioAjeno.setId(999L);
        usuarioAjeno.setRol(RolUsuario.ESTUDIANTE);

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(usuarioAjeno);

        assertThrows(AccessDeniedException.class, () -> asignacionProyectoComunitarioService.buscarPorId(1000L));
    }

    @Test
    @DisplayName("buscarPorId - Como TUTOR ajeno debe denegar acceso (403)")
    void buscarPorId_TutorAjeno_LanzaAccessDeniedException() {
        Usuario tutorAjeno = new Usuario();
        tutorAjeno.setId(999L);
        tutorAjeno.setRol(RolUsuario.TUTOR_ACADEMICO);

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(tutorAjeno);

        assertThrows(AccessDeniedException.class, () -> asignacionProyectoComunitarioService.buscarPorId(1000L));
    }

    @Test
    @DisplayName("listarPorEstudiante - Como ESTUDIANTE consultando a otro debe denegar acceso (403)")
    void listarPorEstudiante_OtroEstudiante_LanzaAccessDeniedException() {
        Usuario estudiante = new Usuario();
        estudiante.setId(50L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);

        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(estudiante);

        assertThrows(AccessDeniedException.class, () -> asignacionProyectoComunitarioService.listarPorEstudiante(999L));
    }

    @Test
    @DisplayName("listarPorTutor - Como TUTOR consultando a otro debe denegar acceso (403)")
    void listarPorTutor_OtroTutor_LanzaAccessDeniedException() {
        Usuario tutor = new Usuario();
        tutor.setId(20L);
        tutor.setRol(RolUsuario.TUTOR_ACADEMICO);

        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(tutor);

        assertThrows(AccessDeniedException.class, () -> asignacionProyectoComunitarioService.listarPorTutor(999L));
    }

    @Test
    @DisplayName("Debe listar estudiantes disponibles")
    void listarEstudiantesDisponibles_Exito() {
        when(usuarioRepository.findEstudiantesDisponiblesParaVcs(1, 100L, "Juan"))
                .thenReturn(List.of(estudianteMock));
        when(procesoVinculacionRepository.findByEstudianteIdAndCarreraId(50L, 1))
                .thenReturn(Optional.of(procesoMock));

        List<EstudianteResumenVcsDto> resultado = asignacionProyectoComunitarioService.listarEstudiantesDisponibles(1, 100L, "Juan");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Juan", resultado.get(0).nombres());
        assertEquals(0, resultado.get(0).horasCompletadasVcs());
        assertEquals(160, resultado.get(0).horasRequeridasVcs());
    }

    @Test
    @DisplayName("Debe listar proyectos disponibles")
    void listarProyectosDisponibles_Exito() {
        ProyectoComunitarioResumenDto proyectoResumenDto = new ProyectoComunitarioResumenDto(10L, "Alfabetización Digital", "Desc", 1, "Ingeniería en Sistemas", 50L, "Jaime Salvador", EstadoProyecto.ACTIVO);

        when(proyectoComunitarioRepository.findByEstadoAndCarreraId(EstadoProyecto.ACTIVO, 1, "Alfa"))
                .thenReturn(List.of(proyectoMock));
        when(proyectoComunitarioMapeador.aDtoResumen(proyectoMock)).thenReturn(proyectoResumenDto);

        List<ProyectoComunitarioResumenDto> resultado = asignacionProyectoComunitarioService.listarProyectosDisponibles(1, 100L, "Alfa");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Alfabetización Digital", resultado.get(0).nombre());
    }

    @Test
    @DisplayName("Debe listar tutores disponibles")
    void listarTutoresDisponibles_Exito() {
        when(usuarioRepository.findTutoresParaAsignacion(1, "Carlos"))
                .thenReturn(List.of(tutorMock));
        when(proyectoComunitarioRepository.findByTutorIdAndCarreraId(20L, 1))
                .thenReturn(List.of());
        when(asignacionProyectoComunitarioRepository.countByProyectoComunitarioTutorAcademicoIdAndPeriodoAcademicoId(20L, 100L))
                .thenReturn(0);

        List<TutorResumenVcsDto> resultado = asignacionProyectoComunitarioService.listarTutoresDisponibles(1, 100L, "Carlos");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Carlos", resultado.get(0).nombres());
    }

    @Test
    @DisplayName("Debe buscar asignaciones con filtros y paginación")
    void buscarConFiltros_Exito() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<AsignacionProyectoComunitario> paginaEntidades = new PageImpl<>(List.of(asignacionMock));

        when(asignacionProyectoComunitarioRepository.buscarConFiltros("Juan", 1, null, null, null, EstadoAsignacionVcs.EN_CURSO, null, 100L, pageable))
                .thenReturn(paginaEntidades);
        when(asignacionProyectoComunitarioMapeador.aDto(asignacionMock)).thenReturn(asignacionDtoMock);

        Page<AsignacionProyectoComunitarioDto> resultado = asignacionProyectoComunitarioService.buscarConFiltros(" Juan ", 1, null, null, EstadoAsignacionVcs.EN_CURSO, null, 100L, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals("Juan Estrella", resultado.getContent().get(0).nombreCompletoEstudiante());
    }

    @Test
    @DisplayName("Debe buscar asignaciones filtrando por estudianteId específico")
    void buscarConFiltros_ConEstudianteId_Exito() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<AsignacionProyectoComunitario> paginaEntidades = new PageImpl<>(List.of(asignacionMock));

        when(asignacionProyectoComunitarioRepository.buscarConFiltros(null, 1, null, 50L, null, EstadoAsignacionVcs.EN_CURSO, null, 100L, pageable))
                .thenReturn(paginaEntidades);
        when(asignacionProyectoComunitarioMapeador.aDto(asignacionMock)).thenReturn(asignacionDtoMock);

        Page<AsignacionProyectoComunitarioDto> resultado = asignacionProyectoComunitarioService.buscarConFiltros(null, 1, null, 50L, null, EstadoAsignacionVcs.EN_CURSO, null, 100L, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(50L, resultado.getContent().get(0).estudianteId());
    }

    @Test
    @DisplayName("Debe asignar estudiantes masivamente creando nuevo proceso de vinculación")
    void asignarEstudiantesMasivo_Exito_NuevoProceso() {
        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L),
                10L,
                80,
                1,
                100L
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(50L)).thenReturn(Optional.of(estudianteMock));
        when(procesoVinculacionRepository.findByEstudianteIdAndCarreraId(50L, 1)).thenReturn(Optional.empty());
        when(procesoVinculacionRepository.save(any(ProcesoVinculacion.class))).thenReturn(procesoMock);
        when(asignacionProyectoComunitarioRepository.existsByProcesoVinculacionIdAndPeriodoAcademicoIdAndEstadoNot(procesoMock.getId(), 100L, EstadoAsignacionVcs.CANCELADO)).thenReturn(false);
        when(asignacionProyectoComunitarioRepository.save(any(AsignacionProyectoComunitario.class))).thenReturn(asignacionMock);
        when(asignacionProyectoComunitarioMapeador.aDto(any(AsignacionProyectoComunitario.class))).thenReturn(asignacionDtoMock);

        List<AsignacionProyectoComunitarioDto> resultado = asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(notificacionService).enviar(eq(50L), anyString(), anyString(), eq(TipoNotificacion.INFORMACION), anyString());
    }

    @Test
    @DisplayName("Debe lanzar NegocioException cuando el periodo académico está inactivo")
    void asignarEstudiantesMasivo_ErrorPeriodoInactivo() {
        periodoMock.setEstado(EstadoPeriodo.INACTIVO);
        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L), 10L, 80, 1, 100L
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException cuando las horas exceden las de la carrera")
    void asignarEstudiantesMasivo_ErrorHorasExcedenCarrera() {
        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L), 10L, 200, 1, 100L // 200 > 160
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException cuando el estudiante está inactivo")
    void asignarEstudiantesMasivo_ErrorEstudianteInactivo() {
        estudianteMock.setEstado(EstadoUsuario.INACTIVO);
        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L), 10L, 80, 1, 100L
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(50L)).thenReturn(Optional.of(estudianteMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException cuando el estudiante no pertenece a la carrera")
    void asignarEstudiantesMasivo_ErrorEstudianteCarreraDiferente() {
        Carrera otraCarrera = new Carrera();
        otraCarrera.setId(2);
        estudianteMock.setCarrera(otraCarrera);

        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L), 10L, 80, 1, 100L
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(50L)).thenReturn(Optional.of(estudianteMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException cuando el proceso ya está completado")
    void asignarEstudiantesMasivo_ErrorProcesoCompletado() {
        procesoMock.setEstado(EstadoProcesoVcs.COMPLETADO);
        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L), 10L, 80, 1, 100L
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(50L)).thenReturn(Optional.of(estudianteMock));
        when(procesoVinculacionRepository.findByEstudianteIdAndCarreraId(50L, 1)).thenReturn(Optional.of(procesoMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException cuando el estudiante ya tiene asignación en el periodo")
    void asignarEstudiantesMasivo_ErrorAsignacionDuplicadaPeriodo() {
        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L), 10L, 80, 1, 100L
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(50L)).thenReturn(Optional.of(estudianteMock));
        when(procesoVinculacionRepository.findByEstudianteIdAndCarreraId(50L, 1)).thenReturn(Optional.of(procesoMock));
        when(asignacionProyectoComunitarioRepository.existsByProcesoVinculacionIdAndPeriodoAcademicoIdAndEstadoNot(procesoMock.getId(), 100L, EstadoAsignacionVcs.CANCELADO)).thenReturn(true);

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto));
    }

    @Test
    @DisplayName("Debe permitir asignación si la previa en el mismo periodo fue cancelada")
    void asignarEstudiantesMasivo_PermiteReasignarSiPreviaFueCancelada() {
        AsignacionProyectoComunitarioMasivoDto dto = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L), 10L, 80, 1, 100L
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(periodoAcademicoRepository.findById(100L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(50L)).thenReturn(Optional.of(estudianteMock));
        when(procesoVinculacionRepository.findByEstudianteIdAndCarreraId(50L, 1)).thenReturn(Optional.of(procesoMock));
        when(asignacionProyectoComunitarioRepository.existsByProcesoVinculacionIdAndPeriodoAcademicoIdAndEstadoNot(procesoMock.getId(), 100L, EstadoAsignacionVcs.CANCELADO)).thenReturn(false);
        when(asignacionProyectoComunitarioRepository.save(any(AsignacionProyectoComunitario.class))).thenReturn(asignacionMock);
        when(asignacionProyectoComunitarioMapeador.aDto(any(AsignacionProyectoComunitario.class))).thenReturn(asignacionDtoMock);

        List<AsignacionProyectoComunitarioDto> resultado = asignacionProyectoComunitarioService.asignarEstudiantesMasivo(dto);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(asignacionProyectoComunitarioRepository).save(any(AsignacionProyectoComunitario.class));
    }

    @Test
    @DisplayName("Debe actualizar asignación exitosamente")
    void actualizarAsignacion_Exito() {
        ProyectoComunitario nuevoProyecto = new ProyectoComunitario();
        nuevoProyecto.setId(11L);
        nuevoProyecto.setNombre("Nuevo Proyecto");
        nuevoProyecto.setCarrera(carreraMock);

        AsignacionProyectoComunitarioActualizarDto dto = new AsignacionProyectoComunitarioActualizarDto(11L, 100);

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(proyectoComunitarioRepository.findById(11L)).thenReturn(Optional.of(nuevoProyecto));
        when(asignacionProyectoComunitarioRepository.save(asignacionMock)).thenReturn(asignacionMock);
        when(asignacionProyectoComunitarioMapeador.aDto(asignacionMock)).thenReturn(asignacionDtoMock);

        AsignacionProyectoComunitarioDto resultado = asignacionProyectoComunitarioService.actualizarAsignacion(1000L, dto);

        assertNotNull(resultado);
        verify(notificacionService).enviar(eq(50L), anyString(), anyString(), eq(TipoNotificacion.INFORMACION), anyString());
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al actualizar asignación que superó la fase de asignación")
    void actualizarAsignacion_ErrorFaseNoAsignacion() {
        asignacionMock.setFaseActual(FaseActualAsignacion.DESARROLLO);
        AsignacionProyectoComunitarioActualizarDto dto = new AsignacionProyectoComunitarioActualizarDto(10L, 100);

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.actualizarAsignacion(1000L, dto));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al actualizar si el nuevo proyecto no es de la carrera")
    void actualizarAsignacion_ErrorNuevoProyectoCarreraDiferente() {
        Carrera otraCarrera = new Carrera();
        otraCarrera.setId(2);
        ProyectoComunitario nuevoProyecto = new ProyectoComunitario();
        nuevoProyecto.setId(11L);
        nuevoProyecto.setCarrera(otraCarrera);

        AsignacionProyectoComunitarioActualizarDto dto = new AsignacionProyectoComunitarioActualizarDto(11L, 100);

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(proyectoComunitarioRepository.findById(11L)).thenReturn(Optional.of(nuevoProyecto));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.actualizarAsignacion(1000L, dto));
    }

    @Test
    @DisplayName("Debe eliminar asignación exitosamente")
    void eliminarAsignacion_Exito() {
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        doNothing().when(asignacionProyectoComunitarioRepository).delete(asignacionMock);

        assertDoesNotThrow(() -> asignacionProyectoComunitarioService.eliminarAsignacion(1000L));
        verify(asignacionProyectoComunitarioRepository).delete(asignacionMock);
        verify(notificacionService).enviar(eq(50L), anyString(), anyString(), eq(TipoNotificacion.INFORMACION), anyString());
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException al eliminar ID inexistente")
    void eliminarAsignacion_ErrorNoEncontrado() {
        when(asignacionProyectoComunitarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> asignacionProyectoComunitarioService.eliminarAsignacion(999L));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al eliminar si no está en fase ASIGNACION")
    void eliminarAsignacion_ErrorFaseNoAsignacion() {
        asignacionMock.setFaseActual(FaseActualAsignacion.FINALIZACION);
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.eliminarAsignacion(1000L));
    }

    @Test
    @DisplayName("Debe asociar proyectos al tutor exitosamente")
    void asociarProyectosATutor_Exito() {
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));
        when(proyectoComunitarioRepository.findByTutorIdAndCarreraId(20L, 1)).thenReturn(List.of());
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(proyectoComunitarioRepository.save(any(ProyectoComunitario.class))).thenReturn(proyectoMock);

        assertDoesNotThrow(() -> asignacionProyectoComunitarioService.asociarProyectosATutor(20L, List.of(10L)));
        verify(proyectoComunitarioRepository).save(proyectoMock);
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al asociar más de 2 proyectos a un tutor")
    void asociarProyectosATutor_ErrorMasDeDosProyectos() {
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.asociarProyectosATutor(20L, List.of(10L, 11L, 12L)));
        verify(proyectoComunitarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al asociar un proyecto que ya pertenece a otro tutor")
    void asociarProyectosATutor_ErrorProyectoYaAsignadoAOtroTutor() {
        Usuario otroTutor = new Usuario();
        otroTutor.setId(99L);
        otroTutor.setNombres("Docente");
        otroTutor.setApellidos("Existente");

        ProyectoComunitario proyectoOcupado = new ProyectoComunitario();
        proyectoOcupado.setId(10L);
        proyectoOcupado.setNombre("Proyecto Ocupado");
        proyectoOcupado.setCarrera(carreraMock);
        proyectoOcupado.setTutorAcademico(otroTutor);

        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));
        when(proyectoComunitarioRepository.findByTutorIdAndCarreraId(20L, 1)).thenReturn(List.of());
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoOcupado));

        NegocioException exception = assertThrows(NegocioException.class, () -> 
                asignacionProyectoComunitarioService.asociarProyectosATutor(20L, List.of(10L)));

        assertTrue(exception.getMessage().contains("ya está asignado al tutor"));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException si el proyecto no pertenece a la carrera del tutor")
    void asociarProyectosATutor_ErrorCarreraDiferente() {
        Carrera otraCarrera = new Carrera();
        otraCarrera.setId(2);

        ProyectoComunitario proyectoOtraCarrera = new ProyectoComunitario();
        proyectoOtraCarrera.setId(10L);
        proyectoOtraCarrera.setNombre("Proyecto Otra Carrera");
        proyectoOtraCarrera.setCarrera(otraCarrera);

        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));
        when(proyectoComunitarioRepository.findByTutorIdAndCarreraId(20L, 1)).thenReturn(List.of());
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoOtraCarrera));

        NegocioException exception = assertThrows(NegocioException.class, () -> 
                asignacionProyectoComunitarioService.asociarProyectosATutor(20L, List.of(10L)));

        assertTrue(exception.getMessage().contains("no pertenece a la carrera del tutor"));
    }

    @Test
    @DisplayName("Debe generar PDF dinamico de certificado de horas exitosamente")
    void vistaPreviaCertificadoHoras_GeneraPdfDinamico_Exitoso() {
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        byte[] pdfEsperado = "pdf-certificado".getBytes();
        when(certificadoHorasVcsPdfExportador.exportar(eq(asignacionMock), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(pdfEsperado);

        byte[] resultado = asignacionProyectoComunitarioService.vistaPreviaCertificadoHoras(
                1000L, "Dr. Subdecano", "1711111111", "0991111111", "sub@uce.edu.ec");

        assertNotNull(resultado);
        assertArrayEquals(pdfEsperado, resultado);
        verify(certificadoHorasVcsPdfExportador).exportar(eq(asignacionMock), eq("Dr. Subdecano"), eq("1711111111"), eq("0991111111"), eq("sub@uce.edu.ec"));
    }

    @Test
    @DisplayName("Debe lanzar excepcion al solicitar certificado de asignacion inexistente")
    void vistaPreviaCertificadoHoras_NoEncontrado_LanzaExcepcion() {
        when(asignacionProyectoComunitarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () ->
                asignacionProyectoComunitarioService.vistaPreviaCertificadoHoras(
                        999L, "Dr. Subdecano", "1711111111", "0991111111", "sub@uce.edu.ec"));
    }

    @Test
    @DisplayName("Debe reprobar asignacion en curso exitosamente con 0 horas")
    void reprobarAsignacion_EnCurso_Exitoso() {
        asignacionMock.setEstado(EstadoAsignacionVcs.EN_CURSO);
        asignacionMock.setHorasCompletadas(40);
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionProyectoComunitarioRepository.save(any(AsignacionProyectoComunitario.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AsignacionProyectoComunitarioDto resultado = asignacionProyectoComunitarioService.reprobarAsignacion(1000L);

        assertNotNull(resultado);
        assertEquals(EstadoAsignacionVcs.REPROBADO, asignacionMock.getEstado());
        assertEquals(0, asignacionMock.getHorasCompletadas());
        verify(notificacionService).enviar(eq(estudianteMock.getId()), anyString(), anyString(), eq(TipoNotificacion.ADVERTENCIA), anyString());
    }

    @Test
    @DisplayName("Debe lanzar excepcion al reprobar asignacion que no este en curso")
    void reprobarAsignacion_NoEnCurso_LanzaExcepcion() {
        asignacionMock.setEstado(EstadoAsignacionVcs.APROBADO);
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.reprobarAsignacion(1000L));
    }

    @Test
    @DisplayName("Debe cancelar asignacion exitosamente con 0 horas")
    void cancelarAsignacion_Exitoso() {
        asignacionMock.setEstado(EstadoAsignacionVcs.EN_CURSO);
        asignacionMock.setHorasCompletadas(30);
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionProyectoComunitarioRepository.save(any(AsignacionProyectoComunitario.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        AsignacionProyectoComunitarioDto resultado = asignacionProyectoComunitarioService.cancelarAsignacion(1000L);

        assertNotNull(resultado);
        assertEquals(EstadoAsignacionVcs.CANCELADO, asignacionMock.getEstado());
        assertEquals(0, asignacionMock.getHorasCompletadas());
        verify(notificacionService).enviar(eq(estudianteMock.getId()), anyString(), anyString(), eq(TipoNotificacion.INFORMACION), anyString());
    }

    @Test
    @DisplayName("Debe lanzar excepcion al cancelar asignacion ya aprobada")
    void cancelarAsignacion_Aprobada_LanzaExcepcion() {
        asignacionMock.setEstado(EstadoAsignacionVcs.APROBADO);
        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.cancelarAsignacion(1000L));
    }

    @Test
    @DisplayName("Debe enviar asignacion a subdecanato exitosamente cuando ambos documentos estan aprobados")
    void enviarASubdecanato_Exitoso() {
        asignacionMock.setEstado(EstadoAsignacionVcs.EN_CURSO);
        asignacionMock.setDocumentosValidados(false);

        EvidenciaAsignacionVcs bitacora = new EvidenciaAsignacionVcs();
        bitacora.setTipoDocumento(TipoDocumentoVcs.BITACORA);
        bitacora.setEstadoTutor(EstadoRevisionVcs.APROBADO);

        EvidenciaAsignacionVcs informe = new EvidenciaAsignacionVcs();
        informe.setTipoDocumento(TipoDocumentoVcs.INFORME_FINAL);
        informe.setEstadoTutor(EstadoRevisionVcs.APROBADO);

        Usuario subdecano = new Usuario();
        subdecano.setId(99L);
        subdecano.setRol(RolUsuario.SUBDECANO);
        subdecano.setNombres("Sub");
        subdecano.setApellidos("Decano");

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(evidenciaAsignacionVcsRepository.findByAsignacionIdOrderByFechaSubidaDesc(1000L))
                .thenReturn(List.of(bitacora, informe));
        when(asignacionProyectoComunitarioRepository.save(any(AsignacionProyectoComunitario.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(usuarioRepository.findAll()).thenReturn(List.of(subdecano));

        AsignacionProyectoComunitarioDto resultado = asignacionProyectoComunitarioService.enviarASubdecanato(1000L);

        assertNotNull(resultado);
        assertTrue(asignacionMock.isDocumentosValidados());
        assertEquals(FaseActualAsignacion.FINALIZACION, asignacionMock.getFaseActual());
        verify(notificacionService).enviar(eq(99L), anyString(), anyString(), eq(TipoNotificacion.ADVERTENCIA), anyString());
    }

    @Test
    @DisplayName("Debe lanzar excepcion al enviar a subdecanato si falta aprobar algun documento")
    void enviarASubdecanato_FaltanDocumentos_LanzaExcepcion() {
        asignacionMock.setEstado(EstadoAsignacionVcs.EN_CURSO);
        asignacionMock.setDocumentosValidados(false);

        EvidenciaAsignacionVcs bitacora = new EvidenciaAsignacionVcs();
        bitacora.setTipoDocumento(TipoDocumentoVcs.BITACORA);
        bitacora.setEstadoTutor(EstadoRevisionVcs.APROBADO);

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));
        when(evidenciaAsignacionVcsRepository.findByAsignacionIdOrderByFechaSubidaDesc(1000L))
                .thenReturn(List.of(bitacora));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.enviarASubdecanato(1000L));
    }

    @Test
    @DisplayName("Debe lanzar excepcion al enviar a subdecanato si los documentos ya fueron validados")
    void enviarASubdecanato_YaValidados_LanzaExcepcion() {
        asignacionMock.setEstado(EstadoAsignacionVcs.EN_CURSO);
        asignacionMock.setDocumentosValidados(true);

        when(asignacionProyectoComunitarioRepository.findById(1000L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(NegocioException.class, () -> asignacionProyectoComunitarioService.enviarASubdecanato(1000L));
    }
}
