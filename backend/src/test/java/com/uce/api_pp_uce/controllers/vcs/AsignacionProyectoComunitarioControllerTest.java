package com.uce.api_pp_uce.controllers.vcs;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioMasivoDto;
import com.uce.api_pp_uce.dtos.vcs.EstudianteResumenVcsDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioResumenDto;
import com.uce.api_pp_uce.dtos.vcs.TutorResumenVcsDto;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.vcs.AsignacionProyectoComunitarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AsignacionProyectoComunitarioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AsignacionProyectoComunitarioService asignacionProyectoComunitarioService;

    @InjectMocks
    private AsignacionProyectoComunitarioController asignacionProyectoComunitarioController;

    private ObjectMapper objectMapper;
    private AsignacionProyectoComunitarioDto asignacionDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(asignacionProyectoComunitarioController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();

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
                LocalDate.of(2026, 10, 1),
                null,
                EstadoAsignacionVcs.EN_CURSO,
                FaseActualAsignacion.ASIGNACION,
                false,
                null,
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /asignaciones-proyectos-comunitarios/{id} - Debe retornar 200 OK cuando existe")
    void buscarPorId_Exito() throws Exception {
        when(asignacionProyectoComunitarioService.buscarPorId(1000L)).thenReturn(asignacionDtoMock);

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(1000))
                .andExpect(jsonPath("$.data.nombreCompletoEstudiante").value("Juan Estrella"))
                .andExpect(jsonPath("$.data.nombreProyecto").value("Alfabetización Digital"));
    }

    @Test
    @DisplayName("GET /asignaciones-proyectos-comunitarios/{id} - Debe retornar 404 NOT FOUND cuando no existe")
    void buscarPorId_NoEncontrado() throws Exception {
        when(asignacionProyectoComunitarioService.buscarPorId(999L))
                .thenThrow(new RecursoNoEncontradoException("Asignación no encontrada con ID: 999"));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Asignación no encontrada con ID: 999"));
    }

    @Test
    @DisplayName("buscarPorId - Propaga AccessDeniedException cuando el servicio deniega acceso (403)")
    void buscarPorId_AccesoDenegado() {
        when(asignacionProyectoComunitarioService.buscarPorId(1000L))
                .thenThrow(new AccessDeniedException("No tiene permisos para acceder a esta asignación."));

        assertThrows(AccessDeniedException.class, () ->
                asignacionProyectoComunitarioController.buscarPorId(1000L));
    }

    @Test
    @DisplayName("buscarPorId - Retorna 200 OK cuando el acceso es permitido")
    void buscarPorId_Permitido() {
        when(asignacionProyectoComunitarioService.buscarPorId(1000L)).thenReturn(asignacionDtoMock);

        var respuesta = asignacionProyectoComunitarioController.buscarPorId(1000L);
        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
        assertEquals(1000L, respuesta.getBody().data().id());
    }

    @Test
    @DisplayName("vistaPreviaCertificadoHoras - Propaga AccessDeniedException cuando el servicio deniega acceso (403)")
    void vistaPreviaCertificadoHoras_AccesoDenegado() {
        when(asignacionProyectoComunitarioService.obtenerDescargaCertificadoHoras(eq(1000L), any(), any(), any(), any()))
                .thenThrow(new AccessDeniedException("No tienes permiso para ver el certificado de otro estudiante."));

        assertThrows(AccessDeniedException.class, () ->
                asignacionProyectoComunitarioController.vistaPreviaCertificadoHoras(
                        1000L, "Subdecano", "1700000000", "0999999999", "sub@uce.edu.ec"));
    }

    @Test
    @DisplayName("vistaPreviaCertificadoHoras - Permite acceso exitoso (200)")
    void vistaPreviaCertificadoHoras_Permitido() {
        when(asignacionProyectoComunitarioService.obtenerDescargaCertificadoHoras(eq(1000L), any(), any(), any(), any()))
                .thenReturn(new ArchivoDescargaDto(new byte[]{1, 2, 3}, "Certificado_Test.pdf", "application/pdf"));

        var respuesta = asignacionProyectoComunitarioController.vistaPreviaCertificadoHoras(
                1000L, "Subdecano", "1700000000", "0999999999", "sub@uce.edu.ec");

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertNotNull(respuesta.getBody());
    }

    @Test
    @DisplayName("listarPorEstudiante - Propaga AccessDeniedException cuando el servicio deniega acceso (403)")
    void listarPorEstudiante_AccesoDenegado() {
        when(asignacionProyectoComunitarioService.listarPorEstudiante(999L))
                .thenThrow(new AccessDeniedException("No tienes permiso para consultar asignaciones de otro estudiante."));

        assertThrows(AccessDeniedException.class, () ->
                asignacionProyectoComunitarioController.listarPorEstudiante(999L));
    }

    @Test
    @DisplayName("listarPorTutor - Propaga AccessDeniedException cuando el servicio deniega acceso (403)")
    void listarPorTutor_AccesoDenegado() {
        when(asignacionProyectoComunitarioService.listarPorTutor(999L))
                .thenThrow(new AccessDeniedException("No tienes permiso para consultar asignaciones de otro tutor."));

        assertThrows(AccessDeniedException.class, () ->
                asignacionProyectoComunitarioController.listarPorTutor(999L));
    }

    @Test
    @DisplayName("GET /asignaciones-proyectos-comunitarios - Debe retornar 200 OK con página de asignaciones")
    void buscarConFiltros_Exito() throws Exception {
        when(asignacionProyectoComunitarioService.buscarConFiltros(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(asignacionDtoMock), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios")
                        .param("busqueda", "Juan")
                        .param("carreraId", "1")
                        .param("estado", "EN_CURSO")
                        .param("periodoId", "100")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Asignaciones obtenidas con éxito"))
                .andExpect(jsonPath("$.data.content[0].id").value(1000))
                .andExpect(jsonPath("$.data.content[0].nombreCompletoEstudiante").value("Juan Estrella"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("buscarConFiltros - Delega la consulta con filtros al servicio")
    void buscarConFiltros_DelegaAlServicio() {
        when(asignacionProyectoComunitarioService.buscarConFiltros(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(asignacionDtoMock), PageRequest.of(0, 10), 1));

        asignacionProyectoComunitarioController.buscarConFiltros(
                "Juan", 1, 20L, 50L, null, EstadoAsignacionVcs.EN_CURSO, null, 100L, null, PageRequest.of(0, 10));

        verify(asignacionProyectoComunitarioService).buscarConFiltros(
                eq("Juan"), eq(1), eq(20L), eq(50L), isNull(), eq(EstadoAsignacionVcs.EN_CURSO), isNull(), eq(100L), any());
    }

    @Test
    @DisplayName("GET /asignaciones-proyectos-comunitarios/estudiantes-disponibles - Debe retornar 200 OK con lista de estudiantes")
    void listarEstudiantesDisponibles_Exito() throws Exception {
        EstudianteResumenVcsDto estudiante = new EstudianteResumenVcsDto(50L, "Juan", "Estrella", "1723456789", null, "juan.estrella@uce.edu.ec", null, "Ingeniería en Sistemas", 1, null, 20, 80);
        when(asignacionProyectoComunitarioService.listarEstudiantesDisponibles(1, 100L, "Juan"))
                .thenReturn(List.of(estudiante));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/estudiantes-disponibles")
                        .param("carreraId", "1")
                        .param("periodoId", "100")
                        .param("busqueda", "Juan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Estudiantes disponibles obtenidos con éxito"))
                .andExpect(jsonPath("$.data[0].id").value(50))
                .andExpect(jsonPath("$.data[0].nombres").value("Juan"));
    }

    @Test
    @DisplayName("GET /asignaciones-proyectos-comunitarios/proyectos-disponibles - Debe retornar 200 OK con lista de proyectos")
    void listarProyectosDisponibles_Exito() throws Exception {
        ProyectoComunitarioResumenDto proyecto = new ProyectoComunitarioResumenDto(10L, "Alfabetización Digital", "Capacitación", 1, "Ingeniería en Sistemas", 50L, "Jaime Salvador", EstadoProyecto.ACTIVO);
        when(asignacionProyectoComunitarioService.listarProyectosDisponibles(1, 100L, "Alfa"))
                .thenReturn(List.of(proyecto));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/proyectos-disponibles")
                        .param("carreraId", "1")
                        .param("periodoId", "100")
                        .param("busqueda", "Alfa"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Proyectos disponibles obtenidos con éxito"))
                .andExpect(jsonPath("$.data[0].id").value(10))
                .andExpect(jsonPath("$.data[0].nombre").value("Alfabetización Digital"));
    }

    @Test
    @DisplayName("GET /asignaciones-proyectos-comunitarios/tutores-disponibles - Debe retornar 200 OK con lista de tutores")
    void listarTutoresDisponibles_Exito() throws Exception {
        TutorResumenVcsDto tutor = new TutorResumenVcsDto(20L, "Carlos", "Pérez", "1712345678", "carlos.perez@uce.edu.ec", 1, "Ingeniería en Sistemas", 0, List.of(), List.of());
        when(asignacionProyectoComunitarioService.listarTutoresDisponibles(1, 100L, "Carlos", 10L, "CON_ASIGNACIONES"))
                .thenReturn(List.of(tutor));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/tutores-disponibles")
                        .param("carreraId", "1")
                        .param("periodoId", "100")
                        .param("busqueda", "Carlos")
                        .param("proyectoId", "10")
                        .param("conAsignaciones", "CON_ASIGNACIONES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Tutores disponibles obtenidos con éxito"))
                .andExpect(jsonPath("$.data[0].id").value(20))
                .andExpect(jsonPath("$.data[0].nombres").value("Carlos"));
    }

    @Test
    @DisplayName("POST /asignaciones-proyectos-comunitarios - Debe retornar 201 CREATED al crear asignaciones exitosamente")
    void crearAsignacion_Exito() throws Exception {
        AsignacionProyectoComunitarioMasivoDto peticion = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L),
                10L,
                80,
                1,
                100L
        );

        when(asignacionProyectoComunitarioService.asignarEstudiantesMasivo(any(AsignacionProyectoComunitarioMasivoDto.class)))
                .thenReturn(List.of(asignacionDtoMock));

        mockMvc.perform(post("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Asignación creada con éxito"))
                .andExpect(jsonPath("$.data[0].id").value(1000));
    }

    @Test
    @DisplayName("POST /asignaciones-proyectos-comunitarios - Debe retornar 400 BAD REQUEST si fallan validaciones (@Valid)")
    void crearAsignacion_ErrorValidacion() throws Exception {
        String jsonInvalido = """
                {
                    "estudiantesId": [],
                    "proyectoComunitarioId": null,
                    "horasAsignadas": -10,
                    "carreraId": 1,
                    "periodoAcademicoId": 100
                }
                """;

        mockMvc.perform(post("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.estudiantesId").exists())
                .andExpect(jsonPath("$.data.proyectoComunitarioId").exists())
                .andExpect(jsonPath("$.data.horasAsignadas").exists());
    }

    @Test
    @DisplayName("POST /asignaciones-proyectos-comunitarios - Debe retornar 400 BAD REQUEST cuando horasAsignadas excede 160h")
    void crearAsignacion_ErrorHorasExcedenLimite() throws Exception {
        String jsonExcesivo = """
                {
                    "estudiantesId": [1],
                    "proyectoComunitarioId": 10,
                    "horasAsignadas": 161,
                    "carreraId": 1,
                    "periodoAcademicoId": 100
                }
                """;

        mockMvc.perform(post("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonExcesivo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.horasAsignadas").exists());
    }

    @Test
    @DisplayName("POST /asignaciones-proyectos-comunitarios - Debe retornar 400 BAD REQUEST ante NegocioException")
    void crearAsignacion_ErrorNegocio() throws Exception {
        AsignacionProyectoComunitarioMasivoDto peticion = new AsignacionProyectoComunitarioMasivoDto(
                List.of(50L),
                10L,
                80,
                1,
                100L
        );

        when(asignacionProyectoComunitarioService.asignarEstudiantesMasivo(any(AsignacionProyectoComunitarioMasivoDto.class)))
                .thenThrow(new NegocioException("El periodo académico no está activo"));

        mockMvc.perform(post("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("El periodo académico no está activo"));
    }

    @Test
    @DisplayName("PUT /asignaciones-proyectos-comunitarios/{id} - Debe retornar 200 OK al actualizar")
    void actualizarAsignacion_Exito() throws Exception {
        AsignacionProyectoComunitarioActualizarDto peticion = new AsignacionProyectoComunitarioActualizarDto(11L, 100);

        when(asignacionProyectoComunitarioService.actualizarAsignacion(eq(1000L), any(AsignacionProyectoComunitarioActualizarDto.class)))
                .thenReturn(asignacionDtoMock);

        mockMvc.perform(put("/asignaciones-proyectos-comunitarios/1000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Asignación actualizada con éxito"));
    }

    @Test
    @DisplayName("PUT /asignaciones-proyectos-comunitarios/{id} - Debe retornar 400 BAD REQUEST si fallan validaciones (@Valid)")
    void actualizarAsignacion_ErrorValidacion() throws Exception {
        String jsonInvalido = """
                {
                    "proyectoComunitarioId": null,
                    "horasAsignadas": 0
                }
                """;

        mockMvc.perform(put("/asignaciones-proyectos-comunitarios/1000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.proyectoComunitarioId").exists())
                .andExpect(jsonPath("$.data.horasAsignadas").exists());
    }

    @Test
    @DisplayName("PUT /asignaciones-proyectos-comunitarios/{id} - Debe retornar 400 BAD REQUEST cuando horasAsignadas excede 160h")
    void actualizarAsignacion_ErrorHorasExcedenLimite() throws Exception {
        String jsonExcesivo = """
                {
                    "proyectoComunitarioId": 10,
                    "horasAsignadas": 165
                }
                """;

        mockMvc.perform(put("/asignaciones-proyectos-comunitarios/1000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonExcesivo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.horasAsignadas").exists());
    }

    @Test
    @DisplayName("DELETE /asignaciones-proyectos-comunitarios/{id} - Debe retornar 200 OK al eliminar")
    void eliminarAsignacion_Exito() throws Exception {
        doNothing().when(asignacionProyectoComunitarioService).eliminarAsignacion(1000L);

        mockMvc.perform(delete("/asignaciones-proyectos-comunitarios/1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Asignación eliminada con éxito"));
    }

    @Test
    @DisplayName("DELETE /asignaciones-proyectos-comunitarios/{id} - Debe retornar 404 NOT FOUND si no existe")
    void eliminarAsignacion_NoEncontrado() throws Exception {
        doThrow(new RecursoNoEncontradoException("Asignación no encontrada con ID: 999"))
                .when(asignacionProyectoComunitarioService).eliminarAsignacion(999L);

        mockMvc.perform(delete("/asignaciones-proyectos-comunitarios/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Asignación no encontrada con ID: 999"));
    }

    @Test
    @DisplayName("PUT /asignaciones-proyectos-comunitarios/tutores/{tutorId}/proyectos - Debe retornar 200 OK al asociar")
    void asociarProyectosATutor_Exito() throws Exception {
        doNothing().when(asignacionProyectoComunitarioService).asociarProyectosATutor(eq(20L), any());

        mockMvc.perform(put("/asignaciones-proyectos-comunitarios/tutores/20/proyectos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(10L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Proyectos asociados al tutor académico con éxito"));
    }

    @Test
    @DisplayName("PATCH /asignaciones-proyectos-comunitarios/{id}/enviar-subdecanato - Debe retornar 200 OK")
    void enviarASubdecanato_Exito() throws Exception {
        when(asignacionProyectoComunitarioService.enviarASubdecanato(1000L)).thenReturn(asignacionDtoMock);

        mockMvc.perform(patch("/asignaciones-proyectos-comunitarios/1000/enviar-subdecanato"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Documentos validados y enviados a Subdecanato con éxito"));
    }
}
