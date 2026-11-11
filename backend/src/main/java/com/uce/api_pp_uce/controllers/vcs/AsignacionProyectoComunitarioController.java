package com.uce.api_pp_uce.controllers.vcs;

import org.springframework.web.bind.annotation.RestController;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
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
import com.uce.api_pp_uce.services.vcs.AsignacionProyectoComunitarioService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.uce.api_pp_uce.common.RespuestaArchivoUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/asignaciones-proyectos-comunitarios")
@RequiredArgsConstructor
public class AsignacionProyectoComunitarioController {

    private final AsignacionProyectoComunitarioService asignacionProyectoComunitarioService;

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaApi<AsignacionProyectoComunitarioDto>> buscarPorId(@PathVariable Long id) {
        AsignacionProyectoComunitarioDto asignacion = asignacionProyectoComunitarioService.buscarPorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación obtenida con éxito", asignacion));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping
    public ResponseEntity<RespuestaApi<Page<AsignacionProyectoComunitarioDto>>> buscarConFiltros(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) Long tutorId,
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) Long proyectoId,
            @RequestParam(required = false) EstadoAsignacionVcs estado,
            @RequestParam(required = false) FaseActualAsignacion faseActual,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) Long periodoAcademicoId,
            Pageable pageable) {
        Long periodoFinal = periodoId != null ? periodoId : periodoAcademicoId;
        Page<AsignacionProyectoComunitarioDto> asignaciones = asignacionProyectoComunitarioService.buscarConFiltros(
                busqueda,
                carreraId,
                tutorId,
                estudianteId,
                proyectoId,
                estado,
                faseActual,
                periodoFinal,
                pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignaciones obtenidas con éxito", asignaciones));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @GetMapping("/estudiantes-disponibles")
    public ResponseEntity<RespuestaApi<List<EstudianteResumenVcsDto>>> listarEstudiantesDisponibles(
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) String busqueda) {
        List<EstudianteResumenVcsDto> estudiantes = asignacionProyectoComunitarioService.listarEstudiantesDisponibles(
                carreraId,
                periodoId,
                busqueda);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Estudiantes disponibles obtenidos con éxito", estudiantes));
    }

    @PreAuthorize("hasAnyRole('DIRECTOR_CARRERA', 'SUBDECANO', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    @GetMapping("/proyectos-disponibles")
    public ResponseEntity<RespuestaApi<List<ProyectoComunitarioResumenDto>>> listarProyectosDisponibles(
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) String busqueda) {
        List<ProyectoComunitarioResumenDto> proyectos = asignacionProyectoComunitarioService.listarProyectosDisponibles(
                carreraId,
                periodoId,
                busqueda);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyectos disponibles obtenidos con éxito", proyectos));
    }

    @PreAuthorize("hasAnyRole('DIRECTOR_CARRERA', 'SUBDECANO', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    @GetMapping("/tutores-disponibles")
    public ResponseEntity<RespuestaApi<List<TutorResumenVcsDto>>> listarTutoresDisponibles(
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) Long proyectoId,
            @RequestParam(required = false) String conAsignaciones) {
        List<TutorResumenVcsDto> tutores = asignacionProyectoComunitarioService.listarTutoresDisponibles(
                carreraId,
                periodoId,
                busqueda,
                proyectoId,
                conAsignaciones);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Tutores disponibles obtenidos con éxito", tutores));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PostMapping
    public ResponseEntity<RespuestaApi<List<AsignacionProyectoComunitarioDto>>> crearAsignacion(
            @Valid @RequestBody AsignacionProyectoComunitarioMasivoDto dto) {
        List<AsignacionProyectoComunitarioDto> nuevaAsignacion = asignacionProyectoComunitarioService
                .asignarEstudiantesMasivo(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespuestaApi<>(true, "Asignación creada con éxito", nuevaAsignacion));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PutMapping("/{id}")
    public ResponseEntity<RespuestaApi<AsignacionProyectoComunitarioDto>> actualizarAsignacion(
            @PathVariable Long id,
            @Valid @RequestBody AsignacionProyectoComunitarioActualizarDto dto) {
        AsignacionProyectoComunitarioDto actualizada = asignacionProyectoComunitarioService.actualizarAsignacion(id,
                dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación actualizada con éxito", actualizada));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PutMapping("/tutores/{tutorId}/proyectos")
    public ResponseEntity<RespuestaApi<Void>> asociarProyectosATutor(
            @PathVariable Long tutorId,
            @RequestBody List<Long> proyectoIds) {
        asignacionProyectoComunitarioService.asociarProyectosATutor(tutorId, proyectoIds);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyectos asociados al tutor académico con éxito", null));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @DeleteMapping("/{id}")
    public ResponseEntity<RespuestaApi<Void>> eliminarAsignacion(@PathVariable Long id) {
        asignacionProyectoComunitarioService.eliminarAsignacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación eliminada con éxito", null));
    }

    @PreAuthorize("hasRole('TUTOR_ACADEMICO')")
    @PatchMapping("/{id}/iniciar-desarrollo")
    public ResponseEntity<RespuestaApi<AsignacionProyectoComunitarioDto>> iniciarDesarrollo(@PathVariable Long id) {
        AsignacionProyectoComunitarioDto actualizada = asignacionProyectoComunitarioService.iniciarDesarrollo(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyecto iniciado con éxito. Fase actualizada a Desarrollo.", actualizada));
    }

    @PreAuthorize("hasRole('TUTOR_ACADEMICO')")
    @PatchMapping("/proyectos/{proyectoId}/iniciar")
    public ResponseEntity<RespuestaApi<Integer>> iniciarProyectoGeneral(
            @PathVariable Long proyectoId,
            @RequestParam(required = false) Long periodoId) {
        int actualizadas = periodoId != null
                ? asignacionProyectoComunitarioService.iniciarProyecto(proyectoId, periodoId)
                : asignacionProyectoComunitarioService.iniciarProyecto(proyectoId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Proyecto iniciado con éxito para " + actualizadas + " estudiante(s). Fase actualizada a Desarrollo.", actualizadas));
    }


    @PreAuthorize("hasAnyRole('TUTOR_ACADEMICO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    @PatchMapping("/{id}/enviar-subdecanato")
    public ResponseEntity<RespuestaApi<AsignacionProyectoComunitarioDto>> enviarASubdecanato(@PathVariable Long id) {
        AsignacionProyectoComunitarioDto actualizada = asignacionProyectoComunitarioService.enviarASubdecanato(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documentos validados y enviados a Subdecanato con éxito", actualizada));
    }

    @PreAuthorize("hasRole('SUBDECANO')")
    @PatchMapping("/{id}/aprobar-horas-subdecanato")
    public ResponseEntity<RespuestaApi<ResultadoAprobacionHorasDto>> aprobarHorasSubdecanato(
            @PathVariable Long id,
            @Valid @RequestBody AprobarHorasSubdecanatoDto dto) {
        ResultadoAprobacionHorasDto resultado = asignacionProyectoComunitarioService.aprobarHorasSubdecanato(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Horas de vinculación validadas y aprobadas con éxito", resultado));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping("/{id}/certificado-horas/preview")
    public ResponseEntity<byte[]> vistaPreviaCertificadoHoras(
            @PathVariable Long id,
            @RequestParam(required = false) String subdecanoNombre,
            @RequestParam(required = false) String subdecanoCedula,
            @RequestParam(required = false) String subdecanoTelefono,
            @RequestParam(required = false) String subdecanoCorreo) {
        ArchivoDescargaDto descarga = asignacionProyectoComunitarioService.obtenerDescargaCertificadoHoras(
                id, subdecanoNombre, subdecanoCedula, subdecanoTelefono, subdecanoCorreo);
        return RespuestaArchivoUtil.previsualizar(descarga);
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'ESTUDIANTE')")
    @GetMapping("/estudiante/{estudianteId}")
    public ResponseEntity<RespuestaApi<List<AsignacionProyectoComunitarioDto>>> listarPorEstudiante(@PathVariable Long estudianteId) {
        List<AsignacionProyectoComunitarioDto> asignaciones = asignacionProyectoComunitarioService.listarPorEstudiante(estudianteId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignaciones del estudiante obtenidas con éxito", asignaciones));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<RespuestaApi<List<AsignacionProyectoComunitarioDto>>> listarPorTutor(@PathVariable Long tutorId) {
        List<AsignacionProyectoComunitarioDto> asignaciones = asignacionProyectoComunitarioService.listarPorTutor(tutorId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignaciones del tutor académico obtenidas con éxito", asignaciones));
    }

    @PreAuthorize("hasRole('TUTOR_ACADEMICO')")
    @PatchMapping("/{id}/reprobar")
    public ResponseEntity<RespuestaApi<AsignacionProyectoComunitarioDto>> reprobarAsignacion(@PathVariable Long id) {
        AsignacionProyectoComunitarioDto reprobada = asignacionProyectoComunitarioService.reprobarAsignacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación reprobada con éxito", reprobada));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<RespuestaApi<AsignacionProyectoComunitarioDto>> cancelarAsignacion(@PathVariable Long id) {
        AsignacionProyectoComunitarioDto cancelada = asignacionProyectoComunitarioService.cancelarAsignacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación cancelada con éxito", cancelada));
    }
}
