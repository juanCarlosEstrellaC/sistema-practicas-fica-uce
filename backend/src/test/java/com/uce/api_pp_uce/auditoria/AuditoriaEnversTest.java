package com.uce.api_pp_uce.auditoria;

import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.entities.pp.DocumentoPortafolio;
import com.uce.api_pp_uce.entities.vcs.AsignacionProyectoComunitario;
import com.uce.api_pp_uce.entities.vcs.EvidenciaAsignacionVcs;
import com.uce.api_pp_uce.entities.vcs.ProcesoVinculacion;
import com.uce.api_pp_uce.entities.vcs.ProyectoComunitario;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import com.uce.api_pp_uce.enums.vcs.EstadoAsignacionVcs;
import com.uce.api_pp_uce.enums.vcs.EstadoProyecto;
import com.uce.api_pp_uce.enums.vcs.EstadoRevisionVcs;
import com.uce.api_pp_uce.enums.vcs.FaseActualAsignacion;
import com.uce.api_pp_uce.enums.vcs.TipoDocumentoVcs;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.repositories.pp.DocumentoPortafolioRepository;
import com.uce.api_pp_uce.repositories.vcs.AsignacionProyectoComunitarioRepository;
import com.uce.api_pp_uce.repositories.vcs.EvidenciaAsignacionVcsRepository;
import com.uce.api_pp_uce.repositories.vcs.ProcesoVinculacionRepository;
import com.uce.api_pp_uce.repositories.vcs.ProyectoComunitarioRepository;
import jakarta.persistence.EntityManager;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest
class AuditoriaEnversTest {

    @Autowired
    private ConvenioRepository convenioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CarreraRepository carreraRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Autowired
    private DocumentoPortafolioRepository documentoPortafolioRepository;

    @Autowired
    private ProcesoVinculacionRepository procesoVinculacionRepository;

    @Autowired
    private ProyectoComunitarioRepository proyectoComunitarioRepository;

    @Autowired
    private AsignacionProyectoComunitarioRepository asignacionProyectoComunitarioRepository;

    @Autowired
    private EvidenciaAsignacionVcsRepository evidenciaAsignacionVcsRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @AfterEach
    void limpiarSeguridad() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Debe registrar revisiones historicas al crear y modificar un convenio")
    void debeRegistrarRevisionesHistoricasConvenio() {
        Long convenioId = transactionTemplate.execute(status -> {
            Convenio convenio = new Convenio();
            convenio.setInstitucion("Empresa Prueba Auditoria");
            convenio.setTipo(TipoConvenio.PRIVADO);
            convenio.setCampoEspecifico(new BigDecimal("123.45"));
            convenio.setFechaInicio(LocalDate.now());
            convenio.setFechaFin(LocalDate.now().plusYears(1));
            convenio.setEstado(EstadoConvenio.ACTIVO);
            convenio.setCuposDisponibles(10);
            return convenioRepository.save(convenio).getId();
        });

        transactionTemplate.executeWithoutResult(status -> {
            Convenio convenio = convenioRepository.findById(convenioId).orElseThrow();
            convenio.setEstado(EstadoConvenio.POR_EXPIRAR);
            convenioRepository.save(convenio);
        });

        transactionTemplate.executeWithoutResult(status -> {
            AuditReader lectorAuditoria = AuditReaderFactory.get(entityManager);
            List<Number> revisiones = lectorAuditoria.getRevisions(Convenio.class, convenioId);

            assertNotNull(revisiones);
            assertFalse(revisiones.isEmpty());
            assertEquals(2, revisiones.size());

            Convenio versionUno = lectorAuditoria.find(Convenio.class, convenioId, revisiones.get(0));
            Convenio versionDos = lectorAuditoria.find(Convenio.class, convenioId, revisiones.get(1));

            assertEquals(EstadoConvenio.ACTIVO, versionUno.getEstado());
            assertEquals(EstadoConvenio.POR_EXPIRAR, versionDos.getEstado());
        });
    }

