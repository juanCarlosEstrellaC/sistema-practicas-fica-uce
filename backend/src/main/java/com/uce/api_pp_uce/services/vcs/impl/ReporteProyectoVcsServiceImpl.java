package com.uce.api_pp_uce.services.vcs.impl;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteRevisionSubdecanatoDto;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ReporteProyectoVcs;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.ReporteProyectoVcsMapeador;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ReporteProyectoVcsRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.vcs.ReporteProyectoVcsService;
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

@Service
@RequiredArgsConstructor
public class ReporteProyectoVcsServiceImpl implements ReporteProyectoVcsService {

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento = "archivos_subidos";

    private final ReporteProyectoVcsRepository reporteProyectoVcsRepository;
    private final ProyectoComunitarioRepository proyectoComunitarioRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final ReporteProyectoVcsMapeador reporteProyectoVcsMapeador;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    private Usuario obtenerUsuarioAutenticadoActual() {
        return usuarioAutenticadoService != null ? usuarioAutenticadoService.obtenerUsuarioLogueado() : null;
    }

    private void validarAccesoProyecto(ProyectoComunitario proyecto, Usuario usuario) {
        if (usuario == null || proyecto == null) {
            return;
        }
        RolUsuario rol = usuario.getRol();
        if (rol == null || rol == RolUsuario.SUBDECANO) {
            return;
        }
        if (rol == RolUsuario.DIRECTOR_CARRERA || rol == RolUsuario.COORDINADOR_PRACTICAS) {
            Integer miCarreraId = usuario.getCarrera() != null ? usuario.getCarrera().getId() : null;
            Integer carreraProyecto = proyecto.getCarrera() != null ? proyecto.getCarrera().getId() : null;
            if (miCarreraId != null && carreraProyecto != null && !miCarreraId.equals(carreraProyecto)) {
                throw new AccessDeniedException("No tiene permisos para acceder a reportes de proyectos de otra carrera.");
            }
            return;
        }
        if (rol == RolUsuario.TUTOR_ACADEMICO) {
            Long tutorId = proyecto.getTutorAcademico() != null ? proyecto.getTutorAcademico().getId() : null;
            if (tutorId == null || !usuario.getId().equals(tutorId)) {
                throw new AccessDeniedException("No tiene permisos para acceder a reportes de un proyecto donde no es el tutor asignado.");
            }
            return;
        }
        throw new AccessDeniedException("No tiene permisos para acceder a reportes de proyectos comunitarios.");
    }

    private ReporteProyectoDto mapearADto(ReporteProyectoVcs reporte) {
        if (reporte == null) {
            return null;
        }
        ReporteProyectoDto dto = reporteProyectoVcsMapeador.aDto(reporte);
        if (dto == null) {
            return null;
        }
        if (reporte.getUrlArchivo() != null && !reporte.getUrlArchivo().isBlank() && reporte.getId() != null) {
            return new ReporteProyectoDto(
                    dto.id(),
                    dto.proyectoId(),
                    dto.nombreProyecto(),
                    dto.periodoId(),
                    dto.nombrePeriodo(),
                    dto.coordinadorId(),
                    dto.nombreCoordinador(),
                    dto.tipo(),
                    dto.nombreArchivo(),
                    "/reportes-proyectos-vcs/" + reporte.getId() + "/preview",
                    dto.estadoSubdecanato(),
                    dto.observaciones(),
                    dto.fechaSubida(),
                    dto.fechaRevision()
            );
        }
        return dto;
    }

    private String construirUrlNotificacionReporte(Long proyectoId, Long periodoId) {
        StringBuilder url = new StringBuilder("/dashboard/vinculacion/proyectos-comunitarios?proyectoId=")
                .append(proyectoId)
                .append("&abrirReportes=true");
        if (periodoId != null) {
            url.append("&periodoId=").append(periodoId);
        }
        return url.toString();
    }

    @Transactional
    @Override
    public ReporteProyectoDto subirReporte(ReporteProyectoNuevoDto dto, Usuario usuarioAutenticado) {
        Usuario actor = usuarioAutenticado != null ? usuarioAutenticado : obtenerUsuarioAutenticadoActual();

        ProyectoComunitario proyecto = proyectoComunitarioRepository.findById(dto.proyectoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + dto.proyectoId()));

        if (actor != null && actor.getRol() == RolUsuario.COORDINADOR_PRACTICAS) {
            validarAccesoProyecto(proyecto, actor);
        }

