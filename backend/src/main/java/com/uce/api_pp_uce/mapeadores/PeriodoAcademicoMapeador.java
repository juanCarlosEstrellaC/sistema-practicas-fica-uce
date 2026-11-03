package com.uce.api_pp_uce.mapeadores;

import com.uce.api_pp_uce.dtos.PeriodoAcademicoDto;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PeriodoAcademicoMapeador {

    PeriodoAcademicoDto aDto(PeriodoAcademico entidad);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    PeriodoAcademico aEntidad(PeriodoAcademicoDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    void actualizarEntidadDesdeDto(PeriodoAcademicoDto dto, @MappingTarget PeriodoAcademico entidad);
}
