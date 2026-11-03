package com.uce.api_pp_uce.repositories.vcs;

import com.uce.api_pp_uce.entities.vcs.EvidenciaAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenciaAsignacionVcsRepository extends JpaRepository<EvidenciaAsignacionVcs, Long> {

    @Query(
        value = """
            SELECT e
            FROM EvidenciaAsignacionVcs e
            JOIN FETCH e.asignacion a
            JOIN FETCH a.proyectoComunitario p
            JOIN FETCH e.estudiante est
            LEFT JOIN FETCH p.tutorAcademico ta
            WHERE (CAST(:busqueda AS string) IS NULL
                   OR LOWER(e.nombreArchivo) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                   OR LOWER(CONCAT(est.nombres, ' ', est.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                   OR LOWER(est.identificacion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
              AND (CAST(:asignacionId AS long) IS NULL OR a.id = :asignacionId)
              AND (CAST(:estudianteId AS long) IS NULL OR est.id = :estudianteId)
              AND (CAST(:tutorId AS long) IS NULL OR ta.id = :tutorId)
              AND (CAST(:estadoTutor AS string) IS NULL OR e.estadoTutor = :estadoTutor)
        """,
        countQuery = """
            SELECT COUNT(e)
            FROM EvidenciaAsignacionVcs e
            JOIN e.asignacion a
            JOIN a.proyectoComunitario p
            JOIN e.estudiante est
            LEFT JOIN p.tutorAcademico ta
            WHERE (CAST(:busqueda AS string) IS NULL
                   OR LOWER(e.nombreArchivo) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                   OR LOWER(CONCAT(est.nombres, ' ', est.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                   OR LOWER(est.identificacion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
              AND (CAST(:asignacionId AS long) IS NULL OR a.id = :asignacionId)
              AND (CAST(:estudianteId AS long) IS NULL OR est.id = :estudianteId)
              AND (CAST(:tutorId AS long) IS NULL OR ta.id = :tutorId)
              AND (CAST(:estadoTutor AS string) IS NULL OR e.estadoTutor = :estadoTutor)
        """
    )
    Page<EvidenciaAsignacionVcs> buscarConFiltros(
        @Param("busqueda") String busqueda,
        @Param("asignacionId") Long asignacionId,
        @Param("estudianteId") Long estudianteId,
        @Param("tutorId") Long tutorId,
        @Param("estadoTutor") EstadoRevisionVcs estadoTutor,
        Pageable pageable
    );

    List<EvidenciaAsignacionVcs> findByAsignacionIdOrderByFechaSubidaDesc(Long asignacionId);

    Optional<EvidenciaAsignacionVcs> findByAsignacionIdAndTipoDocumento(Long asignacionId, TipoDocumentoVcs tipoDocumento);

    long countByAsignacionId(Long asignacionId);

    long countByAsignacionIdAndEstadoTutor(Long asignacionId, EstadoRevisionVcs estadoTutor);
}
