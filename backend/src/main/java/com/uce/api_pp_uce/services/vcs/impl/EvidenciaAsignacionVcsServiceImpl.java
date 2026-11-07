package com.uce.api_pp_uce.services.vcs.impl;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EvidenciaAsignacionVcsServiceImpl implements EvidenciaAsignacionVcsService {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento;

    private final EvidenciaAsignacionVcsRepository evidenciaAsignacionVcsRepository;
    private final AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;
    private final NotificacionService notificacionService;
    private final EvidenciaAsignacionVcsMapeador evidenciaAsignacionVcsMapeador;
    private final com.uce.api_pp_uce.services.UsuarioAutenticadoService usuarioAutenticadoService;

    private static final Set<RolUsuario> ROLES_ADMINISTRATIVOS = Set.of(
            RolUsuario.SUBDECANO,
            RolUsuario.DIRECTOR_CARRERA,
            RolUsuario.COORDINADOR_PRACTICAS
    );

    @Transactional
    @Override
    public EvidenciaVcsDto subirEvidencia(EvidenciaVcsNuevoDto dto) {
        return subirEvidencia(dto, usuarioAutenticadoService.obtenerUsuarioLogueado());
    }

    @Transactional
    @Override
    public EvidenciaVcsDto subirEvidencia(EvidenciaVcsNuevoDto dto, Usuario usuarioAutenticado) {
        if (usuarioAutenticado == null) {
            usuarioAutenticado = usuarioAutenticadoService.obtenerUsuarioLogueado();
        }
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

        return mapearADto(evidenciaGuardada);
    }

    @Transactional(readOnly = true)
    @Override
    public EvidenciaVcsDto buscarPorId(Long id) {
        EvidenciaAsignacionVcs evidencia = evidenciaAsignacionVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evidencia no encontrada con ID: " + id));
        return mapearADto(evidencia);
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
                .map(this::mapearADto);
    }

    @Transactional(readOnly = true)
    @Override
    public List<EvidenciaVcsDto> listarPorAsignacion(Long asignacionId) {
        return evidenciaAsignacionVcsRepository.findByAsignacionIdOrderByFechaSubidaDesc(asignacionId)
                .stream()
                .map(this::mapearADto)
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

        return mapearADto(evidenciaActualizada);
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

    private EvidenciaVcsDto mapearADto(EvidenciaAsignacionVcs e) {
        if (e == null) {
            return null;
        }
        EvidenciaVcsDto dto = evidenciaAsignacionVcsMapeador.aDto(e);
        if (e.getId() != null) {
            return new EvidenciaVcsDto(
                    dto.id(),
                    dto.asignacionId(),
                    dto.estudianteId(),
                    dto.nombreCompletoEstudiante(),
                    dto.identificacionEstudiante(),
                    dto.proyectoId(),
                    dto.nombreProyecto(),
                    dto.tipoDocumento(),
                    dto.nombreArchivo(),
                    "/evidencias-vcs/" + e.getId() + "/preview",
                    dto.horasReportadas(),
                    dto.estadoTutor(),
                    dto.observacionesTutor(),
                    dto.fechaSubida(),
                    dto.fechaRevisionTutor()
            );
        }
        return dto;
    }

    @Transactional(readOnly = true)
    @Override
    public ArchivoDescargaDto obtenerEvidenciaDescarga(Long id) {
        return obtenerEvidenciaDescarga(id, usuarioAutenticadoService.obtenerUsuarioLogueado());
    }

    @Transactional(readOnly = true)
    @Override
    public ArchivoDescargaDto obtenerEvidenciaDescarga(Long id, Usuario usuarioAutenticado) {
        if (usuarioAutenticado == null) {
            usuarioAutenticado = usuarioAutenticadoService.obtenerUsuarioLogueado();
        }
        EvidenciaAsignacionVcs evidencia = evidenciaAsignacionVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evidencia no encontrada con ID: " + id));

        if (usuarioAutenticado != null) {
            RolUsuario rol = usuarioAutenticado.getRol();
            Long miId = usuarioAutenticado.getId();

            if (rol == RolUsuario.ESTUDIANTE) {
                Long estudianteId = evidencia.getEstudiante() != null ? evidencia.getEstudiante().getId() : null;
                if (!miId.equals(estudianteId)) {
                    throw new AccessDeniedException("No tiene permisos para acceder a la evidencia de otro estudiante.");
                }
            } else if (rol == RolUsuario.TUTOR_ACADEMICO) {
                Long tutorId = (evidencia.getAsignacion() != null
                        && evidencia.getAsignacion().getProyectoComunitario() != null
                        && evidencia.getAsignacion().getProyectoComunitario().getTutorAcademico() != null)
                        ? evidencia.getAsignacion().getProyectoComunitario().getTutorAcademico().getId()
                        : null;
                if (tutorId == null || !miId.equals(tutorId)) {
                    throw new AccessDeniedException("No tiene permisos para acceder a esta evidencia (no es el tutor asignado).");
                }
            } else if (rol == RolUsuario.DIRECTOR_CARRERA || rol == RolUsuario.COORDINADOR_PRACTICAS) {
                Integer miCarreraId = usuarioAutenticado.getCarrera() != null ? usuarioAutenticado.getCarrera().getId() : null;
                Integer carreraDoc = (evidencia.getAsignacion() != null
                        && evidencia.getAsignacion().getProyectoComunitario() != null
                        && evidencia.getAsignacion().getProyectoComunitario().getCarrera() != null)
                        ? evidencia.getAsignacion().getProyectoComunitario().getCarrera().getId()
                        : null;
                if (miCarreraId != null && carreraDoc != null && !miCarreraId.equals(carreraDoc)) {
                    throw new AccessDeniedException("No tiene permisos para acceder a evidencias de estudiantes de otra carrera.");
                }
            }
        }

        String rutaLimpia = evidencia.getUrlArchivo() != null ? evidencia.getUrlArchivo().trim() : "";
        if (rutaLimpia.startsWith("/")) {
            rutaLimpia = rutaLimpia.substring(1);
        }
        if (rutaLimpia.startsWith("archivos_subidos/")) {
            rutaLimpia = rutaLimpia.substring("archivos_subidos/".length());
        }

        Path carpetaBase = Paths.get(rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos")
                .toAbsolutePath().normalize();
        Path filePath = carpetaBase.resolve(rutaLimpia).normalize().toAbsolutePath();

        if (!filePath.startsWith(carpetaBase)) {
            throw new NegocioException("Acceso no permitido: ruta de archivo invalida");
        }

        if (!Files.exists(filePath)) {
            Path posible = carpetaBase.resolve("vinculacion")
                    .resolve(Paths.get(rutaLimpia).getFileName()).normalize().toAbsolutePath();
            if (posible.startsWith(carpetaBase) && Files.exists(posible)) {
                filePath = posible;
            } else {
                throw new RecursoNoEncontradoException("El archivo físico de la evidencia no existe en el servidor: " + filePath.getFileName());
            }
        }

        byte[] contenido;
        try {
            contenido = Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo de la evidencia del disco", e);
        }

        String nombreDescarga = evidencia.getNombreArchivo() != null && !evidencia.getNombreArchivo().isBlank()
                ? evidencia.getNombreArchivo()
                : filePath.getFileName().toString();

        return new ArchivoDescargaDto(contenido, nombreDescarga, "application/pdf");
    }
}
