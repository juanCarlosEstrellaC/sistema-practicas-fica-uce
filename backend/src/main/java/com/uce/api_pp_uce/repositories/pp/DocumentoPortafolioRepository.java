package com.uce.api_pp_uce.repositories.pp;

import com.uce.api_pp_uce.entities.pp.DocumentoPortafolio;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentoPortafolioRepository extends JpaRepository<DocumentoPortafolio, Long> {
    List<DocumentoPortafolio> findByEstudianteIdOrderByIdDesc(Long estudianteId);
    boolean existsByAsignacionIdAndTipo(Long asignacionId, TipoDocumento tipo);
    Optional<DocumentoPortafolio> findByAsignacionIdAndTipo(Long asignacionId, TipoDocumento tipo);
}
