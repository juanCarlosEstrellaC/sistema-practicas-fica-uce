package com.uce.api_pp_uce.controllers.pp;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.dtos.pp.NuevaObservacionDto;
import com.uce.api_pp_uce.dtos.pp.ObservacionDto;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.pp.ObservacionService;
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

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ObservacionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ObservacionService observacionService;

    @InjectMocks
    private ObservacionController observacionController;

    private ObjectMapper objectMapper;
    private ObservacionDto observacionDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(observacionController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();

        UsuarioResumenDto resumenMock = new UsuarioResumenDto(
                10L,
                "Juan",
                "Perez",
                "1711111111",
                TipoIdentificacionUsuario.CEDULA,
                "juan@uce.edu.ec",
                "0999999999",
                "Computacion",
                1,
                null
        );

        observacionDtoMock = new ObservacionDto(
                1L,
                resumenMock,
                10L,
                1,
                "Computacion",
                null,
                "Tech Corp",
                TipoObservacion.NUEVA,
                "0999999999",
                "contacto@techcorp.com",
                "Propuesta de nuevo convenio",
                EstadoObservacion.PENDIENTE,
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("POST /observaciones - Debe registrar observacion exitosamente")
    void sugerir_Exitoso() throws Exception {
        NuevaObservacionDto peticion = new NuevaObservacionDto(
                10L,
                1,
                TipoObservacion.NUEVA,
                "Tech Corp",
                "0999999999",
                "contacto@techcorp.com",
                "Propuesta de nuevo convenio"
        );

        when(observacionService.crearObservacion(any(NuevaObservacionDto.class))).thenReturn(observacionDtoMock);

        mockMvc.perform(post("/observaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Observación enviada"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.empresa").value("Tech Corp"));
    }

    @Test
    @DisplayName("POST /observaciones - Debe retornar 400 Bad Request si fallan validaciones")
    void sugerir_ValidacionFallida() throws Exception {
        NuevaObservacionDto peticionInvalida = new NuevaObservacionDto(
                null,
                1,
                null,
                "Tech Corp",
                "0999999999",
                "contacto@techcorp.com",
                ""
        );

        mockMvc.perform(post("/observaciones")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticionInvalida)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false));
    }

    @Test
    @DisplayName("GET /observaciones - Debe listar observaciones paginadas")
    void listar_Exitoso() throws Exception {
        PageImpl<ObservacionDto> pagina = new PageImpl<>(List.of(observacionDtoMock), PageRequest.of(0, 10), 1);

        when(observacionService.listarTodas(eq(10L), eq(TipoObservacion.NUEVA), eq(EstadoObservacion.PENDIENTE), eq("Tech"), any()))
                .thenReturn(pagina);

        mockMvc.perform(get("/observaciones")
                        .param("remitenteId", "10")
                        .param("tipo", "NUEVA")
                        .param("estado", "PENDIENTE")
                        .param("search", "Tech")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Observaciones obtenidas"))
                .andExpect(jsonPath("$.data.content[0].id").value(1));
    }

    @Test
    @DisplayName("PATCH /observaciones/{id}/estado - Debe actualizar estado exitosamente")
    void procesar_Exitoso() throws Exception {
        ObservacionDto observacionAprobada = new ObservacionDto(
                1L,
                observacionDtoMock.remitente(),
                10L,
                1,
                "Computacion",
                null,
                "Tech Corp",
                TipoObservacion.NUEVA,
                "0999999999",
                "contacto@techcorp.com",
                "Propuesta de nuevo convenio",
                EstadoObservacion.APROBADA,
                LocalDateTime.now()
        );

        when(observacionService.procesarObservacion(eq(1L), eq(EstadoObservacion.APROBADA), any())).thenReturn(observacionAprobada);

        mockMvc.perform(patch("/observaciones/1/estado")
                        .param("estado", "APROBADA")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Observación procesada"))
                .andExpect(jsonPath("$.data.estado").value("APROBADA"));
    }

    @Test
    @DisplayName("PATCH /observaciones/{id}/estado - Debe retornar 404 si la observacion no existe")
    void procesar_NoExiste() throws Exception {
        when(observacionService.procesarObservacion(eq(999L), eq(EstadoObservacion.APROBADA), any()))
                .thenThrow(new RecursoNoEncontradoException("Observacion no encontrada"));

        mockMvc.perform(patch("/observaciones/999/estado")
                        .param("estado", "APROBADA")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Observacion no encontrada"));
    }
}
