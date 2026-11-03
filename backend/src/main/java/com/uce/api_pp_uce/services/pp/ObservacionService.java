package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.pp.NuevaObservacionDto;
import com.uce.api_pp_uce.dtos.pp.ObservacionDto;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ObservacionService {
    ObservacionDto crearObservacion(NuevaObservacionDto dto);
    ObservacionDto crearObservacion(Long remitenteId, Integer carreraId, TipoObservacion tipo, String empresa, String contacto, String correo, String descripcion);
    Page<ObservacionDto> listarTodas(Long remitenteId, TipoObservacion tipo, EstadoObservacion estado, String busqueda, Pageable pageable);
    ObservacionDto obtenerPorId(Long id);
    ObservacionDto procesarObservacion(Long id, EstadoObservacion nuevoEstado, String motivoRechazo);
}
