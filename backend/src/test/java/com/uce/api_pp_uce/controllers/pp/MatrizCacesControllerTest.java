package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.pp.MatrizCacesDto;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.services.pp.MatrizCacesService;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MatrizCacesControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MatrizCacesService matrizCacesService;

    @InjectMocks
    private MatrizCacesController matrizCacesController;

    private MatrizCacesDto matrizDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(matrizCacesController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        matrizDtoMock = new MatrizCacesDto(
                1L,
                10L,
                1,
                "Computacion",
                "COM",
                EstadoMatrizCaces.PENDIENTE,
                LocalDateTime.now(),
                null,
                null
        );
    }

    @Test
    @DisplayName("GET /matrices-caces/carrera/{carreraId} - Debe listar por carrera")
    void listarPorCarrera_Exitoso() throws Exception {
        PageImpl<MatrizCacesDto> pagina = new PageImpl<>(List.of(matrizDtoMock), PageRequest.of(0, 10), 1);
        when(matrizCacesService.listarPorCarrera(eq(1), any())).thenReturn(pagina);

        mockMvc.perform(get("/matrices-caces/carrera/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(1));
    }

    @Test
    @DisplayName("GET /matrices-caces/periodo/{periodoId} - Debe listar por periodo con filtros")
    void listarPorPeriodo_Exitoso() throws Exception {
        PageImpl<MatrizCacesDto> pagina = new PageImpl<>(List.of(matrizDtoMock), PageRequest.of(0, 10), 1);
        when(matrizCacesService.listarPorPeriodo(eq(10L), eq(EstadoMatrizCaces.PENDIENTE), eq("COM"), any())).thenReturn(pagina);

        mockMvc.perform(get("/matrices-caces/periodo/10")
                        .param("estado", "PENDIENTE")
                        .param("search", "COM")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(1));
    }

    @Test
    @DisplayName("GET /matrices-caces/periodo/{periodoId}/carrera/{carreraId} - Debe obtener matriz especifica")
    void obtenerPorPeriodoYCarrera_Exitoso() throws Exception {
        when(matrizCacesService.obtenerPorPeriodoYCarrera(10L, 1)).thenReturn(matrizDtoMock);

        mockMvc.perform(get("/matrices-caces/periodo/10/carrera/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.carreraNombre").value("Computacion"));
    }

    @Test
    @DisplayName("POST /matrices-caces - Debe registrar o crear matriz")
    void crearOActualizar_Exitoso() throws Exception {
        when(matrizCacesService.crearOActualizar(10L, 1)).thenReturn(matrizDtoMock);

        mockMvc.perform(post("/matrices-caces")
                        .param("periodoAcademicoId", "10")
                        .param("carreraId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("PATCH /matrices-caces/{id}/estado - Debe cambiar estado exitosamente")
    void cambiarEstado_Exitoso() throws Exception {
        MatrizCacesDto matrizAprobada = new MatrizCacesDto(
                1L, 10L, 1, "Computacion", "COM", EstadoMatrizCaces.FIRMADA_POR_SUBDECANO, LocalDateTime.now(), null, "Aprobado"
        );
        when(matrizCacesService.cambiarEstado(1L, EstadoMatrizCaces.FIRMADA_POR_SUBDECANO, "Aprobado")).thenReturn(matrizAprobada);

        mockMvc.perform(patch("/matrices-caces/1/estado")
                        .param("estado", "FIRMADA_POR_SUBDECANO")
                        .param("observacion", "Aprobado")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.estado").value("FIRMADA_POR_SUBDECANO"));
    }

    @Test
    @DisplayName("GET /matrices-caces/{id}/excel - Debe descargar reporte en Excel")
    void descargarExcel_Exitoso() throws Exception {
        byte[] bytesFalsos = new byte[]{1, 2, 3, 4};
        when(matrizCacesService.obtenerDescargaExcel(1L)).thenReturn(new ArchivoDescargaDto(
                bytesFalsos,
                "Matriz CACES - Computacion - Periodo.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ));

        mockMvc.perform(get("/matrices-caces/1/excel"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("Matriz CACES - Computacion - Periodo.xlsx")));
    }

    @Test
    @DisplayName("GET /matrices-caces/{id}/excel - Debe descargar archivo firmado si ya existe")
    void descargarExcel_ConArchivoFirmado_Exitoso() throws Exception {
        byte[] bytesFalsos = new byte[]{1, 2, 3, 4};
        when(matrizCacesService.obtenerDescargaExcel(1L)).thenReturn(new ArchivoDescargaDto(
                bytesFalsos,
                "Matriz CACES - Computacion - Periodo - Firmada por DC.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ));

        mockMvc.perform(get("/matrices-caces/1/excel"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("Matriz CACES - Computacion - Periodo - Firmada por DC.xlsx")));
    }

    @Test
    @DisplayName("PATCH /matrices-caces/{id}/archivo-firmado - Debe subir URL de archivo firmado")
    void subirArchivoFirmado_Exitoso() throws Exception {
        MatrizCacesDto matrizFirmada = new MatrizCacesDto(
                1L, 10L, 1, "Computacion", "COM", EstadoMatrizCaces.PENDIENTE, LocalDateTime.now(), "/archivos/firmado.pdf", null
        );
        when(matrizCacesService.subirArchivoFirmado(1L, "/archivos/firmado.pdf")).thenReturn(matrizFirmada);

        mockMvc.perform(patch("/matrices-caces/1/archivo-firmado")
                        .param("urlArchivo", "/archivos/firmado.pdf")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.archivoFirmadoUrl").value("/archivos/firmado.pdf"));
    }
}
