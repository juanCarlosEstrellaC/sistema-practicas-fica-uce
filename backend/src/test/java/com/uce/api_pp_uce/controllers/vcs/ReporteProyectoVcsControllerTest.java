package com.uce.api_pp_uce.controllers.vcs;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteRevisionSubdecanatoDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.vcs.ReporteProyectoVcsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ReporteProyectoVcsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReporteProyectoVcsService reporteProyectoVcsService;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private ReporteProyectoVcsController reporteProyectoVcsController;

    private ObjectMapper objectMapper;
    private ReporteProyectoDto reporteDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reporteProyectoVcsController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();

        reporteDtoMock = new ReporteProyectoDto(
                10L,
                1L,
                "Alfabetización Digital",
                2L,
                "2027",
                5L,
                "Milton Giovanny Moncayo Unda",
                TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "Reporte Trimestral.pdf",
                "/reportes-proyectos-vcs/10/preview",
                EstadoRevisionVcs.PENDIENTE,
                null,
                LocalDateTime.now(),
                null
        );
    }

    @Test
    @DisplayName("GET /reportes-proyectos-vcs/{id}/preview - Debe previsualizar PDF inline")
    void previsualizarReporte_Exito() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 demo".getBytes();
        when(reporteProyectoVcsService.obtenerReporteDescarga(10L))
                .thenReturn(new ArchivoDescargaDto(pdfBytes, "Reporte_Trimestral.pdf", "application/pdf"));

        mockMvc.perform(get("/reportes-proyectos-vcs/10/preview"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Reporte_Trimestral.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("GET /reportes-proyectos-vcs/{id}/preview - Soporta nombres de archivo con tildes")
    void previsualizarReporte_NombreConTildes_Exito() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 demo".getBytes();
        when(reporteProyectoVcsService.obtenerReporteDescarga(10L))
                .thenReturn(new ArchivoDescargaDto(pdfBytes, "Evaluación_Vinculación.pdf", "application/pdf"));

        mockMvc.perform(get("/reportes-proyectos-vcs/10/preview"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("inline")))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("GET /reportes-proyectos-vcs/{id}/descargar - Debe descargar PDF como attachment")
    void descargarReporte_Exito() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 demo".getBytes();
        when(reporteProyectoVcsService.obtenerReporteDescarga(10L))
                .thenReturn(new ArchivoDescargaDto(pdfBytes, "Reporte_Trimestral.pdf", "application/pdf"));

        mockMvc.perform(get("/reportes-proyectos-vcs/10/descargar"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Reporte_Trimestral.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("GET /reportes-proyectos-vcs/{id}/preview - Retorna 404 si el recurso no existe")
    void previsualizarReporte_NoEncontrado() throws Exception {
        when(reporteProyectoVcsService.obtenerReporteDescarga(99L))
                .thenThrow(new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: 99"));

        mockMvc.perform(get("/reportes-proyectos-vcs/99/preview"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Reporte de proyecto no encontrado con ID: 99"));
    }

    @Test
    @DisplayName("GET /reportes-proyectos-vcs/{id}/preview - Retorna 403 si no tiene permisos BOLA")
    void previsualizarReporte_AccesoDenegado() throws Exception {
        when(reporteProyectoVcsService.obtenerReporteDescarga(10L))
                .thenThrow(new AccessDeniedException("No tiene permisos para acceder a reportes de proyectos de otra carrera."));

        mockMvc.perform(get("/reportes-proyectos-vcs/10/preview"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false));
    }

    @Test
    @DisplayName("GET /reportes-proyectos-vcs/proyecto/{proyectoId} - Debe listar reportes con URL de preview")
    void listarPorProyecto_Exito() throws Exception {
        when(reporteProyectoVcsService.listarPorProyecto(1L, 2L)).thenReturn(List.of(reporteDtoMock));

        mockMvc.perform(get("/reportes-proyectos-vcs/proyecto/1")
                        .param("periodoId", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data[0].urlArchivo").value("/reportes-proyectos-vcs/10/preview"));
    }

    @Test
    @DisplayName("POST /reportes-proyectos-vcs - Debe crear reporte y retornar 201")
    void subirReporte_Exito() throws Exception {
        Usuario coordinador = new Usuario();
        coordinador.setId(5L);
        ReporteProyectoNuevoDto peticion = new ReporteProyectoNuevoDto(
                1L, 2L, TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "Reporte Trimestral.pdf", "/archivos_subidos/vinculacion/rep.pdf"
        );

        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(coordinador);
        when(reporteProyectoVcsService.subirReporte(any(ReporteProyectoNuevoDto.class), eq(coordinador)))
                .thenReturn(reporteDtoMock);

        mockMvc.perform(post("/reportes-proyectos-vcs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.urlArchivo").value("/reportes-proyectos-vcs/10/preview"));
    }

    @Test
    @DisplayName("PATCH /reportes-proyectos-vcs/{id}/revision - Debe registrar revision de Subdecanato")
    void revisarReporteSubdecanato_Exito() throws Exception {
        ReporteProyectoDto aprobado = new ReporteProyectoDto(
                10L, 1L, "Alfabetización Digital", 2L, "2027",
                5L, "Milton Giovanny Moncayo Unda", TipoReporteProyectoVcs.TRIMESTRAL_AVANCES,
                "Reporte Trimestral.pdf", "/reportes-proyectos-vcs/10/preview",
                EstadoRevisionVcs.APROBADO, null, LocalDateTime.now(), LocalDateTime.now()
        );
        ReporteRevisionSubdecanatoDto peticion = new ReporteRevisionSubdecanatoDto(EstadoRevisionVcs.APROBADO, "");

        when(reporteProyectoVcsService.revisarReporteSubdecanato(eq(10L), any(ReporteRevisionSubdecanatoDto.class)))
                .thenReturn(aprobado);

        mockMvc.perform(patch("/reportes-proyectos-vcs/10/revision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.estadoSubdecanato").value("APROBADO"));
    }
}

