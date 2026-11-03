package com.uce.api_pp_uce.controllers.pp;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.pp.HorasAsignacionDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.entities.pp.ProcesoPractica;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoIdentificacionUsuario;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.EstadoProceso;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@WithMockUser(roles = {"SUBDECANO", "COORDINADOR_PRACTICAS", "TUTOR_ACADEMICO"})
public class AsignacionPracticaIntegracionTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private CarreraRepository carreraRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ConvenioRepository convenioRepository;

    @Autowired
    private ProcesoPracticaRepository procesoPracticaRepository;

    @Autowired
    private AsignacionPracticaRepository asignacionPracticaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private AsignacionPractica asignacionGuardada;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

        asignacionPracticaRepository.deleteAll();
        procesoPracticaRepository.deleteAll();
        convenioRepository.deleteAll();
        periodoAcademicoRepository.deleteAll();
        usuarioRepository.deleteAll();
        carreraRepository.deleteAll();

        Carrera carrera = new Carrera();
        carrera.setNombre("Ingenieria en Software");
        carrera.setCodigoCarrera("ISW");
        carrera = carreraRepository.save(carrera);

        PeriodoAcademico periodo = new PeriodoAcademico();
        periodo.setNombre("2026-2026");
        periodo.setFechaInicio(LocalDate.now().minusMonths(1));
        periodo.setFechaFin(LocalDate.now().plusMonths(5));
        periodo.setEstado(EstadoPeriodo.ACTIVO);
        periodo = periodoAcademicoRepository.save(periodo);

        Usuario estudiante = new Usuario();
        estudiante.setNombres("Mateo");
        estudiante.setApellidos("Salazar");
        estudiante.setIdentificacion("1723456789");
        estudiante.setTipoIdentificacion(TipoIdentificacionUsuario.CEDULA);
        estudiante.setCorreo("mateo.salazar@uce.edu.ec");
        estudiante.setClaveHash(BCrypt.hashpw("clave123", BCrypt.gensalt()));
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        estudiante.setCarrera(carrera);
        estudiante = usuarioRepository.save(estudiante);

        Usuario tutor = new Usuario();
        tutor.setNombres("Dr. Hernan");
        tutor.setApellidos("Flores");
        tutor.setIdentificacion("1709876543");
        tutor.setTipoIdentificacion(TipoIdentificacionUsuario.CEDULA);
        tutor.setCorreo("hernan.flores@uce.edu.ec");
        tutor.setClaveHash(BCrypt.hashpw("clave123", BCrypt.gensalt()));
        tutor.setRol(RolUsuario.TUTOR_ACADEMICO);
        tutor.setCarrera(carrera);
        tutor = usuarioRepository.save(tutor);

        Convenio convenio = new Convenio();
        convenio.setInstitucion("Produbanco");
        convenio.setTipo(TipoConvenio.PRIVADO);
        convenio.setFechaInicio(LocalDate.now().minusMonths(2));
        convenio.setFechaFin(LocalDate.now().plusMonths(10));
        convenio.setEstado(EstadoConvenio.ACTIVO);
        convenio.setCuposDisponibles(5);
        convenio = convenioRepository.save(convenio);

        ProcesoPractica proceso = new ProcesoPractica();
        proceso.setEstudiante(estudiante);
        proceso.setCarrera(carrera);
        proceso.setHorasRequeridas(240);
        proceso.setHorasAcumuladas(0);
        proceso.setEstado(EstadoProceso.EN_CURSO);
        proceso = procesoPracticaRepository.save(proceso);

        AsignacionPractica asignacion = new AsignacionPractica();
        asignacion.setProcesoPractica(proceso);
        asignacion.setConvenio(convenio);
        asignacion.setTutorAcademico(tutor);
        asignacion.setTutorInstitucional("Ing. Fernando Reyes");
        asignacion.setPeriodoAcademico(periodo);
        asignacion.setSemestre(7);
        asignacion.setHorasAsignadas(120);
        asignacion.setHorasCompletadas(0);
        asignacion.setFechaInicio(LocalDate.now());
        asignacion.setFechaFin(LocalDate.now().plusMonths(3));
        asignacion.setFase(FaseActualPractica.DESARROLLO);
        asignacion.setEstado(EstadoAsignacion.EN_CURSO);
        asignacionGuardada = asignacionPracticaRepository.save(asignacion);
    }

    @Test
    @DisplayName("Integracion - Debe obtener detalle de asignacion desde base de datos")
    void buscarDetallePorId_Exitoso() throws Exception {
        mockMvc.perform(get("/asignaciones-practicas/" + asignacionGuardada.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.id").value(asignacionGuardada.getId()))
                .andExpect(jsonPath("$.data.estudiante.nombres").value("Mateo"))
                .andExpect(jsonPath("$.data.tutorAcademico.nombres").value("Dr. Hernan"))
                .andExpect(jsonPath("$.data.institucion").value("Produbanco"))
                .andExpect(jsonPath("$.data.horasAsignadas").value(120));
    }

    @Test
    @DisplayName("Integracion - Debe retornar 404 al buscar asignacion inexistente")
    void buscarDetallePorId_NoExiste() throws Exception {
        mockMvc.perform(get("/asignaciones-practicas/99999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.exito").value(false));
    }

    @Test
    @DisplayName("Integracion - Debe listar asignaciones paginadas con busqueda")
    void listarAsignaciones_Paginadas() throws Exception {
        mockMvc.perform(get("/asignaciones-practicas")
                        .param("search", "Mateo")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].id").value(asignacionGuardada.getId()));
    }

    @Test
    @DisplayName("Integracion - Debe avanzar horas de asignacion y persistir en base de datos")
    void avanzarHoras_Exitoso() throws Exception {
        HorasAsignacionDto peticion = new HorasAsignacionDto(60);

        mockMvc.perform(patch("/asignaciones-practicas/" + asignacionGuardada.getId() + "/avanzar-horas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.horasCompletadas").value(60));

        AsignacionPractica enDb = asignacionPracticaRepository.findById(asignacionGuardada.getId()).orElseThrow();
        assertEquals(60, enDb.getHorasCompletadas());
    }
}
