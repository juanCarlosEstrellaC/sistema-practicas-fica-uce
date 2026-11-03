package com.uce.api_pp_uce.mapeadores.vcs;

import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsNuevoDto;
import com.uce.api_pp_uce.entities.vcs.EvidenciaAsignacionVcs;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EvidenciaAsignacionVcsMapeador {

    @Mapping(source = "asignacion.id", target = "asignacionId")
    @Mapping(source = "estudiante.id", target = "estudianteId")
    @Mapping(source = "estudiante.nombreCompleto", target = "nombreCompletoEstudiante")
    @Mapping(source = "estudiante.identificacion", target = "identificacionEstudiante")
    @Mapping(source = "asignacion.proyectoComunitario.id", target = "proyectoId")
    @Mapping(source = "asignacion.proyectoComunitario.nombre", target = "nombreProyecto")
    EvidenciaVcsDto aDto(EvidenciaAsignacionVcs entidad);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "asignacion", ignore = true)
    @Mapping(target = "estudiante", ignore = true)
    @Mapping(target = "estadoTutor", ignore = true)
    @Mapping(target = "observacionesTutor", ignore = true)
    @Mapping(target = "fechaSubida", ignore = true)
    @Mapping(target = "fechaRevisionTutor", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    EvidenciaAsignacionVcs aEntidad(EvidenciaVcsNuevoDto dto);
}
