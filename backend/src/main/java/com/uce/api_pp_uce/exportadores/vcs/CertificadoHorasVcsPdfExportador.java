package com.uce.api_pp_uce.exportadores.vcs;

import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.services.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CertificadoHorasVcsPdfExportador {

    private final PdfService pdfService;

    public byte[] exportar(AsignacionProyectoComunitario asignacion,
                           String subdecanoNombre,
                           String subdecanoCedula,
                           String subdecanoTelefono,
                           String subdecanoCorreo) {
        Usuario estudiante = asignacion.getProcesoVinculacion() != null ? asignacion.getProcesoVinculacion().getEstudiante() : null;
        ProyectoComunitario proyecto = asignacion.getProyectoComunitario();
        Usuario tutor = proyecto != null ? proyecto.getTutorAcademico() : null;
        PeriodoAcademico periodo = asignacion.getPeriodoAcademico();
        Carrera carrera = estudiante != null ? estudiante.getCarrera() : null;

        Map<String, Object> variables = new HashMap<>();
        variables.put("fechaEmision", LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", Locale.forLanguageTag("es-ES"))));
        variables.put("carrera", carrera != null && carrera.getNombre() != null ? carrera.getNombre() : "Ingeniería de Software");
        variables.put("estudianteNombre", estudiante != null ? estudiante.getNombreCompleto() : "Estudiante");
        variables.put("estudianteCedula", estudiante != null && estudiante.getIdentificacion() != null ? estudiante.getIdentificacion() : "17XXXXXXXX");
        variables.put("proyectoNombre", proyecto != null && proyecto.getNombre() != null ? proyecto.getNombre() : "Proyecto Comunitario");
        variables.put("tutorAcademico", tutor != null ? tutor.getNombreCompleto() : "Tutor Académico");
        variables.put("periodo", periodo != null && periodo.getNombre() != null ? periodo.getNombre() : "2026-2026");
        variables.put("horas", asignacion.getHorasAsignadas() != null ? asignacion.getHorasAsignadas().toString() : "80");
        variables.put("totalHoras", asignacion.getHorasAsignadas() != null ? asignacion.getHorasAsignadas().toString() : "80");

        variables.put("subdecanoNombre", (subdecanoNombre != null && !subdecanoNombre.isBlank()) ? subdecanoNombre : "Subdecano(a) FICA");
        variables.put("subdecanoCedula", (subdecanoCedula != null && !subdecanoCedula.isBlank()) ? subdecanoCedula : "1700000000");
        variables.put("subdecanoTelefono", (subdecanoTelefono != null && !subdecanoTelefono.isBlank()) ? subdecanoTelefono : "0999999999");
        variables.put("subdecanoCorreo", (subdecanoCorreo != null && !subdecanoCorreo.isBlank()) ? subdecanoCorreo : "subdecano@uce.edu.ec");

        return pdfService.generatePdfFromHtml("certificado-horas-vcs", variables);
    }
}
