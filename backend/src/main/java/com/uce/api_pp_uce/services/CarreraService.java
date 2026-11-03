package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.dtos.CarreraDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CarreraService {
    Page<CarreraDto> obtenerTodas(Pageable pageable);
    Page<CarreraDto> buscarConFiltros(String search, Pageable pageable);
    CarreraDto obtenerPorId(Integer id);
    CarreraDto crear(CarreraDto dto);
    CarreraDto actualizar(Integer id, CarreraDto dto);
    void eliminar(Integer id);
}
