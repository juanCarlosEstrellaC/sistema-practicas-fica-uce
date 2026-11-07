package com.uce.api_pp_uce.controllers.pp;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.pp.DocumentoPortafolioDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoResubirDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoRevisarDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoSubirDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.services.pp.DocumentoPortafolioService;
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
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DocumentoControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DocumentoPortafolioService documentoService;

    @InjectMocks
    private DocumentoController documentoController;

    private ObjectMapper objectMapper;
    private DocumentoPortafolioDto documentoDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentoController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();

        documentoDtoMock = new DocumentoPortafolioDto(
                1L,
                10L,
                null,
                TipoDocumento.CV,
                "Maria Lopez - cv.pdf",
                "/archivos/cv.pdf",
                false,
                EstadoDocumento.PENDIENTE_REVISION,
                null,
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /documentos/estudiante/{estudianteId} - Debe obtener documentos de estudiante")
    void obtenerPorEstudiante_Exitoso() throws Exception {
        when(documentoService.buscarPorEstudiante(10L)).thenReturn(List.of(documentoDtoMock));

        mockMvc.perform(get("/documentos/estudiante/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Documentos obtenidos exitosamente"))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].tipo").value("CV"));
    }

    @Test
    @DisplayName("GET /documentos - Debe obtener todos los documentos paginados")
    void obtenerTodos_Exitoso() throws Exception {
        PageImpl<DocumentoPortafolioDto> pagina = new PageImpl<>(List.of(documentoDtoMock), PageRequest.of(0, 10), 1);

        when(documentoService.obtenerTodos(any())).thenReturn(pagina);

        mockMvc.perform(get("/documentos")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(1));
    }

    @Test
    @DisplayName("PUT /documentos/{id}/revisar - Debe revisar documento exitosamente")
    void revisarDocumento_Exitoso() throws Exception {
        DocumentoRevisarDto peticion = new DocumentoRevisarDto(EstadoDocumento.APROBADO, "Todo en orden");
        DocumentoPortafolioDto respuesta = new DocumentoPortafolioDto(
                1L, 10L, null, TipoDocumento.CV, "Maria Lopez - cv.pdf", "/archivos/cv.pdf", false, EstadoDocumento.APROBADO, "Todo en orden", LocalDateTime.now()
        );

        when(documentoService.revisarDocumento(eq(1L), any(DocumentoRevisarDto.class))).thenReturn(respuesta);

        mockMvc.perform(put("/documentos/1/revisar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Documento revisado exitosamente"))
                .andExpect(jsonPath("$.data.estado").value("APROBADO"));
    }

    @Test
    @DisplayName("PUT /documentos/{id}/resubir - Debe resubir documento exitosamente")
    void resubirDocumento_Exitoso() throws Exception {
        DocumentoResubirDto peticion = new DocumentoResubirDto("/archivos/cv_nuevo.pdf", "cv_nuevo.pdf");
        DocumentoPortafolioDto respuesta = new DocumentoPortafolioDto(
                1L, 10L, null, TipoDocumento.CV, "Maria Lopez - cv_nuevo.pdf", "/archivos/cv_nuevo.pdf", false, EstadoDocumento.PENDIENTE_REVISION, null, LocalDateTime.now()
        );

        when(documentoService.resubirDocumento(
                any(Long.class),
                any(DocumentoResubirDto.class)
        )).thenReturn(respuesta);

        mockMvc.perform(put("/documentos/1/resubir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Documento resubido correctamente"))
                .andExpect(jsonPath("$.data.url").value("/archivos/cv_nuevo.pdf"));
    }

    @Test
    @DisplayName("POST /documentos/subir - Debe subir documento exitosamente")
    void subirDocumento_Exitoso() throws Exception {
        DocumentoSubirDto peticion = new DocumentoSubirDto(10L, TipoDocumento.CV, "/archivos/cv.pdf", "cv.pdf");

        when(documentoService.subirDocumentoPortafolio(any(DocumentoSubirDto.class))).thenReturn(documentoDtoMock);

        mockMvc.perform(post("/documentos/subir")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Documento subido correctamente"))
                .andExpect(jsonPath("$.data.id").value(1));
    }
}
