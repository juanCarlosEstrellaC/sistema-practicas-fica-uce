package com.uce.api_pp_uce.dtos;

import java.util.List;

public record TutorResumenDto(
    Long id,
    String nombres,
    String apellidos,
    String correo,
    String especialidad,
    Long estudiantesAsignados,
    String urlAvatar,
    List<UsuarioResumenDto> estudiantes
) {
}
