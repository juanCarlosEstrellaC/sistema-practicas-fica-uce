package com.uce.api_pp_uce.services.vcs.impl;

import com.uce.api_pp_uce.dtos.vcs.EvidenciaRevisionTutorDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsDto;
import com.uce.api_pp_uce.dtos.vcs.EvidenciaVcsNuevoDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.EvidenciaAsignacionVcs;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.EvidenciaAsignacionVcsMapeador;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.EvidenciaAsignacionVcsRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.vcs.EvidenciaAsignacionVcsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EvidenciaAsignacionVcsServiceImpl implements EvidenciaAsignacionVcsService {

    private final EvidenciaAsignacionVcsRepository evidenciaAsignacionVcsRepository;
    private final AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;
    private final NotificacionService notificacionService;
    private final EvidenciaAsignacionVcsMapeador evidenciaAsignacionVcsMapeador;

    private static final Set<RolUsuario> ROLES_ADMINISTRATIVOS = Set.of(
            RolUsuario.SUBDECANO,
            RolUsuario.DIRECTOR_CARRERA,
            RolUsuario.COORDINADOR_PRACTICAS
    );

    @Transactional
    @Override
    public EvidenciaVcsDto subirEvidencia(EvidenciaVcsNuevoDto dto, Usuario usuarioAutenticado) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(dto.asignacionId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + dto.asignacionId()));

        if (asignacion.getFaseActual() == FaseActualAsignacion.ASIGNACION) {
            throw new NegocioException("No se pueden subir evidencias mientras el proyecto no haya iniciado la fase de Desarrollo");
        }

        Usuario estudiante = asignacion.getProcesoVinculacion().getEstudiante();
        if (usuarioAutenticado != null && !usuarioAutenticado.getId().equals(estudiante.getId())
                && !ROLES_ADMINISTRATIVOS.contains(usuarioAutenticado.getRol())) {
            throw new NegocioException("No tienes permiso para subir evidencias en esta asignación");
        }

        Optional<EvidenciaAsignacionVcs> evidenciaExistenteOpt = (dto.tipoDocumento() != null)
                ? evidenciaAsignacionVcsRepository.findByAsignacionIdAndTipoDocumento(asignacion.getId(), dto.tipoDocumento())
                : Optional.empty();

        EvidenciaAsignacionVcs evidencia;
        if (evidenciaExistenteOpt.isPresent()) {
            evidencia = evidenciaExistenteOpt.get();
            if (evidencia.getEstadoTutor() == EstadoRevisionVcs.APROBADO) {
                throw new NegocioException("No se puede resubir un documento que ya fue aprobado por el tutor académico");
            }
            evidencia.setNombreArchivo(dto.nombreArchivo());
            evidencia.setUrlArchivo(dto.urlArchivo());
            evidencia.setTipoDocumento(dto.tipoDocumento());
            if (dto.horasReportadas() != null) {
                evidencia.setHorasReportadas(dto.horasReportadas());
            }
            evidencia.setEstadoTutor(EstadoRevisionVcs.PENDIENTE);
            evidencia.setObservacionesTutor(null);
            evidencia.setFechaRevisionTutor(null);
            evidencia.setFechaSubida(LocalDateTime.now());
        } else {
            evidencia = evidenciaAsignacionVcsMapeador.aEntidad(dto);
            evidencia.setAsignacion(asignacion);
            evidencia.setEstudiante(estudiante);
            evidencia.setEstadoTutor(EstadoRevisionVcs.PENDIENTE);
            evidencia.setFechaSubida(LocalDateTime.now());
        }

        EvidenciaAsignacionVcs evidenciaGuardada = evidenciaAsignacionVcsRepository.save(evidencia);

        // La asignacion solo transiciona a FINALIZACION cuando existen ambos documentos requeridos (BITACORA e INFORME_FINAL)
        boolean tieneBitacora = dto.tipoDocumento() == TipoDocumentoVcs.BITACORA
                || evidenciaAsignacionVcsRepository.findByAsignacionIdAndTipoDocumento(asignacion.getId(), TipoDocumentoVcs.BITACORA).isPresent();
        boolean tieneInformeFinal = dto.tipoDocumento() == TipoDocumentoVcs.INFORME_FINAL
                || evidenciaAsignacionVcsRepository.findByAsignacionIdAndTipoDocumento(asignacion.getId(), TipoDocumentoVcs.INFORME_FINAL).isPresent();

        if (tieneBitacora && tieneInformeFinal) {
            asignacion.setFaseActual(FaseActualAsignacion.FINALIZACION);
            asignacionProyectoComunitarioRepository.save(asignacion);
        }

        // Notificar al Tutor Académico si está asignado
        Usuario tutor = asignacion.getProyectoComunitario().getTutorAcademico();
        if (tutor != null) {
            notificacionService.enviar(
                    tutor.getId(),
                    "Nueva Evidencia de VCS Recibida",
                    "El estudiante " + estudiante.getNombreCompleto() + " ha subido evidencias para el proyecto: " + asignacion.getProyectoComunitario().getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/asignaciones-existentes?asignacionId=" + asignacion.getId() + "&abrirEvidencias=true"
            );
        }

        return evidenciaAsignacionVcsMapeador.aDto(evidenciaGuardada);
    }

    @Transactional(readOnly = true)
    @Override
    public EvidenciaVcsDto buscarPorId(Long id) {
        EvidenciaAsignacionVcs evidencia = evidenciaAsignacionVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evidencia no encontrada con ID: " + id));
        return evidenciaAsignacionVcsMapeador.aDto(evidencia);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<EvidenciaVcsDto> buscarConFiltros(
            String busqueda,
            Long asignacionId,
            Long estudianteId,
            Long tutorId,
            EstadoRevisionVcs estadoTutor,
            Pageable pageable) {
        String busquedaLimpia = (busqueda != null && !busqueda.trim().isEmpty()) ? busqueda.trim() : null;
        return evidenciaAsignacionVcsRepository
                .buscarConFiltros(busquedaLimpia, asignacionId, estudianteId, tutorId, estadoTutor, pageable)
                .map(evidenciaAsignacionVcsMapeador::aDto);
    }

    @Transactional(readOnly = true)
    @Override
    public List<EvidenciaVcsDto> listarPorAsignacion(Long asignacionId) {
        return evidenciaAsignacionVcsRepository.findByAsignacionIdOrderByFechaSubidaDesc(asignacionId)
                .stream()
                .map(evidenciaAsignacionVcsMapeador::aDto)
                .toList();
    }

    @Transactional
    @Override
    public EvidenciaVcsDto revisarEvidenciaTutor(Long id, EvidenciaRevisionTutorDto dto) {
        EvidenciaAsignacionVcs evidencia = evidenciaAsignacionVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evidencia no encontrada con ID: " + id));

        evidencia.setEstadoTutor(dto.estadoTutor());
        evidencia.setObservacionesTutor(dto.observaciones());
        evidencia.setFechaRevisionTutor(LocalDateTime.now());

        EvidenciaAsignacionVcs evidenciaActualizada = evidenciaAsignacionVcsRepository.save(evidencia);

        AsignacionProyectoComunitario asignacion = evidencia.getAsignacion();
        if (asignacion != null) {
            List<EvidenciaAsignacionVcs> todasEvidencias = evidenciaAsignacionVcsRepository
                    .findByAsignacionIdOrderByFechaSubidaDesc(asignacion.getId());

            boolean bitacoraAprobada = todasEvidencias.stream().anyMatch(e ->
                    e.getTipoDocumento() == TipoDocumentoVcs.BITACORA && e.getEstadoTutor() == EstadoRevisionVcs.APROBADO);
            boolean informeFinalAprobado = todasEvidencias.stream().anyMatch(e ->
                    e.getTipoDocumento() == TipoDocumentoVcs.INFORME_FINAL && e.getEstadoTutor() == EstadoRevisionVcs.APROBADO);

            boolean ambosAprobados = bitacoraAprobada && informeFinalAprobado;

            // Si los documentos previamente estaban validados pero ahora uno fue observado o revertido,
            // se invalida la validación enviada a Subdecanato.
            // La validación y envío a Subdecanato ya no es automático al aprobar ambos documentos,
            // sino que debe ser activada explícitamente por el Tutor Académico.
            if (!ambosAprobados && asignacion.isDocumentosValidados()) {
                asignacion.setDocumentosValidados(false);
                asignacionProyectoComunitarioRepository.save(asignacion);
            }
        }

        // Notificar al estudiante
        String estadoTexto = dto.estadoTutor() == EstadoRevisionVcs.APROBADO ? "aprobada" : "observada";
        notificacionService.enviar(
                evidencia.getEstudiante().getId(),
                "Revisión de Evidencia de VCS",
                "Tu evidencia (" + evidencia.getNombreArchivo() + ") ha sido " + estadoTexto + " por tu tutor académico.",
                TipoNotificacion.INFORMACION,
                "/dashboard/vinculacion/mi-proyecto?asignacionId=" + (asignacion != null ? asignacion.getId() : "")
        );

        return evidenciaAsignacionVcsMapeador.aDto(evidenciaActualizada);
    }

    @Transactional
    @Override
    public void eliminarEvidencia(Long id) {
        EvidenciaAsignacionVcs evidencia = evidenciaAsignacionVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evidencia no encontrada con ID: " + id));

        if (evidencia.getEstadoTutor() == EstadoRevisionVcs.APROBADO) {
            throw new NegocioException("No se puede eliminar una evidencia que ya fue aprobada por el tutor académico");
        }

        evidenciaAsignacionVcsRepository.delete(evidencia);
    }
}
