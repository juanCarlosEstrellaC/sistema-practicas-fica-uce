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
class CartaAsignacionPdfExportadorTest {

    @Mock
    private PdfService pdfService;

    @InjectMocks
    private CartaAsignacionPdfExportador exportador;

    @Test
    @DisplayName("Deberia exportar carta de asignacion con datos completos exitosamente")
    void exportar_ConDatosCompletos_Exitoso() {
        UsuarioResumenDto estudiante = new UsuarioResumenDto(
                1L, "Carlos", "Perez", "1712345678", TipoIdentificacionUsuario.CEDULA,
                "carlos@uce.edu.ec", "0991112233", "Ingeniería de Software", 1, null);

        UsuarioResumenDto tutor = new UsuarioResumenDto(
                2L, "Ana", "Gomez", "1798765432", TipoIdentificacionUsuario.CEDULA,
                "ana@uce.edu.ec", "0994445566", "Ingeniería de Software", 1, null);

        AsignacionPracticaDetalleDto detalle = new AsignacionPracticaDetalleDto(
                15L, estudiante, tutor, 100L, "Empresa Tech", "Av. America",
                "Ing. Supervisor", "sup@tech.com", "0987654321",
                "Director", "2026-2026", 1L, 6,
                240, 0, LocalDate.of(2026, 3, 1), LocalDate.of(2026, 5, 1),
                FaseActualPractica.ASIGNACION, EstadoAsignacion.EN_CURSO,
                false, false, false, false, "CONVENIO_MARCO", null, true);

        byte[] esperado = "pdf-contenido".getBytes();
        when(pdfService.generatePdfFromHtml(eq("carta-asignacion"), any())).thenReturn(esperado);

        byte[] resultado = exportador.exportar(detalle);

        assertNotNull(resultado);
        assertArrayEquals(esperado, resultado);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(pdfService).generatePdfFromHtml(eq("carta-asignacion"), captor.capture());

        Map<String, Object> variables = captor.getValue();
        assertEquals("015", variables.get("numeroOficio"));
        assertEquals("Carlos Perez", variables.get("estudianteNombre"));
        assertEquals("Empresa Tech", variables.get("institucion"));
        assertEquals("Ing. Director", variables.get("directorCarrera"));
    }

    @Test
    @DisplayName("Deberia exportar carta de asignacion con valores por defecto si los datos son nulos")
    void exportar_ConValoresNulos_UsaValoresPorDefecto() {
        AsignacionPracticaDetalleDto detalle = new AsignacionPracticaDetalleDto(
                5L, null, null, null, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null,
                null, null, null, null, null, null, null, null, null);

        byte[] esperado = "pdf-defecto".getBytes();
        when(pdfService.generatePdfFromHtml(eq("carta-asignacion"), any())).thenReturn(esperado);

        byte[] resultado = exportador.exportar(detalle);

        assertNotNull(resultado);
        assertArrayEquals(esperado, resultado);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(pdfService).generatePdfFromHtml(eq("carta-asignacion"), captor.capture());

        Map<String, Object> variables = captor.getValue();
        assertEquals("005", variables.get("numeroOficio"));
        assertEquals("Estudiante", variables.get("estudianteNombre"));
        assertEquals("Institución no definida", variables.get("institucion"));
        assertEquals("POR DESIGNAR", variables.get("directorCarrera"));
    }
}
