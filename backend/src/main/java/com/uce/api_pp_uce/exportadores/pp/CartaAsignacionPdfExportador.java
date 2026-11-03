package com.uce.api_pp_uce.exportadores.pp;

import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.services.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CartaAsignacionPdfExportador {

    private final PdfService pdfService;

    public byte[] exportar(AsignacionPracticaDetalleDto asignacion) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("carrera", asignacion.estudiante() != null && asignacion.estudiante().carreraNombre() != null
                ? asignacion.estudiante().carreraNombre()
                : "Ingeniería de Software");
        variables.put("numeroOficio", String.format("%03d", asignacion.id()));
        variables.put("anio", Year.now().getValue());
        variables.put("fechaEmision", LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", Locale.forLanguageTag("es-ES"))));
        variables.put("estudianteNombre", asignacion.estudiante() != null
                ? asignacion.estudiante().nombres() + " " + asignacion.estudiante().apellidos()
                : "Estudiante");
        variables.put("periodo", asignacion.periodoAcademicoNombre() != null ? asignacion.periodoAcademicoNombre() : "2026-2026");
        variables.put("fechaInicio", asignacion.fechaInicio() != null ? asignacion.fechaInicio().toString() : LocalDate.now().toString());
        variables.put("institucion", asignacion.institucion() != null ? asignacion.institucion() : "Institución no definida");
        variables.put("tutorInstitucional", (asignacion.tutorInstitucional() != null ? asignacion.tutorInstitucional().toUpperCase() : "POR DESIGNAR")
                + " - " + (asignacion.correoTutorInstitucional() != null ? asignacion.correoTutorInstitucional() : "S/N")
                + " - " + (asignacion.telefonoTutorInstitucional() != null ? asignacion.telefonoTutorInstitucional() : "S/N"));
        variables.put("tutorAcademico", (asignacion.tutorAcademico() != null ? (asignacion.tutorAcademico().nombres() + " " + asignacion.tutorAcademico().apellidos()).toUpperCase() : "POR DESIGNAR")
                + " - " + (asignacion.tutorAcademico() != null ? asignacion.tutorAcademico().correo() : "S/N")
                + " - " + (asignacion.tutorAcademico() != null && asignacion.tutorAcademico().telefono() != null ? asignacion.tutorAcademico().telefono() : "0996098119"));
        variables.put("directorCarrera", asignacion.directorCarreraNombre() != null && !asignacion.directorCarreraNombre().equals("POR DESIGNAR")
                ? "Ing. " + asignacion.directorCarreraNombre()
                : "POR DESIGNAR");

        return pdfService.generatePdfFromHtml("carta-asignacion", variables);
    }
}
