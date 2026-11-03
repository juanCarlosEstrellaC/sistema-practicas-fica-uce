package com.uce.api_pp_uce.exportadores.pp;

import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import com.uce.api_pp_uce.services.PdfService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvalCumplimientoPdfExportadorTest {

    @Mock
    private PdfService pdfService;

    @InjectMocks
    private AvalCumplimientoPdfExportador exportador;

    @Test
    @DisplayName("Deberia exportar aval de cumplimiento con datos completos exitosamente")
    void exportar_ConDatosCompletos_Exitoso() {
        UsuarioResumenDto estudiante = new UsuarioResumenDto(
                1L, "Carlos", "Perez", "1712345678", TipoIdentificacionUsuario.CEDULA,
                "carlos@uce.edu.ec", "0991112233", "Ingeniería de Software", 1, null);

        AsignacionPracticaDetalleDto detalle = new AsignacionPracticaDetalleDto(
                10L, estudiante, null, 100L, "Empresa Tech", "Av. America",
                "Ing. Supervisor", "sup@tech.com", "0987654321",
                "Director", "2026-2026", 1L, 6,
                240, 240, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 5, 1),
                FaseActualPractica.FINALIZACION, EstadoAsignacion.APROBADO,
                true, true, true, true, "CONVENIO_MARCO", null, false);

        byte[] esperado = "pdf-aval".getBytes();
        when(pdfService.generatePdfFromHtml(eq("aval-cumplimiento"), any())).thenReturn(esperado);

        byte[] resultado = exportador.exportar(detalle, "Dr. Subdecano", "1701234567", "0998877665", "subdecano@uce.edu.ec");

        assertNotNull(resultado);
        assertArrayEquals(esperado, resultado);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(pdfService).generatePdfFromHtml(eq("aval-cumplimiento"), captor.capture());

        Map<String, Object> variables = captor.getValue();
        assertEquals("Carlos Perez", variables.get("estudianteNombre"));
        assertEquals("1712345678", variables.get("estudianteCedula"));
        assertEquals("Empresa Tech", variables.get("institucionReceptora"));
        assertEquals("Dr. Subdecano", variables.get("subdecanoNombre"));
        assertEquals("240", variables.get("horas"));
    }

    @Test
    @DisplayName("Deberia exportar aval con valores por defecto si los datos son nulos")
    void exportar_ConValoresNulos_UsaValoresPorDefecto() {
        AsignacionPracticaDetalleDto detalle = new AsignacionPracticaDetalleDto(
                10L, null, null, null, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null,
                null, null, null, null, null, null, null, null, null);

        byte[] esperado = "pdf-aval-defecto".getBytes();
        when(pdfService.generatePdfFromHtml(eq("aval-cumplimiento"), any())).thenReturn(esperado);

        byte[] resultado = exportador.exportar(detalle, null, null, null, null);

        assertNotNull(resultado);
        assertArrayEquals(esperado, resultado);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(pdfService).generatePdfFromHtml(eq("aval-cumplimiento"), captor.capture());

        Map<String, Object> variables = captor.getValue();
        assertEquals("Estudiante", variables.get("estudianteNombre"));
        assertEquals("Subdecano FICA", variables.get("subdecanoNombre"));
        assertEquals("240", variables.get("horas"));
    }
}
