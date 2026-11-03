package com.uce.api_pp_uce.mapeadores.pp;

import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.mapeadores.UsuarioMapeador;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {UsuarioMapeador.class}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AsignacionPracticaMapeador {

    @Mapping(target = "estudianteId", source = "estudiante.id")
    @Mapping(target = "convenioId", source = "convenio.id")
    @Mapping(target = "institucion", source = "convenio.institucion")
    @Mapping(target = "direccion", source = "convenio.direccion")
    @Mapping(target = "tutorAcademicoId", source = "tutorAcademico.id")
    @Mapping(target = "tutorInstitucional", expression = "java(resolverTutorInstitucional(asignacion))")
    @Mapping(target = "periodoAcademicoId", source = "periodoAcademico.id")
    @Mapping(target = "sectorReceptora", expression = "java(resolverSectorReceptora(asignacion))")
    AsignacionPracticaDto aDto(AsignacionPractica asignacion);

    @Mapping(target = "id", source = "asignacion.id")
    @Mapping(target = "estudiante", source = "asignacion.estudiante")
    @Mapping(target = "tutorAcademico", source = "asignacion.tutorAcademico")
    @Mapping(target = "convenioId", source = "asignacion.convenio.id")
    @Mapping(target = "institucion", source = "asignacion.convenio.institucion")
    @Mapping(target = "direccion", source = "asignacion.convenio.direccion")
    @Mapping(target = "tutorInstitucional", expression = "java(resolverTutorInstitucional(asignacion))")
    @Mapping(target = "correoTutorInstitucional", source = "asignacion.convenio.correoTutor")
    @Mapping(target = "telefonoTutorInstitucional", source = "asignacion.convenio.telefonoTutor")
    @Mapping(target = "directorCarreraNombre", expression = "java(resolverDirectorCarreraNombre(asignacion))")
    @Mapping(target = "periodoAcademicoNombre", source = "asignacion.periodoAcademico.nombre")
    @Mapping(target = "periodoAcademicoId", source = "asignacion.periodoAcademico.id")
    @Mapping(target = "semestre", source = "asignacion.semestre")
    @Mapping(target = "horasAsignadas", source = "asignacion.horasAsignadas")
    @Mapping(target = "horasCompletadas", source = "asignacion.horasCompletadas")
    @Mapping(target = "fechaInicio", source = "asignacion.fechaInicio")
    @Mapping(target = "fechaFin", source = "asignacion.fechaFin")
    @Mapping(target = "fase", source = "asignacion.fase")
    @Mapping(target = "estado", source = "asignacion.estado")
    @Mapping(target = "validadoCpp", source = "asignacion.validadoCpp")
    @Mapping(target = "reunionRealizada", source = "asignacion.reunionRealizada")
    @Mapping(target = "validadoSiiu", source = "asignacion.validadoSiiu")
    @Mapping(target = "cartaAsignacionEnviada", source = "asignacion.cartaAsignacionEnviada")
    @Mapping(target = "sectorReceptora", expression = "java(resolverSectorReceptora(asignacion))")
    @Mapping(target = "observacionesCaces", source = "asignacion.observacionesCaces")
    @Mapping(target = "puedeEditar", source = "puedeEditar")
    AsignacionPracticaDetalleDto aDetalleDto(AsignacionPractica asignacion, Boolean puedeEditar);

    default String resolverSectorReceptora(AsignacionPractica a) {
        if (a != null && a.getConvenio() != null && a.getConvenio().getTipo() != null) {
            return a.getConvenio().getTipo().name();
        }
        return null;
    }

    default String resolverTutorInstitucional(AsignacionPractica a) {
        if (a == null) return null;
        if (a.getTutorInstitucional() != null && !a.getTutorInstitucional().isBlank()) {
            return a.getTutorInstitucional();
        }
        if (a.getConvenio() != null && a.getConvenio().getTutorInstitucional() != null && !a.getConvenio().getTutorInstitucional().isBlank()) {
            return a.getConvenio().getTutorInstitucional();
        }
        return null;
    }

    default String resolverDirectorCarreraNombre(AsignacionPractica a) {
        if (a != null && a.getEstudiante() != null && a.getEstudiante().getCarrera() != null && a.getEstudiante().getCarrera().getDirector() != null) {
            Usuario director = a.getEstudiante().getCarrera().getDirector();
            return director.getNombreCompleto();
        }
        return "POR DESIGNAR";
    }
}
