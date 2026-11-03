package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.dtos.pp.MetricasDashboardDto;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.services.pp.MetricasService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MetricasControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MetricasService metricasService;

    @InjectMocks
    private MetricasController metricasController;

    private MetricasDashboardDto metricasDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(metricasController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .build();

        metricasDtoMock = new MetricasDashboardDto(
                100L,
                80L,
                50L,
                30L,
                15L,
                2L,
                1L,
                10L,
                0L
        );
    }

    @Test
    @DisplayName("GET /metricas/globales - Debe retornar metricas globales exitosamente")
    void obtenerMetricasGlobales_Exitoso() throws Exception {
        when(metricasService.obtenerMetricasGlobales(1L)).thenReturn(metricasDtoMock);

        mockMvc.perform(get("/metricas/globales")
                        .param("periodoId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Métricas globales obtenidas exitosamente"))
                .andExpect(jsonPath("$.data.totalEstudiantes").value(100))
                .andExpect(jsonPath("$.data.estudiantesAsignados").value(80))
                .andExpect(jsonPath("$.data.totalConvenios").value(15));
    }

    @Test
    @DisplayName("GET /metricas/carrera/{carreraId} - Debe retornar metricas por carrera exitosamente")
    void obtenerMetricasPorCarrera_Exitoso() throws Exception {
        when(metricasService.obtenerMetricasPorCarrera(5, 1L, 10L)).thenReturn(metricasDtoMock);

        mockMvc.perform(get("/metricas/carrera/5")
                        .param("periodoId", "1")
                        .param("tutorId", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Métricas por carrera obtenidas exitosamente"))
                .andExpect(jsonPath("$.data.totalEstudiantes").value(100))
                .andExpect(jsonPath("$.data.estudiantesEnCurso").value(50));
    }
}
