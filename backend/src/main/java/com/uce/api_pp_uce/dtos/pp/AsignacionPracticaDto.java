package com.uce.api_pp_uce.dtos.pp;

import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import java.time.LocalDate;

public record AsignacionPracticaDto(
        Long id,
        Long estudianteId,
        Long convenioId,
        String institucion,
        String direccion,
        Long tutorAcademicoId,
        String tutorInstitucional,
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
        String sectorReceptora,
        String observacionesCaces) {
}
