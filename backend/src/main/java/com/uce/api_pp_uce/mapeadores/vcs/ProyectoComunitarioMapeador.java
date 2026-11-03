package com.uce.api_pp_uce.mapeadores.vcs;

import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioResumenDto;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProyectoComunitarioMapeador {

    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "carrera.nombre", target = "nombreCarrera")
    @Mapping(source = "tutorAcademico.id", target = "tutorAcademicoId")
    @Mapping(source = "tutorAcademico.nombreCompleto", target = "nombreCompletoTutor")
    @Mapping(source = "tutorAcademico.correo", target = "correoTutor")
    @Mapping(target = "iniciado", ignore = true)
    ProyectoComunitarioDto aDto(ProyectoComunitario entidad);

    @Mapping(source = "entidad.carrera.id", target = "carreraId")
    @Mapping(source = "entidad.carrera.nombre", target = "nombreCarrera")
    @Mapping(source = "entidad.tutorAcademico.id", target = "tutorAcademicoId")
    @Mapping(source = "entidad.tutorAcademico.nombreCompleto", target = "nombreCompletoTutor")
    @Mapping(source = "entidad.tutorAcademico.correo", target = "correoTutor")
    @Mapping(source = "entidad.urlDocumento", target = "urlDocumento")
    @Mapping(source = "entidad.nombreDocumento", target = "nombreDocumento")
    @Mapping(source = "iniciado", target = "iniciado")
    ProyectoComunitarioDto aDto(ProyectoComunitario entidad, boolean iniciado);

    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "carrera.nombre", target = "nombreCarrera")
    @Mapping(source = "tutorAcademico.id", target = "tutorAcademicoId")
    @Mapping(source = "tutorAcademico.nombreCompleto", target = "nombreTutor")
    ProyectoComunitarioResumenDto aDtoResumen(ProyectoComunitario entidad);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "tutorAcademico", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    ProyectoComunitario aEntidad(ProyectoComunitarioNuevoDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "tutorAcademico", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    void actualizarEntidadDesdeDto(ProyectoComunitarioActualizarDto dto, @MappingTarget ProyectoComunitario entidad);
}
