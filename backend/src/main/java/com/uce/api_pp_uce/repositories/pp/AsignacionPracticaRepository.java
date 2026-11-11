package com.uce.api_pp_uce.repositories.pp;

import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsignacionPracticaRepository extends JpaRepository<AsignacionPractica, Long> {
    List<AsignacionPractica> findByProcesoPracticaEstudianteId(Long estudianteId);

    @Query("SELECT a FROM AsignacionPractica a LEFT JOIN FETCH a.procesoPractica p LEFT JOIN FETCH p.estudiante WHERE a.tutorAcademico.id IN :tutorIds AND (CAST(:periodoId AS long) IS NULL OR a.periodoAcademico.id = :periodoId)")
    List<AsignacionPractica> findByTutorAcademicoIdInAndPeriodoAcademicoId(@Param("tutorIds") List<Long> tutorIds,
            @Param("periodoId") Long periodoId);

    @Query("SELECT a FROM AsignacionPractica a LEFT JOIN FETCH a.procesoPractica p LEFT JOIN FETCH p.estudiante e LEFT JOIN FETCH a.convenio LEFT JOIN FETCH a.tutorAcademico WHERE a.periodoAcademico.id = :periodoId AND a.procesoPractica.estudiante.carrera.id = :carreraId")
    List<AsignacionPractica> findByPeriodoAcademicoIdAndProcesoPracticaCarreraId(
            @Param("periodoId") Long periodoAcademicoId, @Param("carreraId") Integer carreraId);

    @EntityGraph(attributePaths = { "procesoPractica", "procesoPractica.estudiante", "convenio", "tutorAcademico",
            "periodoAcademico" })
    @Query(value = """
            SELECT a FROM AsignacionPractica a WHERE
            (CAST(:carreraId AS integer) IS NULL OR a.procesoPractica.estudiante.carrera.id = :carreraId) AND
            (CAST(:periodoId AS long) IS NULL OR a.periodoAcademico.id = :periodoId) AND
            (CAST(:tutorId AS long) IS NULL OR a.tutorAcademico.id = :tutorId) AND
            (CAST(:estudianteId AS long) IS NULL OR a.procesoPractica.estudiante.id = :estudianteId) AND
            (CAST(:estado AS string) IS NULL OR a.estado = :estado) AND
            (CAST(:fase AS string) IS NULL OR a.fase = :fase) AND
            (:requiereCarta IS NULL OR :requiereCarta = false OR (a.cartaAsignacionEnviada = true OR EXISTS (SELECT d FROM DocumentoPortafolio d WHERE d.asignacion = a AND d.tipo = :tipoCartaAsignacion))) AND
            (CAST(:busqueda AS string) IS NULL OR
            LOWER(a.procesoPractica.estudiante.nombres) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) OR
            LOWER(a.procesoPractica.estudiante.apellidos) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) OR
            (a.tutorAcademico IS NOT NULL AND (
            LOWER(a.tutorAcademico.nombres) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) OR
            LOWER(a.tutorAcademico.apellidos) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
            )))
            """, countQuery = """
            SELECT COUNT(a) FROM AsignacionPractica a WHERE
            (CAST(:carreraId AS integer) IS NULL OR a.procesoPractica.estudiante.carrera.id = :carreraId) AND
            (CAST(:periodoId AS long) IS NULL OR a.periodoAcademico.id = :periodoId) AND
            (CAST(:tutorId AS long) IS NULL OR a.tutorAcademico.id = :tutorId) AND
            (CAST(:estudianteId AS long) IS NULL OR a.procesoPractica.estudiante.id = :estudianteId) AND
            (CAST(:estado AS string) IS NULL OR a.estado = :estado) AND
            (CAST(:fase AS string) IS NULL OR a.fase = :fase) AND
            (:requiereCarta IS NULL OR :requiereCarta = false OR (a.cartaAsignacionEnviada = true OR EXISTS (SELECT d FROM DocumentoPortafolio d WHERE d.asignacion = a AND d.tipo = :tipoCartaAsignacion))) AND
            (CAST(:busqueda AS string) IS NULL OR
            LOWER(a.procesoPractica.estudiante.nombres) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) OR
            LOWER(a.procesoPractica.estudiante.apellidos) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) OR
            (a.tutorAcademico IS NOT NULL AND (
            LOWER(a.tutorAcademico.nombres) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) OR
            LOWER(a.tutorAcademico.apellidos) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
            )))
            """)
    Page<AsignacionPractica> findByFiltros(
            @Param("busqueda") String busqueda,
            @Param("estado") EstadoAsignacion estado,
            @Param("fase") FaseActualPractica fase,
            @Param("carreraId") Integer carreraId,
            @Param("periodoId") Long periodoId,
            @Param("tutorId") Long tutorId,
            @Param("estudianteId") Long estudianteId,
            @Param("requiereCarta") Boolean requiereCarta,
            @Param("tipoCartaAsignacion") TipoDocumento tipoCartaAsignacion,
            Pageable pageable);

    default Page<AsignacionPractica> findByFiltros(
            String busqueda,
            EstadoAsignacion estado,
            FaseActualPractica fase,
            Integer carreraId,
            Long periodoId,
            Long tutorId,
            Long estudianteId,
            Boolean requiereCarta,
            Pageable pageable) {
        return findByFiltros(busqueda, estado, fase, carreraId, periodoId, tutorId, estudianteId, requiereCarta,
                TipoDocumento.CARTA_ASIGNACION, pageable);
    }

    @Query("SELECT a FROM AsignacionPractica a LEFT JOIN FETCH a.procesoPractica p LEFT JOIN FETCH p.estudiante e LEFT JOIN FETCH a.convenio LEFT JOIN FETCH a.tutorAcademico WHERE a.periodoAcademico.id = :periodoId AND a.estado != :estado")
    List<AsignacionPractica> findByPeriodoAcademicoIdAndEstadoNot(@Param("periodoId") Long periodoId,
            @Param("estado") EstadoAsignacion estado);

    boolean existsByProcesoPracticaEstudianteIdAndPeriodoAcademicoIdAndEstadoNot(
            Long estudianteId, Long periodoAcademicoId, EstadoAsignacion estado);

    long countByTutorAcademicoIsNotNull();

    long countByTutorAcademicoIsNull();

    long countByEstado(EstadoAsignacion estado);

    long countByTutorAcademicoId(Long tutorAcademicoId);

    long countByTutorAcademicoIdAndPeriodoAcademicoId(Long tutorAcademicoId, Long periodoAcademicoId);

    long countByConvenioIdAndEstado(Long convenioId, EstadoAsignacion estado);

    long countByProcesoPracticaEstudianteCarreraId(Integer carreraId);

    long countByProcesoPracticaEstudianteCarreraIdAndEstado(Integer carreraId, EstadoAsignacion estado);

    @Query("SELECT COUNT(a) FROM AsignacionPractica a WHERE " +
            "(CAST(:carreraId AS integer) IS NULL OR a.procesoPractica.estudiante.carrera.id = :carreraId) AND " +
            "(CAST(:periodoId AS long) IS NULL OR a.periodoAcademico.id = :periodoId) AND " +
            "(CAST(:tutorId AS long) IS NULL OR (a.tutorAcademico.id = :tutorId AND (a.cartaAsignacionEnviada = true OR EXISTS (SELECT d FROM DocumentoPortafolio d WHERE d.asignacion = a AND d.tipo = :tipoCartaAsignacion)))) AND "
            +
            "(CAST(:estado AS string) IS NULL OR a.estado = :estado)")
    long countByFiltros(
            @Param("carreraId") Integer carreraId,
            @Param("periodoId") Long periodoId,
            @Param("tutorId") Long tutorId,
            @Param("estado") EstadoAsignacion estado,
            @Param("tipoCartaAsignacion") TipoDocumento tipoCartaAsignacion);

    default long countByFiltros(Integer carreraId, Long periodoId, Long tutorId, EstadoAsignacion estado) {
        return countByFiltros(carreraId, periodoId, tutorId, estado, TipoDocumento.CARTA_ASIGNACION);
    }

    @Query("""
            SELECT COUNT(a)
            FROM AsignacionPractica a
            WHERE a.periodoAcademico.id = :periodoId
            AND a.estado = :estado
            AND a.tutorAcademico.id = :tutorId
            """)
    long numeroEstudiantesAsignadosPorPeriodo(
            @Param("periodoId") Long periodoId,
            @Param("tutorId") Long tutorId,
            @Param("estado") EstadoAsignacion estado);
}
