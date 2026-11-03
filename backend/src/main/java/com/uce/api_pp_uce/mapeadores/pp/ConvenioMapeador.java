package com.uce.api_pp_uce.mapeadores.pp;

import com.uce.api_pp_uce.dtos.pp.ConvenioDto;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import com.uce.api_pp_uce.entities.pp.Convenio;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ConvenioMapeador {

    @Mapping(target = "id", source = "convenio.id")
    @Mapping(target = "institucion", source = "convenio.institucion")
    @Mapping(target = "tipo", source = "convenio.tipo")
    @Mapping(target = "campoEspecifico", source = "convenio.campoEspecifico")
    @Mapping(target = "direccion", source = "convenio.direccion")
    @Mapping(target = "fechaInicio", source = "convenio.fechaInicio")
    @Mapping(target = "fechaFin", source = "convenio.fechaFin")
    @Mapping(target = "estado", source = "convenio.estado")
    @Mapping(target = "cuposDisponibles", source = "convenio.cuposDisponibles")
    @Mapping(target = "tutorInstitucional", source = "convenio.tutorInstitucional")
    @Mapping(target = "correoTutor", source = "convenio.correoTutor")
    @Mapping(target = "telefonoTutor", source = "convenio.telefonoTutor")
    @Mapping(target = "urlDocumento", source = "convenio.urlDocumento")
    @Mapping(target = "nombreDocumento", source = "convenio.nombreDocumento")
    @Mapping(target = "ocupados", source = "ocupados")
    ConvenioDto aDto(Convenio convenio, Integer ocupados);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    Convenio aEntidad(NuevoConvenioDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    void actualizarEntidadDesdeDto(NuevoConvenioDto dto, @MappingTarget Convenio convenio);
}
