package com.uce.api_pp_uce.dtos.vcs;

import java.util.List;

import com.uce.api_pp_uce.dtos.UsuarioResumenDto;

public record TutorResumenVcsDto(
    Long id,
    String nombres,
    String apellidos,
    String identificacion,
    String correo,
    Integer carreraId,
    String nombreCarrera,
    Integer asignacionesActuales,
    List<ProyectoComunitarioResumenDto> proyectos,
    List<UsuarioResumenDto> estudiantes
) {
}
