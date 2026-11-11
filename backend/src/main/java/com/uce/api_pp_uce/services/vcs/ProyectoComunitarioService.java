package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProyectoComunitarioService {

    Page<ProyectoComunitarioDto> buscarConFiltros(String busqueda, Integer carreraId, Long tutorId, EstadoProyecto estado, Long periodoId, Pageable pageable);

    default Page<ProyectoComunitarioDto> buscarConFiltros(String busqueda, Integer carreraId, Long tutorId, EstadoProyecto estado, Pageable pageable) {
        return buscarConFiltros(busqueda, carreraId, tutorId, estado, null, pageable);
    }

    ProyectoComunitarioDto buscarPorId(Long id, Long periodoId);

    default ProyectoComunitarioDto buscarPorId(Long id) {
        return buscarPorId(id, null);
    }

    ProyectoComunitarioDto crearProyecto(ProyectoComunitarioNuevoDto dto);

    ProyectoComunitarioDto actualizarProyecto(Long id, ProyectoComunitarioActualizarDto dto);

    void eliminarProyecto(Long id);
}
