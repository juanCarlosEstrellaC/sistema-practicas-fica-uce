package com.uce.api_pp_uce.mapeadores.pp;

import com.uce.api_pp_uce.dtos.pp.MatrizCacesDto;
import com.uce.api_pp_uce.entities.pp.MatrizCaces;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MatrizCacesMapeador {

    @Mapping(source = "periodoAcademico.id", target = "periodoAcademicoId")
    @Mapping(source = "periodoAcademico.nombre", target = "periodoNombre")
    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "carrera.nombre", target = "carreraNombre")
    @Mapping(source = "carrera.codigoCarrera", target = "carreraCodigo")
    MatrizCacesDto aDto(MatrizCaces entidad);
}
