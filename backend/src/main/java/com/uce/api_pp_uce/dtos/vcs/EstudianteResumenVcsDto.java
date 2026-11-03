package com.uce.api_pp_uce.dtos.vcs;

import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;

public record EstudianteResumenVcsDto(
    Long id,
    String nombres,
    String apellidos,
    String identificacion,
    TipoIdentificacionUsuario tipoIdentificacion,
    String correo,
    String telefono,
    String carreraNombre,
    Integer carreraId,
    String urlAvatar,
    Integer horasCompletadasVcs,
    Integer horasRequeridasVcs
) {
}
