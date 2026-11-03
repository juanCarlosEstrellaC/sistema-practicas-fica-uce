package com.uce.api_pp_uce.mapeadores.vcs;

import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.entities.vcs.ReporteProyectoVcs;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReporteProyectoVcsMapeador {

    @Mapping(source = "proyecto.id", target = "proyectoId")
    @Mapping(source = "proyecto.nombre", target = "nombreProyecto")
    @Mapping(source = "periodoAcademico.id", target = "periodoId")
    @Mapping(source = "periodoAcademico.nombre", target = "nombrePeriodo")
    @Mapping(source = "coordinador.id", target = "coordinadorId")
    @Mapping(source = "coordinador.nombreCompleto", target = "nombreCoordinador")
    ReporteProyectoDto aDto(ReporteProyectoVcs entidad);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "proyecto", ignore = true)
    @Mapping(target = "periodoAcademico", ignore = true)
    @Mapping(target = "coordinador", ignore = true)
    @Mapping(target = "estadoSubdecanato", ignore = true)
    @Mapping(target = "observaciones", ignore = true)
    @Mapping(target = "fechaSubida", ignore = true)
    @Mapping(target = "fechaRevision", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    ReporteProyectoVcs aEntidad(ReporteProyectoNuevoDto dto);
}
