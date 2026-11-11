package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.ProyectoComunitarioMapeador;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.services.vcs.impl.ProyectoComunitarioServiceImpl;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProyectoComunitarioServiceTest {

    @Mock
    private ProyectoComunitarioRepository proyectoComunitarioRepository;

    @Mock
    private CarreraRepository carreraRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Mock
    private AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;

    @Mock
    private ProyectoComunitarioMapeador proyectoComunitarioMapeador;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private ProyectoComunitarioServiceImpl proyectoComunitarioService;

    private Carrera carreraMock;
    private ProyectoComunitario proyectoMock;
    private ProyectoComunitarioDto proyectoDtoMock;

    @BeforeEach
    void setUp() {
        carreraMock = new Carrera();
        carreraMock.setId(1);
        carreraMock.setNombre("Ingeniería en Sistemas");

        proyectoMock = new ProyectoComunitario();
        proyectoMock.setId(10L);
        proyectoMock.setNombre("Alfabetización Digital");
        proyectoMock.setDescripcion("Capacitación TIC");
        proyectoMock.setCarrera(carreraMock);
        proyectoMock.setEstado(EstadoProyecto.ACTIVO);
        proyectoMock.setFechaInicio(LocalDate.of(2026, 10, 1));
        proyectoMock.setFechaFin(LocalDate.of(2027, 2, 28));
        proyectoMock.setFechaCreacion(LocalDateTime.now());

        proyectoDtoMock = new ProyectoComunitarioDto(
                10L,
                "Alfabetización Digital",
                "Capacitación TIC",
                1,
                "Ingeniería en Sistemas",
                10L,
                "Carlos Pérez",
                "carlos.perez@uce.edu.ec",
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                "/archivos/vinculacion/proyecto.pdf",
                "proyecto.pdf",
                LocalDateTime.now(),
                false
        );
    }

    @Test
    @DisplayName("Debe listar proyectos comunitarios con filtros y paginación")
    void buscarConFiltros_Exito() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ProyectoComunitario> paginaEntidades = new PageImpl<>(List.of(proyectoMock));

        when(proyectoComunitarioRepository.buscarConFiltros("Alfa", 1, null, EstadoProyecto.ACTIVO, pageable))
                .thenReturn(paginaEntidades);
        when(proyectoComunitarioMapeador.aDto(eq(proyectoMock), anyBoolean())).thenReturn(proyectoDtoMock);

        Page<ProyectoComunitarioDto> resultado = proyectoComunitarioService.buscarConFiltros("Alfa", 1, null, EstadoProyecto.ACTIVO, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals("Alfabetización Digital", resultado.getContent().get(0).nombre());
        verify(proyectoComunitarioRepository).buscarConFiltros("Alfa", 1, null, EstadoProyecto.ACTIVO, pageable);
    }

    @Test
    @DisplayName("Debe buscar proyecto por ID exitosamente")
    void buscarPorId_Exito() {
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(proyectoComunitarioMapeador.aDto(eq(proyectoMock), anyBoolean())).thenReturn(proyectoDtoMock);

        ProyectoComunitarioDto resultado = proyectoComunitarioService.buscarPorId(10L);

        assertNotNull(resultado);
        assertEquals(10L, resultado.id());
        assertEquals("Alfabetización Digital", resultado.nombre());
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException cuando el ID no existe")
    void buscarPorId_NoEncontrado() {
        when(proyectoComunitarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> proyectoComunitarioService.buscarPorId(99L));
    }

    @Test
    @DisplayName("buscarPorId - Como DIRECTOR_CARRERA deniega acceso si el proyecto pertenece a otra carrera (403)")
    void buscarPorId_ComoDirector_DeniegaAccesoSiEsDeOtraCarrera() {
        Usuario director = new Usuario();
        director.setId(99L);
        director.setRol(RolUsuario.DIRECTOR_CARRERA);
        Carrera otraCarrera = new Carrera();
        otraCarrera.setId(999);
        director.setCarrera(otraCarrera);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(director);

        assertThrows(AccessDeniedException.class, () ->
                proyectoComunitarioService.buscarPorId(10L));
    }

    @Test
    @DisplayName("buscarPorId - Como TUTOR_ACADEMICO deniega acceso si el proyecto está asignado a otro tutor (403)")
    void buscarPorId_ComoTutor_DeniegaAccesoSiEsDeOtroTutor() {
        Usuario tutorActual = new Usuario();
        tutorActual.setId(99L);
        tutorActual.setRol(RolUsuario.TUTOR_ACADEMICO);

        Usuario otroTutor = new Usuario();
        otroTutor.setId(88L);
        proyectoMock.setTutorAcademico(otroTutor);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(tutorActual);

        assertThrows(AccessDeniedException.class, () ->
                proyectoComunitarioService.buscarPorId(10L));
    }

    @Test
    @DisplayName("Debe crear un proyecto comunitario exitosamente")
    void crearProyecto_Exito() {
        ProyectoComunitarioNuevoDto peticion = new ProyectoComunitarioNuevoDto(
                "Alfabetización Digital",
                "Capacitación TIC",
                1,
                null,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                null,
                null
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraId("Alfabetización Digital", 1)).thenReturn(false);
        when(proyectoComunitarioMapeador.aEntidad(peticion)).thenReturn(proyectoMock);
        when(proyectoComunitarioRepository.save(proyectoMock)).thenReturn(proyectoMock);
        when(proyectoComunitarioMapeador.aDto(proyectoMock)).thenReturn(proyectoDtoMock);

        ProyectoComunitarioDto resultado = proyectoComunitarioService.crearProyecto(peticion);

        assertNotNull(resultado);
        assertEquals("Alfabetización Digital", resultado.nombre());
        verify(proyectoComunitarioRepository).save(proyectoMock);
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al crear con fechaFin anterior a fechaInicio")
    void crearProyecto_ErrorFechasInvalidas() {
        ProyectoComunitarioNuevoDto peticion = new ProyectoComunitarioNuevoDto(
                "Proyecto Invalido",
                "Desc",
                1,
                null,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 5, 1), // Fecha fin anterior a fecha inicio
                null,
                null
        );

        NegocioException exception = assertThrows(NegocioException.class, () -> proyectoComunitarioService.crearProyecto(peticion));
        assertTrue(exception.getMessage().contains("posterior o igual"));
        verifyNoInteractions(proyectoComunitarioRepository);
    }

    @Test
    @DisplayName("Debe lanzar NegocioException cuando ya existe un proyecto con el mismo nombre en la carrera")
    void crearProyecto_ErrorNombreDuplicado() {
        ProyectoComunitarioNuevoDto peticion = new ProyectoComunitarioNuevoDto(
                "Alfabetización Digital",
                "Capacitación TIC",
                1,
                null,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                null,
                null
        );

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraId("Alfabetización Digital", 1)).thenReturn(true);

        NegocioException exception = assertThrows(NegocioException.class, () -> proyectoComunitarioService.crearProyecto(peticion));
        assertTrue(exception.getMessage().contains("Ya existe un proyecto"));
        verify(proyectoComunitarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException al crear si la carrera no existe")
    void crearProyecto_ErrorCarreraNoExiste() {
        ProyectoComunitarioNuevoDto peticion = new ProyectoComunitarioNuevoDto(
                "Proyecto Nuevo",
                "Desc",
                999,
                null,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                null,
                null
        );

        when(carreraRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> proyectoComunitarioService.crearProyecto(peticion));
        verify(proyectoComunitarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe actualizar un proyecto comunitario exitosamente")
    void actualizarProyecto_Exito() {
        ProyectoComunitarioActualizarDto peticion = new ProyectoComunitarioActualizarDto(
                "Alfabetización Digital Modificado",
                "Nueva Desc",
                1,
                null,
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 3, 31),
                null,
                null
        );

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraIdAndIdNot("Alfabetización Digital Modificado", 1, 10L)).thenReturn(false);
        when(proyectoComunitarioRepository.save(proyectoMock)).thenReturn(proyectoMock);
        when(proyectoComunitarioMapeador.aDto(proyectoMock)).thenReturn(proyectoDtoMock);

        ProyectoComunitarioDto resultado = proyectoComunitarioService.actualizarProyecto(10L, peticion);

        assertNotNull(resultado);
        verify(proyectoComunitarioMapeador).actualizarEntidadDesdeDto(peticion, proyectoMock);
        verify(proyectoComunitarioRepository).save(proyectoMock);
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al crear proyecto si el tutor ya tiene 2 proyectos asignados")
    void crearProyecto_ErrorTutorExcedeLimite() {
        ProyectoComunitarioNuevoDto peticion = new ProyectoComunitarioNuevoDto(
                "Alfabetización Digital",
                "Capacitación TIC",
                1,
                20L,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                null,
                null
        );

        Usuario tutor = new Usuario();
        tutor.setId(20L);

        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraId("Alfabetización Digital", 1)).thenReturn(false);
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutor));
        when(proyectoComunitarioRepository.countByTutorAcademicoIdAndEstadoNot(20L, EstadoProyecto.CANCELADO)).thenReturn(2L);

        NegocioException exception = assertThrows(NegocioException.class, () -> proyectoComunitarioService.crearProyecto(peticion));
        assertTrue(exception.getMessage().contains("ya tiene 2 proyectos"));
        verify(proyectoComunitarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar NegocioException al actualizar proyecto si el tutor ya tiene 2 proyectos asignados")
    void actualizarProyecto_ErrorTutorExcedeLimite() {
        ProyectoComunitarioActualizarDto peticion = new ProyectoComunitarioActualizarDto(
                "Alfabetización Digital Modificado",
                "Nueva Desc",
                1,
                20L,
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 3, 31),
                null,
                null
        );

        Usuario tutor = new Usuario();
        tutor.setId(20L);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraIdAndIdNot("Alfabetización Digital Modificado", 1, 10L)).thenReturn(false);
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutor));
        when(proyectoComunitarioRepository.countByTutorAcademicoIdAndIdNotAndEstadoNot(20L, 10L, EstadoProyecto.CANCELADO)).thenReturn(2L);

        NegocioException exception = assertThrows(NegocioException.class, () -> proyectoComunitarioService.actualizarProyecto(10L, peticion));
        assertTrue(exception.getMessage().contains("ya tiene 2 proyectos"));
        verify(proyectoComunitarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe eliminar un proyecto comunitario exitosamente")
    void eliminarProyecto_Exito() {
        when(proyectoComunitarioRepository.existsById(10L)).thenReturn(true);
        doNothing().when(proyectoComunitarioRepository).deleteById(10L);

        assertDoesNotThrow(() -> proyectoComunitarioService.eliminarProyecto(10L));
        verify(proyectoComunitarioRepository).deleteById(10L);
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException al eliminar un ID inexistente")
    void eliminarProyecto_NoEncontrado() {
        when(proyectoComunitarioRepository.existsById(99L)).thenReturn(false);

        assertThrows(RecursoNoEncontradoException.class, () -> proyectoComunitarioService.eliminarProyecto(99L));
        verify(proyectoComunitarioRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("buscarPorId - Marca proyecto como iniciado cuando tiene asignaciones que superaron ASIGNACION")
    void buscarPorId_ProyectoConAsignacionEnDesarrollo_MarcaIniciadoTrue() {
        ProyectoComunitarioDto dtoIniciado = new ProyectoComunitarioDto(
                10L,
                "Alfabetización Digital",
                "Capacitación TIC",
                1,
                "Ingeniería en Sistemas",
                10L,
                "Carlos Pérez",
                "carlos.perez@uce.edu.ec",
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                "/archivos/vinculacion/proyecto.pdf",
                "proyecto.pdf",
                LocalDateTime.now(),
                true
        );

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(asignacionProyectoComunitarioRepository.existsByProyectoComunitarioIdAndFaseActualNot(10L, FaseActualAsignacion.ASIGNACION))
                .thenReturn(true);
        when(proyectoComunitarioMapeador.aDto(proyectoMock, true)).thenReturn(dtoIniciado);

        ProyectoComunitarioDto resultado = proyectoComunitarioService.buscarPorId(10L);

        assertTrue(resultado.iniciado());
        verify(asignacionProyectoComunitarioRepository).existsByProyectoComunitarioIdAndFaseActualNot(10L, FaseActualAsignacion.ASIGNACION);
    }

    @Test
    @DisplayName("buscarPorId - Enmascara urlDocumento hacia endpoint protegido /preview")
    void buscarPorId_ConDocumento_EnmascaraUrlPreview() {
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/doc_41.pdf");
        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(proyectoComunitarioMapeador.aDto(eq(proyectoMock), anyBoolean())).thenReturn(proyectoDtoMock);

        ProyectoComunitarioDto resultado = proyectoComunitarioService.buscarPorId(10L);

        assertEquals("/proyectos-comunitarios/10/preview", resultado.urlDocumento());
    }

    @Test
    @DisplayName("buscarPorId - Como TUTOR_ACADEMICO deniega acceso si el proyecto no tiene tutor asignado (BOLA)")
    void buscarPorId_ComoTutor_DeniegaAccesoSiNoTieneTutor() {
        Usuario tutor = new Usuario();
        tutor.setId(99L);
        tutor.setRol(RolUsuario.TUTOR_ACADEMICO);
        proyectoMock.setTutorAcademico(null);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(tutor);

        assertThrows(AccessDeniedException.class, () -> proyectoComunitarioService.buscarPorId(10L));
    }

    @Test
    @DisplayName("buscarPorId - Como ESTUDIANTE no asignado deniega acceso (BOLA)")
    void buscarPorId_ComoEstudianteNoAsignado_DeniegaAcceso() {
        Usuario estudiante = new Usuario();
        estudiante.setId(55L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(estudiante);
        when(asignacionProyectoComunitarioRepository
                .existsByProyectoComunitarioIdAndProcesoVinculacionEstudianteId(10L, 55L))
                .thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> proyectoComunitarioService.buscarPorId(10L));
    }

    @Test
    @DisplayName("actualizarProyecto - Preserva ruta fisica si el cliente reenvia URL de preview")
    void actualizarProyecto_ConUrlPreview_PreservaRutaFisica() {
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/real.pdf");
        proyectoMock.setNombreDocumento("Convenio.pdf");

        ProyectoComunitarioActualizarDto peticion = new ProyectoComunitarioActualizarDto(
                "Alfabetización Digital",
                "Nueva Desc",
                1,
                null,
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 3, 31),
                "/proyectos-comunitarios/10/preview",
                ""
        );

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraIdAndIdNot("Alfabetización Digital", 1, 10L))
                .thenReturn(false);
        doAnswer(inv -> {
            ProyectoComunitarioActualizarDto d = inv.getArgument(0);
            ProyectoComunitario p = inv.getArgument(1);
            p.setUrlDocumento(d.urlDocumento());
            p.setNombreDocumento(d.nombreDocumento());
            return null;
        }).when(proyectoComunitarioMapeador).actualizarEntidadDesdeDto(peticion, proyectoMock);
        when(proyectoComunitarioRepository.save(proyectoMock)).thenReturn(proyectoMock);
        when(proyectoComunitarioMapeador.aDto(proyectoMock)).thenReturn(proyectoDtoMock);

        ProyectoComunitarioDto resultado = proyectoComunitarioService.actualizarProyecto(10L, peticion);

        assertEquals("/archivos_subidos/vinculacion/real.pdf", proyectoMock.getUrlDocumento());
        assertEquals("Convenio.pdf", proyectoMock.getNombreDocumento());
        assertEquals("/proyectos-comunitarios/10/preview", resultado.urlDocumento());
    }

    @Test
    @DisplayName("actualizarProyecto - Limpia documento si el cliente envia urlDocumento vacia")
    void actualizarProyecto_ConUrlVacia_LimpiaDocumento() {
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/real.pdf");
        proyectoMock.setNombreDocumento("Convenio.pdf");

        ProyectoComunitarioActualizarDto peticion = new ProyectoComunitarioActualizarDto(
                "Alfabetización Digital",
                "Nueva Desc",
                1,
                null,
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 3, 31),
                "",
                ""
        );

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(carreraRepository.findById(1)).thenReturn(Optional.of(carreraMock));
        when(proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraIdAndIdNot("Alfabetización Digital", 1, 10L))
                .thenReturn(false);
        doAnswer(inv -> {
            ProyectoComunitarioActualizarDto d = inv.getArgument(0);
            ProyectoComunitario p = inv.getArgument(1);
            p.setUrlDocumento(d.urlDocumento());
            p.setNombreDocumento(d.nombreDocumento());
            return null;
        }).when(proyectoComunitarioMapeador).actualizarEntidadDesdeDto(peticion, proyectoMock);
        when(proyectoComunitarioRepository.save(proyectoMock)).thenReturn(proyectoMock);
        when(proyectoComunitarioMapeador.aDto(proyectoMock)).thenReturn(proyectoDtoMock);

        proyectoComunitarioService.actualizarProyecto(10L, peticion);

        assertNull(proyectoMock.getUrlDocumento());
        assertNull(proyectoMock.getNombreDocumento());
    }

    @Test
    @DisplayName("obtenerProyectoDescarga - Lee PDF fisico desde archivos_subidos/vinculacion para SUBDECANO")
    void obtenerProyectoDescarga_Subdecano_RetornaBytes(@TempDir Path tempDir) throws Exception {
        Path carpetaVinculacion = tempDir.resolve("vinculacion");
        Files.createDirectories(carpetaVinculacion);
        byte[] pdfBytes = "%PDF-1.4 contenido proyecto".getBytes();
        Files.write(carpetaVinculacion.resolve("proyecto_41.pdf"), pdfBytes);

        ReflectionTestUtils.setField(proyectoComunitarioService, "rutaBaseAlmacenamiento", tempDir.toString());
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/proyecto_41.pdf");
        proyectoMock.setNombreDocumento("41. Convenio FING-empresa");

        Usuario subdecano = new Usuario();
        subdecano.setId(1L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));

        ArchivoDescargaDto descarga = proyectoComunitarioService.obtenerProyectoDescarga(10L, subdecano);

        assertNotNull(descarga);
        assertArrayEquals(pdfBytes, descarga.contenido());
        assertEquals("41. Convenio FING-empresa.pdf", descarga.nombreArchivo());
        assertEquals("application/pdf", descarga.contentType());
    }

    @Test
    @DisplayName("obtenerProyectoDescarga - Permite descarga a ESTUDIANTE asignado al proyecto")
    void obtenerProyectoDescarga_EstudianteAsignado_RetornaBytes(@TempDir Path tempDir) throws Exception {
        Path carpetaVinculacion = tempDir.resolve("vinculacion");
        Files.createDirectories(carpetaVinculacion);
        byte[] pdfBytes = "%PDF-1.4 estudiante".getBytes();
        Files.write(carpetaVinculacion.resolve("proyecto_est.pdf"), pdfBytes);

        ReflectionTestUtils.setField(proyectoComunitarioService, "rutaBaseAlmacenamiento", tempDir.toString());
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/proyecto_est.pdf");
        proyectoMock.setNombreDocumento("Proyecto_Est.pdf");

        Usuario estudiante = new Usuario();
        estudiante.setId(55L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(asignacionProyectoComunitarioRepository
                .existsByProyectoComunitarioIdAndProcesoVinculacionEstudianteId(10L, 55L))
                .thenReturn(true);

        ArchivoDescargaDto descarga = proyectoComunitarioService.obtenerProyectoDescarga(10L, estudiante);

        assertArrayEquals(pdfBytes, descarga.contenido());
    }

    @Test
    @DisplayName("obtenerProyectoDescarga - Deniega acceso a ESTUDIANTE no asignado (BOLA)")
    void obtenerProyectoDescarga_EstudianteNoAsignado_DeniegaAcceso() {
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/proyecto.pdf");
        Usuario estudiante = new Usuario();
        estudiante.setId(55L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));
        when(asignacionProyectoComunitarioRepository
                .existsByProyectoComunitarioIdAndProcesoVinculacionEstudianteId(10L, 55L))
                .thenReturn(false);

        assertThrows(AccessDeniedException.class,
                () -> proyectoComunitarioService.obtenerProyectoDescarga(10L, estudiante));
    }

    @Test
    @DisplayName("obtenerProyectoDescarga - Deniega acceso a COORDINADOR_PRACTICAS de otra carrera (BOLA)")
    void obtenerProyectoDescarga_CoordinadorOtraCarrera_DeniegaAcceso() {
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/proyecto.pdf");
        Carrera otraCarrera = new Carrera();
        otraCarrera.setId(99);
        Usuario coordinador = new Usuario();
        coordinador.setId(30L);
        coordinador.setRol(RolUsuario.COORDINADOR_PRACTICAS);
        coordinador.setCarrera(otraCarrera);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));

        assertThrows(AccessDeniedException.class,
                () -> proyectoComunitarioService.obtenerProyectoDescarga(10L, coordinador));
    }

    @Test
    @DisplayName("obtenerProyectoDescarga - Lanza RecursoNoEncontradoException si no tiene documento o falta en disco")
    void obtenerProyectoDescarga_SinArchivoFisico_LanzaNotFound(@TempDir Path tempDir) {
        ReflectionTestUtils.setField(proyectoComunitarioService, "rutaBaseAlmacenamiento", tempDir.toString());
        proyectoMock.setUrlDocumento("/archivos_subidos/vinculacion/no_existe.pdf");

        Usuario subdecano = new Usuario();
        subdecano.setId(1L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));

        assertThrows(RecursoNoEncontradoException.class,
                () -> proyectoComunitarioService.obtenerProyectoDescarga(10L, subdecano));
    }

    @Test
    @DisplayName("obtenerProyectoDescarga - Bloquea path traversal con NegocioException")
    void obtenerProyectoDescarga_PathTraversal_LanzaNegocioException(@TempDir Path tempDir) {
        ReflectionTestUtils.setField(proyectoComunitarioService, "rutaBaseAlmacenamiento", tempDir.toString());
        proyectoMock.setUrlDocumento("../../etc/passwd");

        Usuario subdecano = new Usuario();
        subdecano.setId(1L);
        subdecano.setRol(RolUsuario.SUBDECANO);

        when(proyectoComunitarioRepository.findById(10L)).thenReturn(Optional.of(proyectoMock));

        assertThrows(NegocioException.class,
                () -> proyectoComunitarioService.obtenerProyectoDescarga(10L, subdecano));
    }
}
