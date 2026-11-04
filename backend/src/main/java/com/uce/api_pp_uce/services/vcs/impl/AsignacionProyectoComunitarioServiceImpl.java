package com.uce.api_pp_uce.services.vcs.impl;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.uce.api_pp_uce.dtos.vcs.AprobarHorasSubdecanatoDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioActualizarDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioDto;
import com.uce.api_pp_uce.dtos.vcs.AsignacionProyectoComunitarioMasivoDto;
import com.uce.api_pp_uce.dtos.vcs.EstudianteResumenVcsDto;
import com.uce.api_pp_uce.dtos.vcs.ProyectoComunitarioResumenDto;
import com.uce.api_pp_uce.dtos.vcs.ResultadoAprobacionHorasDto;
import com.uce.api_pp_uce.dtos.vcs.TutorResumenVcsDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.ProcesoVinculacion;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.pp.EstadoProceso;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProcesoVcs;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.mapeadores.vcs.AsignacionProyectoComunitarioMapeador;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
import com.uce.api_pp_uce.entities.vcs.EvidenciaAsignacionVcs;
import com.uce.api_pp_uce.repositories.vcs.EvidenciaAsignacionVcsRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository;
import com.uce.api_pp_uce.repositories.vcs.ProcesoVinculacionRepository;
import com.uce.api_pp_uce.services.vcs.AsignacionProyectoComunitarioService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.exportadores.vcs.CertificadoHorasVcsPdfExportador;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.mapeadores.vcs.ProyectoComunitarioMapeador;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsignacionProyectoComunitarioServiceImpl implements AsignacionProyectoComunitarioService {

    private final UsuarioRepository usuarioRepository;
    private final AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;
    private final ProyectoComunitarioRepository proyectoComunitarioRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final CarreraRepository carreraRepository;
    private final ProcesoVinculacionRepository procesoVinculacionRepository;
    private final ProcesoPracticaRepository procesoPracticaRepository;
    private final NotificacionService notificacionService;
    private final CertificadoHorasVcsPdfExportador certificadoHorasVcsPdfExportador;
    private final AsignacionProyectoComunitarioMapeador asignacionProyectoComunitarioMapeador;
    private final ProyectoComunitarioMapeador proyectoComunitarioMapeador;
    private final EvidenciaAsignacionVcsRepository evidenciaAsignacionVcsRepository;

    @Value("${app.almacenamiento.ruta-base:archivos_subidos}")
    private String rutaBaseAlmacenamiento = "archivos_subidos";

    @Transactional(readOnly = true)
    @Override
    public AsignacionProyectoComunitarioDto buscarPorId(Long id) {
        AsignacionProyectoComunitario entidad = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + id));
        return asignacionProyectoComunitarioMapeador.aDto(entidad);
    }

    @Transactional(readOnly = true)
    @Override
    public List<EstudianteResumenVcsDto> listarEstudiantesDisponibles(Integer carreraId, Long periodoId, String busqueda) {
        String busquedaLimpia = (busqueda != null && !busqueda.trim().isEmpty()) ? busqueda.trim() : null;
        List<Usuario> estudiantes = usuarioRepository.findEstudiantesDisponiblesParaVcs(carreraId, periodoId, busquedaLimpia);

        return estudiantes.stream()
                .map(estudiante -> {
                    ProcesoVinculacion proceso = null;
                    if (estudiante.getCarrera() != null) {
                        proceso = procesoVinculacionRepository
                                .findByEstudianteIdAndCarreraId(estudiante.getId(), estudiante.getCarrera().getId())
                                .orElse(null);
                    }

                    Integer horasCompletadas = (proceso != null && proceso.getHorasAcumuladas() != null) ? proceso.getHorasAcumuladas() : 0;
                    Integer horasRequeridas = (proceso != null && proceso.getHorasRequeridas() != null)
                            ? proceso.getHorasRequeridas()
                            : (estudiante.getCarrera() != null && estudiante.getCarrera().getHorasProyectosComunitarios() != null
                                    ? estudiante.getCarrera().getHorasProyectosComunitarios()
                                    : 160);

                    return asignacionProyectoComunitarioMapeador.aEstudianteResumenDto(estudiante, horasCompletadas, horasRequeridas);
                })
                .sorted(Comparator.comparing(EstudianteResumenVcsDto::apellidos, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(EstudianteResumenVcsDto::nombres, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<ProyectoComunitarioResumenDto> listarProyectosDisponibles(Integer carreraId, Long periodoId,
            String busqueda) {

        // *Actualmente no filtra por periodo, se toma en cuenta como proyectos sin
        // periodo
        return proyectoComunitarioRepository
                .findByEstadoAndCarreraId(EstadoProyecto.ACTIVO, carreraId, busqueda)
                .stream()
                .map(proyectoComunitarioMapeador::aDtoResumen)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<TutorResumenVcsDto> listarTutoresDisponibles(Integer carreraId, Long periodoId, String busqueda, Long proyectoId, String conAsignaciones) {
        List<Usuario> tutores = usuarioRepository.findTutoresParaAsignacion(carreraId, busqueda);
        
        return tutores.stream()
                .map(tutor -> {
                    Integer carreraTutor = carreraId != null ? carreraId : (tutor.getCarrera() != null ? tutor.getCarrera().getId() : null);
                    List<ProyectoComunitario> proyectosTutor = proyectoComunitarioRepository
                            .findByTutorIdAndCarreraId(tutor.getId(), carreraTutor);
                    
                    List<ProyectoComunitarioResumenDto> proyectosDto = proyectosTutor.stream()
                            .map(proyectoComunitarioMapeador::aDtoResumen)
                            .toList();
                    
                    Integer asignacionesEnPeriodo = periodoId != null 
                            ? asignacionProyectoComunitarioRepository.countByProyectoComunitarioTutorAcademicoIdAndPeriodoAcademicoId(tutor.getId(), periodoId)
                            : 0;
                    
                    String nombreCarrera = tutor.getCarrera() != null ? tutor.getCarrera().getNombre() : null;
                    return asignacionProyectoComunitarioMapeador.aTutorResumenDto(
                            tutor,
                            carreraTutor,
                            nombreCarrera,
                            asignacionesEnPeriodo != null ? asignacionesEnPeriodo : 0,
                            proyectosDto,
                            List.of()
                    );
                })
                .filter(tutorDto -> {
                    if (proyectoId != null) {
                        boolean tieneProyecto = tutorDto.proyectos() != null && tutorDto.proyectos().stream()
                                .anyMatch(p -> p.id().equals(proyectoId));
                        if (!tieneProyecto) return false;
                    }
                    if (conAsignaciones != null && !conAsignaciones.isBlank()) {
                        if ("CON_ASIGNACIONES".equalsIgnoreCase(conAsignaciones)) {
                            return tutorDto.asignacionesActuales() != null && tutorDto.asignacionesActuales() > 0;
                        } else if ("SIN_ASIGNACIONES".equalsIgnoreCase(conAsignaciones)) {
                            return tutorDto.asignacionesActuales() == null || tutorDto.asignacionesActuales() == 0;
                        }
                    }
                    return true;
                })
                .toList();
    }

    private Pageable mapearPageable(Pageable pageable) {
        if (pageable == null || pageable.getSort().isUnsorted()) {
            return pageable;
        }
        List<Sort.Order> ordenes = new ArrayList<>();
        for (Sort.Order orden : pageable.getSort()) {
            String propiedad = orden.getProperty();
            String propiedadMapeada = switch (propiedad) {
                case "nombreEstudiante", "estudiante", "estudiante.nombres" -> "procesoVinculacion.estudiante.nombres";
                case "estudiante.apellidos", "apellidos" -> "procesoVinculacion.estudiante.apellidos";
                case "nombreProyecto", "proyecto", "proyectoComunitario.nombre" -> "proyectoComunitario.nombre";
                case "carrera", "carreraNombre" -> "procesoVinculacion.carrera.nombre";
                case "tutor", "tutorAcademico" -> "proyectoComunitario.tutorAcademico.nombres";
                default -> propiedad;
            };
            ordenes.add(new Sort.Order(orden.getDirection(), propiedadMapeada));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(ordenes));
    }

    @Transactional(readOnly = true)
    @Override
    public Page<AsignacionProyectoComunitarioDto> buscarConFiltros(String busqueda, Integer carreraId, Long tutorId,
            Long estudianteId, Long proyectoId, EstadoAsignacionVcs estado, FaseActualAsignacion faseActual, Long periodoId, Pageable pageable) {
        String busquedaLimpia = (busqueda != null && !busqueda.trim().isEmpty()) ? busqueda.trim() : null;
        Pageable pageableMapeado = mapearPageable(pageable);
        return asignacionProyectoComunitarioRepository
                .buscarConFiltros(busquedaLimpia, carreraId, tutorId, estudianteId, proyectoId, estado, faseActual, periodoId, pageableMapeado)
                .map(asignacionProyectoComunitarioMapeador::aDto);
    }

    @Transactional
    @Override
    public List<AsignacionProyectoComunitarioDto> asignarEstudiantesMasivo(AsignacionProyectoComunitarioMasivoDto dto) {

        // Valido si existe la carrera
        Carrera carrera = carreraRepository.findById(dto.carreraId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada con ID: " + dto.carreraId()));

        // Valido si existe el proyecto
        ProyectoComunitario proyectoComunitario = proyectoComunitarioRepository.findById(dto.proyectoComunitarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto no encontrado con ID: " + dto.proyectoComunitarioId()));

        // Valido el periodo academico
        PeriodoAcademico periodoAcademico = periodoAcademicoRepository.findById(dto.periodoAcademicoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Periodo academico no encontrado con ID: " + dto.periodoAcademicoId()));

        // Valido que el periodo academico esté Activo
        if (periodoAcademico.getEstado() != EstadoPeriodo.ACTIVO) {
            throw new NegocioException("El periodo academico no esta activo");
        }

        // Valido las horas asignadas
        if (carrera.getHorasProyectosComunitarios() != null && carrera.getHorasProyectosComunitarios() < dto.horasAsignadas()) {
            throw new NegocioException("Las horas asignadas exceden las horas disponibles de la carrera");
        }

        List<AsignacionProyectoComunitario> asignaciones = new ArrayList<>();

        // Valido estudiantes:
        for (Long idEstudiante : dto.estudiantesId()) {
            // 1. Que sean de la carrera y que esten en estado ACTIVO
            Usuario estudiante = usuarioRepository.findById(idEstudiante)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Estudiante no encontrado con ID: " + idEstudiante));

            if (estudiante.getEstado() != EstadoUsuario.ACTIVO) {
                throw new NegocioException("El estudiante " + estudiante.getNombreCompleto() + " no está en estado activo");
            }

            if (estudiante.getCarrera() == null || !estudiante.getCarrera().getId().equals(carrera.getId())) {
                throw new NegocioException("El estudiante " + estudiante.getNombreCompleto() + " no pertenece a la carrera seleccionada");
            }

            // 2. Obtenermos o generamos un proceso de vinculacion
            ProcesoVinculacion procesoVinculacion = procesoVinculacionRepository
                .findByEstudianteIdAndCarreraId(idEstudiante, carrera.getId())
                .orElseGet(() -> {
                    ProcesoVinculacion nuevoProceso = new ProcesoVinculacion();
                    nuevoProceso.setEstudiante(estudiante);
                    nuevoProceso.setCarrera(carrera);
                    nuevoProceso.setEstado(EstadoProcesoVcs.EN_CURSO);
                    nuevoProceso.setHorasRequeridas(carrera.getHorasProyectosComunitarios() != null ? carrera.getHorasProyectosComunitarios() : 160);
                    nuevoProceso.setHorasAcumuladas(0);
                    return procesoVinculacionRepository.save(nuevoProceso);
                });

            // 3. Validamos que el Proceso de Vinculacion no esté COMPLETADO o CANCELADO
            if (procesoVinculacion.getEstado() == EstadoProcesoVcs.COMPLETADO || procesoVinculacion.getEstado() == EstadoProcesoVcs.CANCELADO) {
                throw new NegocioException("El estudiante ya tiene su proceso de vinculacion completado o cancelado");
            }

            // 4. Validar no superar horas requeridas
            int horasTotales = (procesoVinculacion.getHorasAcumuladas() != null ? procesoVinculacion.getHorasAcumuladas() : 0) + dto.horasAsignadas();
            if (horasTotales > procesoVinculacion.getHorasRequeridas()) {
                throw new NegocioException("Las horas asignadas para el estudiante " + estudiante.getNombreCompleto() + " exceden las requeridas para su proceso");
            }
            
            // 5. Validar que el estudiante no tenga una asignacion en el periodo actual que no haya sido cancelada
            if (asignacionProyectoComunitarioRepository.existsByProcesoVinculacionIdAndPeriodoAcademicoIdAndEstadoNot(
                    procesoVinculacion.getId(), periodoAcademico.getId(), EstadoAsignacionVcs.CANCELADO)) {
                throw new NegocioException("El estudiante ya tiene una asignacion en el periodo actual");
            }

            // 6. Si el proceso esta EN_CURSO, creamos la asignación
            AsignacionProyectoComunitario asignacion = new AsignacionProyectoComunitario();
            asignacion.setProcesoVinculacion(procesoVinculacion);
            asignacion.setProyectoComunitario(proyectoComunitario);
            asignacion.setPeriodoAcademico(periodoAcademico);
            asignacion.setHorasAsignadas(dto.horasAsignadas());
            asignacion.setHorasCompletadas(0);
            asignacion.setFechaInicio(LocalDate.now());
            asignacion.setEstado(EstadoAsignacionVcs.EN_CURSO);
            asignacion.setFaseActual(FaseActualAsignacion.ASIGNACION);
            asignacionProyectoComunitarioRepository.save(asignacion);

            asignaciones.add(asignacion);
        
            // 7. Notifico al estudiante
            notificacionService.enviar(
                    idEstudiante,
                    "Asignacion a Proyecto Comunitario",
                    "Has sido asignado al proyecto: " + proyectoComunitario.getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/mi-proyecto");
        }

        // 8. Notificar al Tutor Académico si el proyecto tiene tutor asignado
        if (proyectoComunitario.getTutorAcademico() != null && !asignaciones.isEmpty()) {
            notificacionService.enviar(
                    proyectoComunitario.getTutorAcademico().getId(),
                    "Nuevos Estudiantes Asignados",
                    "Se han asignado " + asignaciones.size() + " estudiante(s) al proyecto: " + proyectoComunitario.getNombre(),
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/asignaciones-existentes?proyectoId=" + proyectoComunitario.getId());
        }

        return asignaciones.stream()
                .map(asignacionProyectoComunitarioMapeador::aDto)
                .toList();
    }

    @Transactional 
    @Override
    public AsignacionProyectoComunitarioDto actualizarAsignacion(Long id, AsignacionProyectoComunitarioActualizarDto dto) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignacion no encontrada"));
        
        // Validar que no se pueda editar la asignacion si ha superado la fase de asignacion
        if (asignacion.getFaseActual() != FaseActualAsignacion.ASIGNACION) {
            throw new NegocioException("No se puede editar la asignación porque ya ha superado la fase de asignación");
        }

        // Validar que el periodo academico no este en estado INACTIVO
        if (asignacion.getPeriodoAcademico().getEstado() == EstadoPeriodo.INACTIVO) {
            throw new NegocioException("No se puede editar asignaciones de un periodo académico inactivo");
        }

        // Validar que el nuevo proyecto exista y que pertenezca a la carrera del estudiante
        if (dto.proyectoComunitarioId() != null && !dto.proyectoComunitarioId().equals(asignacion.getProyectoComunitario().getId())) {
            ProyectoComunitario nuevoProyecto = proyectoComunitarioRepository.findById(dto.proyectoComunitarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto no encontrado con ID: " + dto.proyectoComunitarioId()));
            
            if (!nuevoProyecto.getCarrera().getId().equals(asignacion.getProcesoVinculacion().getCarrera().getId())) {
                throw new NegocioException("El nuevo proyecto no pertenece a la carrera del estudiante");
            }
            asignacion.setProyectoComunitario(nuevoProyecto);
        }

        ProcesoVinculacion procesoVinculacion = asignacion.getProcesoVinculacion();
        
        // Validar que las horas asignadas no excedan las horas requeridas para el proceso de vinculacion
        int horasTotales = (procesoVinculacion.getHorasAcumuladas() != null ? procesoVinculacion.getHorasAcumuladas() : 0) + dto.horasAsignadas();
        if (horasTotales > procesoVinculacion.getHorasRequeridas()) {
            throw new NegocioException("Las horas asignadas para el estudiante " + procesoVinculacion.getEstudiante().getNombreCompleto() + " exceden las requeridas para su proceso");
        }
        asignacion.setHorasAsignadas(dto.horasAsignadas());

        // Notificar al estudiante
        notificacionService.enviar(
                asignacion.getProcesoVinculacion().getEstudiante().getId(),
                "Actualizacion de asignacion a proyecto comunitario",
                "Se ha actualizado su asignacion al proyecto: " + asignacion.getProyectoComunitario().getNombre(),
                TipoNotificacion.INFORMACION,
                "/dashboard/vinculacion/mi-proyecto");
        
        return asignacionProyectoComunitarioMapeador.aDto(asignacionProyectoComunitarioRepository.save(asignacion));
    }

    @Transactional
    @Override
    public void eliminarAsignacion(Long id) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignacion no encontrada"));
        
        // Validar que no se pueda eliminar la asignacion si ha superado la fase de asignacion
        if (asignacion.getFaseActual() != FaseActualAsignacion.ASIGNACION) {
            throw new NegocioException("No se puede eliminar la asignación porque ya ha superado la fase de asignación");
        }

        // Validar que el periodo academico no este en estado INACTIVO
        if (asignacion.getPeriodoAcademico().getEstado() == EstadoPeriodo.INACTIVO) {
            throw new NegocioException("No se puede eliminar asignaciones de un periodo académico inactivo");
        }

        // Notificar al estudiante
        notificacionService.enviar(
                asignacion.getProcesoVinculacion().getEstudiante().getId(),
                "Eliminacion de asignacion a proyecto comunitario",
                "Se ha eliminado su asignacion al proyecto: " + asignacion.getProyectoComunitario().getNombre(),
                TipoNotificacion.INFORMACION,
                "/dashboard/vinculacion/mi-proyecto");

        asignacionProyectoComunitarioRepository.delete(asignacion);
    }

    @Transactional
    @Override
    public void asociarProyectosATutor(Long tutorId, List<Long> proyectoIds) {
        Usuario tutor = usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Tutor académico no encontrado con ID: " + tutorId));

        if (tutor.getEstado() != EstadoUsuario.ACTIVO) {
            throw new NegocioException("El tutor académico no se encuentra en estado activo");
        }

        List<Long> idsLimpios = proyectoIds != null ? proyectoIds.stream().filter(Objects::nonNull).distinct().toList() : List.of();

        if (idsLimpios.size() > 2) {
            throw new NegocioException("Un tutor académico no puede tener más de 2 proyectos asociados por periodo.");
        }

        // 1. Desvincular proyectos que ya no están en la lista seleccionada para este tutor
        Integer carreraId = tutor.getCarrera() != null ? tutor.getCarrera().getId() : null;
        List<ProyectoComunitario> proyectosActuales = proyectoComunitarioRepository.findByTutorIdAndCarreraId(tutorId, carreraId);
        List<Long> idsAnteriores = proyectosActuales.stream().map(ProyectoComunitario::getId).toList();
        List<String> proyectosNuevosAsignados = new ArrayList<>();
        for (ProyectoComunitario proyectoExistente : proyectosActuales) {
            if (!idsLimpios.contains(proyectoExistente.getId())) {
                proyectoExistente.setTutorAcademico(null);
                proyectoComunitarioRepository.save(proyectoExistente);
            }
        }

        // 2. Asociar los proyectos seleccionados al tutor
        for (Long proyectoId : idsLimpios) {
            ProyectoComunitario proyecto = proyectoComunitarioRepository.findById(proyectoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + proyectoId));

            if (carreraId != null && proyecto.getCarrera() != null && !proyecto.getCarrera().getId().equals(carreraId)) {
                throw new NegocioException("El proyecto '" + proyecto.getNombre() + "' no pertenece a la carrera del tutor.");
            }

            // Validar que el proyecto no esté asignado a otro tutor
            if (proyecto.getTutorAcademico() != null && !proyecto.getTutorAcademico().getId().equals(tutorId)) {
                String nombreTutorActual = proyecto.getTutorAcademico().getNombreCompleto();
                throw new NegocioException("El proyecto '" + proyecto.getNombre() + "' ya está asignado al tutor " 
                        + nombreTutorActual + ". Debe desvincularlo de dicho tutor antes de poder asignarlo.");
            }

            if (!idsAnteriores.contains(proyecto.getId())) {
                proyectosNuevosAsignados.add(proyecto.getNombre());
            }

            proyecto.setTutorAcademico(tutor);
            proyectoComunitarioRepository.save(proyecto);
        }

        if (!proyectosNuevosAsignados.isEmpty()) {
            String detalle = proyectosNuevosAsignados.size() == 1
                    ? "Has sido designado como Tutor Académico del proyecto comunitario: " + proyectosNuevosAsignados.get(0)
                    : "Has sido designado como Tutor Académico de los proyectos comunitarios: " + String.join(", ", proyectosNuevosAsignados);
            notificacionService.enviar(
                    tutor.getId(),
                    "Designación como Tutor de Proyecto",
                    detalle,
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/proyectos-comunitarios"
            );
        }
    }

    @Transactional
    @Override
    public AsignacionProyectoComunitarioDto iniciarDesarrollo(Long id) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + id));

        if (asignacion.getFaseActual() != FaseActualAsignacion.ASIGNACION) {
            throw new NegocioException("La asignación ya ha iniciado su fase de desarrollo o finalización.");
        }

        asignacion.setFaseActual(FaseActualAsignacion.DESARROLLO);
        ProyectoComunitario proyecto = asignacion.getProyectoComunitario();
        AsignacionProyectoComunitario guardada = asignacionProyectoComunitarioRepository.save(asignacion);

        // Notificar al estudiante
        notificacionService.enviar(
                asignacion.getProcesoVinculacion().getEstudiante().getId(),
                "Inicio de Proyecto de Vinculación",
                "El Tutor Académico ha iniciado el proyecto: " + proyecto.getNombre() + ". Ya puedes subir tus evidencias.",
                TipoNotificacion.INFORMACION,
                "/dashboard/vinculacion/mi-proyecto"
        );

        return asignacionProyectoComunitarioMapeador.aDto(guardada);
    }

    @Transactional
    @Override
    public int iniciarProyecto(Long proyectoId) {
        ProyectoComunitario proyecto = proyectoComunitarioRepository.findById(proyectoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proyecto comunitario no encontrado con ID: " + proyectoId));

        if (proyecto.getEstado() == EstadoProyecto.CANCELADO || proyecto.getEstado() == EstadoProyecto.INACTIVO) {
            throw new NegocioException("No se puede iniciar un proyecto en estado " + proyecto.getEstado());
        }

        List<AsignacionProyectoComunitario> asignaciones = asignacionProyectoComunitarioRepository.findByProyectoComunitarioId(proyectoId);
        List<AsignacionProyectoComunitario> asignacionesAIniciar = asignaciones.stream()
                .filter(a -> a.getFaseActual() == FaseActualAsignacion.ASIGNACION)
                .toList();

        if (asignacionesAIniciar.isEmpty()) {
            if (asignaciones.isEmpty()) {
                throw new NegocioException("El proyecto no tiene estudiantes asignados para iniciar la fase de desarrollo.");
            }
            throw new NegocioException("Todos los estudiantes asignados ya han iniciado la fase de desarrollo o culminaron su proceso.");
        }

        for (AsignacionProyectoComunitario asignacion : asignacionesAIniciar) {
            asignacion.setFaseActual(FaseActualAsignacion.DESARROLLO);
            asignacionProyectoComunitarioRepository.save(asignacion);

            // Notificar al estudiante
            notificacionService.enviar(
                    asignacion.getProcesoVinculacion().getEstudiante().getId(),
                    "Inicio de Proyecto de Vinculación",
                    "El Tutor Académico ha iniciado el proyecto: " + proyecto.getNombre() + ". Ya puedes subir tus evidencias.",
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/mi-proyecto"
            );
        }

        return asignacionesAIniciar.size();
    }

    @Transactional
    @Override
    public AsignacionProyectoComunitarioDto enviarASubdecanato(Long id) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + id));

        if (asignacion.getEstado() == EstadoAsignacionVcs.APROBADO) {
            throw new NegocioException("Las horas de esta asignación ya han sido validadas y el certificado ya fue emitido.");
        }

        if (asignacion.isDocumentosValidados()) {
            throw new NegocioException("Los documentos de vinculación ya han sido enviados a Subdecanato previamente.");
        }

        List<EvidenciaAsignacionVcs> todasEvidencias = evidenciaAsignacionVcsRepository
                .findByAsignacionIdOrderByFechaSubidaDesc(asignacion.getId());

        boolean bitacoraAprobada = todasEvidencias.stream().anyMatch(e ->
                e.getTipoDocumento() == TipoDocumentoVcs.BITACORA && e.getEstadoTutor() == EstadoRevisionVcs.APROBADO);
        boolean informeFinalAprobado = todasEvidencias.stream().anyMatch(e ->
                e.getTipoDocumento() == TipoDocumentoVcs.INFORME_FINAL && e.getEstadoTutor() == EstadoRevisionVcs.APROBADO);

        if (!bitacoraAprobada || !informeFinalAprobado) {
            throw new NegocioException("Debe aprobar tanto la Bitácora de Actividades como el Informe Final antes de enviar a Subdecanato.");
        }

        asignacion.setDocumentosValidados(true);
        asignacion.setFaseActual(FaseActualAsignacion.FINALIZACION);
        AsignacionProyectoComunitario guardada = asignacionProyectoComunitarioRepository.save(asignacion);

        // Notificar a Subdecanato
        Usuario subdecano = usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() == RolUsuario.SUBDECANO)
                .findFirst().orElse(null);
        if (subdecano != null) {
            Usuario estudiante = asignacion.getProcesoVinculacion() != null ? asignacion.getProcesoVinculacion().getEstudiante() : null;
            String nombreEst = (estudiante != null) ? estudiante.getNombreCompleto() : "Estudiante";
            String nombreProy = (asignacion.getProyectoComunitario() != null) ? asignacion.getProyectoComunitario().getNombre() : "Proyecto";
            notificacionService.enviar(
                    subdecano.getId(),
                    "Validación de Horas y Certificado VCS Pendiente",
                    "El tutor académico ha validado los documentos del estudiante " + nombreEst + " en el proyecto '" + nombreProy + "'. Pendiente validación de horas y emisión de certificado.",
                    TipoNotificacion.ADVERTENCIA,
                    "/dashboard/vinculacion/asignaciones-existentes?asignacionId=" + asignacion.getId() + "&abrirAprobarHoras=true"
            );
        }

        // Notificar al estudiante
        if (asignacion.getProcesoVinculacion() != null && asignacion.getProcesoVinculacion().getEstudiante() != null) {
            notificacionService.enviar(
                    asignacion.getProcesoVinculacion().getEstudiante().getId(),
                    "Documentos de Vinculación Validados",
                    "Tu tutor académico ha validado tus documentos y los ha enviado a Subdecanato para la emisión del certificado.",
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/mi-proyecto?asignacionId=" + asignacion.getId()
            );
        }

        return asignacionProyectoComunitarioMapeador.aDto(guardada);
    }

    @Transactional
    @Override
    public ResultadoAprobacionHorasDto aprobarHorasSubdecanato(Long id, AprobarHorasSubdecanatoDto dto) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + id));

        if (asignacion.getEstado() == EstadoAsignacionVcs.APROBADO) {
            throw new NegocioException("Las horas de esta asignación ya han sido validadas y el certificado ya fue emitido.");
        }

        if (!asignacion.isDocumentosValidados()) {
            throw new NegocioException("No se pueden aprobar las horas porque el Tutor Académico aún no ha validado los documentos y evidencias.");
        }

        Integer horasAprobar = asignacion.getHorasAsignadas();

        if (horasAprobar == null || horasAprobar <= 0) {
            throw new NegocioException("La asignación no tiene horas asignadas válidas para ser aprobadas.");
        }

        asignacion.setHorasCompletadas(horasAprobar);
        asignacion.setEstado(EstadoAsignacionVcs.APROBADO);
        asignacion.setFaseActual(FaseActualAsignacion.FINALIZACION);
        if (dto != null && dto.urlCertificadoFirmado() != null && !dto.urlCertificadoFirmado().isBlank()) {
            asignacion.setUrlCertificado(dto.urlCertificadoFirmado());
        }
        asignacionProyectoComunitarioRepository.save(asignacion);

        ProcesoVinculacion proceso = asignacion.getProcesoVinculacion();
        int horasAcumuladas = (proceso.getHorasAcumuladas() != null ? proceso.getHorasAcumuladas() : 0) + horasAprobar;
        proceso.setHorasAcumuladas(horasAcumuladas);

        boolean procesoCulminado = false;
        if (horasAcumuladas >= proceso.getHorasRequeridas()) {
            proceso.setEstado(EstadoProcesoVcs.COMPLETADO);
            procesoCulminado = true;
        }
        procesoVinculacionRepository.save(proceso);

        // Notificar al estudiante
        Usuario estudiante = proceso.getEstudiante();
        notificacionService.enviar(
                estudiante.getId(),
                "Acreditación de Horas de Vinculación",
                "El Subdecanato ha aprobado " + horasAprobar + " horas en el proyecto: " + asignacion.getProyectoComunitario().getNombre(),
                TipoNotificacion.INFORMACION,
                "/dashboard/vinculacion/progreso-general"
        );

        if (procesoCulminado) {
            notificacionService.enviar(
                    estudiante.getId(),
                    "¡Proceso de Vinculación Culminado!",
                    "¡Felicitaciones! Has completado el 100% de tus horas requeridas (" + horasAcumuladas + "/" + proceso.getHorasRequeridas() + "h) de Vinculación con la Sociedad.",
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/progreso-general"
            );

            // Inactivar estudiante si y solo si también culminó Prácticas Preprofesionales (PP)
            if (estudiante != null) {
                boolean practicasCulminadas = procesoPracticaRepository.findByEstudianteId(estudiante.getId())
                        .map(pp -> pp.getEstado() == EstadoProceso.COMPLETADO ||
                                   (pp.getHorasAcumuladas() != null && pp.getHorasAcumuladas() >= pp.getHorasRequeridas()))
                        .orElse(false);

                if (practicasCulminadas) {
                    estudiante.setEstado(EstadoUsuario.INACTIVO);
                    usuarioRepository.save(estudiante);
                }
            }
        }

        return new ResultadoAprobacionHorasDto(
                asignacion.getId(),
                asignacion.getEstado(),
                asignacion.getFaseActual(),
                horasAprobar,
                proceso.getHorasAcumuladas(),
                proceso.getHorasRequeridas(),
                proceso.getEstado(),
                procesoCulminado,
                "Horas de vinculación validadas y aprobadas con éxito."
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<AsignacionProyectoComunitarioDto> listarPorEstudiante(Long estudianteId) {
        return asignacionProyectoComunitarioRepository.findByEstudianteId(estudianteId)
                .stream()
                .map(asignacionProyectoComunitarioMapeador::aDto)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<AsignacionProyectoComunitarioDto> listarPorTutor(Long tutorId) {
        return asignacionProyectoComunitarioRepository.findByTutorId(tutorId)
                .stream()
                .map(asignacionProyectoComunitarioMapeador::aDto)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public byte[] vistaPreviaCertificadoHoras(Long id, String subdecanoNombre, String subdecanoCedula, String subdecanoTelefono, String subdecanoCorreo) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + id));

        // 1. Si existe un certificado firmado físicamente subido por Subdecanato, retornar dicho PDF firmado
        String urlCertificado = asignacion.getUrlCertificado();
        if (urlCertificado != null && urlCertificado.contains("/archivos_subidos/")) {
            try {
                String rutaRelativa = urlCertificado.substring(urlCertificado.indexOf("/archivos_subidos/") + "/archivos_subidos/".length());
                Path carpetaBase = Paths.get(rutaBaseAlmacenamiento != null ? rutaBaseAlmacenamiento : "archivos_subidos")
                        .toAbsolutePath().normalize();
                Path filePath = carpetaBase.resolve(rutaRelativa).normalize().toAbsolutePath();
                if (!filePath.startsWith(carpetaBase)) {
                    throw new NegocioException("Acceso no permitido: ruta de archivo invalida");
                }
                if (!Files.exists(filePath) && !rutaRelativa.contains("/")) {
                    Path posibleVinculacion = carpetaBase.resolve("vinculacion").resolve(rutaRelativa).normalize().toAbsolutePath();
                    if (posibleVinculacion.startsWith(carpetaBase) && Files.exists(posibleVinculacion)) {
                        filePath = posibleVinculacion;
                    } else {
                        Path posiblePortafolio = carpetaBase.resolve("portafolios").resolve(rutaRelativa).normalize().toAbsolutePath();
                        if (posiblePortafolio.startsWith(carpetaBase) && Files.exists(posiblePortafolio)) {
                            filePath = posiblePortafolio;
                        }
                    }
                }
                if (Files.exists(filePath)) {
                    return Files.readAllBytes(filePath);
                }
            } catch (Exception e) {
                log.error("Error al leer el archivo de certificado firmado: {}", e.getMessage());
            }
        }

        // 2. Si no hay archivo firmado previo, generar el PDF dinámico para vista previa / firma
        boolean nombreVacio = subdecanoNombre == null || subdecanoNombre.isBlank()
                || "Subdecano FICA".equalsIgnoreCase(subdecanoNombre.trim())
                || "Subdecano(a) FICA".equalsIgnoreCase(subdecanoNombre.trim());
        boolean cedulaVacia = subdecanoCedula == null || subdecanoCedula.isBlank()
                || "1700000000".equals(subdecanoCedula.trim());
        boolean telefonoVacio = subdecanoTelefono == null || subdecanoTelefono.isBlank()
                || "0999999999".equals(subdecanoTelefono.trim());
        boolean correoVacio = subdecanoCorreo == null || subdecanoCorreo.isBlank()
                || "subdecano@uce.edu.ec".equalsIgnoreCase(subdecanoCorreo.trim());

        if (nombreVacio || cedulaVacia || telefonoVacio || correoVacio) {
            Usuario subdecano = usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO).orElse(null);
            if (subdecano != null) {
                if (nombreVacio && subdecano.getNombreCompleto() != null && !subdecano.getNombreCompleto().isBlank()) {
                    subdecanoNombre = subdecano.getNombreCompleto();
                }
                if (cedulaVacia && subdecano.getIdentificacion() != null && !subdecano.getIdentificacion().isBlank()) {
                    subdecanoCedula = subdecano.getIdentificacion();
                }
                if (telefonoVacio && subdecano.getTelefono() != null && !subdecano.getTelefono().isBlank()) {
                    subdecanoTelefono = subdecano.getTelefono();
                }
                if (correoVacio && subdecano.getCorreo() != null && !subdecano.getCorreo().isBlank()) {
                    subdecanoCorreo = subdecano.getCorreo();
                }
            }
        }
        return certificadoHorasVcsPdfExportador.exportar(asignacion, subdecanoNombre, subdecanoCedula, subdecanoTelefono, subdecanoCorreo);
    }

    @Transactional(readOnly = true)
    @Override
    public String obtenerNombreArchivoCertificado(Long id) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id).orElse(null);
        String nombreEstudiante = "Estudiante";
        String nombreCarrera = "Carrera";
        if (asignacion != null && asignacion.getProcesoVinculacion() != null && asignacion.getProcesoVinculacion().getEstudiante() != null) {
            Usuario estudiante = asignacion.getProcesoVinculacion().getEstudiante();
            if (estudiante.getNombreCompleto() != null && !estudiante.getNombreCompleto().isBlank()) {
                nombreEstudiante = estudiante.getNombreCompleto().trim();
            }
            if (estudiante.getCarrera() != null && estudiante.getCarrera().getNombre() != null && !estudiante.getCarrera().getNombre().isBlank()) {
                nombreCarrera = estudiante.getCarrera().getNombre().trim();
            }
        }
        return ("Certificado_VCS_" + nombreEstudiante + "_" + nombreCarrera)
                .replaceAll("[^a-zA-Z0-9_.-]", "_") + ".pdf";
    }

    @Transactional
    @Override
    public AsignacionProyectoComunitarioDto reprobarAsignacion(Long id) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + id));

        if (asignacion.getEstado() != EstadoAsignacionVcs.EN_CURSO) {
            throw new NegocioException("Solo se pueden reprobar asignaciones que se encuentren en curso");
        }

        asignacion.setEstado(EstadoAsignacionVcs.REPROBADO);
        asignacion.setHorasCompletadas(0);
        AsignacionProyectoComunitario guardada = asignacionProyectoComunitarioRepository.save(asignacion);

        Usuario estudiante = asignacion.getProcesoVinculacion().getEstudiante();
        if (estudiante != null) {
            notificacionService.enviar(
                    estudiante.getId(),
                    "Asignación Reprobada",
                    "Has sido reprobado en el proyecto comunitario '" + asignacion.getProyectoComunitario().getNombre() + "'. Las horas completadas se han registrado en 0.",
                    TipoNotificacion.ADVERTENCIA,
                    "/dashboard/vinculacion/progreso-general"
            );
        }

        return asignacionProyectoComunitarioMapeador.aDto(guardada);
    }

    @Transactional
    @Override
    public AsignacionProyectoComunitarioDto cancelarAsignacion(Long id) {
        AsignacionProyectoComunitario asignacion = asignacionProyectoComunitarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Asignación no encontrada con ID: " + id));

        if (asignacion.getEstado() == EstadoAsignacionVcs.APROBADO) {
            throw new NegocioException("No se puede cancelar una asignación cuyas horas ya fueron aprobadas");
        }

        asignacion.setEstado(EstadoAsignacionVcs.CANCELADO);
        asignacion.setHorasCompletadas(0);
        AsignacionProyectoComunitario guardada = asignacionProyectoComunitarioRepository.save(asignacion);

        Usuario estudiante = asignacion.getProcesoVinculacion().getEstudiante();
        if (estudiante != null) {
            notificacionService.enviar(
                    estudiante.getId(),
                    "Asignación Cancelada",
                    "Tu asignación al proyecto comunitario '" + asignacion.getProyectoComunitario().getNombre() + "' ha sido cancelada.",
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/progreso-general"
            );
        }

        Usuario tutor = asignacion.getProyectoComunitario().getTutorAcademico();
        if (tutor != null) {
            notificacionService.enviar(
                    tutor.getId(),
                    "Asignación de Estudiante Cancelada",
                    "La asignación del estudiante " + (estudiante != null ? estudiante.getNombreCompleto() : "") + " en el proyecto '" + asignacion.getProyectoComunitario().getNombre() + "' ha sido cancelada.",
                    TipoNotificacion.INFORMACION,
                    "/dashboard/vinculacion/asignaciones-existentes"
            );
        }

        return asignacionProyectoComunitarioMapeador.aDto(guardada);
    }
}
