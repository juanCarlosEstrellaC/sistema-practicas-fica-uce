package com.uce.api_pp_uce.exportadores.pp;

import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
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
public class AvalCumplimientoPdfExportador {

    private final PdfService pdfService;

    public byte[] exportar(AsignacionPracticaDetalleDto asignacion,
                           String subdecanoNombre,
                           String subdecanoCedula,
                           String subdecanoTelefono,
                           String subdecanoCorreo) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("fechaEmision", LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", Locale.forLanguageTag("es-ES"))));
        variables.put("carrera", asignacion.estudiante() != null && asignacion.estudiante().carreraNombre() != null
                ? asignacion.estudiante().carreraNombre()
                : "Ingeniería de Software");
        variables.put("estudianteNombre", asignacion.estudiante() != null
                ? asignacion.estudiante().nombres() + " " + asignacion.estudiante().apellidos()
                : "Estudiante");
        variables.put("estudianteCedula", asignacion.estudiante() != null && asignacion.estudiante().identificacion() != null
                ? asignacion.estudiante().identificacion()
                : "17XXXXXXXX");
        variables.put("institucionReceptora", asignacion.institucion() != null ? asignacion.institucion() : "Institución no definida");
        variables.put("institucion", asignacion.institucion() != null ? asignacion.institucion() : "Institución no definida");
        variables.put("tutorInstitucional", asignacion.tutorInstitucional() != null && !asignacion.tutorInstitucional().isBlank() ? asignacion.tutorInstitucional() : "Por designar");
        variables.put("periodo", asignacion.periodoAcademicoNombre() != null ? asignacion.periodoAcademicoNombre() : "2026-2026");
        variables.put("fechaInicio", asignacion.fechaInicio() != null ? asignacion.fechaInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "dd/mm/aaaa");
        variables.put("fechaFin", asignacion.fechaFin() != null ? asignacion.fechaFin().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        variables.put("horas", asignacion.horasAsignadas() != null ? asignacion.horasAsignadas().toString() : "240");
        variables.put("totalHoras", asignacion.horasAsignadas() != null ? asignacion.horasAsignadas().toString() : "240");

        variables.put("subdecanoNombre", (subdecanoNombre != null && !subdecanoNombre.isBlank()) ? subdecanoNombre : "Subdecano FICA");
        variables.put("subdecanoCedula", (subdecanoCedula != null && !subdecanoCedula.isBlank()) ? subdecanoCedula : "1700000000");
        variables.put("subdecanoTelefono", (subdecanoTelefono != null && !subdecanoTelefono.isBlank()) ? subdecanoTelefono : "0999999999");
        variables.put("subdecanoCorreo", (subdecanoCorreo != null && !subdecanoCorreo.isBlank()) ? subdecanoCorreo : "subdecano@uce.edu.ec");

        return pdfService.generatePdfFromHtml("aval-cumplimiento", variables);
    }
}
