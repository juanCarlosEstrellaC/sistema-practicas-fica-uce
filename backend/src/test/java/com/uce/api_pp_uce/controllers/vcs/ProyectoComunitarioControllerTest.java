package com.uce.api_pp_uce.controllers.vcs;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.vcs.ProyectoComunitarioService;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProyectoComunitarioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProyectoComunitarioService proyectoComunitarioService;

    @InjectMocks
    private ProyectoComunitarioController proyectoComunitarioController;

    private ObjectMapper objectMapper;
    private ProyectoComunitarioDto proyectoDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(proyectoComunitarioController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();

        proyectoDtoMock = new ProyectoComunitarioDto(
                1L,
                "Alfabetización Digital",
                "Capacitación comunitaria",
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
    @DisplayName("GET /proyectos-comunitarios - Debe retornar 200 OK con página de proyectos")
    void listarProyectos_Exito() throws Exception {
        when(proyectoComunitarioService.buscarConFiltros(any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(proyectoDtoMock), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/proyectos-comunitarios")
                        .param("busqueda", "Alfa")
                        .param("carreraId", "1")
                        .param("estado", "ACTIVO")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Proyectos comunitarios obtenidos con éxito"))
                .andExpect(jsonPath("$.data.content[0].id").value(1))
                .andExpect(jsonPath("$.data.content[0].nombre").value("Alfabetización Digital"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /proyectos-comunitarios/{id} - Debe retornar 200 OK cuando existe")
    void obtenerProyecto_Exito() throws Exception {
        when(proyectoComunitarioService.buscarPorId(1L)).thenReturn(proyectoDtoMock);

        mockMvc.perform(get("/proyectos-comunitarios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.nombre").value("Alfabetización Digital"));
    }

    @Test
    @DisplayName("GET /proyectos-comunitarios/{id} - Debe retornar 404 NOT FOUND cuando no existe")
    void obtenerProyecto_NoEncontrado() throws Exception {
        when(proyectoComunitarioService.buscarPorId(99L))
                .thenThrow(new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: 99"));

        mockMvc.perform(get("/proyectos-comunitarios/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Proyecto comunitario no encontrado con ID: 99"));
    }

    @Test
    @DisplayName("POST /proyectos-comunitarios - Debe retornar 201 CREATED al crear exitosamente")
    void crearProyecto_Exito() throws Exception {
        ProyectoComunitarioNuevoDto peticion = new ProyectoComunitarioNuevoDto(
                "Alfabetización Digital",
                "Capacitación comunitaria",
                1,
                null,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                null,
                null
        );

        when(proyectoComunitarioService.crearProyecto(any(ProyectoComunitarioNuevoDto.class)))
                .thenReturn(proyectoDtoMock);

        mockMvc.perform(post("/proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Proyecto comunitario creado con éxito"))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("POST /proyectos-comunitarios - Debe retornar 400 BAD REQUEST si fallan las validaciones (@Valid)")
    void crearProyecto_ErrorValidacion() throws Exception {
        String jsonInvalido = """
                {
                    "nombre": "",
                    "descripcion": "Descripcion",
                    "carreraId": null,
                    "fechaInicio": "2026-10-01",
                    "fechaFin": "2027-02-28"
                }
                """;

        mockMvc.perform(post("/proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.nombre").exists())
                .andExpect(jsonPath("$.data.carreraId").exists());
    }

    @Test
    @DisplayName("POST /proyectos-comunitarios - Debe retornar 400 BAD REQUEST si hay error de negocio")
    void crearProyecto_ErrorNegocio() throws Exception {
        ProyectoComunitarioNuevoDto peticion = new ProyectoComunitarioNuevoDto(
                "Alfabetización Digital",
                "Capacitación comunitaria",
                1,
                null,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 2, 28),
                null,
                null
        );

        when(proyectoComunitarioService.crearProyecto(any(ProyectoComunitarioNuevoDto.class)))
                .thenThrow(new NegocioException("Ya existe un proyecto comunitario con ese nombre en esta carrera."));

        mockMvc.perform(post("/proyectos-comunitarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Ya existe un proyecto comunitario con ese nombre en esta carrera."));
    }

    @Test
    @DisplayName("PUT /proyectos-comunitarios/{id} - Debe retornar 200 OK al actualizar")
    void actualizarProyecto_Exito() throws Exception {
        ProyectoComunitarioActualizarDto peticion = new ProyectoComunitarioActualizarDto(
                "Alfabetización Digital Modificado",
                "Nueva descripcion",
                1,
                null,
                EstadoProyecto.ACTIVO,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2027, 3, 31),
                null,
                null
        );

        when(proyectoComunitarioService.actualizarProyecto(eq(1L), any(ProyectoComunitarioActualizarDto.class)))
                .thenReturn(proyectoDtoMock);

        mockMvc.perform(put("/proyectos-comunitarios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Proyecto comunitario actualizado con éxito"));
    }

    @Test
    @DisplayName("DELETE /proyectos-comunitarios/{id} - Debe retornar 200 OK al eliminar")
    void eliminarProyecto_Exito() throws Exception {
        doNothing().when(proyectoComunitarioService).eliminarProyecto(1L);

        mockMvc.perform(delete("/proyectos-comunitarios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Proyecto comunitario eliminado con éxito"));
    }

    @Test
    @DisplayName("DELETE /proyectos-comunitarios/{id} - Debe retornar 404 NOT FOUND si no existe")
    void eliminarProyecto_NoEncontrado() throws Exception {
        doThrow(new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: 99"))
                .when(proyectoComunitarioService).eliminarProyecto(99L);

        mockMvc.perform(delete("/proyectos-comunitarios/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Proyecto comunitario no encontrado con ID: 99"));
    }

    @Test
    @DisplayName("GET /proyectos-comunitarios/{id}/preview - Debe previsualizar PDF inline")
    void previsualizarDocumento_Exito() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 proyecto".getBytes();
        when(proyectoComunitarioService.obtenerProyectoDescarga(1L))
                .thenReturn(new ArchivoDescargaDto(pdfBytes, "Proyecto_VCS.pdf", "application/pdf"));

        mockMvc.perform(get("/proyectos-comunitarios/1/preview"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Proyecto_VCS.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("GET /proyectos-comunitarios/{id}/preview - Soporta nombres de archivo con tildes")
    void previsualizarDocumento_NombreConTildes_Exito() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 proyecto".getBytes();
        when(proyectoComunitarioService.obtenerProyectoDescarga(1L))
                .thenReturn(new ArchivoDescargaDto(pdfBytes, "Alfabetización_Digital.pdf", "application/pdf"));

        mockMvc.perform(get("/proyectos-comunitarios/1/preview"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("inline")))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("GET /proyectos-comunitarios/{id}/descargar - Debe descargar PDF como attachment")
    void descargarDocumento_Exito() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 proyecto".getBytes();
        when(proyectoComunitarioService.obtenerProyectoDescarga(1L))
                .thenReturn(new ArchivoDescargaDto(pdfBytes, "Proyecto_VCS.pdf", "application/pdf"));

        mockMvc.perform(get("/proyectos-comunitarios/1/descargar"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Proyecto_VCS.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("GET /proyectos-comunitarios/{id}/preview - Retorna 404 si no existe o no tiene documento")
    void previsualizarDocumento_NoEncontrado() throws Exception {
        when(proyectoComunitarioService.obtenerProyectoDescarga(99L))
                .thenThrow(new RecursoNoEncontradoException("El proyecto comunitario no tiene un documento asociado"));

        mockMvc.perform(get("/proyectos-comunitarios/99/preview"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("El proyecto comunitario no tiene un documento asociado"));
    }

    @Test
    @DisplayName("GET /proyectos-comunitarios/{id}/preview - Retorna 403 si falla validacion BOLA")
    void previsualizarDocumento_AccesoDenegado() throws Exception {
        when(proyectoComunitarioService.obtenerProyectoDescarga(1L))
                .thenThrow(new AccessDeniedException("No tiene permisos para acceder a proyectos de otra carrera."));

        mockMvc.perform(get("/proyectos-comunitarios/1/preview"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a proyectos de otra carrera."));
    }
}
