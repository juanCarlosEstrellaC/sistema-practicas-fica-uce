package com.uce.api_pp_uce.controllers.pp;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.dtos.pp.HorasAsignacionDto;
import com.uce.api_pp_uce.dtos.pp.NuevaAsignacionDto;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import com.uce.api_pp_uce.excepciones.ManejadorExcepcionesGlobal;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.pp.AsignacionPracticaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AsignacionPracticasControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AsignacionPracticaService asignacionPracticaService;

    @InjectMocks
    private AsignacionPracticasController asignacionPracticasController;

    private ObjectMapper objectMapper;
    private AsignacionPracticaDetalleDto detalleDtoMock;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(asignacionPracticasController)
                .setControllerAdvice(new ManejadorExcepcionesGlobal())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        objectMapper = new ObjectMapper();

        UsuarioResumenDto estudiante = new UsuarioResumenDto(10L, "Carlos", "Perez", "1720000001", TipoIdentificacionUsuario.CEDULA, "carlos.perez@uce.edu.ec", "0991112233", "Sistemas", 1, null);
        UsuarioResumenDto tutor = new UsuarioResumenDto(20L, "Dra. Ana", "Morales", "1710000002", TipoIdentificacionUsuario.CEDULA, "ana.morales@uce.edu.ec", "0992223344", "Sistemas", 1, null);

        detalleDtoMock = new AsignacionPracticaDetalleDto(
                100L,
                estudiante,
                tutor,
                30L,
                "Empresa Tech S.A.",
                "Av. Amazonas N24-100",
                "Ing. Externo",
                "tutor@tech.com",
                "0993334455",
                "Dr. Director",
                "2026-2026",
                40L,
                8,
                240,
                0,
                LocalDate.now(),
                null,
                FaseActualPractica.ASIGNACION,
                EstadoAsignacion.EN_CURSO,
                false,
                false,
                false,
                false,
                "Privada",
                null,
                true
        );
    }

    @Test
    @DisplayName("GET /asignaciones-practicas/{id} - Debe retornar 200 OK con asignacion existente (Caso Feliz)")
    void obtenerAsignacion_Exitoso() throws Exception {
        when(asignacionPracticaService.buscarDetallePorId(100L)).thenReturn(detalleDtoMock);

        mockMvc.perform(get("/asignaciones-practicas/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(100))
                .andExpect(jsonPath("$.data.institucion").value("Empresa Tech S.A."))
                .andExpect(jsonPath("$.data.estudiante.nombres").value("Carlos"));
    }

    @Test
    @DisplayName("GET /asignaciones-practicas/{id} - Debe retornar 404 NOT FOUND si no existe (Caso Limite)")
    void obtenerAsignacion_NoEncontrada() throws Exception {
        when(asignacionPracticaService.buscarDetallePorId(999L))
                .thenThrow(new RecursoNoEncontradoException("Asignacion no encontrada con ID: 999"));

        mockMvc.perform(get("/asignaciones-practicas/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("Asignacion no encontrada con ID: 999"));
    }

    @Test
    @DisplayName("POST /asignaciones-practicas/asignar - Debe retornar 200 OK al asignar exitosamente (Caso Feliz)")
    void asignarTutorYConvenio_Exitoso() throws Exception {
        NuevaAsignacionDto peticion = new NuevaAsignacionDto(10L, 30L, 20L, "Ing. Externo", 240, 40L);

        when(asignacionPracticaService.asignarTutorYConvenio(10L, 30L, 20L, "Ing. Externo", 240, 40L))
                .thenReturn(detalleDtoMock);

        mockMvc.perform(post("/asignaciones-practicas/asignar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(100))
                .andExpect(jsonPath("$.mensaje").value("Asignación completada"));
    }

    @Test
    @DisplayName("POST /asignaciones-practicas/asignar - Debe retornar 400 BAD REQUEST si fallan validaciones Bean Validation (Caso Limite)")
    void asignarTutorYConvenio_ValidacionFallida() throws Exception {
        String jsonInvalido = """
                {
                    "estudianteId": null,
                    "convenioId": null,
                    "tutorId": null,
                    "horas": -50,
                    "periodoAcademicoId": null
                }
                """;

        mockMvc.perform(post("/asignaciones-practicas/asignar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.estudianteId").exists())
                .andExpect(jsonPath("$.data.horas").exists());
    }

    @Test
    @DisplayName("POST /asignaciones-practicas/asignar - Debe retornar 400 BAD REQUEST si periodo academico esta inactivo (Caso Limite Negocio)")
    void asignarTutorYConvenio_ErrorNegocio_PeriodoInactivo() throws Exception {
        NuevaAsignacionDto peticion = new NuevaAsignacionDto(10L, 30L, 20L, "Ing. Externo", 240, 40L);

        when(asignacionPracticaService.asignarTutorYConvenio(any(), any(), any(), any(), any(), any()))
                .thenThrow(new NegocioException("La acción no puede realizarse porque el periodo académico no está activo."));

        mockMvc.perform(post("/asignaciones-practicas/asignar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.mensaje").value("La acción no puede realizarse porque el periodo académico no está activo."));
    }

    @Test
    @DisplayName("PATCH /asignaciones-practicas/{id}/avanzar-horas - Debe retornar 200 OK con horas actualizadas (Caso Feliz)")
    void avanzarHoras_Exitoso() throws Exception {
        HorasAsignacionDto peticion = new HorasAsignacionDto(40);

        when(asignacionPracticaService.avanzarHoras(100L, 40)).thenReturn(detalleDtoMock);

        mockMvc.perform(patch("/asignaciones-practicas/100/avanzar-horas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Horas actualizadas"));
    }

    @Test
    @DisplayName("PATCH /asignaciones-practicas/{id}/avanzar-horas - Debe retornar 400 BAD REQUEST si horas son negativas o nulas (Caso Limite)")
    void avanzarHoras_ValidacionFallida() throws Exception {
        String jsonInvalido = """
                {
                    "horas": -10
                }
                """;

        mockMvc.perform(patch("/asignaciones-practicas/100/avanzar-horas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.exito").value(false))
                .andExpect(jsonPath("$.data.horas").exists());
    }

    @Test
    @DisplayName("POST /asignaciones-practicas/{id}/iniciar-desarrollo - Debe retornar 200 OK al iniciar fase desarrollo (Caso Feliz)")
    void iniciarDesarrollo_Exitoso() throws Exception {
        when(asignacionPracticaService.iniciarDesarrolloPracticas(100L)).thenReturn(detalleDtoMock);

        mockMvc.perform(post("/asignaciones-practicas/100/iniciar-desarrollo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Desarrollo iniciado"));
    }

    @Test
    @DisplayName("POST /asignaciones-practicas/{id}/validar-cpp - Debe retornar 200 OK al validar CPP (Caso Feliz)")
    void validarCpp_Exitoso() throws Exception {
        when(asignacionPracticaService.validarCpp(100L)).thenReturn(detalleDtoMock);

        mockMvc.perform(post("/asignaciones-practicas/100/validar-cpp"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Validación CPP exitosa"));
    }

    @Test
    @DisplayName("DELETE /asignaciones-practicas/{id} - Debe retornar 200 OK al eliminar asignacion (Caso Feliz)")
    void eliminarAsignacion_Exitoso() throws Exception {
        doNothing().when(asignacionPracticaService).eliminarAsignacion(100L);

        mockMvc.perform(delete("/asignaciones-practicas/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Asignación eliminada correctamente"));
    }

    @Test
    @DisplayName("Debe cancelar asignacion de practica correctamente (PATCH /{id}/cancelar)")
    void cancelarAsignacion_Exitoso() throws Exception {
        when(asignacionPracticaService.cancelarAsignacion(100L)).thenReturn(detalleDtoMock);

        mockMvc.perform(patch("/asignaciones-practicas/100/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Práctica preprofesional cancelada exitosamente"));
    }

    @Test
    @DisplayName("Debe reprobar asignacion de practica correctamente (PATCH /{id}/reprobar)")
    void reprobarAsignacion_Exitoso() throws Exception {
        when(asignacionPracticaService.reprobarAsignacion(100L)).thenReturn(detalleDtoMock);

        mockMvc.perform(patch("/asignaciones-practicas/100/reprobar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Práctica preprofesional reprobada exitosamente"));
    }

    @Test
    @DisplayName("GET /asignaciones-practicas/{id}/carta-asignacion/preview - Debe retornar 200 OK con PDF inline")
    void vistaPreviaCartaAsignacion_Exitoso() throws Exception {
        byte[] pdfBytes = "PDF_MOCK_CONTENT".getBytes();
        ArchivoDescargaDto descargaDto = new ArchivoDescargaDto(pdfBytes, "Carta_100.pdf", "application/pdf");
        when(asignacionPracticaService.obtenerCartaAsignacionDescarga(100L)).thenReturn(descargaDto);

        mockMvc.perform(get("/asignaciones-practicas/100/carta-asignacion/preview"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", "inline; filename=\"Carta_100.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    @DisplayName("GET /asignaciones-practicas/{id}/carta-asignacion/descargar - Debe retornar 200 OK con PDF attachment")
    void descargarCartaAsignacion_Exitoso() throws Exception {
        byte[] pdfBytes = "PDF_MOCK_CONTENT".getBytes();
        ArchivoDescargaDto descargaDto = new ArchivoDescargaDto(pdfBytes, "Carta_100.pdf", "application/pdf");
        when(asignacionPracticaService.obtenerCartaAsignacionDescarga(100L)).thenReturn(descargaDto);

        mockMvc.perform(get("/asignaciones-practicas/100/carta-asignacion/descargar"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"Carta_100.pdf\""))
                .andExpect(content().bytes(pdfBytes));
    }
}
