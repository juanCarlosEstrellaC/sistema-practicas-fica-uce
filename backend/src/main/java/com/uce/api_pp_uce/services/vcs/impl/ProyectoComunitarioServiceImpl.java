package com.uce.api_pp_uce.services.vcs.impl;

import com.uce.api_pp_uce.common.Utilitarios;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioNuevoDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto; 
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.mapeadores.vcs.ProyectoComunitarioMapeador;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.vcs.ProyectoComunitarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProyectoComunitarioServiceImpl implements ProyectoComunitarioService {

    private final ProyectoComunitarioRepository proyectoComunitarioRepository;
    private final CarreraRepository carreraRepository;
    private final UsuarioRepository usuarioRepository;
    private final AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;
    private final ProyectoComunitarioMapeador proyectoComunitarioMapeador;
    private final NotificacionService notificacionService;

    private ProyectoComunitarioDto mapearConEstadoInicio(ProyectoComunitario entidad) {
        boolean tieneAsignaciones = asignacionProyectoComunitarioRepository.existsByProyectoComunitarioId(entidad.getId());
        boolean tienePendientesIniciar = asignacionProyectoComunitarioRepository.existsByProyectoComunitarioIdAndFaseActual(
                entidad.getId(), FaseActualAsignacion.ASIGNACION);
        boolean iniciado = tieneAsignaciones && !tienePendientesIniciar;
        return proyectoComunitarioMapeador.aDto(entidad, iniciado);
    }

    private Pageable mapearPageable(Pageable pageable) {
        if (pageable == null || pageable.getSort().isUnsorted()) {
            return pageable;
        }
        List<Sort.Order> ordenes = new ArrayList<>();
        for (Sort.Order orden : pageable.getSort()) {
            String propiedad = orden.getProperty();
            String propiedadMapeada = switch (propiedad) {
                case "carrera", "carreraNombre" -> "carrera.nombre";
                case "tutor", "tutorAcademico" -> "tutorAcademico.nombres";
                default -> propiedad;
            };
            ordenes.add(new Sort.Order(orden.getDirection(), propiedadMapeada));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(ordenes));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProyectoComunitarioDto> buscarConFiltros(String busqueda, Integer carreraId, Long tutorId, EstadoProyecto estado, Pageable pageable) {
        String busquedaLimpia = (busqueda != null && !busqueda.trim().isEmpty()) ? busqueda.trim() : null;
        Pageable pageableMapeado = mapearPageable(pageable);
        return proyectoComunitarioRepository.buscarConFiltros(busquedaLimpia, carreraId, tutorId, estado, pageableMapeado)
                .map(this::mapearConEstadoInicio);
    }

    @Override
    @Transactional(readOnly = true)
    public ProyectoComunitarioDto buscarPorId(Long id) {
        ProyectoComunitario entidad = proyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + id));
        return mapearConEstadoInicio(entidad);
    }

    @Override
    @Transactional
    public ProyectoComunitarioDto crearProyecto(ProyectoComunitarioNuevoDto dto) {
        Utilitarios.validarRangoFechas(dto.fechaInicio(), dto.fechaFin());

        Carrera carrera = carreraRepository.findById(dto.carreraId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada con ID: " + dto.carreraId()));

        if (proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraId(dto.nombre().trim(), dto.carreraId())) {
            throw new NegocioException("Ya existe un proyecto comunitario con el nombre '" + dto.nombre().trim() + "' en esta carrera.");
        }

        Usuario tutorAcademico = null;
        if (dto.tutorAcademicoId() != null) {
            tutorAcademico = usuarioRepository.findById(dto.tutorAcademicoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tutor académico no encontrado con ID: " + dto.tutorAcademicoId()));

            long proyectosTutor = proyectoComunitarioRepository.countByTutorAcademicoIdAndEstadoNot(dto.tutorAcademicoId(), EstadoProyecto.CANCELADO);
            if (proyectosTutor >= 2) {
                throw new NegocioException("El tutor académico seleccionado ya tiene 2 proyectos asignados. No puede tener más de 2 proyectos asociados.");
            }
        }

        ProyectoComunitario nuevaEntidad = proyectoComunitarioMapeador.aEntidad(dto);
        nuevaEntidad.setCarrera(carrera);
        nuevaEntidad.setTutorAcademico(tutorAcademico);

        ProyectoComunitario guardado = proyectoComunitarioRepository.save(nuevaEntidad);

        if (tutorAcademico != null) {
            notificacionService.enviar(
                    tutorAcademico.getId(),
                    "Designación como Tutor de Proyecto",
                    "Has sido designado como Tutor Académico del proyecto comunitario: " + guardado.getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/proyectos-comunitarios"
            );
        }

        return proyectoComunitarioMapeador.aDto(guardado);
    }

    @Override
    @Transactional
    public ProyectoComunitarioDto actualizarProyecto(Long id, ProyectoComunitarioActualizarDto dto) {
        Utilitarios.validarRangoFechas(dto.fechaInicio(), dto.fechaFin());

        ProyectoComunitario entidadExistente = proyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + id));

        Carrera carrera = carreraRepository.findById(dto.carreraId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada con ID: " + dto.carreraId()));

        // Validar que NO exista OTRO proyecto con el mismo nombre en la misma carrera
        if (proyectoComunitarioRepository.existsByNombreIgnoreCaseAndCarreraIdAndIdNot(dto.nombre().trim(), dto.carreraId(), id)) {
            throw new NegocioException("Ya existe otro proyecto comunitario con el nombre '" + dto.nombre().trim() + "' en esta carrera.");
        }

        Usuario tutorAcademico = null;
        if (dto.tutorAcademicoId() != null) {
            tutorAcademico = usuarioRepository.findById(dto.tutorAcademicoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tutor académico no encontrado con ID: " + dto.tutorAcademicoId()));

            long proyectosTutor = proyectoComunitarioRepository.countByTutorAcademicoIdAndIdNotAndEstadoNot(dto.tutorAcademicoId(), id, EstadoProyecto.CANCELADO);
            if (proyectosTutor >= 2) {
                throw new NegocioException("El tutor académico seleccionado ya tiene 2 proyectos asignados. No puede tener más de 2 proyectos asociados.");
            }
        }

        Usuario tutorAnterior = entidadExistente.getTutorAcademico();
        Long idTutorAnterior = tutorAnterior != null ? tutorAnterior.getId() : null;

        proyectoComunitarioMapeador.actualizarEntidadDesdeDto(dto, entidadExistente);
        entidadExistente.setCarrera(carrera);
        if (dto.tutorAcademicoId() != null) {
            entidadExistente.setTutorAcademico(tutorAcademico);
        }

        ProyectoComunitario actualizado = proyectoComunitarioRepository.save(entidadExistente);

        if (tutorAcademico != null && (idTutorAnterior == null || !idTutorAnterior.equals(tutorAcademico.getId()))) {
            notificacionService.enviar(
                    tutorAcademico.getId(),
                    "Designación como Tutor de Proyecto",
                    "Has sido designado como Tutor Académico del proyecto comunitario: " + actualizado.getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/proyectos-comunitarios"
            );
        }

        return proyectoComunitarioMapeador.aDto(actualizado);
    }

    @Override
    @Transactional
    public void eliminarProyecto(Long id) {
        if (!proyectoComunitarioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + id);
        }
        proyectoComunitarioRepository.deleteById(id);
    }
}
