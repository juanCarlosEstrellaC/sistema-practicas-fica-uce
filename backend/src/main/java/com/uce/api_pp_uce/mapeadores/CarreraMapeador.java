package com.uce.api_pp_uce.mapeadores;

import com.uce.api_pp_uce.dtos.CarreraDto;
import com.uce.api_pp_uce.entities.Carrera;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CarreraMapeador {

    @Mapping(source = "director.id", target = "directorId")
    @Mapping(source = "coordinador.id", target = "coordinadorId")
    @Mapping(source = "director.nombreCompleto", target = "directorNombre")
    @Mapping(source = "coordinador.nombreCompleto", target = "coordinadorNombre")
    CarreraDto aDto(Carrera entidad);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "director", ignore = true)
    @Mapping(target = "coordinador", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    Carrera aEntidad(CarreraDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "director", ignore = true)
    @Mapping(target = "coordinador", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    void actualizarEntidadDesdeDto(CarreraDto dto, @MappingTarget Carrera entidad);
}
