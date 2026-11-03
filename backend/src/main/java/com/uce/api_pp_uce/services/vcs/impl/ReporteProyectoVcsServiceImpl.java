package com.uce.api_pp_uce.services.vcs.impl;

import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteProyectoNuevoDto;
import com.uce.api_pp_uce.dtos.vcs.ReporteRevisionSubdecanatoDto;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ReporteProyectoVcs;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.ReporteProyectoVcsMapeador;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ReporteProyectoVcsRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.vcs.ReporteProyectoVcsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteProyectoVcsServiceImpl implements ReporteProyectoVcsService {

    private final ReporteProyectoVcsRepository reporteProyectoVcsRepository;
    private final ProyectoComunitarioRepository proyectoComunitarioRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;
    private final NotificacionService notificacionService;
    private final ReporteProyectoVcsMapeador reporteProyectoVcsMapeador;

    @Transactional
    @Override
    public ReporteProyectoDto subirReporte(ReporteProyectoNuevoDto dto, Usuario usuarioAutenticado) {
        ProyectoComunitario proyecto = proyectoComunitarioRepository.findById(dto.proyectoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + dto.proyectoId()));

        if (proyecto.getEstado() == EstadoProyecto.FINALIZADO || proyecto.getEstado() == EstadoProyecto.CANCELADO) {
            throw new NegocioException("No se pueden subir reportes para un proyecto finalizado o cancelado");
        }

        PeriodoAcademico periodo = periodoAcademicoRepository.findById(dto.periodoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Periodo académico no encontrado con ID: " + dto.periodoId()));

        List<ReporteProyectoVcs> existentes = reporteProyectoVcsRepository.findByProyectoIdAndTipo(dto.proyectoId(), dto.tipo());

        if (dto.tipo() == TipoReporteProyectoVcs.INFORME_DEFINITIVO) {
            boolean yaAprobado = existentes.stream().anyMatch(r -> r.getEstadoSubdecanato() == EstadoRevisionVcs.APROBADO);
            if (yaAprobado) {
                throw new NegocioException("El informe final definitivo ya ha sido aprobado por el Subdecanato");
            }
        }

        ReporteProyectoVcs reporteExistente = existentes.stream()
                .filter(r -> r.getEstadoSubdecanato() == EstadoRevisionVcs.OBSERVADO || r.getEstadoSubdecanato() == EstadoRevisionVcs.PENDIENTE)
                .findFirst()
                .orElse(null);

        Usuario coordinador = usuarioAutenticado;
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

        // Notificar a usuarios con rol SUBDECANO
        List<Usuario> subdecanos = usuarioRepository.findByRol(RolUsuario.SUBDECANO);
        for (Usuario subdecano : subdecanos) {
            notificacionService.enviar(
                    subdecano.getId(),
                    "Nuevo Reporte de Proyecto VCS",
                    "Se ha subido un nuevo informe (" + dto.tipo() + ") para el proyecto: " + proyecto.getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/proyectos-comunitarios?proyectoId=" + proyecto.getId() + "&abrirReportes=true"
            );
        }

        return reporteProyectoVcsMapeador.aDto(reporteGuardado);
    }

    @Transactional(readOnly = true)
    @Override
    public ReporteProyectoDto buscarPorId(Long id) {
        ReporteProyectoVcs reporte = reporteProyectoVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: " + id));
        return reporteProyectoVcsMapeador.aDto(reporte);
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
        return reporteProyectoVcsRepository
                .buscarConFiltros(busquedaLimpia, proyectoId, periodoId, tipo, estadoSubdecanato, pageable)
                .map(reporteProyectoVcsMapeador::aDto);
    }

    @Transactional(readOnly = true)
    @Override
    public List<ReporteProyectoDto> listarPorProyecto(Long proyectoId) {
        return reporteProyectoVcsRepository.findByProyectoIdOrderByFechaSubidaDesc(proyectoId)
                .stream()
                .map(reporteProyectoVcsMapeador::aDto)
                .toList();
    }

    @Transactional
    @Override
    public ReporteProyectoDto revisarReporteSubdecanato(Long id, ReporteRevisionSubdecanatoDto dto) {
        ReporteProyectoVcs reporte = reporteProyectoVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: " + id));

        reporte.setEstadoSubdecanato(dto.estadoSubdecanato());
        reporte.setObservaciones(dto.observaciones());
        reporte.setFechaRevision(LocalDateTime.now());

        // Si es el informe definitivo y fue aprobado, verificar que no queden asignaciones de estudiantes en curso
        if (reporte.getTipo() == TipoReporteProyectoVcs.INFORME_DEFINITIVO
                && dto.estadoSubdecanato() == EstadoRevisionVcs.APROBADO) {
            ProyectoComunitario proyecto = reporte.getProyecto();
            if (asignacionProyectoComunitarioRepository.existsByProyectoComunitarioIdAndEstado(proyecto.getId(), EstadoAsignacionVcs.EN_CURSO)) {
                throw new NegocioException("No se puede aprobar el Informe Definitivo porque el proyecto aún tiene asignaciones de estudiantes en curso");
            }
            proyecto.setEstado(EstadoProyecto.FINALIZADO);
            proyectoComunitarioRepository.save(proyecto);
        }

        ReporteProyectoVcs reporteActualizado = reporteProyectoVcsRepository.save(reporte);

        // Notificar al coordinador si existe
        if (reporte.getCoordinador() != null) {
            String estadoTexto = dto.estadoSubdecanato() == EstadoRevisionVcs.APROBADO ? "aprobado" : "observado";
            notificacionService.enviar(
                    reporte.getCoordinador().getId(),
                    "Revisión de Informe VCS",
                    "El informe (" + reporte.getTipo() + ") del proyecto " + reporte.getProyecto().getNombre() + " ha sido " + estadoTexto + " por el Subdecanato.",
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/proyectos-comunitarios?proyectoId=" + reporte.getProyecto().getId() + "&abrirReportes=true"
            );
        }

        return reporteProyectoVcsMapeador.aDto(reporteActualizado);
    }

    @Transactional
    @Override
    public void eliminarReporte(Long id) {
        ReporteProyectoVcs reporte = reporteProyectoVcsRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reporte de proyecto no encontrado con ID: " + id));

        if (reporte.getEstadoSubdecanato() == EstadoRevisionVcs.APROBADO) {
            throw new NegocioException("No se puede eliminar un reporte que ya ha sido aprobado por el Subdecanato");
        }

        reporteProyectoVcsRepository.delete(reporte);
    }
}
