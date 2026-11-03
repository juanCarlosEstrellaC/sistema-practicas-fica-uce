package com.uce.api_pp_uce.exportadores.vcs;

import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ProcesoVinculacion;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.services.PdfService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CertificadoHorasVcsPdfExportadorTest {

    @Mock
    private PdfService pdfService;

    @InjectMocks
    private CertificadoHorasVcsPdfExportador exportador;

    @Test
    @DisplayName("Deberia exportar certificado de horas VCS con datos completos exitosamente")
    void exportar_ConDatosCompletos_Exitoso() {
        Carrera carrera = new Carrera();
        carrera.setId(1);
        carrera.setNombre("Ingeniería de Software");

        Usuario estudiante = new Usuario();
        estudiante.setId(10L);
        estudiante.setNombres("Carlos");
        estudiante.setApellidos("Perez");
        estudiante.setIdentificacion("1712345678");
        estudiante.setCarrera(carrera);

        Usuario tutor = new Usuario();
        tutor.setId(20L);
        tutor.setNombres("Maria");
        tutor.setApellidos("Lopez");

        ProyectoComunitario proyecto = new ProyectoComunitario();
        proyecto.setId(30L);
        proyecto.setNombre("Proyecto Comunitario Alfabetizacion Digital");
        proyecto.setTutorAcademico(tutor);

        PeriodoAcademico periodo = new PeriodoAcademico();
        periodo.setId(40L);
        periodo.setNombre("2026-2026");

        ProcesoVinculacion proceso = new ProcesoVinculacion();
        proceso.setEstudiante(estudiante);

        AsignacionProyectoComunitario asignacion = new AsignacionProyectoComunitario();
        asignacion.setId(100L);
        asignacion.setProcesoVinculacion(proceso);
        asignacion.setProyectoComunitario(proyecto);
        asignacion.setPeriodoAcademico(periodo);
        asignacion.setHorasAsignadas(80);

        byte[] esperado = "pdf-certificado".getBytes();
        when(pdfService.generatePdfFromHtml(eq("certificado-horas-vcs"), any())).thenReturn(esperado);

        byte[] resultado = exportador.exportar(
                asignacion, "Dra. Subdecana", "1799999999", "0988888888", "subdecana@uce.edu.ec");

        assertNotNull(resultado);
        assertArrayEquals(esperado, resultado);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(pdfService).generatePdfFromHtml(eq("certificado-horas-vcs"), captor.capture());

        Map<String, Object> variables = captor.getValue();
        assertEquals("Carlos Perez", variables.get("estudianteNombre"));
        assertEquals("1712345678", variables.get("estudianteCedula"));
        assertEquals("Proyecto Comunitario Alfabetizacion Digital", variables.get("proyectoNombre"));
        assertEquals("Maria Lopez", variables.get("tutorAcademico"));
        assertEquals("Dra. Subdecana", variables.get("subdecanoNombre"));
        assertEquals("80", variables.get("horas"));
    }

    @Test
    @DisplayName("Deberia exportar certificado con valores por defecto cuando los campos son nulos")
    void exportar_ConCamposNulos_UsaValoresPorDefecto() {
        AsignacionProyectoComunitario asignacion = new AsignacionProyectoComunitario();
        asignacion.setId(101L);

        byte[] esperado = "pdf-certificado-defecto".getBytes();
        when(pdfService.generatePdfFromHtml(eq("certificado-horas-vcs"), any())).thenReturn(esperado);

        byte[] resultado = exportador.exportar(asignacion, null, null, null, null);

        assertNotNull(resultado);
        assertArrayEquals(esperado, resultado);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(pdfService).generatePdfFromHtml(eq("certificado-horas-vcs"), captor.capture());

        Map<String, Object> variables = captor.getValue();
        assertEquals("Estudiante", variables.get("estudianteNombre"));
        assertEquals("17XXXXXXXX", variables.get("estudianteCedula"));
        assertEquals("Subdecano(a) FICA", variables.get("subdecanoNombre"));
        assertEquals("80", variables.get("horas"));
    }
}
