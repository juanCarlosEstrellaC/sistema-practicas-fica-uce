package com.uce.api_pp_uce.services.vcs;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.uce.api_pp_uce.dtos.vcs.AprobarHorasSubdecanatoDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioMasivoDto;
import com.uce.api_pp_uce.dtos.vcs.EstudianteResumenVcsDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioResumenDto;
import com.uce.api_pp_uce.dtos.vcs.ResultadoAprobacionHorasDto;
import com.uce.api_pp_uce.dtos.vcs.TutorResumenVcsDto;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;

public interface AsignacionProyectoComunitarioService {

    AsignacionProyectoComunitarioDto buscarPorId(Long id);

    List<EstudianteResumenVcsDto> listarEstudiantesDisponibles(Integer carreraId, Long periodoId, String busqueda);

    List<ProyectoComunitarioResumenDto> listarProyectosDisponibles(Integer carreraId, Long periodoId, String busqueda);

    List<TutorResumenVcsDto> listarTutoresDisponibles(Integer carreraId, Long periodoId, String busqueda, Long proyectoId, String conAsignaciones);
    
    default List<TutorResumenVcsDto> listarTutoresDisponibles(Integer carreraId, Long periodoId, String busqueda) {
        return listarTutoresDisponibles(carreraId, periodoId, busqueda, null, null);
    }

    Page<AsignacionProyectoComunitarioDto> buscarConFiltros(
            String busqueda,
            Integer carreraId,
            Long tutorId,
            Long estudianteId,
            Long proyectoId,
            EstadoAsignacionVcs estado,
            FaseActualAsignacion faseActual,
            Long periodoId,
            Pageable pageable);

    default Page<AsignacionProyectoComunitarioDto> buscarConFiltros(
            String busqueda,
            Integer carreraId,
            Long tutorId,
            Long proyectoId,
            EstadoAsignacionVcs estado,
            FaseActualAsignacion faseActual,
            Long periodoId,
            Pageable pageable) {
        return buscarConFiltros(busqueda, carreraId, tutorId, null, proyectoId, estado, faseActual, periodoId, pageable);
    }

    default Page<AsignacionProyectoComunitarioDto> buscarConFiltros(
            String busqueda,
            Integer carreraId,
            Long proyectoId,
            EstadoAsignacionVcs estado,
            FaseActualAsignacion faseActual,
            Long periodoId,
            Pageable pageable) {
        return buscarConFiltros(busqueda, carreraId, null, null, proyectoId, estado, faseActual, periodoId, pageable);
    }

    List<AsignacionProyectoComunitarioDto> asignarEstudiantesMasivo(AsignacionProyectoComunitarioMasivoDto dto);

    AsignacionProyectoComunitarioDto actualizarAsignacion(Long id, AsignacionProyectoComunitarioActualizarDto dto);

    void asociarProyectosATutor(Long tutorId, List<Long> proyectoIds);

    void eliminarAsignacion(Long id);

    AsignacionProyectoComunitarioDto iniciarDesarrollo(Long id);

    int iniciarProyecto(Long proyectoId);

    AsignacionProyectoComunitarioDto enviarASubdecanato(Long id);

    ResultadoAprobacionHorasDto aprobarHorasSubdecanato(Long id, AprobarHorasSubdecanatoDto dto);

    byte[] vistaPreviaCertificadoHoras(Long id, String subdecanoNombre, String subdecanoCedula, String subdecanoTelefono, String subdecanoCorreo);

    String obtenerNombreArchivoCertificado(Long id);

    List<AsignacionProyectoComunitarioDto> listarPorEstudiante(Long estudianteId);

    List<AsignacionProyectoComunitarioDto> listarPorTutor(Long tutorId);

    AsignacionProyectoComunitarioDto reprobarAsignacion(Long id);

    AsignacionProyectoComunitarioDto cancelarAsignacion(Long id);
}