    @Test
    @DisplayName("Debe auditar Usuario y capturar el correo y rol del autor en revinfo")
    void debeAuditarUsuarioYCapturarResponsableEnRevision() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "coordinador@uce.edu.ec",
                        "secret",
                        List.of(new SimpleGrantedAuthority("COORDINADOR_PRACTICAS"))
                )
        );

        String sufijo = String.valueOf(System.nanoTime());
        String cedulaUnica = sufijo.substring(sufijo.length() - 10);

        Long usuarioId = transactionTemplate.execute(status -> {
            Usuario usuario = new Usuario();
            usuario.setCorreo("audit." + sufijo + "@uce.edu.ec");
            usuario.setClaveHash("hash123456");
            usuario.setNombres("Carlos");
            usuario.setApellidos("Mendoza");
            usuario.setIdentificacion(cedulaUnica);
            usuario.setTipoIdentificacion(TipoIdentificacionUsuario.CEDULA);
            usuario.setRol(RolUsuario.ESTUDIANTE);
            usuario.setEstado(EstadoUsuario.ACTIVO);
            return usuarioRepository.save(usuario).getId();
        });

        transactionTemplate.executeWithoutResult(status -> {
            Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();
            usuario.setRol(RolUsuario.TUTOR_ACADEMICO);
            usuario.setEstado(EstadoUsuario.INACTIVO);
            usuarioRepository.save(usuario);
        });

        transactionTemplate.executeWithoutResult(status -> {
            AuditReader lectorAuditoria = AuditReaderFactory.get(entityManager);
            List<Number> revisiones = lectorAuditoria.getRevisions(Usuario.class, usuarioId);

            assertNotNull(revisiones);
            assertEquals(2, revisiones.size());

            Usuario versionUno = lectorAuditoria.find(Usuario.class, usuarioId, revisiones.get(0));
            Usuario versionDos = lectorAuditoria.find(Usuario.class, usuarioId, revisiones.get(1));

            assertEquals(RolUsuario.ESTUDIANTE, versionUno.getRol());
            assertEquals(EstadoUsuario.ACTIVO, versionUno.getEstado());

            assertEquals(RolUsuario.TUTOR_ACADEMICO, versionDos.getRol());
            assertEquals(EstadoUsuario.INACTIVO, versionDos.getEstado());

            RevisionAuditoria revisionInfo = entityManager.find(RevisionAuditoria.class, revisiones.get(1).longValue());
            assertNotNull(revisionInfo);
            assertEquals("coordinador@uce.edu.ec", revisionInfo.getUsuarioCorreo());
            assertEquals("COORDINADOR_PRACTICAS", revisionInfo.getUsuarioRol());
        });
    }

    @Test
    @DisplayName("Debe auditar el ciclo de vida de un DocumentoPortafolio (subida, rechazo y aprobacion)")
    void debeAuditarCicloDeVidaDocumentoPortafolio() {
        String sufijo = String.valueOf(System.nanoTime());
        String cedulaUnica = sufijo.substring(sufijo.length() - 10);

        Long usuarioId = transactionTemplate.execute(status -> {
            Usuario u = new Usuario();
            u.setCorreo("doc." + sufijo + "@uce.edu.ec");
            u.setClaveHash("pass123");
            u.setNombres("Alumno");
            u.setApellidos("Documento");
            u.setIdentificacion(cedulaUnica);
            u.setRol(RolUsuario.ESTUDIANTE);
            u.setEstado(EstadoUsuario.ACTIVO);
            return usuarioRepository.save(u).getId();
        });

        Long documentoId = transactionTemplate.execute(status -> {
            Usuario estudiante = usuarioRepository.findById(usuarioId).orElseThrow();
            DocumentoPortafolio doc = new DocumentoPortafolio();
            doc.setEstudiante(estudiante);
            doc.setTipo(TipoDocumento.INFORME_FINAL);
            doc.setNombre("informe_v1.pdf");
            doc.setUrl("/archivos/uuid-v1.pdf");
            doc.setEstado(EstadoDocumento.PENDIENTE_REVISION);
            doc.setObservacion(null);
            return documentoPortafolioRepository.save(doc).getId();
        });

        transactionTemplate.executeWithoutResult(status -> {
            DocumentoPortafolio doc = documentoPortafolioRepository.findById(documentoId).orElseThrow();
            doc.setEstado(EstadoDocumento.RECHAZADO);
            doc.setObservacion("Falta firma del decano y sello institucional");
            documentoPortafolioRepository.save(doc);
        });

        transactionTemplate.executeWithoutResult(status -> {
            DocumentoPortafolio doc = documentoPortafolioRepository.findById(documentoId).orElseThrow();
            doc.setUrl("/archivos/uuid-v2.pdf");
            doc.setEstado(EstadoDocumento.APROBADO);
            doc.setObservacion("Documento corregido y aprobado");
            documentoPortafolioRepository.save(doc);
        });

        transactionTemplate.executeWithoutResult(status -> {
            AuditReader lectorAuditoria = AuditReaderFactory.get(entityManager);
            List<Number> revisiones = lectorAuditoria.getRevisions(DocumentoPortafolio.class, documentoId);

            assertNotNull(revisiones);
            assertEquals(3, revisiones.size());

            DocumentoPortafolio rev1 = lectorAuditoria.find(DocumentoPortafolio.class, documentoId, revisiones.get(0));
            DocumentoPortafolio rev2 = lectorAuditoria.find(DocumentoPortafolio.class, documentoId, revisiones.get(1));
            DocumentoPortafolio rev3 = lectorAuditoria.find(DocumentoPortafolio.class, documentoId, revisiones.get(2));

            assertEquals(EstadoDocumento.PENDIENTE_REVISION, rev1.getEstado());
            assertEquals("/archivos/uuid-v1.pdf", rev1.getUrl());
            assertNull(rev1.getObservacion());

            assertEquals(EstadoDocumento.RECHAZADO, rev2.getEstado());
            assertEquals("Falta firma del decano y sello institucional", rev2.getObservacion());

            assertEquals(EstadoDocumento.APROBADO, rev3.getEstado());
            assertEquals("/archivos/uuid-v2.pdf", rev3.getUrl());
            assertEquals("Documento corregido y aprobado", rev3.getObservacion());
        });
    }

    @Test
    @DisplayName("Debe auditar acreditacion de horas en AsignacionProyectoComunitario y Evidencias VCS")
    void debeAuditarAcreditacionDeHorasVcs() {
        String sufijo = String.valueOf(System.nanoTime());
        String cedulaUnica = sufijo.substring(sufijo.length() - 10);
        String codCarrera = "SIS-" + sufijo.substring(sufijo.length() - 6);

        Integer carreraId = transactionTemplate.execute(status -> {
            Carrera c = new Carrera();
            c.setNombre("Ingenieria en Sistemas " + sufijo);
            c.setCodigoCarrera(codCarrera);
            return carreraRepository.save(c).getId();
        });

        Long estudianteId = transactionTemplate.execute(status -> {
            Usuario u = new Usuario();
            u.setCorreo("vcs." + sufijo + "@uce.edu.ec");
            u.setClaveHash("pass123");
            u.setNombres("Estudiante");
            u.setApellidos("Vinculacion");
            u.setIdentificacion(cedulaUnica);
            u.setRol(RolUsuario.ESTUDIANTE);
            u.setEstado(EstadoUsuario.ACTIVO);
            return usuarioRepository.save(u).getId();
        });

        Long procesoId = transactionTemplate.execute(status -> {
            Usuario est = usuarioRepository.findById(estudianteId).orElseThrow();
            Carrera car = carreraRepository.findById(carreraId).orElseThrow();
            ProcesoVinculacion proc = new ProcesoVinculacion();
            proc.setEstudiante(est);
            proc.setCarrera(car);
            proc.setHorasRequeridas(160);
            proc.setHorasAcumuladas(0);
            return procesoVinculacionRepository.save(proc).getId();
        });

        Long proyectoId = transactionTemplate.execute(status -> {
            Carrera car = carreraRepository.findById(carreraId).orElseThrow();
            ProyectoComunitario proy = new ProyectoComunitario();
            proy.setNombre("Alfabetizacion Digital Rural " + sufijo);
            proy.setDescripcion("Capacitacion en TIC");
            proy.setCarrera(car);
            proy.setEstado(EstadoProyecto.ACTIVO);
            return proyectoComunitarioRepository.save(proy).getId();
        });

        Long periodoId = transactionTemplate.execute(status -> {
            PeriodoAcademico p = new PeriodoAcademico();
            p.setNombre("AUD-" + sufijo);
            p.setFechaInicio(LocalDate.now());
            p.setFechaFin(LocalDate.now().plusMonths(6));
            return periodoAcademicoRepository.save(p).getId();
        });

        Long asignacionId = transactionTemplate.execute(status -> {
            ProcesoVinculacion proc = procesoVinculacionRepository.findById(procesoId).orElseThrow();
            ProyectoComunitario proy = proyectoComunitarioRepository.findById(proyectoId).orElseThrow();
            PeriodoAcademico per = periodoAcademicoRepository.findById(periodoId).orElseThrow();
            AsignacionProyectoComunitario asig = new AsignacionProyectoComunitario();
            asig.setProcesoVinculacion(proc);
            asig.setProyectoComunitario(proy);
            asig.setPeriodoAcademico(per);
            asig.setHorasAsignadas(80);
            asig.setHorasCompletadas(0);
            asig.setEstado(EstadoAsignacionVcs.EN_CURSO);
            asig.setFaseActual(FaseActualAsignacion.ASIGNACION);
            return asignacionProyectoComunitarioRepository.save(asig).getId();
        });

        Long evidenciaId = transactionTemplate.execute(status -> {
            AsignacionProyectoComunitario asig = asignacionProyectoComunitarioRepository.findById(asignacionId).orElseThrow();
            Usuario est = usuarioRepository.findById(estudianteId).orElseThrow();
            EvidenciaAsignacionVcs ev = new EvidenciaAsignacionVcs();
            ev.setAsignacion(asig);
            ev.setEstudiante(est);
            ev.setTipoDocumento(TipoDocumentoVcs.BITACORA);
            ev.setNombreArchivo("bitacora_semana1.pdf");
            ev.setUrlArchivo("/archivos/bitacora1.pdf");
            ev.setHorasReportadas(40);
            ev.setEstadoTutor(EstadoRevisionVcs.PENDIENTE);
            return evidenciaAsignacionVcsRepository.save(ev).getId();
        });

        // Actualizacion: El tutor aprueba la bitacora y actualiza las horas de la asignacion
        transactionTemplate.executeWithoutResult(status -> {
            EvidenciaAsignacionVcs ev = evidenciaAsignacionVcsRepository.findById(evidenciaId).orElseThrow();
            ev.setEstadoTutor(EstadoRevisionVcs.APROBADO);
            ev.setObservacionesTutor("Horas comunitarias verificadas");
            evidenciaAsignacionVcsRepository.save(ev);

            AsignacionProyectoComunitario asig = asignacionProyectoComunitarioRepository.findById(asignacionId).orElseThrow();
            asig.setHorasCompletadas(40);
            asig.setFaseActual(FaseActualAsignacion.DESARROLLO);
            asignacionProyectoComunitarioRepository.save(asig);
        });

        // Verificacion de auditoria en ambas tablas
        transactionTemplate.executeWithoutResult(status -> {
            AuditReader lectorAuditoria = AuditReaderFactory.get(entityManager);

            List<Number> revsAsig = lectorAuditoria.getRevisions(AsignacionProyectoComunitario.class, asignacionId);
            assertEquals(2, revsAsig.size());

            AsignacionProyectoComunitario asigRev1 = lectorAuditoria.find(AsignacionProyectoComunitario.class, asignacionId, revsAsig.get(0));
            AsignacionProyectoComunitario asigRev2 = lectorAuditoria.find(AsignacionProyectoComunitario.class, asignacionId, revsAsig.get(1));

            assertEquals(0, asigRev1.getHorasCompletadas());
            assertEquals(FaseActualAsignacion.ASIGNACION, asigRev1.getFaseActual());

            assertEquals(40, asigRev2.getHorasCompletadas());
            assertEquals(FaseActualAsignacion.DESARROLLO, asigRev2.getFaseActual());

            List<Number> revsEv = lectorAuditoria.getRevisions(EvidenciaAsignacionVcs.class, evidenciaId);
            assertEquals(2, revsEv.size());

            EvidenciaAsignacionVcs evRev1 = lectorAuditoria.find(EvidenciaAsignacionVcs.class, evidenciaId, revsEv.get(0));
            EvidenciaAsignacionVcs evRev2 = lectorAuditoria.find(EvidenciaAsignacionVcs.class, evidenciaId, revsEv.get(1));

            assertEquals(EstadoRevisionVcs.PENDIENTE, evRev1.getEstadoTutor());
            assertNull(evRev1.getObservacionesTutor());

            assertEquals(EstadoRevisionVcs.APROBADO, evRev2.getEstadoTutor());
            assertEquals("Horas comunitarias verificadas", evRev2.getObservacionesTutor());
        });
    }
}
