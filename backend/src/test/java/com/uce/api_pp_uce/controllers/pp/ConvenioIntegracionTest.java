package com.uce.api_pp_uce.controllers.pp;

import tools.jackson.databind.ObjectMapper;
import com.uce.api_pp_uce.dtos.pp.NuevoConvenioDto;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "SUBDECANO")
public class ConvenioIntegracionTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ConvenioRepository convenioRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        convenioRepository.deleteAll();
    }

    @Test
    @DisplayName("Integracion - Debe crear un convenio y persistirlo en la base de datos")
    void crearConvenio_PersisteEnBaseDeDatos() throws Exception {
        NuevoConvenioDto peticion = new NuevoConvenioDto(
                "Empresa Integradora S.A.",
                TipoConvenio.PRIVADO,
                new BigDecimal("12.50"),
                "Av. Amazonas y Naciones Unidas",
                LocalDate.now(),
                LocalDate.now().plusYears(1),
                "Lic. Roberto Diaz",
                "roberto@empresa.com",
                "0987654321",
                5,
                "/docs/convenio.pdf",
                "convenio.pdf",
                EstadoConvenio.ACTIVO
        );

        mockMvc.perform(post("/convenios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(peticion)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.institucion").value("Empresa Integradora S.A."))
                .andExpect(jsonPath("$.data.cuposDisponibles").value(5));

        assertEquals(1, convenioRepository.count());
    }

    @Test
    @DisplayName("Integracion - Debe listar convenios con filtros y paginacion desde la base de datos")
    void listarConvenios_ConFiltrosYPaginacion() throws Exception {
        Convenio c1 = new Convenio();
        c1.setInstitucion("Banco Pichincha");
        c1.setTipo(TipoConvenio.PRIVADO);
        c1.setFechaInicio(LocalDate.now());
        c1.setFechaFin(LocalDate.now().plusMonths(6));
        c1.setEstado(EstadoConvenio.ACTIVO);
        c1.setCuposDisponibles(10);
        convenioRepository.save(c1);

        Convenio c2 = new Convenio();
        c2.setInstitucion("Ministerio de Educacion");
        c2.setTipo(TipoConvenio.PUBLICO);
        c2.setFechaInicio(LocalDate.now());
        c2.setFechaFin(LocalDate.now().plusMonths(12));
        c2.setEstado(EstadoConvenio.ACTIVO);
        c2.setCuposDisponibles(4);
        convenioRepository.save(c2);

        mockMvc.perform(get("/convenios")
                        .param("search", "Pichincha")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].institucion").value("Banco Pichincha"));
    }

    @Test
    @DisplayName("Integracion - Debe obtener convenio por ID desde base de datos")
    void obtenerConvenioPorId_Exitoso() throws Exception {
        Convenio convenio = new Convenio();
        convenio.setInstitucion("CNT");
        convenio.setTipo(TipoConvenio.PUBLICO);
        convenio.setFechaInicio(LocalDate.now());
        convenio.setFechaFin(LocalDate.now().plusMonths(8));
        convenio.setEstado(EstadoConvenio.ACTIVO);
        convenio.setCuposDisponibles(3);
        Convenio guardado = convenioRepository.save(convenio);

        mockMvc.perform(get("/convenios/" + guardado.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.institucion").value("CNT"));
    }

    @Test
    @DisplayName("Integracion - Debe actualizar un convenio y reflejarlo en base de datos")
    void actualizarConvenio_ModificaEnBaseDeDatos() throws Exception {
        Convenio convenio = new Convenio();
        convenio.setInstitucion("Claro");
        convenio.setTipo(TipoConvenio.PRIVADO);
        convenio.setFechaInicio(LocalDate.now());
        convenio.setFechaFin(LocalDate.now().plusMonths(6));
        convenio.setEstado(EstadoConvenio.ACTIVO);
        convenio.setCuposDisponibles(2);
        Convenio guardado = convenioRepository.save(convenio);

        NuevoConvenioDto dtoActualizado = new NuevoConvenioDto(
                "Claro Ecuador",
                TipoConvenio.PRIVADO,
                BigDecimal.ZERO,
                "Quito",
                LocalDate.now(),
                LocalDate.now().plusMonths(12),
                "Ing. Supervisor",
                "supervisor@claro.com",
                "0911111111",
                8,
                null,
                null,
                EstadoConvenio.ACTIVO
        );

        mockMvc.perform(put("/convenios/" + guardado.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoActualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.data.institucion").value("Claro Ecuador"))
                .andExpect(jsonPath("$.data.cuposDisponibles").value(8));

        Convenio enDb = convenioRepository.findById(guardado.getId()).orElseThrow();
        assertEquals("Claro Ecuador", enDb.getInstitucion());
        assertEquals(8, enDb.getCuposDisponibles());
    }

    @Test
    @DisplayName("Integracion - Debe eliminar convenio mediante soft delete")
    void eliminarConvenio_AplicaSoftDelete() throws Exception {
        Convenio convenio = new Convenio();
        convenio.setInstitucion("Movistar");
        convenio.setTipo(TipoConvenio.PRIVADO);
        convenio.setFechaInicio(LocalDate.now());
        convenio.setFechaFin(LocalDate.now().plusMonths(6));
        convenio.setEstado(EstadoConvenio.ACTIVO);
        convenio.setCuposDisponibles(1);
        Convenio guardado = convenioRepository.save(convenio);

        mockMvc.perform(delete("/convenios/" + guardado.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true));

        Optional<Convenio> enDb = convenioRepository.findById(guardado.getId());
        assertTrue(enDb.isEmpty());
    }
}
