package com.uce.api_pp_uce.repositories.vcs;

import com.uce.api_pp_uce.entities.vcs.ReporteProyectoVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.TipoReporteProyectoVcs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteProyectoVcsRepository extends JpaRepository<ReporteProyectoVcs, Long> {

    @Query(
        value = """
            SELECT r
            FROM ReporteProyectoVcs r
            JOIN FETCH r.proyecto p
            JOIN FETCH r.periodoAcademico per
            LEFT JOIN FETCH r.coordinador c
            WHERE (CAST(:busqueda AS string) IS NULL
                   OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                   OR LOWER(r.nombreArchivo) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
              AND (CAST(:proyectoId AS long) IS NULL OR p.id = :proyectoId)
              AND (CAST(:periodoId AS long) IS NULL OR per.id = :periodoId)
              AND (CAST(:tipo AS string) IS NULL OR r.tipo = :tipo)
              AND (CAST(:estadoSubdecanato AS string) IS NULL OR r.estadoSubdecanato = :estadoSubdecanato)
        """,
        countQuery = """
            SELECT COUNT(r)
            FROM ReporteProyectoVcs r
            JOIN r.proyecto p
            JOIN r.periodoAcademico per
            WHERE (CAST(:busqueda AS string) IS NULL
                   OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                   OR LOWER(r.nombreArchivo) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
              AND (CAST(:proyectoId AS long) IS NULL OR p.id = :proyectoId)
              AND (CAST(:periodoId AS long) IS NULL OR per.id = :periodoId)
              AND (CAST(:tipo AS string) IS NULL OR r.tipo = :tipo)
              AND (CAST(:estadoSubdecanato AS string) IS NULL OR r.estadoSubdecanato = :estadoSubdecanato)
        """
    )
    Page<ReporteProyectoVcs> buscarConFiltros(
        @Param("busqueda") String busqueda,
        @Param("proyectoId") Long proyectoId,
        @Param("periodoId") Long periodoId,
        @Param("tipo") TipoReporteProyectoVcs tipo,
        @Param("estadoSubdecanato") EstadoRevisionVcs estadoSubdecanato,
        Pageable pageable
    );

    List<ReporteProyectoVcs> findByProyectoIdOrderByFechaSubidaDesc(Long proyectoId);

    List<ReporteProyectoVcs> findByProyectoIdAndTipo(Long proyectoId, TipoReporteProyectoVcs tipo);

    boolean existsByProyectoIdAndTipoAndEstadoSubdecanato(Long proyectoId, TipoReporteProyectoVcs tipo, EstadoRevisionVcs estadoSubdecanato);
}
