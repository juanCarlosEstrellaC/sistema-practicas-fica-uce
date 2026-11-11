package com.uce.api_pp_uce.controllers.vcs;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.security.DetallesUsuarioImpl;
import com.uce.api_pp_uce.services.vcs.ProyectoComunitarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
public class ProyectoComunitarioSeguridadTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private ProyectoComunitarioService proyectoComunitarioService;

    private ProyectoComunitarioDto dtoPrueba;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        dtoPrueba = new ProyectoComunitarioDto(
                10L,
                "Alfabetización Digital",
                "Capacitación comunitaria",
                1,
                "Ingeniería en Computación",
                20L,
                "Jaime Salvador",
                "jsalvador@uce.edu.ec",
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 2, 28),
                LocalDate.of(2026, 7, 30),
                "/proyectos-comunitarios/10/preview",
                "proyecto.pdf",
                LocalDateTime.now(),
                true
        );
    }

    @Test
    @DisplayName("Seguridad - Solicitud sin autenticacion a /preview responde 403 FORBIDDEN")
    void previsualizarDocumento_SinAutenticacion_Responde403() throws Exception {
        mockMvc.perform(get("/proyectos-comunitarios/10/preview"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Seguridad (BFLA) - ESTUDIANTE no puede listar catalogo global de proyectos (403 FORBIDDEN)")
    @WithMockUser(roles = "ESTUDIANTE")
    void listarProyectos_DenegadoParaEstudiante_Responde403() throws Exception {
        mockMvc.perform(get("/proyectos-comunitarios"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a este recurso."));
    }

    @Test
    @DisplayName("Seguridad (BFLA) - COORDINADOR_PRACTICAS no puede crear ni eliminar proyectos (403 FORBIDDEN)")
    @WithMockUser(roles = "COORDINADOR_PRACTICAS")
    void crearYEliminarProyecto_DenegadoParaCoordinador_Responde403() throws Exception {
        String jsonCreacion = """
                {
                    "nombre": "Proyecto Prueba",
                    "carreraId": 1
                }
                """;

        mockMvc.perform(post("/proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCreacion))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false));

        mockMvc.perform(delete("/proyectos-comunitarios/10"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false));
    }

    @Test
    @DisplayName("Seguridad (BFLA) - SUBDECANO puede crear proyectos (201 CREATED)")
    @WithMockUser(roles = "SUBDECANO")
    void crearProyecto_PermitidoParaSubdecano_Responde201() throws Exception {
        String jsonCreacion = """
                {
                    "nombre": "Proyecto Prueba",
                    "carreraId": 1
                }
                """;

        when(proyectoComunitarioService.crearProyecto(any())).thenReturn(dtoPrueba);

        mockMvc.perform(post("/proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCreacion))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true));
    }

    @Test
    @DisplayName("Seguridad (BOLA) - ESTUDIANTE asignado puede previsualizar PDF del proyecto (200 OK)")
    void previsualizarDocumento_EstudianteAsignado_Responde200() throws Exception {
        Usuario estudiante = new Usuario();
        estudiante.setId(50L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(estudiante);

        byte[] pdfBytes = "%PDF-1.4 demo".getBytes();
        when(proyectoComunitarioService.obtenerProyectoDescarga(10L))
                .thenReturn(new ArchivoDescargaDto(pdfBytes, "proyecto.pdf", "application/pdf"));

        mockMvc.perform(get("/proyectos-comunitarios/10/preview")
                        .with(user(detalles)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("Seguridad (BOLA) - ESTUDIANTE no asignado recibe 403 FORBIDDEN con RespuestaApi al previsualizar PDF")
    void previsualizarDocumento_EstudianteAjeno_Responde403() throws Exception {
        Usuario estudiante = new Usuario();
        estudiante.setId(99L);
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(estudiante);

        when(proyectoComunitarioService.obtenerProyectoDescarga(10L))
                .thenThrow(new AccessDeniedException("No tiene permisos para acceder a un proyecto al que no está asignado."));

        mockMvc.perform(get("/proyectos-comunitarios/10/preview")
                        .with(user(detalles)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a un proyecto al que no está asignado."));
    }

    @Test
    @DisplayName("Seguridad (BOLA) - TUTOR_ACADEMICO ajeno recibe 403 FORBIDDEN al descargar PDF")
    void descargarDocumento_TutorAjeno_Responde403() throws Exception {
        Usuario tutor = new Usuario();
        tutor.setId(88L);
        tutor.setRol(RolUsuario.TUTOR_ACADEMICO);
        DetallesUsuarioImpl detalles = new DetallesUsuarioImpl(tutor);

        when(proyectoComunitarioService.obtenerProyectoDescarga(10L))
                .thenThrow(new AccessDeniedException("No tiene permisos para acceder a proyectos donde no es el tutor asignado."));

        mockMvc.perform(get("/proyectos-comunitarios/10/descargar")
                        .with(user(detalles)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a proyectos donde no es el tutor asignado."));
    }
}

