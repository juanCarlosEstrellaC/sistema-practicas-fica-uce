package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.services.ArchivoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ArchivoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ArchivoService archivoService;

    @InjectMocks
    private ArchivoController archivoController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(archivoController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .build();
    }

    @Test
    @DisplayName("POST /archivos/subir - Debe subir archivo exitosamente con parametro carpeta")
    void subirArchivo_Exitoso() throws Exception {
        MockMultipartFile archivoFalso = new MockMultipartFile(
                "archivo",
                "documento.pdf",
                "application/pdf",
                "contenido de prueba".getBytes()
        );

        when(archivoService.subirArchivo(any(), eq("convenios")))
                .thenReturn("/archivos_subidos/convenios/documento.pdf");

        mockMvc.perform(multipart("/archivos/subir")
                        .file(archivoFalso)
                        .param("carpeta", "convenios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Archivo subido exitosamente"))
                .andExpect(jsonPath("$.data").value("/archivos_subidos/convenios/documento.pdf"));
    }

    @Test
    @DisplayName("POST /archivos/subir/matrices-caces - Debe subir matriz CACES")
    void subirMatrizCaces_Exitoso() throws Exception {
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo",
                "matriz.ods",
                "application/vnd.oasis.opendocument.spreadsheet",
                "ods-data".getBytes()
        );

        when(archivoService.subirArchivo(any(), eq(TipoArchivoSubido.MATRICES_CACES)))
                .thenReturn("/archivos_subidos/matrices_caces/matriz.ods");

        mockMvc.perform(multipart("/archivos/subir/matrices-caces")
                        .file(archivo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Matriz CACES subida exitosamente"))
                .andExpect(jsonPath("$.data").value("/archivos_subidos/matrices_caces/matriz.ods"));
    }

    @Test
    @DisplayName("POST /archivos/subir/cartas-asignacion - Debe subir carta de asignacion")
    void subirCartaAsignacion_Exitoso() throws Exception {
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo",
                "carta.pdf",
                "application/pdf",
                "carta-pdf".getBytes()
        );

        when(archivoService.subirArchivo(any(), eq(TipoArchivoSubido.CARTAS_ASIGNACION)))
                .thenReturn("/archivos_subidos/cartas_asignacion/carta.pdf");

        mockMvc.perform(multipart("/archivos/subir/cartas-asignacion")
                        .file(archivo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Carta de asignacion subida exitosamente"))
                .andExpect(jsonPath("$.data").value("/archivos_subidos/cartas_asignacion/carta.pdf"));
    }

    @Test
    @DisplayName("GET /archivos/categorias - Debe listar las categorias disponibles")
    void listarCategorias_Exitoso() throws Exception {
        mockMvc.perform(get("/archivos/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].codigo").value("MATRICES_CACES"))
                .andExpect(jsonPath("$.data[0].subcarpeta").value("practicas/matrices_caces"));
    }
}
