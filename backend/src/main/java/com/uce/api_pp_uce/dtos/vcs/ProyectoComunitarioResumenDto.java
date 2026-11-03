package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;

public record ProyectoComunitarioResumenDto(
        Long id,
        String nombre,
        String descripcion,
        Integer carreraId,
        String nombreCarrera,
        Long tutorAcademicoId,
        String nombreTutor,
        EstadoProyecto estado) {

}
