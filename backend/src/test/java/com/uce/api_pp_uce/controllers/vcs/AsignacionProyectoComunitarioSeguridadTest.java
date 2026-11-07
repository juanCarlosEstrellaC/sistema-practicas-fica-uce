package com.uce.api_pp_uce.controllers.vcs;

import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioDto;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.services.vcs.AsignacionProyectoComunitarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.security.DetallesUsuarioImpl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
public class AsignacionProyectoComunitarioSeguridadTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private AsignacionProyectoComunitarioService asignacionProyectoComunitarioService;

    private AsignacionProyectoComunitarioDto dtoPrueba;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        dtoPrueba = new AsignacionProyectoComunitarioDto(
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
    @DisplayName("Seguridad - Usuario con rol ESTUDIANTE puede consultar asignaciones VCS (200 OK)")
    @WithMockUser(roles = "ESTUDIANTE")
    void buscarConFiltros_PermitidoParaEstudiante() throws Exception {
        when(asignacionProyectoComunitarioService.buscarConFiltros(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(dtoPrueba), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(1000L))
                .andExpect(jsonPath("$.data.content[0].nombreCompletoEstudiante").value("Juan Estrella"));
    }

    @Test
    @DisplayName("Seguridad - Usuario con rol ESTUDIANTE no autorizado para crear asignaciones responde 403 FORBIDDEN con RespuestaApi")
    @WithMockUser(roles = "ESTUDIANTE")
    void crearAsignacion_DenegadoParaEstudiante_Responde403ConRespuestaApi() throws Exception {
        String jsonCreacion = """
                {
                    "estudiantesId": [50],
                    "proyectoComunitarioId": 10,
                    "horasAsignadas": 80,
                    "carreraId": 1,
                    "periodoAcademicoId": 100
                }
                """;

        mockMvc.perform(post("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCreacion))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a este recurso."));
    }

    @Test
    @DisplayName("Seguridad - Usuario con rol DIRECTOR_CARRERA no autorizado para crear asignaciones responde 403 FORBIDDEN")
    @WithMockUser(roles = "DIRECTOR_CARRERA")
    void crearAsignacion_DenegadoParaDirectorCarrera_Responde403() throws Exception {
        String jsonCreacion = """
                {
                    "estudiantesId": [50],
                    "proyectoComunitarioId": 10,
                    "horasAsignadas": 80,
                    "carreraId": 1,
                    "periodoAcademicoId": 100
                }
                """;

        mockMvc.perform(post("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCreacion))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false));
    }

    @Test
    @DisplayName("Seguridad - Usuario con rol COORDINADOR_PRACTICAS puede crear asignaciones (201 CREATED)")
    @WithMockUser(roles = "COORDINADOR_PRACTICAS")
    void crearAsignacion_PermitidoParaCoordinadorPracticas_Responde201() throws Exception {
        String jsonCreacion = """
                {
                    "estudiantesId": [50],
                    "proyectoComunitarioId": 10,
                    "horasAsignadas": 80,
                    "carreraId": 1,
                    "periodoAcademicoId": 100
                }
                """;

        when(asignacionProyectoComunitarioService.asignarEstudiantesMasivo(any()))
                .thenReturn(List.of(dtoPrueba));

        mockMvc.perform(post("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCreacion))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true));
    }

    @Test
    @DisplayName("Seguridad - Solicitud sin autenticación es rechazada por Spring Security (403 FORBIDDEN)")
    void buscarConFiltros_SinAutenticacion_Responde403() throws Exception {
        mockMvc.perform(get("/asignaciones-proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Seguridad - Estudiante autenticado consulta /asignaciones-proyectos-comunitarios y delega al servicio")
    void buscarConFiltros_EstudianteAutenticado_AislaDatosEstudiante() throws Exception {
        Usuario estudiante = new Usuario();
        estudiante.setId(50L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(estudiante);

        when(asignacionProyectoComunitarioService.buscarConFiltros(any(), any(), any(), eq(999L), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(dtoPrueba), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios")
                        .with(user(detalles))
                        .param("estudianteId", "999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true));

        verify(asignacionProyectoComunitarioService).buscarConFiltros(
                isNull(), isNull(), isNull(), eq(999L), isNull(), isNull(), isNull(), isNull(), any());
    }

    @Test
    @DisplayName("Seguridad - Estudiante autenticado no puede consultar asignación ajena por ID (403 FORBIDDEN)")
    void buscarPorId_EstudianteIntentaAccederAsignacionAjena_Responde403() throws Exception {
        Usuario estudiante = new Usuario();
        estudiante.setId(99L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(estudiante);

        when(asignacionProyectoComunitarioService.buscarPorId(1000L))
                .thenThrow(new org.springframework.security.access.AccessDeniedException("No tiene permisos para acceder a esta asignación."));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/1000")
                        .with(user(detalles))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a esta asignación."));
    }

    @Test
    @DisplayName("Seguridad - Estudiante autenticado no puede consultar asignaciones de otro estudiante en /estudiante/{id} (403)")
    void listarPorEstudiante_EstudianteIntentaConsultarOtroEstudiante_Responde403() throws Exception {
        Usuario estudiante = new Usuario();
        estudiante.setId(50L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(estudiante);

        when(asignacionProyectoComunitarioService.listarPorEstudiante(999L))
                .thenThrow(new org.springframework.security.access.AccessDeniedException("No tienes permiso para consultar asignaciones de otro estudiante."));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/estudiante/999")
                        .with(user(detalles))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tienes permiso para consultar asignaciones de otro estudiante."));
    }

    @Test
    @DisplayName("Seguridad - Parámetro de solicitud incompatible responde 400 BAD REQUEST, nunca 500")
    @WithMockUser(roles = "ESTUDIANTE")
    void buscarConFiltros_ParametroIncompatible_Responde400() throws Exception {
        mockMvc.perform(get("/asignaciones-proyectos-comunitarios")
                        .param("carreraId", "no-es-un-numero")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("El parámetro 'carreraId' tiene un valor incompatible: no-es-un-numero"));
    }

    @Test
    @DisplayName("Seguridad - Estudiante autenticado no puede ver certificado de otro estudiante (403 FORBIDDEN)")
    void vistaPreviaCertificadoHoras_EstudianteAjeno_Responde403() throws Exception {
        Usuario estudiante = new Usuario();
        estudiante.setId(99L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(estudiante);

        when(asignacionProyectoComunitarioService.obtenerDescargaCertificadoHoras(eq(1000L), any(), any(), any(), any()))
                .thenThrow(new org.springframework.security.access.AccessDeniedException("No tienes permiso para ver el certificado de otro estudiante."));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/1000/certificado-horas/preview")
                        .with(user(detalles)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tienes permiso para ver el certificado de otro estudiante."));
    }

    @Test
    @DisplayName("Seguridad - Tutor autenticado no puede ver certificado de asignación de otro tutor (403 FORBIDDEN)")
    void vistaPreviaCertificadoHoras_TutorAjeno_Responde403() throws Exception {
        Usuario tutor = new Usuario();
        tutor.setId(99L);
        tutor.setRol(RolUsuario.TUTOR_ACADEMICO);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(tutor);

        when(asignacionProyectoComunitarioService.obtenerDescargaCertificadoHoras(eq(1000L), any(), any(), any(), any()))
                .thenThrow(new org.springframework.security.access.AccessDeniedException("No tienes permiso para ver el certificado de una asignación que no está a su cargo."));

        mockMvc.perform(get("/asignaciones-proyectos-comunitarios/1000/certificado-horas/preview")
                        .with(user(detalles)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tienes permiso para ver el certificado de una asignación que no está a su cargo."));
    }
}
