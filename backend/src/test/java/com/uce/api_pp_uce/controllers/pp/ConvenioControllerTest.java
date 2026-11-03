package com.uce.api_pp_uce.controllers.pp;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.pp.ConvenioDto;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.pp.ConvenioService;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ConvenioControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ConvenioService convenioService;

    @InjectMocks
    private ConvenioController convenioController;

    private ObjectMapper objectMapper;
    private ConvenioDto convenioDtoMock;
    private NuevoConvenioDto nuevoConvenioDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(convenioController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();

        convenioDtoMock = new ConvenioDto(
                1L,
                "Ministerio de Telecomunicaciones",
                TipoConvenio.PUBLICO,
                new BigDecimal("10.5"),
                "Av. 6 de Diciembre y Colón",
                LocalDate.now(),
                LocalDate.now().plusMonths(12),
                EstadoConvenio.ACTIVO,
                10,
                "Ing. Roberto Gomez",
                "roberto.gomez@mintel.gob.ec",
                "0991234567",
                "/archivos_subidos/convenios/mintel.pdf",
                "Convenio_MINTEL.pdf",
                2
        );

        nuevoConvenioDtoMock = new NuevoConvenioDto(
                "Ministerio de Telecomunicaciones",
                TipoConvenio.PUBLICO,
                new BigDecimal("10.5"),
                "Av. 6 de Diciembre y Colón",
                LocalDate.now(),
                LocalDate.now().plusMonths(12),
                "Ing. Roberto Gomez",
                "roberto.gomez@mintel.gob.ec",
                "0991234567",
                10,
                "/archivos_subidos/convenios/mintel.pdf",
                "Convenio_MINTEL.pdf",
                EstadoConvenio.ACTIVO
        );
    }

    @Test
    @DisplayName("GET /convenios/{id} - Debe retornar 200 OK cuando el convenio existe (Caso Feliz)")
    void obtenerConvenio_Exitoso() throws Exception {
        when(convenioService.buscarPorId(1L)).thenReturn(convenioDtoMock);

        mockMvc.perform(get("/convenios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.institucion").value("Ministerio de Telecomunicaciones"))
                .andExpect(jsonPath("$.data.cuposDisponibles").value(10))
                .andExpect(jsonPath("$.data.ocupados").value(2));
    }

    @Test
    @DisplayName("GET /convenios/{id} - Debe retornar 404 NOT FOUND cuando el convenio no existe (Caso Limite)")
    void obtenerConvenio_NoEncontrado() throws Exception {
        when(convenioService.buscarPorId(999L))
                .thenThrow(new RecursoNoEncontradoException("Convenio no encontrado con ID: 999"));

        mockMvc.perform(get("/convenios/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Convenio no encontrado con ID: 999"));
    }

    @Test
    @DisplayName("GET /convenios - Debe retornar 200 OK con pagina de convenios (Caso Feliz)")
    void listarConvenios_Exitoso() throws Exception {
        when(convenioService.buscarConFiltros(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(convenioDtoMock), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/convenios")
                        .param("search", "Mintel")
                        .param("estado", "ACTIVO")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.content[0].institucion").value("Ministerio de Telecomunicaciones"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("POST /convenios - Debe retornar 201 CREATED con convenio creado (Caso Feliz)")
    void crearConvenio_Exitoso() throws Exception {
        when(convenioService.crearConvenio(any(NuevoConvenioDto.class))).thenReturn(convenioDtoMock);

        mockMvc.perform(post("/convenios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevoConvenioDtoMock)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.mensaje").value("Convenio creado con éxito"));
    }

    @Test
    @DisplayName("POST /convenios - Debe retornar 400 BAD REQUEST si fallan validaciones Bean Validation (Caso Limite)")
    void crearConvenio_ValidacionFallida() throws Exception {
        // Enviar institucion vacia y cupos negativos
        String jsonInvalido = """
                {
                    "institucion": "",
                    "cuposDisponibles": -3,
                    "tutorInstitucional": ""
                }
                """;

        mockMvc.perform(post("/convenios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.institucion").exists())
                .andExpect(jsonPath("$.data.cuposDisponibles").exists());
    }

    @Test
    @DisplayName("PUT /convenios/{id} - Debe retornar 200 OK con convenio actualizado (Caso Feliz)")
    void actualizarConvenio_Exitoso() throws Exception {
        when(convenioService.actualizarConvenio(eq(1L), any(NuevoConvenioDto.class))).thenReturn(convenioDtoMock);

        mockMvc.perform(put("/convenios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevoConvenioDtoMock)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Convenio actualizado con éxito"));
    }

    @Test
    @DisplayName("DELETE /convenios/{id} - Debe retornar 200 OK al eliminar convenio (Caso Feliz)")
    void eliminarConvenio_Exitoso() throws Exception {
        doNothing().when(convenioService).eliminarConvenio(1L);

        mockMvc.perform(delete("/convenios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Convenio eliminado con éxito"));
    }
}
