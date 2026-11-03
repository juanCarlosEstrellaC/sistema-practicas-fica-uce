package com.uce.api_pp_uce.repositories.vcs;

import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository 
public interface AsignacionProyectoComunitarioRepository extends JpaRepository<AsignacionProyectoComunitario, Long> {

    Integer countByProyectoComunitarioTutorAcademicoIdAndPeriodoAcademicoId(Long tutorAcademicoId, Long periodoAcademicoId);
    
    // Validar antes de guardar
    Boolean existsByProcesoVinculacionIdAndPeriodoAcademicoId(Long procesoVinculacionId, Long periodoAcademicoId);

    Boolean existsByProcesoVinculacionIdAndPeriodoAcademicoIdAndEstadoNot(
            Long procesoVinculacionId, Long periodoAcademicoId, EstadoAsignacionVcs estado);

    boolean existsByProyectoComunitarioId(Long proyectoId);

    boolean existsByProyectoComunitarioIdAndFaseActual(Long proyectoId, FaseActualAsignacion faseActual);

    boolean existsByProyectoComunitarioIdAndEstado(Long proyectoId, EstadoAsignacionVcs estado);

    // Listado de asignaciones con paginacion y filtros
    @Query(
        value = """
            SELECT DISTINCT a 
            FROM AsignacionProyectoComunitario a
            LEFT JOIN FETCH a.procesoVinculacion pv
            LEFT JOIN FETCH pv.carrera pvc
            LEFT JOIN FETCH a.proyectoComunitario pc
            LEFT JOIN FETCH pv.estudiante e
            LEFT JOIN FETCH e.carrera c
            LEFT JOIN FETCH pc.tutorAcademico ta
            LEFT JOIN FETCH a.periodoAcademico per
            WHERE (CAST(:busqueda AS string) IS NULL 
                    OR LOWER(CONCAT(e.nombres, ' ', e.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
                    OR LOWER(e.identificacion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                    OR LOWER(CONCAT(ta.nombres, ' ', ta.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                    OR LOWER(pc.nombre) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
            AND (CAST(:carreraId AS integer) IS NULL OR c.id = :carreraId)
            AND (CAST(:tutorId AS long) IS NULL OR ta.id = :tutorId)
            AND (CAST(:estudianteId AS long) IS NULL OR e.id = :estudianteId)
            AND (CAST(:proyectoId AS long) IS NULL OR pc.id = :proyectoId)
            AND (CAST(:estado AS string) IS NULL OR a.estado = :estado)
            AND (CAST(:faseActual AS string) IS NULL OR a.faseActual = :faseActual)
            AND (CAST(:periodoId AS long) IS NULL OR a.periodoAcademico.id = :periodoId)
        """,
        countQuery = """
            SELECT COUNT(DISTINCT a) FROM AsignacionProyectoComunitario a
            LEFT JOIN a.procesoVinculacion pv
            LEFT JOIN a.proyectoComunitario pc
            LEFT JOIN pv.estudiante e
            LEFT JOIN e.carrera c
            LEFT JOIN pc.tutorAcademico ta
            WHERE (CAST(:busqueda AS string) IS NULL 
                    OR LOWER(CONCAT(e.nombres, ' ', e.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
                    OR LOWER(e.identificacion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                    OR LOWER(CONCAT(ta.nombres, ' ', ta.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))
                    OR LOWER(pc.nombre) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
                AND (CAST(:carreraId AS integer) IS NULL OR c.id = :carreraId)
                AND (CAST(:tutorId AS long) IS NULL OR ta.id = :tutorId)
                AND (CAST(:estudianteId AS long) IS NULL OR e.id = :estudianteId)
                AND (CAST(:proyectoId AS long) IS NULL OR pc.id = :proyectoId)
                AND (CAST(:estado AS string) IS NULL OR a.estado = :estado)
                AND (CAST(:faseActual AS string) IS NULL OR a.faseActual = :faseActual)
                AND (CAST(:periodoId AS long) IS NULL OR a.periodoAcademico.id = :periodoId)
    """)
    Page<AsignacionProyectoComunitario> buscarConFiltros(
        @Param("busqueda") String busqueda,
        @Param("carreraId") Integer carreraId,
        @Param("tutorId") Long tutorId,
        @Param("estudianteId") Long estudianteId,
        @Param("proyectoId") Long proyectoId,
        @Param("estado") EstadoAsignacionVcs estado,
        @Param("faseActual") FaseActualAsignacion faseActual,
        @Param("periodoId") Long periodoId,
        Pageable pageable
    );

    default Page<AsignacionProyectoComunitario> buscarConFiltros(
        String busqueda,
        Integer carreraId,
        Long tutorId,
        Long proyectoId,
        EstadoAsignacionVcs estado,
        FaseActualAsignacion faseActual,
        Long periodoId,
        Pageable pageable
    ) {
        return buscarConFiltros(busqueda, carreraId, tutorId, null, proyectoId, estado, faseActual, periodoId, pageable);
    }

    @Query("""
        SELECT a FROM AsignacionProyectoComunitario a
        LEFT JOIN FETCH a.procesoVinculacion pv
        LEFT JOIN FETCH pv.carrera pvc
        LEFT JOIN FETCH a.proyectoComunitario pc
        LEFT JOIN FETCH pv.estudiante e
        LEFT JOIN FETCH pc.tutorAcademico ta
        LEFT JOIN FETCH a.periodoAcademico per
        WHERE pv.estudiante.id = :estudianteId
        ORDER BY a.fechaCreacion DESC
    """)
    List<AsignacionProyectoComunitario> findByEstudianteId(@Param("estudianteId") Long estudianteId);

    @Query("""
        SELECT a FROM AsignacionProyectoComunitario a
        LEFT JOIN FETCH a.procesoVinculacion pv
        LEFT JOIN FETCH pv.carrera pvc
        LEFT JOIN FETCH a.proyectoComunitario pc
        LEFT JOIN FETCH pv.estudiante e
        LEFT JOIN FETCH pc.tutorAcademico ta
        LEFT JOIN FETCH a.periodoAcademico per
        WHERE pc.tutorAcademico.id = :tutorId
        ORDER BY a.fechaCreacion DESC
    """)
    List<AsignacionProyectoComunitario> findByTutorId(@Param("tutorId") Long tutorId);

    @Query("""
        SELECT a FROM AsignacionProyectoComunitario a
        LEFT JOIN FETCH a.procesoVinculacion pv
        LEFT JOIN FETCH pv.carrera pvc
        LEFT JOIN FETCH a.proyectoComunitario pc
        LEFT JOIN FETCH pv.estudiante e
        LEFT JOIN FETCH pc.tutorAcademico ta
        LEFT JOIN FETCH a.periodoAcademico per
        WHERE pc.id = :proyectoId
        ORDER BY a.fechaCreacion DESC
    """)
    List<AsignacionProyectoComunitario> findByProyectoComunitarioId(@Param("proyectoId") Long proyectoId);
}
