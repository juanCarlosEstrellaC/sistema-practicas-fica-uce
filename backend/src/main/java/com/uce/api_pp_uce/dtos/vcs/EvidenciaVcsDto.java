package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;

import java.time.LocalDateTime;

public record EvidenciaVcsDto(
    Long id,
    Long asignacionId,
    Long estudianteId,
    String nombreCompletoEstudiante,
    String identificacionEstudiante,
    Long proyectoId,
    String nombreProyecto,
    TipoDocumentoVcs tipoDocumento,
    String nombreArchivo,
    String urlArchivo,
    Integer horasReportadas,
    EstadoRevisionVcs estadoTutor,
    String observacionesTutor,
    LocalDateTime fechaSubida,
    LocalDateTime fechaRevisionTutor
) {
}
