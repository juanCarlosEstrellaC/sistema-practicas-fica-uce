package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDto;
import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.dtos.AsignacionStatsDto;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AsignacionPracticaService {
    Page<AsignacionPracticaDetalleDto> buscarConFiltros(String busqueda, EstadoAsignacion estado, FaseActualPractica fase, Integer carreraId, Long periodoId, Long tutorId, Long estudianteId, Boolean requiereCarta, Pageable pageable);

    AsignacionPracticaDetalleDto buscarDetallePorId(Long id);

    AsignacionStatsDto obtenerEstadisticas();

    // Flujo de Negocio (Mockup)
    AsignacionPracticaDetalleDto asignarTutorYConvenio(Long estudianteId, Long convenioId, Long tutorId,
            String tutorInstitucional, Integer horas, Long periodoAcademicoId);

    AsignacionPracticaDetalleDto emitirCartaAsignacion(Long asignacionId, String urlCartaFirmada);

    void reenviarCartaAsignacion(Long asignacionId);

    AsignacionPracticaDetalleDto iniciarDesarrolloPracticas(Long asignacionId);

    AsignacionPracticaDetalleDto avanzarHoras(Long asignacionId, Integer horas);

    AsignacionPracticaDetalleDto firmarRegistroDesarrollo(Long asignacionId, String urlInforme, String urlCertificado, String urlSeguimiento, LocalDate fechaFin);

    byte[] generarPdfCartaAsignacion(Long asignacionId);

    byte[] generarPdfAval(Long asignacionId, String subdecanoNombre, String subdecanoCedula, String subdecanoTelefono, String subdecanoCorreo);

    AsignacionPracticaDetalleDto validarCpp(Long asignacionId);

    AsignacionPracticaDetalleDto generarAval(Long asignacionId, String urlAvalFirmado);

    AsignacionPracticaDetalleDto actualizarDatosCaces(Long asignacionId, String observacionesCaces);

    AsignacionPracticaDetalleDto validarSiiu(Long asignacionId);

    // Métodos base
    Page<AsignacionPracticaDto> buscarTodas(Pageable pageable);

    AsignacionPracticaDto buscarPorId(Long id);

    void eliminarAsignacion(Long asignacionId);

    AsignacionPracticaDetalleDto cancelarAsignacion(Long asignacionId);

    AsignacionPracticaDetalleDto reprobarAsignacion(Long asignacionId);

    AsignacionPracticaDetalleDto actualizarAsignacion(Long asignacionId, Long convenioId, Long tutorId, Integer horas, Long periodoAcademicoId);
}
