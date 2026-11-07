package com.uce.api_pp_uce.services.vcs;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaRevisionTutorDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsNuevoDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EvidenciaAsignacionVcsService {

    EvidenciaVcsDto subirEvidencia(EvidenciaVcsNuevoDto dto);

    EvidenciaVcsDto subirEvidencia(EvidenciaVcsNuevoDto dto, Usuario usuarioAutenticado);

    EvidenciaVcsDto buscarPorId(Long id);

    Page<EvidenciaVcsDto> buscarConFiltros(
            String busqueda,
            Long asignacionId,
            Long estudianteId,
            Long tutorId,
            EstadoRevisionVcs estadoTutor,
            Pageable pageable
    );

    List<EvidenciaVcsDto> listarPorAsignacion(Long asignacionId);

    EvidenciaVcsDto revisarEvidenciaTutor(Long id, EvidenciaRevisionTutorDto dto);

    void eliminarEvidencia(Long id);

    ArchivoDescargaDto obtenerEvidenciaDescarga(Long id);

    ArchivoDescargaDto obtenerEvidenciaDescarga(Long id, Usuario usuarioAutenticado);
}
