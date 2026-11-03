package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.dtos.UsuarioResumenDto;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import java.time.LocalDate;

public record AsignacionPracticaDetalleDto(
        Long id,
        UsuarioResumenDto estudiante,
        UsuarioResumenDto tutorAcademico,
        Long convenioId,
        String institucion,
        String direccion,
        String tutorInstitucional,
        String correoTutorInstitucional,
        String telefonoTutorInstitucional,
        String directorCarreraNombre,
        String periodoAcademicoNombre,
        Long periodoAcademicoId,
        Integer semestre,
        Integer horasAsignadas,
        Integer horasCompletadas,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        FaseActualPractica fase,
        EstadoAsignacion estado,
        Boolean validadoCpp,
        Boolean reunionRealizada,
        Boolean validadoSiiu,
        Boolean cartaAsignacionEnviada,
        String sectorReceptora,
        String observacionesCaces,
        Boolean puedeEditar) {
}
