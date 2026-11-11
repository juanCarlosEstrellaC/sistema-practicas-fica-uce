package com.uce.api_pp_uce.controllers.pp;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.common.RespuestaArchivoUtil;
import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoPortafolioDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoRevisarDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoResubirDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoSubirDto;
import com.uce.api_pp_uce.services.pp.DocumentoPortafolioService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documentos")
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoPortafolioService documentoService;

    @GetMapping("/estudiante/{estudianteId}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<RespuestaApi<List<DocumentoPortafolioDto>>> obtenerPorEstudiante(
            @PathVariable Long estudianteId) {
        List<DocumentoPortafolioDto> documentos = documentoService.buscarPorEstudiante(estudianteId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documentos obtenidos exitosamente", documentos));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    public ResponseEntity<RespuestaApi<Page<DocumentoPortafolioDto>>> obtenerTodos(Pageable pageable) {
        Page<DocumentoPortafolioDto> documentos = documentoService.obtenerTodos(pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documentos obtenidos exitosamente", documentos));
    }

    @PutMapping("/{id}/revisar")
    @PreAuthorize("hasAnyRole('COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO')")
    public ResponseEntity<RespuestaApi<DocumentoPortafolioDto>> revisarDocumento(
            @PathVariable Long id,
            @RequestBody DocumentoRevisarDto dto) {
        DocumentoPortafolioDto documento = documentoService.revisarDocumento(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documento revisado exitosamente", documento));
    }

    @PutMapping("/{id}/resubir")
    @PreAuthorize("hasAnyRole('ESTUDIANTE', 'TUTOR_ACADEMICO')")
    public ResponseEntity<RespuestaApi<DocumentoPortafolioDto>> resubirDocumento(
            @PathVariable Long id,
            @RequestBody DocumentoResubirDto dto) {
        DocumentoPortafolioDto res = documentoService.resubirDocumento(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documento resubido correctamente", res));
    }

    @PostMapping("/subir")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<RespuestaApi<DocumentoPortafolioDto>> subirDocumento(
            @RequestBody DocumentoSubirDto dto) {
        DocumentoPortafolioDto res = documentoService.subirDocumentoPortafolio(dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Documento subido correctamente", res));
    }

    @GetMapping("/{id}/preview")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<byte[]> previsualizarDocumento(@PathVariable Long id) {
        ArchivoDescargaDto descarga = documentoService.obtenerDocumentoDescarga(id);
        return RespuestaArchivoUtil.previsualizar(descarga);
    }

    @GetMapping("/{id}/descargar")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'TUTOR_ACADEMICO', 'ESTUDIANTE')")
    public ResponseEntity<byte[]> descargarDocumento(@PathVariable Long id) {
        ArchivoDescargaDto descarga = documentoService.obtenerDocumentoDescarga(id);
        return RespuestaArchivoUtil.descargar(descarga);
    }
}
