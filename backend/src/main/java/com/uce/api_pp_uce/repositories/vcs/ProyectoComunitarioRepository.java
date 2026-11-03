package com.uce.api_pp_uce.repositories.vcs;

import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoComunitarioRepository extends JpaRepository<ProyectoComunitario, Long> {

    @Query(
        value = """
            SELECT p 
            FROM ProyectoComunitario p
            JOIN FETCH p.carrera c
            LEFT JOIN FETCH p.tutorAcademico ta
            WHERE (CAST(:busqueda AS string) IS NULL 
                   OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
                   OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
              AND (CAST(:carreraId AS integer) IS NULL OR p.carrera.id = :carreraId)
              AND (CAST(:tutorId AS long) IS NULL OR p.tutorAcademico.id = :tutorId)
              AND (CAST(:estado AS string) IS NULL OR p.estado = :estado)
        """,
        countQuery = """
            SELECT COUNT(p) FROM ProyectoComunitario p
            WHERE (CAST(:busqueda AS string) IS NULL 
                   OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
                   OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
              AND (CAST(:carreraId AS integer) IS NULL OR p.carrera.id = :carreraId)
              AND (CAST(:tutorId AS long) IS NULL OR p.tutorAcademico.id = :tutorId)
              AND (CAST(:estado AS string) IS NULL OR p.estado = :estado)
        """
    )
    Page<ProyectoComunitario> buscarConFiltros(
        @Param("busqueda") String busqueda,
        @Param("carreraId") Integer carreraId,
        @Param("tutorId") Long tutorId,
        @Param("estado") EstadoProyecto estado,
        Pageable pageable
    );

    boolean existsByNombreIgnoreCaseAndCarreraId(String nombre, Integer carreraId);

    // Busca saber si existe un proyecto con el mismo nombre y carrera, pero diferente id
    // para validar actualizaciones. Si devuelve true, significa que existe otro proyecto con
    // el mismo nombre y carrera, por lo tanto, no se puede actualizar. 
    // Si es false, significa que no existe otro proyecto con el mismo nombre y carrera (ya que se trata del mismo proyecto),
    // por lo tanto, se puede actualizar.
    boolean existsByNombreIgnoreCaseAndCarreraIdAndIdNot(String nombre, Integer carreraId, Long id);

    // Estado de Proyectos Comunitarios por carrera
    @Query("""
            SELECT p 
            FROM ProyectoComunitario p
            JOIN FETCH p.carrera c
            LEFT JOIN FETCH p.tutorAcademico ta
            WHERE p.estado = :estado
              AND (CAST(:carreraId AS integer) IS NULL OR p.carrera.id = :carreraId)
              AND (CAST(:busqueda AS string) IS NULL 
                   OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
        """)
    List<ProyectoComunitario> findByEstadoAndCarreraId(
        @Param("estado") EstadoProyecto estado, 
        @Param("carreraId") Integer carreraId, 
        @Param("busqueda") String busqueda
    );

    @Query("""
        SELECT p 
        FROM ProyectoComunitario p
        JOIN FETCH p.carrera c
        LEFT JOIN FETCH p.tutorAcademico ta
        WHERE p.tutorAcademico.id = :tutorId
          AND (CAST(:carreraId AS integer) IS NULL OR p.carrera.id = :carreraId)
    """)
    List<ProyectoComunitario> findByTutorIdAndCarreraId(
        @Param("tutorId") Long tutorId,
        @Param("carreraId") Integer carreraId
    );

    @Query("""
        SELECT COUNT(p) 
        FROM ProyectoComunitario p 
        WHERE p.tutorAcademico.id = :tutorId 
          AND (p.estado IS NULL OR p.estado != :estadoExcluido)
    """)
    long countByTutorAcademicoIdAndEstadoNot(
        @Param("tutorId") Long tutorId, 
        @Param("estadoExcluido") EstadoProyecto estadoExcluido
    );

    @Query("""
        SELECT COUNT(p) 
        FROM ProyectoComunitario p 
        WHERE p.tutorAcademico.id = :tutorId 
          AND (:proyectoId IS NULL OR p.id != :proyectoId) 
          AND (p.estado IS NULL OR p.estado != :estadoExcluido)
    """)
    long countByTutorAcademicoIdAndIdNotAndEstadoNot(
        @Param("tutorId") Long tutorId, 
        @Param("proyectoId") Long proyectoId, 
        @Param("estadoExcluido") EstadoProyecto estadoExcluido
    );
}
