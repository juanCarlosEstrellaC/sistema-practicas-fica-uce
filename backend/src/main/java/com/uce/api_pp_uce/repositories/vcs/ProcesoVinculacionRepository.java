package com.uce.api_pp_uce.repositories.vcs;

import com.uce.api_pp_uce.entities.vcs.ProcesoVinculacion;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.vcs.EstadoProcesoVcs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcesoVinculacionRepository extends JpaRepository<ProcesoVinculacion, Long> {

    Optional<ProcesoVinculacion> findByEstudianteIdAndCarreraId(Long estudianteId, Integer carreraId);
    Optional<ProcesoVinculacion> findByEstudianteId(Long estudianteId);

    boolean existsByEstudianteIdAndEstado(Long estudianteId, EstadoProcesoVcs estado);

    @Query("""
        SELECT pv
        FROM ProcesoVinculacion pv
        LEFT JOIN FETCH pv.estudiante e
        LEFT JOIN FETCH pv.carrera c
        WHERE e.estado = :estadoUsuario
          AND pv.estado = :estado
          AND (:carreraId IS NULL OR c.id = :carreraId)
          AND (CAST(:busqueda AS string) IS NULL 
               OR LOWER(CONCAT(e.nombres, ' ', e.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
               OR LOWER(e.identificacion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%'))) 
          AND (CAST(:periodoId AS long) IS NULL 
              OR NOT EXISTS (
                  SELECT 1
                  FROM AsignacionProyectoComunitario a
                  WHERE a.procesoVinculacion = pv
                  AND a.periodoAcademico.id = :periodoId
              )
          )
        """)
    List<ProcesoVinculacion> findProcesosSinAsignacion(
        @Param("carreraId") Integer carreraId,
        @Param("estado") EstadoProcesoVcs estado,
        @Param("periodoId") Long periodoId,
        @Param("busqueda") String busqueda,
        @Param("estadoUsuario") EstadoUsuario estadoUsuario
    );

    default List<ProcesoVinculacion> findProcesosSinAsignacion(
        Integer carreraId,
        EstadoProcesoVcs estado,
        Long periodoId,
        String busqueda
    ) {
        return findProcesosSinAsignacion(carreraId, estado, periodoId, busqueda, EstadoUsuario.ACTIVO);
    }
}
