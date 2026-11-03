package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.ProyectoComunitarioMapeador;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.services.vcs.impl.ProyectoComunitarioServiceImpl;
import com.uce.api_pp_uce.services.NotificacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProyectoComunitarioServiceTest {

    @Mock
    private ProyectoComunitarioRepository proyectoComunitarioRepository;

    @Mock
    private CarreraRepository carreraRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;

    @Mock
    private ProyectoComunitarioMapeador proyectoComunitarioMapeador;

    @Mock
    private NotificacionService notificacionService;

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
}