        if (proyecto.getEstado() == EstadoProyecto.FINALIZADO || proyecto.getEstado() == EstadoProyecto.CANCELADO) {
            throw new NegocioException("No se pueden subir reportes para un proyecto finalizado o cancelado");
        }

        PeriodoAcademico periodo = periodoAcademicoRepository.findById(dto.periodoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Periodo académico no encontrado con ID: " + dto.periodoId()));

        if (periodo.getEstado() != EstadoPeriodo.ACTIVO) {
            throw new NegocioException("No se pueden subir informes en un periodo académico inactivo");
        }

        List<ReporteProyectoVcs> existentes = reporteProyectoVcsRepository
                .findByProyectoIdAndPeriodoAcademicoIdAndTipo(dto.proyectoId(), dto.periodoId(), dto.tipo());

        boolean yaAprobadoEnPeriodo = existentes.stream()
                .anyMatch(r -> r.getEstadoSubdecanato() == EstadoRevisionVcs.APROBADO);
        if (yaAprobadoEnPeriodo) {
            String etiquetaTipo = dto.tipo() == TipoReporteProyectoVcs.INFORME_DEFINITIVO
                    ? "El informe final"
                    : "El reporte trimestral";
            throw new NegocioException(etiquetaTipo + " de este periodo académico ya ha sido aprobado por el Subdecanato");
        }

        ReporteProyectoVcs reporteExistente = existentes.stream()
                .filter(r -> r.getEstadoSubdecanato() == EstadoRevisionVcs.OBSERVADO || r.getEstadoSubdecanato() == EstadoRevisionVcs.PENDIENTE)
                .findFirst()
                .orElse(null);

        Usuario coordinador = actor;
        if (coordinador == null) {
            if (proyecto.getCarrera() != null) {
                coordinador = usuarioRepository.findByRolAndCarreraId(RolUsuario.COORDINADOR_PRACTICAS, proyecto.getCarrera().getId())
                        .orElse(null);
            }
            if (coordinador == null) {
                List<Usuario> cpps = usuarioRepository.findByRol(RolUsuario.COORDINADOR_PRACTICAS);
                if (!cpps.isEmpty()) {
                    coordinador = cpps.get(0);
                }
            }
        }
        if (coordinador == null) {
            coordinador = usuarioRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new NegocioException("No se encontró un usuario coordinador para registrar el reporte"));
        }

        ReporteProyectoVcs reporte;
        if (reporteExistente != null) {
            reporte = reporteExistente;
            reporte.setNombreArchivo(dto.nombreArchivo());
            reporte.setUrlArchivo(dto.urlArchivo());
            reporte.setPeriodoAcademico(periodo);
            reporte.setCoordinador(coordinador);
            reporte.setEstadoSubdecanato(EstadoRevisionVcs.PENDIENTE);
            reporte.setObservaciones(null);
            reporte.setFechaRevision(null);
            reporte.setFechaSubida(LocalDateTime.now());
        } else {
            reporte = reporteProyectoVcsMapeador.aEntidad(dto);
            reporte.setProyecto(proyecto);
            reporte.setPeriodoAcademico(periodo);
            reporte.setCoordinador(coordinador);
            reporte.setEstadoSubdecanato(EstadoRevisionVcs.PENDIENTE);
            reporte.setFechaSubida(LocalDateTime.now());
        }

        ReporteProyectoVcs reporteGuardado = reporteProyectoVcsRepository.save(reporte);

        String etiquetaTipo = dto.tipo() == TipoReporteProyectoVcs.INFORME_DEFINITIVO
                ? "Informe Final Definitivo"
                : "Reporte Trimestral de Avances";
        String urlNotificacion = construirUrlNotificacionReporte(proyecto.getId(), periodo.getId());

        // Notificar a usuarios con rol SUBDECANO
        List<Usuario> subdecanos = usuarioRepository.findByRol(RolUsuario.SUBDECANO);
        for (Usuario subdecano : subdecanos) {
            notificacionService.enviar(
                    subdecano.getId(),
                    "Nuevo Reporte de Proyecto VCS",
                    "Se ha subido un nuevo " + etiquetaTipo + " para el proyecto: " + proyecto.getNombre(),
                    TipoNotificacion.INFORMACION,
                    urlNotificacion
            );
        }

