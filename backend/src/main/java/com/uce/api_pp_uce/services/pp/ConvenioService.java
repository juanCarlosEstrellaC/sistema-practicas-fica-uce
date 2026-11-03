package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.enums.pp.EstadoConvenio;

import com.uce.api_pp_uce.dtos.pp.ConvenioDto;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Servicio para manejar la lógica de negocio de Conversios oficiales.
 */
public interface ConvenioService {
    Page<ConvenioDto> buscarTodos(Pageable pageable);

    Page<ConvenioDto> buscarConFiltros(String search, EstadoConvenio estado, Pageable pageable);

    ConvenioDto buscarPorId(Long id);

    ConvenioDto crearConvenio(NuevoConvenioDto dto);

    ConvenioDto actualizarConvenio(Long id, NuevoConvenioDto dto);

    void eliminarConvenio(Long id);

    Page<ConvenioDto> buscarConveniosActivosYCuposDisponibles(Pageable pageable);
}
