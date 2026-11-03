package com.uce.api_pp_uce.mapeadores;

import com.uce.api_pp_uce.dtos.TutorResumenDto;
import com.uce.api_pp_uce.dtos.UsuarioDto;
import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.dtos.vcs.TutorResumenVcsDto;
import com.uce.api_pp_uce.entities.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UsuarioMapeador {

    @Mapping(source = "usuario.id", target = "id")
    @Mapping(source = "usuario.correo", target = "correo")
    @Mapping(source = "usuario.nombres", target = "nombres")
    @Mapping(source = "usuario.apellidos", target = "apellidos")
    @Mapping(source = "usuario.identificacion", target = "identificacion")
    @Mapping(source = "usuario.tipoIdentificacion", target = "tipoIdentificacion")
    @Mapping(source = "usuario.rol", target = "rol")
    @Mapping(source = "usuario.carrera.id", target = "carreraId")
    @Mapping(source = "usuario.telefono", target = "telefono")
    @Mapping(source = "usuario.urlAvatar", target = "urlAvatar")
    @Mapping(source = "usuario.estado", target = "estado")
    @Mapping(source = "horasRequeridas", target = "horasRequeridas")
    @Mapping(source = "horasAcumuladas", target = "horasAcumuladas")
    UsuarioDto aDto(Usuario usuario, Integer horasRequeridas, Integer horasAcumuladas);

    default UsuarioDto aDto(Usuario usuario) {
        return aDto(usuario, 0, 0);
    }

    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "carrera.nombre", target = "carreraNombre")
    UsuarioResumenDto aDtoResumen(Usuario usuario);

    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "carrera.nombre", target = "nombreCarrera")
    @Mapping(target = "asignacionesActuales", ignore = true)
    @Mapping(target = "proyectos", ignore = true)
    @Mapping(target = "estudiantes", ignore = true)
    TutorResumenVcsDto aTutorResumenDto(Usuario usuario);

    @Mapping(target = "id", source = "usuario.id")
    @Mapping(target = "nombres", source = "usuario.nombres")
    @Mapping(target = "apellidos", source = "usuario.apellidos")
    @Mapping(target = "correo", source = "usuario.correo")
    @Mapping(target = "especialidad", expression = "java(usuario.getCarrera() != null ? usuario.getCarrera().getNombre() : \"General\")")
    @Mapping(target = "estudiantesAsignados", source = "estudiantesAsignados")
    @Mapping(target = "urlAvatar", source = "usuario.urlAvatar")
    @Mapping(target = "estudiantes", source = "estudiantes")
    TutorResumenDto aTutorResumenDto(Usuario usuario, Long estudiantesAsignados, List<UsuarioResumenDto> estudiantes);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "claveHash", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    @Mapping(target = "versionToken", ignore = true)
    Usuario aEntidad(UsuarioDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "carrera", ignore = true)
    @Mapping(target = "claveHash", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "borrado", ignore = true)
    @Mapping(target = "versionToken", ignore = true)
    void actualizarEntidadDesdeDto(UsuarioDto dto, @MappingTarget Usuario usuario);
}
