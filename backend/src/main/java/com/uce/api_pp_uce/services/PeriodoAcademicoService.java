package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.dtos.PeriodoAcademicoDto;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PeriodoAcademicoService {
    Page<PeriodoAcademicoDto> buscarTodos(Pageable pageable);
    Page<PeriodoAcademicoDto> buscarConFiltros(String busqueda, EstadoPeriodo estado, Pageable pageable);
    PeriodoAcademicoDto buscarPorId(Long id);
    PeriodoAcademicoDto crear(PeriodoAcademicoDto dto);
    PeriodoAcademicoDto actualizar(Long id, PeriodoAcademicoDto dto);
    void eliminar(Long id);
}
