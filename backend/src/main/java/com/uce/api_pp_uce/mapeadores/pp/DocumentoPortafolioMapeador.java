package com.uce.api_pp_uce.mapeadores.pp;

import com.uce.api_pp_uce.dtos.pp.DocumentoPortafolioDto;
import com.uce.api_pp_uce.entities.pp.DocumentoPortafolio;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface DocumentoPortafolioMapeador {

    @Mapping(source = "estudiante.id", target = "estudianteId")
    @Mapping(source = "asignacion.id", target = "asignacionId")
    DocumentoPortafolioDto aDto(DocumentoPortafolio entidad);
}
