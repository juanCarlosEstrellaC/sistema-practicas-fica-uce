package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.ArchivoDescargaDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoPortafolioDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoRevisarDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoResubirDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoSubirDto;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DocumentoPortafolioService {
    /**
     * Obtiene todos los documentos asociados al portafolio de un estudiante.
     *
     * @param estudianteId El ID del estudiante.
     * @return Una lista de DTOs con la informacion de los documentos.
     */
    List<DocumentoPortafolioDto> buscarPorEstudiante(Long estudianteId);
    List<DocumentoPortafolioDto> buscarPorEstudiante(Long estudianteId, Usuario usuarioAutenticado);

    /**
     * Obtiene todos los documentos del portafolio de la base de datos.
     *
     * @return Una lista de DTOs con la informacion de todos los documentos.
     */
    Page<DocumentoPortafolioDto> obtenerTodos(Pageable pageable);
    DocumentoPortafolioDto revisarDocumento(Long id, DocumentoRevisarDto dto);
    DocumentoPortafolioDto revisarDocumento(Long id, DocumentoRevisarDto dto, Usuario usuarioAutenticado);
    DocumentoPortafolioDto resubirDocumento(Long id, DocumentoResubirDto dto);
    DocumentoPortafolioDto resubirDocumento(Long id, DocumentoResubirDto dto, Long estudianteAutenticadoId);
    DocumentoPortafolioDto resubirDocumento(Long id, DocumentoResubirDto dto, Usuario usuarioAutenticado);
    DocumentoPortafolioDto subirDocumentoPortafolio(DocumentoSubirDto dto);
    DocumentoPortafolioDto subirDocumentoPortafolio(DocumentoSubirDto dto, Usuario usuarioAutenticado);
    List<DocumentoPortafolioDto> ocultarUrlsNoValidadasParaEstudiante(List<DocumentoPortafolioDto> documentos);
    List<DocumentoPortafolioDto> filtrarDocumentosPorRol(List<DocumentoPortafolioDto> documentos, RolUsuario rol);
    ArchivoDescargaDto obtenerDocumentoDescarga(Long id);
    ArchivoDescargaDto obtenerDocumentoDescarga(Long id, Usuario usuarioAutenticado);
}
