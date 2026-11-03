package com.uce.api_pp_uce.mapeadores.vcs;

import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.EstudianteResumenVcsDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioResumenDto;
import com.uce.api_pp_uce.dtos.vcs.TutorResumenVcsDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ProcesoVinculacion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AsignacionProyectoComunitarioMapeador {

    @Mapping(source = "procesoVinculacion.id", target = "procesoVinculacionId")
    @Mapping(source = "procesoVinculacion.estudiante.id", target = "estudianteId")
    @Mapping(source = "procesoVinculacion.estudiante.nombreCompleto", target = "nombreCompletoEstudiante")
    @Mapping(source = "procesoVinculacion.estudiante.identificacion", target = "identificacionEstudiante")
    @Mapping(source = "procesoVinculacion.estudiante.correo", target = "correoEstudiante")
    @Mapping(source = "procesoVinculacion.carrera.id", target = "carreraId")
    @Mapping(source = "procesoVinculacion.carrera.nombre", target = "nombreCarrera")
    @Mapping(source = "proyectoComunitario.id", target = "proyectoId")
    @Mapping(source = "proyectoComunitario.nombre", target = "nombreProyecto")
    @Mapping(source = "proyectoComunitario.tutorAcademico.id", target = "tutorId")
    @Mapping(source = "proyectoComunitario.tutorAcademico.nombreCompleto", target = "nombreCompletoTutor")
    @Mapping(source = "proyectoComunitario.tutorAcademico.correo", target = "correoTutor")
    @Mapping(source = "periodoAcademico.id", target = "periodoAcademicoId")
    @Mapping(source = "periodoAcademico.nombre", target = "nombrePeriodoAcademico")
    @Mapping(source = "procesoVinculacion.horasAcumuladas", target = "horasAcumuladasEstudiante")
    @Mapping(source = "procesoVinculacion.horasRequeridas", target = "horasRequeridasEstudiante")
    AsignacionProyectoComunitarioDto aDto(AsignacionProyectoComunitario entidad);

    @Mapping(source = "estudiante.id", target = "id")
    @Mapping(source = "estudiante.nombres", target = "nombres")
    @Mapping(source = "estudiante.apellidos", target = "apellidos")
    @Mapping(source = "estudiante.identificacion", target = "identificacion")
    @Mapping(source = "estudiante.tipoIdentificacion", target = "tipoIdentificacion")
    @Mapping(source = "estudiante.correo", target = "correo")
    @Mapping(source = "estudiante.telefono", target = "telefono")
    @Mapping(source = "carrera.nombre", target = "carreraNombre")
    @Mapping(source = "carrera.id", target = "carreraId")
    @Mapping(source = "estudiante.urlAvatar", target = "urlAvatar")
    @Mapping(source = "horasAcumuladas", target = "horasCompletadasVcs")
    @Mapping(source = "horasRequeridas", target = "horasRequeridasVcs")
    EstudianteResumenVcsDto aEstudianteResumenDto(ProcesoVinculacion proceso);

    @Mapping(source = "estudiante.id", target = "id")
    @Mapping(source = "estudiante.nombres", target = "nombres")
    @Mapping(source = "estudiante.apellidos", target = "apellidos")
    @Mapping(source = "estudiante.identificacion", target = "identificacion")
    @Mapping(source = "estudiante.tipoIdentificacion", target = "tipoIdentificacion")
    @Mapping(source = "estudiante.correo", target = "correo")
    @Mapping(source = "estudiante.telefono", target = "telefono")
    @Mapping(source = "estudiante.carrera.nombre", target = "carreraNombre")
    @Mapping(source = "estudiante.carrera.id", target = "carreraId")
    @Mapping(source = "estudiante.urlAvatar", target = "urlAvatar")
    @Mapping(source = "horasCompletadas", target = "horasCompletadasVcs")
    @Mapping(source = "horasRequeridas", target = "horasRequeridasVcs")
    EstudianteResumenVcsDto aEstudianteResumenDto(Usuario estudiante, Integer horasCompletadas, Integer horasRequeridas);

    @Mapping(source = "tutor.id", target = "id")
    @Mapping(source = "tutor.nombres", target = "nombres")
    @Mapping(source = "tutor.apellidos", target = "apellidos")
    @Mapping(source = "tutor.identificacion", target = "identificacion")
    @Mapping(source = "tutor.correo", target = "correo")
    @Mapping(source = "carreraId", target = "carreraId")
    @Mapping(source = "nombreCarrera", target = "nombreCarrera")
    @Mapping(source = "asignacionesActuales", target = "asignacionesActuales")
    @Mapping(source = "proyectos", target = "proyectos")
    @Mapping(source = "estudiantes", target = "estudiantes")
    TutorResumenVcsDto aTutorResumenDto(Usuario tutor, Integer carreraId, String nombreCarrera, Integer asignacionesActuales, List<ProyectoComunitarioResumenDto> proyectos, List<UsuarioResumenDto> estudiantes);
}
