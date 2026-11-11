package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteRevisionSubdecanatoDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReporteProyectoVcsService {

    ReporteProyectoDto subirReporte(ReporteProyectoNuevoDto dto, Usuario usuarioAutenticado);

    ReporteProyectoDto buscarPorId(Long id);

    Page<ReporteProyectoDto> buscarConFiltros(
            String busqueda,
            Long proyectoId,
            Long periodoId,
            TipoReporteProyectoVcs tipo,
            EstadoRevisionVcs estadoSubdecanato,
            Pageable pageable
    );

    List<ReporteProyectoDto> listarPorProyecto(Long proyectoId, Long periodoId);

    default List<ReporteProyectoDto> listarPorProyecto(Long proyectoId) {
        return listarPorProyecto(proyectoId, null);
    }

    ReporteProyectoDto revisarReporteSubdecanato(Long id, ReporteRevisionSubdecanatoDto dto);

    void eliminarReporte(Long id);

    ArchivoDescargaDto obtenerReporteDescarga(Long id);

    ArchivoDescargaDto obtenerReporteDescarga(Long id, Usuario usuarioAutenticado);
}
