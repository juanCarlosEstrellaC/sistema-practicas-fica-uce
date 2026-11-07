package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.AsignacionStatsDto;
import com.uce.api_pp_uce.dtos.pp.ActualizarAsignacionDto;
import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.dtos.pp.DatosCacesDto;
import com.uce.api_pp_uce.dtos.pp.EmitirCartaDto;
import com.uce.api_pp_uce.dtos.pp.FirmarRegistroDto;
import com.uce.api_pp_uce.dtos.pp.GenerarAvalDto;
import com.uce.api_pp_uce.dtos.pp.HorasAsignacionDto;
import com.uce.api_pp_uce.dtos.pp.NuevaAsignacionDto;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import com.uce.api_pp_uce.services.pp.AsignacionPracticaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/asignaciones-practicas")
@RequiredArgsConstructor
public class AsignacionPracticasController {

    private final AsignacionPracticaService asignacionPracticaService;

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping
    public ResponseEntity<RespuestaApi<Page<AsignacionPracticaDetalleDto>>> listarAsignaciones(
            @RequestParam(required = false, name = "search") String busqueda,
            @RequestParam(required = false) EstadoAsignacion estado,
            @RequestParam(required = false) FaseActualPractica fase,
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) Long tutorId,
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) Boolean requiereCarta,
            Pageable pageable) {
        Page<AsignacionPracticaDetalleDto> asignaciones = asignacionPracticaService.buscarConFiltros(
                busqueda, estado, fase, carreraId, periodoId, tutorId, estudianteId, requiereCarta, pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignaciones obtenidas", asignaciones));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    @GetMapping("/estadisticas")
    public ResponseEntity<RespuestaApi<AsignacionStatsDto>> obtenerEstadisticas() {
        AsignacionStatsDto estadisticas = asignacionPracticaService.obtenerEstadisticas();
        return ResponseEntity.ok(new RespuestaApi<>(true, "Estadisticas obtenidas", estadisticas));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> obtenerAsignacion(@PathVariable Long id) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.buscarDetallePorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignacion obtenida", asignacion));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PostMapping("/asignar")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> asignarTutorYConvenio(
            @Valid @RequestBody NuevaAsignacionDto solicitud) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.asignarTutorYConvenio(
                solicitud.estudianteId(), solicitud.convenioId(), solicitud.tutorId(),
                solicitud.tutorInstitucional(), solicitud.horas(), solicitud.periodoAcademicoId());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación completada", asignacion));
    }

    @PreAuthorize("hasRole('TUTOR_ACADEMICO')")
    @PatchMapping("/{id}/reprobar")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> reprobarAsignacion(@PathVariable Long id) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.reprobarAsignacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Práctica preprofesional reprobada exitosamente", asignacion));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> cancelarAsignacion(@PathVariable Long id) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.cancelarAsignacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Práctica preprofesional cancelada exitosamente", asignacion));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @DeleteMapping("/{id}")
    public ResponseEntity<RespuestaApi<Void>> eliminarAsignacion(@PathVariable Long id) {
        asignacionPracticaService.eliminarAsignacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación eliminada correctamente", null));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PutMapping("/{id}")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> actualizarAsignacion(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarAsignacionDto solicitud) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.actualizarAsignacion(
                id, solicitud.convenioId(), solicitud.tutorId(), solicitud.horas(), solicitud.periodoAcademicoId());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Asignación actualizada", asignacion));
    }

    @PreAuthorize("hasRole('DIRECTOR_CARRERA')")
    @PostMapping("/{id}/emitir-carta")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> emitirCarta(
            @PathVariable Long id,
            @RequestBody(required = false) EmitirCartaDto solicitud) {
        String urlCarta = (solicitud != null && solicitud.urlCarta() != null) ? solicitud.urlCarta() : null;
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.emitirCartaAsignacion(id, urlCarta);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carta emitida", asignacion));
    }

    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    @GetMapping("/{id}/carta-asignacion/preview")
    public ResponseEntity<byte[]> vistaPreviaCartaAsignacion(@PathVariable Long id) {
        ArchivoDescargaDto descarga = asignacionPracticaService.obtenerCartaAsignacionDescarga(id);
        return construirRespuestaPdf(descarga.contenido(), descarga.nombreArchivo());
    }

    @PreAuthorize("hasRole('DIRECTOR_CARRERA')")
    @PostMapping("/{id}/reenviar-carta")
    public ResponseEntity<RespuestaApi<Void>> reenviarCarta(@PathVariable Long id) {
        asignacionPracticaService.reenviarCartaAsignacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carta de asignación reenviada exitosamente al Tutor Institucional", null));
    }

    @PreAuthorize("hasAnyRole('TUTOR_ACADEMICO', 'COORDINADOR_PRACTICAS')")
    @PostMapping("/{id}/iniciar-desarrollo")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> iniciarDesarrollo(@PathVariable Long id) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.iniciarDesarrolloPracticas(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Desarrollo iniciado", asignacion));
    }

    @PreAuthorize("hasAnyRole('TUTOR_ACADEMICO', 'COORDINADOR_PRACTICAS')")
    @PatchMapping("/{id}/avanzar-horas")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> avanzarHoras(
            @PathVariable Long id,
            @Valid @RequestBody HorasAsignacionDto solicitud) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.avanzarHoras(id, solicitud.horas());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Horas actualizadas", asignacion));
    }

    @PreAuthorize("hasRole('TUTOR_ACADEMICO')")
    @PostMapping("/{id}/firmar-registro")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> firmarRegistro(
            @PathVariable Long id,
            @RequestBody(required = false) FirmarRegistroDto solicitud) {
        String urlInforme = (solicitud != null && solicitud.urlInforme() != null) ? solicitud.urlInforme() : "/docs/informe_final.pdf";
        String urlCertificado = (solicitud != null && solicitud.urlCertificado() != null) ? solicitud.urlCertificado() : "/docs/certificado_cumplimiento.pdf";
        String urlSeguimiento = (solicitud != null && solicitud.urlSeguimiento() != null) ? solicitud.urlSeguimiento() : "/docs/seguimiento_tutor.pdf";
        LocalDate fechaFin = (solicitud != null) ? solicitud.fechaFin() : null;
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.firmarRegistroDesarrollo(id, urlInforme, urlCertificado, urlSeguimiento, fechaFin);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Registro firmado y enviado a revisión", asignacion));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PostMapping("/{id}/validar-cpp")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> validarCpp(@PathVariable Long id) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.validarCpp(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Validación CPP exitosa", asignacion));
    }

    @PreAuthorize("hasRole('SUBDECANO')")
    @PostMapping("/{id}/generar-aval")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> generarAval(
            @PathVariable Long id, @RequestBody(required = false) GenerarAvalDto solicitud) {
        String urlAval = (solicitud != null && solicitud.urlAval() != null) ? solicitud.urlAval() : null;
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.generarAval(id, urlAval);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Aval generado exitosamente", asignacion));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PatchMapping("/{id}/datos-caces")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> actualizarDatosCaces(
            @PathVariable Long id,
            @RequestBody DatosCacesDto solicitud) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.actualizarDatosCaces(id, solicitud.observacionesCaces());
        return ResponseEntity.ok(new RespuestaApi<>(true, "Datos CACES actualizados", asignacion));
    }

    @PreAuthorize("hasRole('COORDINADOR_PRACTICAS')")
    @PostMapping("/{id}/validar-siiu")
    public ResponseEntity<RespuestaApi<AsignacionPracticaDetalleDto>> validarSiiu(@PathVariable Long id) {
        AsignacionPracticaDetalleDto asignacion = asignacionPracticaService.validarSiiu(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Validación SIIU exitosa", asignacion));
    }

    @PreAuthorize("hasRole('SUBDECANO')")
    @GetMapping("/{id}/aval/preview")
    public ResponseEntity<byte[]> vistaPreviaAval(@PathVariable Long id,
                                              @RequestParam(required = false) String subdecanoNombre,
                                              @RequestParam(required = false) String subdecanoCedula,
                                              @RequestParam(required = false) String subdecanoTelefono,
                                              @RequestParam(required = false) String subdecanoCorreo) {
        ArchivoDescargaDto descarga = asignacionPracticaService.obtenerAvalDescarga(
                id, subdecanoNombre, subdecanoCedula, subdecanoTelefono, subdecanoCorreo);
        return construirRespuestaPdf(descarga.contenido(), descarga.nombreArchivo());
    }

    private ResponseEntity<byte[]> construirRespuestaPdf(byte[] bytesPdf, String nombreArchivo) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(nombreArchivo).build());
        return new ResponseEntity<>(bytesPdf, headers, HttpStatus.OK);
    }
}
