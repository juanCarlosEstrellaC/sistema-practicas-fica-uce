package com.uce.api_pp_uce.mapeadores.pp;

import com.uce.api_pp_uce.dtos.pp.NuevaObservacionDto;
import com.uce.api_pp_uce.dtos.pp.ObservacionDto;
import com.uce.api_pp_uce.entities.pp.Observacion;
import com.uce.api_pp_uce.mapeadores.UsuarioMapeador;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {UsuarioMapeador.class}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ObservacionMapeador {

    @Mapping(source = "remitente.id", target = "remitenteId")
    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "carrera.nombre", target = "carreraNombre")
    @Mapping(source = "convenio.id", target = "convenioId")
    @Mapping(source = "remitente", target = "remitente")
    ObservacionDto aDto(Observacion entidad);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "remitente", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "convenio", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fecha", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    Observacion aEntidad(NuevaObservacionDto dto);
}
