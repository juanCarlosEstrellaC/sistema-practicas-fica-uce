package com.uce.api_pp_uce.mapeadores;

import com.uce.api_pp_uce.dtos.NotificacionRespuestaDto;
import com.uce.api_pp_uce.entities.Notificacion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificacionMapeador {

    @Mapping(source = "usuario.id", target = "usuarioId")
    NotificacionRespuestaDto aDto(Notificacion entidad);
}

