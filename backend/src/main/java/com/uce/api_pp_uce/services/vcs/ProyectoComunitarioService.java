package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProyectoComunitarioService {

    Page<ProyectoComunitarioDto> buscarConFiltros(String busqueda, Integer carreraId, Long tutorId, EstadoProyecto estado, Pageable pageable);

    ProyectoComunitarioDto buscarPorId(Long id);

    ProyectoComunitarioDto crearProyecto(ProyectoComunitarioNuevoDto dto);

    ProyectoComunitarioDto actualizarProyecto(Long id, ProyectoComunitarioActualizarDto dto);

    void eliminarProyecto(Long id);
}
