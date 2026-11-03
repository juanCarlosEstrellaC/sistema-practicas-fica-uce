package com.uce.api_pp_uce.repositories;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoProceso;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProcesoVcs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
  Optional<Usuario> findByCorreo(String correo);

  Optional<Usuario> findByIdentificacion(String identificacion);

  Optional<Usuario> findByRolAndCarreraId(RolUsuario rol, Integer carreraId);

  Optional<Usuario> findFirstByRol(RolUsuario rol);

  List<Usuario> findByRol(RolUsuario rol);

  long countByRol(RolUsuario rol);

  long countByRolAndEstado(RolUsuario rol, EstadoUsuario estado);

  long countByRolAndCarreraId(RolUsuario rol, Integer carreraId);

  @Override
  @EntityGraph(attributePaths = {"carrera"})
  Page<Usuario> findAll(Pageable pageable);

  @EntityGraph(attributePaths = {"carrera"})
  @Query("""
      SELECT u 
      FROM Usuario u 
      WHERE (CAST(:search AS string) IS NULL 
             OR LOWER(CONCAT(u.nombres, ' ', u.apellidos)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) 
             OR LOWER(u.identificacion) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
             OR LOWER(u.correo) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) 
        AND (CAST(:rol AS string) IS NULL OR u.rol = :rol) 
        AND (CAST(:estado AS string) IS NULL OR u.estado = :estado) 
        AND (CAST(:carreraId AS integer) IS NULL OR u.carrera.id = :carreraId) 
        AND (:sinAsignacionEnPeriodoId IS NULL 
             OR (u.estado = com.uce.api_pp_uce.enums.EstadoUsuario.ACTIVO
                 AND NOT EXISTS (SELECT 1 FROM AsignacionPractica a 
                                 WHERE a.procesoPractica.estudiante.id = u.id 
                                   AND a.periodoAcademico.id = :sinAsignacionEnPeriodoId
                                   AND a.estado != :estadoAsignacionCancelado) 
                 AND NOT EXISTS (SELECT 1 FROM ProcesoPractica p 
                                 WHERE p.estudiante.id = u.id 
                                   AND (p.estado = :estadoProcesoCompletado 
                                        OR (p.horasAcumuladas IS NOT NULL AND p.horasRequeridas IS NOT NULL AND p.horasAcumuladas >= p.horasRequeridas)))))
      """)
  Page<Usuario> buscarConFiltros(
      @Param("search") String search,
      @Param("rol") RolUsuario rol,
      @Param("carreraId") Integer carreraId,
      @Param("sinAsignacionEnPeriodoId") Integer sinAsignacionEnPeriodoId,
      @Param("estado") EstadoUsuario estado,
      @Param("estadoProcesoCompletado") EstadoProceso estadoProcesoCompletado,
      @Param("estadoAsignacionCancelado") EstadoAsignacion estadoAsignacionCancelado,
      Pageable pageable
  );

  default Page<Usuario> buscarConFiltros(
      String search,
      RolUsuario rol,
      Integer carreraId,
      Integer sinAsignacionEnPeriodoId,
      EstadoUsuario estado,
      Pageable pageable
  ) {
      return buscarConFiltros(search, rol, carreraId, sinAsignacionEnPeriodoId, estado, EstadoProceso.COMPLETADO, EstadoAsignacion.CANCELADO, pageable);
  }

  @Query("""
      SELECT DISTINCT u
      FROM Usuario u
      LEFT JOIN FETCH u.carrera
      WHERE u.rol = :rolTutor
        AND (CAST(:carreraId AS integer) IS NULL 
             OR u.carrera.id = :carreraId)
        AND (CAST(:busqueda AS string) IS NULL 
             OR LOWER(CONCAT(u.nombres, ' ', u.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
             OR LOWER(u.correo) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
      """)
  List<Usuario> findTutoresParaResumen(
      @Param("carreraId") Integer carreraId, 
      @Param("busqueda") String busqueda,
      @Param("rolTutor") RolUsuario rolTutor
  );

  default List<Usuario> findTutoresParaResumen(Integer carreraId, String busqueda) {
      return findTutoresParaResumen(carreraId, busqueda, RolUsuario.TUTOR_ACADEMICO);
  }

  @Query("""
      SELECT DISTINCT u
      FROM Usuario u
      LEFT JOIN FETCH u.carrera c
      WHERE u.rol = :rolEstudiante
        AND u.estado = :estadoUsuarioActivo
        AND (:carreraId IS NULL OR u.carrera.id = :carreraId)
        AND (CAST(:busqueda AS string) IS NULL 
             OR LOWER(CONCAT(u.nombres, ' ', u.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
             OR LOWER(u.identificacion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
             OR LOWER(u.correo) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
        AND NOT EXISTS (
            SELECT 1 FROM ProcesoVinculacion pv 
            WHERE pv.estudiante.id = u.id 
              AND (pv.estado = :estadoProcesoCompletado 
                   OR (pv.horasAcumuladas IS NOT NULL AND pv.horasRequeridas IS NOT NULL AND pv.horasAcumuladas >= pv.horasRequeridas))
        )
        AND (:periodoId IS NULL OR NOT EXISTS (
            SELECT 1 FROM AsignacionProyectoComunitario a 
            WHERE a.procesoVinculacion.estudiante.id = u.id 
              AND a.periodoAcademico.id = :periodoId
              AND a.estado != :estadoAsignacionCancelado
        ))
      """)
  List<Usuario> findEstudiantesDisponiblesParaVcs(
      @Param("carreraId") Integer carreraId,
      @Param("periodoId") Long periodoId,
      @Param("busqueda") String busqueda,
      @Param("rolEstudiante") RolUsuario rolEstudiante,
      @Param("estadoUsuarioActivo") EstadoUsuario estadoUsuarioActivo,
      @Param("estadoProcesoCompletado") EstadoProcesoVcs estadoProcesoCompletado,
      @Param("estadoAsignacionCancelado") EstadoAsignacionVcs estadoAsignacionCancelado
  );

  default List<Usuario> findEstudiantesDisponiblesParaVcs(
      Integer carreraId,
      Long periodoId,
      String busqueda
  ) {
      return findEstudiantesDisponiblesParaVcs(
          carreraId,
          periodoId,
          busqueda,
          RolUsuario.ESTUDIANTE,
          EstadoUsuario.ACTIVO,
          EstadoProcesoVcs.COMPLETADO,
          EstadoAsignacionVcs.CANCELADO
      );
  }

  @Query("""
    SELECT DISTINCT u
    FROM Usuario u
    LEFT JOIN FETCH u.carrera
    WHERE u.rol = :rolTutor
      AND u.estado = :estadoUsuarioActivo
      AND (CAST(:carreraId AS integer) IS NULL OR u.carrera.id = :carreraId)
      AND (CAST(:busqueda AS string) IS NULL 
            OR LOWER(CONCAT(u.nombres, ' ', u.apellidos)) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
            OR LOWER(u.identificacion) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')) 
            OR LOWER(u.correo) LIKE LOWER(CONCAT('%', CAST(:busqueda AS string), '%')))
    """)
  List<Usuario> findTutoresParaAsignacion(
    @Param("carreraId") Integer carreraId, 
    @Param("busqueda") String busqueda,
    @Param("rolTutor") RolUsuario rolTutor,
    @Param("estadoUsuarioActivo") EstadoUsuario estadoUsuarioActivo
  );

  default List<Usuario> findTutoresParaAsignacion(Integer carreraId, String busqueda) {
      return findTutoresParaAsignacion(carreraId, busqueda, RolUsuario.TUTOR_ACADEMICO, EstadoUsuario.ACTIVO);
  }
}
