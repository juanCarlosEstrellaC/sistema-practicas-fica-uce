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
              AND (CAST(:carreraId AS integer) IS NULL OR p.carrera.id = :carreraId)
              AND (CAST(:tutorId AS long) IS NULL OR p.tutorAcademico.id = :tutorId)
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
              AND (CAST(:carreraId AS integer) IS NULL OR p.carrera.id = :carreraId)
              AND (CAST(:tutorId AS long) IS NULL OR p.tutorAcademico.id = :tutorId)
        """
    )
    Page<ReporteProyectoVcs> buscarConFiltros(
        @Param("busqueda") String busqueda,
        @Param("proyectoId") Long proyectoId,
        @Param("periodoId") Long periodoId,
        @Param("tipo") TipoReporteProyectoVcs tipo,
        @Param("estadoSubdecanato") EstadoRevisionVcs estadoSubdecanato,
        @Param("carreraId") Integer carreraId,
        @Param("tutorId") Long tutorId,
        Pageable pageable
    );

    default Page<ReporteProyectoVcs> buscarConFiltros(
        String busqueda,
        Long proyectoId,
        Long periodoId,
        TipoReporteProyectoVcs tipo,
        EstadoRevisionVcs estadoSubdecanato,
        Pageable pageable
    ) {
        return buscarConFiltros(busqueda, proyectoId, periodoId, tipo, estadoSubdecanato, null, null, pageable);
    }

    List<ReporteProyectoVcs> findByProyectoIdOrderByFechaSubidaDesc(Long proyectoId);

    List<ReporteProyectoVcs> findByProyectoIdAndPeriodoAcademicoIdOrderByFechaSubidaDesc(Long proyectoId, Long periodoAcademicoId);

    List<ReporteProyectoVcs> findByProyectoIdAndTipo(Long proyectoId, TipoReporteProyectoVcs tipo);

    List<ReporteProyectoVcs> findByProyectoIdAndPeriodoAcademicoIdAndTipo(Long proyectoId, Long periodoAcademicoId, TipoReporteProyectoVcs tipo);

    boolean existsByProyectoIdAndTipoAndEstadoSubdecanato(Long proyectoId, TipoReporteProyectoVcs tipo, EstadoRevisionVcs estadoSubdecanato);
}