        return mapearADto(reporteGuardado);
    }

    @Transactional(readOnly = true)
    @Override
    public ReporteProyectoDto buscarPorId(Long id) {
        ReporteProyectoVcs reporte = reporteProyectoVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: " + id));
        validarAccesoProyecto(reporte.getProyecto(), obtenerUsuarioAutenticadoActual());
        return mapearADto(reporte);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ReporteProyectoDto> buscarConFiltros(
            String busqueda,
            Long proyectoId,
            Long periodoId,
            TipoReporteProyectoVcs tipo,
            EstadoRevisionVcs estadoSubdecanato,
            Pageable pageable) {
        String busquedaLimpia = (busqueda != null && !busqueda.trim().isEmpty()) ? busqueda.trim() : null;
        Integer carreraFiltro = null;
        Long tutorFiltro = null;

        Usuario usuario = obtenerUsuarioAutenticadoActual();
        if (usuario != null) {
            RolUsuario rol = usuario.getRol();
            if ((rol == RolUsuario.DIRECTOR_CARRERA || rol == RolUsuario.COORDINADOR_PRACTICAS)
                    && usuario.getCarrera() != null) {
                carreraFiltro = usuario.getCarrera().getId();
            } else if (rol == RolUsuario.TUTOR_ACADEMICO) {
                tutorFiltro = usuario.getId();
                if (usuario.getCarrera() != null) {
                    carreraFiltro = usuario.getCarrera().getId();
                }
            }
        }

        Page<ReporteProyectoVcs> pagina = (carreraFiltro != null || tutorFiltro != null)
                ? reporteProyectoVcsRepository.buscarConFiltros(
                        busquedaLimpia, proyectoId, periodoId, tipo, estadoSubdecanato, carreraFiltro, tutorFiltro, pageable)
                : reporteProyectoVcsRepository.buscarConFiltros(
                        busquedaLimpia, proyectoId, periodoId, tipo, estadoSubdecanato, pageable);

        return pagina.map(this::mapearADto);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ReporteProyectoDto> listarPorProyecto(Long proyectoId, Long periodoId) {
        Usuario usuario = obtenerUsuarioAutenticadoActual();
        if (usuario != null && usuario.getRol() != RolUsuario.SUBDECANO) {
            proyectoComunitarioRepository.findById(proyectoId)
                    .ifPresent(proyecto -> validarAccesoProyecto(proyecto, usuario));
        }

        List<ReporteProyectoVcs> lista = periodoId != null
                ? reporteProyectoVcsRepository.findByProyectoIdAndPeriodoAcademicoIdOrderByFechaSubidaDesc(proyectoId, periodoId)
                : reporteProyectoVcsRepository.findByProyectoIdOrderByFechaSubidaDesc(proyectoId);
        return lista.stream()
                .map(this::mapearADto)
                .toList();
    }

    @Transactional
    @Override
    public ReporteProyectoDto revisarReporteSubdecanato(Long id, ReporteRevisionSubdecanatoDto dto) {
        ReporteProyectoVcs reporte = reporteProyectoVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: " + id));

        if (reporte.getPeriodoAcademico() != null && reporte.getPeriodoAcademico().getEstado() == EstadoPeriodo.INACTIVO) {
            throw new NegocioException("No se pueden revisar informes pertenecientes a un periodo académico inactivo");
        }

        if (dto.estadoSubdecanato() == EstadoRevisionVcs.OBSERVADO
                && (dto.observaciones() == null || dto.observaciones().trim().isEmpty())) {
            throw new NegocioException("Debe ingresar las observaciones para devolver el informe");
        }

        reporte.setEstadoSubdecanato(dto.estadoSubdecanato());
        if (dto.estadoSubdecanato() == EstadoRevisionVcs.PENDIENTE) {
            reporte.setObservaciones(null);
            reporte.setFechaRevision(null);
        } else {
            reporte.setObservaciones(dto.observaciones());
            reporte.setFechaRevision(LocalDateTime.now());
        }

        ReporteProyectoVcs reporteActualizado = reporteProyectoVcsRepository.save(reporte);

        // Notificar al coordinador si existe
        if (reporte.getCoordinador() != null) {
            String etiquetaTipo = reporte.getTipo() == TipoReporteProyectoVcs.INFORME_DEFINITIVO
                    ? "Informe Final Definitivo"
                    : "Reporte Trimestral de Avances";
            String estadoTexto;
            TipoNotificacion tipoNotificacion;
            if (dto.estadoSubdecanato() == EstadoRevisionVcs.APROBADO) {
                estadoTexto = "aprobado";
                tipoNotificacion = TipoNotificacion.EXITO;
            } else if (dto.estadoSubdecanato() == EstadoRevisionVcs.OBSERVADO) {
                estadoTexto = "observado";
                tipoNotificacion = TipoNotificacion.ADVERTENCIA;
            } else {
                estadoTexto = "devuelto a estado pendiente de revisión";
                tipoNotificacion = TipoNotificacion.INFORMACION;
            }

            Long periodoIdNotif = reporte.getPeriodoAcademico() != null ? reporte.getPeriodoAcademico().getId() : null;
            notificacionService.enviar(
                    reporte.getCoordinador().getId(),
                    "Revisión de Informe VCS",
                    "El " + etiquetaTipo + " del proyecto " + reporte.getProyecto().getNombre() + " ha sido " + estadoTexto + " por el Subdecanato.",
                    tipoNotificacion,
                    construirUrlNotificacionReporte(reporte.getProyecto().getId(), periodoIdNotif)
            );
        }

        return mapearADto(reporteActualizado);
    }

    @Transactional
    @Override
    public void eliminarReporte(Long id) {
        ReporteProyectoVcs reporte = reporteProyectoVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: " + id));

        validarAccesoProyecto(reporte.getProyecto(), obtenerUsuarioAutenticadoActual());

        if (reporte.getPeriodoAcademico() != null && reporte.getPeriodoAcademico().getEstado() == EstadoPeriodo.INACTIVO) {
            throw new NegocioException("No se puede eliminar un reporte de un periodo académico inactivo");
        }

        if (reporte.getEstadoSubdecanato() == EstadoRevisionVcs.APROBADO) {
            throw new NegocioException("No se puede eliminar un reporte que ya ha sido aprobado por el Subdecanato");
        }

        reporteProyectoVcsRepository.delete(reporte);
    }

    @Transactional(readOnly = true)
    @Override
    public ArchivoDescargaDto obtenerReporteDescarga(Long id) {
        return obtenerReporteDescarga(id, obtenerUsuarioAutenticadoActual());
    }

    @Transactional(readOnly = true)
    @Override
    public ArchivoDescargaDto obtenerReporteDescarga(Long id, Usuario usuarioAutenticado) {
        Usuario actor = usuarioAutenticado != null ? usuarioAutenticado : obtenerUsuarioAutenticadoActual();
        ReporteProyectoVcs reporte = reporteProyectoVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: " + id));

        validarAccesoProyecto(reporte.getProyecto(), actor);

        if (reporte.getUrlArchivo() == null || reporte.getUrlArchivo().isBlank()) {
            throw new RecursoNoEncontradoException("El reporte no tiene un archivo asociado");
        }

        String rutaLimpia = reporte.getUrlArchivo().trim();
        if (rutaLimpia.startsWith("/")) {
            rutaLimpia = rutaLimpia.substring(1);
        }
        if (rutaLimpia.startsWith("archivos_subidos/")) {
            rutaLimpia = rutaLimpia.substring("archivos_subidos/".length());
        }

        String baseConfig = rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos";
        Path carpetaBase = Paths.get(baseConfig).toAbsolutePath().normalize();
        if (!Files.exists(carpetaBase) && Files.exists(Paths.get("backend", baseConfig))) {
            carpetaBase = Paths.get("backend", baseConfig).toAbsolutePath().normalize();
        }
        Path filePath = carpetaBase.resolve(rutaLimpia).normalize().toAbsolutePath();

        if (!filePath.startsWith(carpetaBase)) {
            throw new NegocioException("Acceso no permitido: ruta de archivo invalida");
        }

        if (!Files.exists(filePath)) {
            Path nombrePlano = Paths.get(rutaLimpia).getFileName();
            if (nombrePlano != null) {
                Path posible = carpetaBase.resolve("vinculacion")
                        .resolve(nombrePlano).normalize().toAbsolutePath();
                if (posible.startsWith(carpetaBase) && Files.exists(posible)) {
                    filePath = posible;
                } else {
                    throw new RecursoNoEncontradoException("El archivo físico del reporte no existe en el servidor: " + filePath.getFileName());
                }
            } else {
                throw new RecursoNoEncontradoException("El archivo físico del reporte no existe en el servidor");
            }
        }

        byte[] contenido;
        try {
            contenido = Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo del reporte del disco", e);
        }

        String nombreDescarga = reporte.getNombreArchivo() != null && !reporte.getNombreArchivo().isBlank()
                ? reporte.getNombreArchivo()
                : filePath.getFileName().toString();
        if (!nombreDescarga.toLowerCase().endsWith(".pdf")) {
            nombreDescarga += ".pdf";
        }

        return new ArchivoDescargaDto(contenido, nombreDescarga, "application/pdf");
    }
}
