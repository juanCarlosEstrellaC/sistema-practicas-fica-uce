package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.enums.TipoNotificacion;

import com.uce.api_pp_uce.dtos.pp.AsignacionPracticaDetalleDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.pp.Convenio;
import com.uce.api_pp_uce.entities.pp.DocumentoPortafolio;
import com.uce.api_pp_uce.entities.pp.ProcesoPractica;
import com.uce.api_pp_uce.enums.EstadoPeriodo;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoArchivoSubido;
import com.uce.api_pp_uce.enums.pp.EstadoAsignacion;
import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.EstadoConvenio;
import com.uce.api_pp_uce.enums.pp.EstadoProceso;
import com.uce.api_pp_uce.enums.pp.FaseActualPractica;
import com.uce.api_pp_uce.enums.pp.TipoConvenio;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import org.springframework.security.access.AccessDeniedException;
import com.uce.api_pp_uce.exportadores.pp.AvalCumplimientoPdfExportador;
import com.uce.api_pp_uce.exportadores.pp.CartaAsignacionPdfExportador;
import com.uce.api_pp_uce.mapeadores.UsuarioMapeador;
import com.uce.api_pp_uce.mapeadores.pp.AsignacionPracticaMapeadorImpl;
import com.uce.api_pp_uce.repositories.PeriodoAcademicoRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.ConvenioRepository;
import com.uce.api_pp_uce.repositories.pp.DocumentoPortafolioRepository;
import com.uce.api_pp_uce.repositories.pp.ProcesoPracticaRepository;
import com.uce.api_pp_uce.services.ArchivoService;
import com.uce.api_pp_uce.services.CorreoService;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.pp.impl.AsignacionPracticaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.mapstruct.factory.Mappers;
import org.springframework.test.util.ReflectionTestUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AsignacionPracticaServiceTest {

    @Mock
    private AsignacionPracticaRepository asignacionPracticaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ConvenioRepository convenioRepository;

    @Mock
    private DocumentoPortafolioRepository documentoRepository;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Mock
    private ProcesoPracticaRepository procesoPracticaRepository;

    @Mock
    private CartaAsignacionPdfExportador cartaAsignacionPdfExportador;

    @Mock
    private AvalCumplimientoPdfExportador avalCumplimientoPdfExportador;

    @Mock
    private CorreoService correoService;

    @Mock
    private ArchivoService archivoService;

    @Mock
    private com.uce.api_pp_uce.services.UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private AsignacionPracticaServiceImpl asignacionPracticaService;

    private Usuario estudianteMock;
    private Usuario tutorMock;
    private Carrera carreraMock;
    private Convenio convenioMock;
    private PeriodoAcademico periodoMock;
    private AsignacionPractica asignacionMock;
    private ProcesoPractica procesoMock;

    @BeforeEach
    void setUp() {
        carreraMock = new Carrera();
        carreraMock.setId(1);
        carreraMock.setNombre("Ingeniería en Computación");
        carreraMock.setHorasPractica(240);

        estudianteMock = new Usuario();
        estudianteMock.setId(10L);
        estudianteMock.setNombres("Carlos");
        estudianteMock.setApellidos("Perez");
        estudianteMock.setCorreo("carlos.perez@uce.edu.ec");
        estudianteMock.setCarrera(carreraMock);
        estudianteMock.setRol(RolUsuario.ESTUDIANTE);

        tutorMock = new Usuario();
        tutorMock.setId(20L);
        tutorMock.setNombres("Dra. Ana");
        tutorMock.setApellidos("Morales");
        tutorMock.setCorreo("ana.morales@uce.edu.ec");
        tutorMock.setRol(RolUsuario.TUTOR_ACADEMICO);

        convenioMock = new Convenio();
        convenioMock.setId(30L);
        convenioMock.setInstitucion("Empresa Tech S.A.");
        convenioMock.setTipo(TipoConvenio.PRIVADO);
        convenioMock.setCuposDisponibles(5);
        convenioMock.setEstado(EstadoConvenio.ACTIVO);

        periodoMock = new PeriodoAcademico();
        periodoMock.setId(40L);
        periodoMock.setNombre("2026-2026");
        periodoMock.setEstado(EstadoPeriodo.ACTIVO);

        procesoMock = new ProcesoPractica();
        procesoMock.setId(50L);
        procesoMock.setEstudiante(estudianteMock);
        procesoMock.setCarrera(carreraMock);
        procesoMock.setHorasRequeridas(240);
        procesoMock.setHorasAcumuladas(0);
        procesoMock.setEstado(EstadoProceso.EN_CURSO);

        asignacionMock = new AsignacionPractica();
        asignacionMock.setId(100L);
        asignacionMock.setProcesoPractica(procesoMock);
        asignacionMock.setConvenio(convenioMock);
        asignacionMock.setTutorAcademico(tutorMock);
        asignacionMock.setTutorInstitucional("Ing. Externo");
        asignacionMock.setHorasAsignadas(240);
        asignacionMock.setHorasCompletadas(0);
        asignacionMock.setPeriodoAcademico(periodoMock);
        asignacionMock.setFechaInicio(LocalDate.now());
        asignacionMock.setFase(FaseActualPractica.ASIGNACION);
        asignacionMock.setEstado(EstadoAsignacion.EN_CURSO);

        UsuarioMapeador usuarioMapeador = Mappers.getMapper(UsuarioMapeador.class);
        AsignacionPracticaMapeadorImpl mapperImpl = new AsignacionPracticaMapeadorImpl();
        ReflectionTestUtils.setField(mapperImpl, "usuarioMapeador", usuarioMapeador);
        ReflectionTestUtils.setField(asignacionPracticaService, "asignacionPracticaMapeador", mapperImpl);
    }

    @Test
    @DisplayName("Deberia asignar tutor y convenio exitosamente (Caso Feliz)")
    void asignarTutorYConvenio_Exitoso() {
        when(periodoAcademicoRepository.findById(40L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(estudianteMock));
        when(convenioRepository.findById(30L)).thenReturn(Optional.of(convenioMock));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));

        when(asignacionPracticaRepository.countByTutorAcademicoIdAndPeriodoAcademicoId(20L, 40L)).thenReturn(2L);
        when(asignacionPracticaRepository.countByConvenioIdAndEstado(30L, EstadoAsignacion.EN_CURSO)).thenReturn(1L);

        when(procesoPracticaRepository.findByEstudianteIdAndCarreraId(10L, 1)).thenReturn(Optional.of(procesoMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenReturn(asignacionMock);
        when(documentoRepository.findByEstudianteIdOrderByIdDesc(10L)).thenReturn(new ArrayList<>());

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.asignarTutorYConvenio(
                10L, 30L, 20L, "Ing. Externo", 240, 40L);

        assertNotNull(resultado);
        assertEquals(100L, resultado.id());
        assertEquals("Empresa Tech S.A.", resultado.institucion());
        verify(asignacionPracticaRepository, times(1)).save(any(AsignacionPractica.class));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si cualquier parametro obligatorio es nulo (Caso Limite)")
    void asignarTutorYConvenio_ParametrosNulos_LanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(null, 30L, 20L, "Ext", 240, 40L));

        assertThrows(IllegalArgumentException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(10L, null, 20L, "Ext", 240, 40L));

        assertThrows(IllegalArgumentException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(10L, 30L, null, "Ext", 240, 40L));

        assertThrows(IllegalArgumentException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(10L, 30L, 20L, "Ext", 240, null));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el periodo academico esta inactivo (Caso Limite)")
    void asignarTutorYConvenio_PeriodoInactivo_LanzaExcepcion() {
        PeriodoAcademico periodoInactivo = new PeriodoAcademico();
        periodoInactivo.setId(40L);
        periodoInactivo.setEstado(EstadoPeriodo.INACTIVO);

        when(periodoAcademicoRepository.findById(40L)).thenReturn(Optional.of(periodoInactivo));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(10L, 30L, 20L, "Ext", 240, 40L));

        assertTrue(ex.getMessage().contains("inactivo"));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el tutor ya tiene 10 estudiantes asignados (Caso Limite Limite Tutor)")
    void asignarTutorYConvenio_CargaTutorExcedida_LanzaExcepcion() {
        when(periodoAcademicoRepository.findById(40L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(estudianteMock));
        when(convenioRepository.findById(30L)).thenReturn(Optional.of(convenioMock));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));

        // Tutor con 10 asignaciones
        when(asignacionPracticaRepository.countByTutorAcademicoIdAndPeriodoAcademicoId(20L, 40L)).thenReturn(10L);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(10L, 30L, 20L, "Ext", 240, 40L));

        assertTrue(ex.getMessage().contains("máximo de 10 estudiantes"));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el convenio ya no tiene cupos disponibles (Caso Limite Sin Cupos)")
    void asignarTutorYConvenio_ConvenioSinCupos_LanzaExcepcion() {
        when(periodoAcademicoRepository.findById(40L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(estudianteMock));
        when(convenioRepository.findById(30L)).thenReturn(Optional.of(convenioMock));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));

        when(asignacionPracticaRepository.countByTutorAcademicoIdAndPeriodoAcademicoId(20L, 40L)).thenReturn(2L);
        // Ocupados igual a cuposDisponibles (5)
        when(asignacionPracticaRepository.countByConvenioIdAndEstado(30L, EstadoAsignacion.EN_CURSO)).thenReturn(5L);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(10L, 30L, 20L, "Ext", 240, 40L));

        assertTrue(ex.getMessage().contains("no tiene cupos disponibles"));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si el estudiante ya cuenta con una asignacion activa en el periodo")
    void asignarTutorYConvenio_EstudianteConAsignacionActiva_LanzaExcepcion() {
        when(periodoAcademicoRepository.findById(40L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(estudianteMock));
        when(convenioRepository.findById(30L)).thenReturn(Optional.of(convenioMock));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));

        when(asignacionPracticaRepository.existsByProcesoPracticaEstudianteIdAndPeriodoAcademicoIdAndEstadoNot(
                10L, 40L, EstadoAsignacion.CANCELADO)).thenReturn(true);

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.asignarTutorYConvenio(10L, 30L, 20L, "Ext", 240, 40L));

        assertTrue(ex.getMessage().contains("ya cuenta con una asignación activa"));
    }

    @Test
    @DisplayName("Deberia permitir asignacion si la practica previa en el periodo fue cancelada")
    void asignarTutorYConvenio_PermiteReasignarSiPreviaFueCancelada() {
        when(periodoAcademicoRepository.findById(40L)).thenReturn(Optional.of(periodoMock));
        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(estudianteMock));
        when(convenioRepository.findById(30L)).thenReturn(Optional.of(convenioMock));
        when(usuarioRepository.findById(20L)).thenReturn(Optional.of(tutorMock));

        when(asignacionPracticaRepository.existsByProcesoPracticaEstudianteIdAndPeriodoAcademicoIdAndEstadoNot(
                10L, 40L, EstadoAsignacion.CANCELADO)).thenReturn(false);
        when(asignacionPracticaRepository.countByTutorAcademicoIdAndPeriodoAcademicoId(20L, 40L)).thenReturn(2L);
        when(asignacionPracticaRepository.countByConvenioIdAndEstado(30L, EstadoAsignacion.EN_CURSO)).thenReturn(1L);
        when(procesoPracticaRepository.findByEstudianteIdAndCarreraId(10L, 1)).thenReturn(Optional.of(procesoMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenReturn(asignacionMock);
        when(documentoRepository.findByEstudianteIdOrderByIdDesc(10L)).thenReturn(new ArrayList<>());

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.asignarTutorYConvenio(
                10L, 30L, 20L, "Ing. Externo", 240, 40L);

        assertNotNull(resultado);
        verify(asignacionPracticaRepository, times(1)).save(any(AsignacionPractica.class));
    }

    @Test
    @DisplayName("Deberia avanzar horas correctamente sumando al progreso (Caso Feliz)")
    void avanzarHoras_Exitoso() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.avanzarHoras(100L, 80);

        assertNotNull(resultado);
        assertEquals(80, asignacionMock.getHorasCompletadas());
        verify(asignacionPracticaRepository, times(1)).save(asignacionMock);
    }

    @Test
    @DisplayName("Deberia truncar al total asignado si las horas superan el maximo (Caso Limite Excedente)")
    void avanzarHoras_ExcedenteTruncaAlMaximo() {
        asignacionMock.setHorasCompletadas(200);
        asignacionMock.setHorasAsignadas(240);

        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        // Intenta sumar 100 horas cuando solo le faltan 40
        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.avanzarHoras(100L, 100);

        assertNotNull(resultado);
        assertEquals(240, asignacionMock.getHorasCompletadas());
    }

    @Test
    @DisplayName("Deberia iniciar fase de desarrollo de practicas (Caso Feliz)")
    void iniciarDesarrolloPracticas_Exitoso() {
        asignacionMock.setCartaAsignacionEnviada(true);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.iniciarDesarrolloPracticas(100L);

        assertNotNull(resultado);
        assertEquals(FaseActualPractica.DESARROLLO, asignacionMock.getFase());
        assertTrue(asignacionMock.getReunionRealizada());
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al iniciar desarrollo si la carta de asignacion no ha sido emitida")
    void iniciarDesarrolloPracticas_SinCartaAsignacion_LanzaExcepcion() {
        asignacionMock.setCartaAsignacionEnviada(false);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        NegocioException ex = assertThrows(NegocioException.class,
                () -> asignacionPracticaService.iniciarDesarrolloPracticas(100L));

        assertTrue(ex.getMessage().contains("Carta de Asignación"));
        verify(asignacionPracticaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deberia firmar registro y pasar a fase de finalizacion (Caso Feliz)")
    void firmarRegistroDesarrollo_Exitoso() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDate fechaFinValida = LocalDate.now().plusMonths(3);

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.firmarRegistroDesarrollo(
                100L, "/informe.pdf", "/certificado.pdf", "/seguimiento.pdf", fechaFinValida);

        assertNotNull(resultado);
        assertEquals(FaseActualPractica.FINALIZACION, asignacionMock.getFase());
        assertEquals(240, asignacionMock.getHorasCompletadas());
        assertEquals(fechaFinValida, asignacionMock.getFechaFin());
        verify(documentoRepository, times(3)).save(any(DocumentoPortafolio.class));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion si fecha fin es menor a fecha inicio al firmar (Caso Limite Fecha Invalida)")
    void firmarRegistroDesarrollo_FechaFinMenorAInicio_LanzaExcepcion() {
        asignacionMock.setFechaInicio(LocalDate.now());
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        LocalDate fechaFinInvalida = LocalDate.now().minusDays(5);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                asignacionPracticaService.firmarRegistroDesarrollo(
                        100L, "/informe.pdf", "/cert.pdf", "/seg.pdf", fechaFinInvalida));

        assertTrue(ex.getMessage().contains("no puede ser menor"));
    }

    @Test
    @DisplayName("Deberia validar CPP correctamente (Caso Feliz)")
    void validarCpp_Exitoso() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.validarCpp(100L);

        assertNotNull(resultado);
        assertTrue(asignacionMock.getValidadoCpp());
    }

    @Test
    @DisplayName("Deberia eliminar asignacion si no tiene carta emitida (Caso Feliz)")
    void eliminarAsignacion_Exitoso() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);
        doNothing().when(asignacionPracticaRepository).delete(asignacionMock);

        assertDoesNotThrow(() -> asignacionPracticaService.eliminarAsignacion(100L));
        verify(asignacionPracticaRepository, times(1)).delete(asignacionMock);
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al eliminar asignacion si ya tiene carta emitida (Caso Limite Bloqueo)")
    void eliminarAsignacion_ConCartaEmitida_LanzaExcepcion() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                asignacionPracticaService.eliminarAsignacion(100L));

        assertTrue(ex.getMessage().contains("ya se ha emitido la carta"));
        verify(asignacionPracticaRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al eliminar asignacion inexistente (Caso Limite)")
    void eliminarAsignacion_NoEncontrada_LanzaExcepcion() {
        when(asignacionPracticaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () ->
                asignacionPracticaService.eliminarAsignacion(999L));
    }

    @Test
    @DisplayName("Deberia generar PDF de carta de asignacion exitosamente")
    void generarPdfCartaAsignacion_Exitoso() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);
        byte[] pdfEsperado = "pdf-carta".getBytes();
        when(cartaAsignacionPdfExportador.exportar(any(AsignacionPracticaDetalleDto.class))).thenReturn(pdfEsperado);

        byte[] resultado = asignacionPracticaService.generarPdfCartaAsignacion(100L);

        assertNotNull(resultado);
        assertArrayEquals(pdfEsperado, resultado);
        verify(cartaAsignacionPdfExportador).exportar(any(AsignacionPracticaDetalleDto.class));
    }

    @Test
    @DisplayName("Deberia generar PDF de aval exitosamente")
    void generarPdfAval_Exitoso() {
        asignacionMock.setValidadoCpp(true);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);
        byte[] pdfEsperado = "pdf-aval".getBytes();
        when(avalCumplimientoPdfExportador.exportar(any(AsignacionPracticaDetalleDto.class), anyString(), anyString(), anyString(), anyString()))
                .thenReturn(pdfEsperado);

        byte[] resultado = asignacionPracticaService.generarPdfAval(100L, "Dr. Subdecano", "1711111111", "0991111111", "sub@uce.edu.ec");

        assertNotNull(resultado);
        assertArrayEquals(pdfEsperado, resultado);
        verify(avalCumplimientoPdfExportador).exportar(any(AsignacionPracticaDetalleDto.class), eq("Dr. Subdecano"), eq("1711111111"), eq("0991111111"), eq("sub@uce.edu.ec"));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al generar PDF de aval sin validacion previa de CPP")
    void generarPdfAval_SinValidacionCpp_LanzaExcepcion() {
        asignacionMock.setValidadoCpp(false);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.generarPdfAval(100L, "Dr. Subdecano", "1711111111", "0991111111", "sub@uce.edu.ec")
        );

        assertTrue(ex.getMessage().contains("el portafolio no ha sido validado por el Coordinador de Practicas"));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al generar aval sin validacion previa de CPP")
    void generarAval_SinValidacionCpp_LanzaExcepcion() {
        asignacionMock.setValidadoCpp(false);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.generarAval(100L, null)
        );

        assertTrue(ex.getMessage().contains("sin la validacion previa del Coordinador de Practicas"));
    }

    @Test
    @DisplayName("Deberia reenviar carta de asignacion exitosamente al tutor institucional")
    void reenviarCartaAsignacion_Exitoso() {
        asignacionMock.getConvenio().setCorreoTutor("tutor.institucional@empresa.com");
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(cartaAsignacionPdfExportador.exportar(any(AsignacionPracticaDetalleDto.class))).thenReturn("pdf-carta".getBytes());

        asignacionPracticaService.reenviarCartaAsignacion(100L);

        verify(correoService, times(1)).enviarCorreoHtmlConAdjunto(
                eq("tutor.institucional@empresa.com"),
                contains("Carta de Asignación"),
                eq("email/carta-asignacion"),
                any(),
                any(byte[].class),
                anyString()
        );
    }

    @Test
    @DisplayName("Deberia emitir carta sin firma guardando archivo fisico en archivos_subidos")
    void emitirCartaAsignacion_SinFirma_GuardaArchivoFisicoYMarcaEnviada() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);
        when(cartaAsignacionPdfExportador.exportar(any(AsignacionPracticaDetalleDto.class))).thenReturn("pdf-bytes".getBytes());
        when(archivoService.guardarArchivoBytes(any(byte[].class), anyString(), eq(TipoArchivoSubido.CARTAS_ASIGNACION)))
                .thenReturn("/archivos_subidos/practicas/cartas_asignacion/carta_100.pdf");

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.emitirCartaAsignacion(100L, null);

        assertNotNull(resultado);
        assertTrue(asignacionMock.getCartaAsignacionEnviada());
        verify(archivoService, times(1)).guardarArchivoBytes(any(byte[].class), eq("Carta_Asignacion_100.pdf"), eq(TipoArchivoSubido.CARTAS_ASIGNACION));
        verify(documentoRepository, times(1)).save(argThat(doc ->
                doc.getTipo() == TipoDocumento.CARTA_ASIGNACION &&
                "/archivos_subidos/practicas/cartas_asignacion/carta_100.pdf".equals(doc.getUrl()) &&
                Boolean.FALSE.equals(doc.getFirmado())
        ));
    }

    @Test
    @DisplayName("Deberia emitir carta con archivo firmado provisto")
    void emitirCartaAsignacion_ConFirma_GuardaUrlFirmada() {
        String urlFirmada = "/archivos_subidos/practicas/cartas_asignacion/firmado_100.pdf";
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);
        when(cartaAsignacionPdfExportador.exportar(any(AsignacionPracticaDetalleDto.class))).thenReturn("pdf-bytes".getBytes());

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.emitirCartaAsignacion(100L, urlFirmada);

        assertNotNull(resultado);
        assertTrue(asignacionMock.getCartaAsignacionEnviada());
        verify(archivoService, never()).guardarArchivoBytes(any(), any(), any());
        verify(documentoRepository, times(1)).save(argThat(doc ->
                doc.getTipo() == TipoDocumento.CARTA_ASIGNACION &&
                urlFirmada.equals(doc.getUrl()) &&
                Boolean.TRUE.equals(doc.getFirmado())
        ));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al generar aval si la asignacion ya se encuentra aprobada")
    void generarAval_CuandoYaEstaAprobado_LanzaExcepcion() {
        asignacionMock.setValidadoCpp(true);
        asignacionMock.setEstado(EstadoAsignacion.APROBADO);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.generarAval(100L, null)
        );

        assertTrue(ex.getMessage().contains("El Aval de Cumplimiento ya ha sido generado"));
    }

    @Test
    @DisplayName("Deberia lanzar excepcion al generar aval si ya existe documento de tipo AVAL")
    void generarAval_CuandoYaExisteDocumentoAval_LanzaExcepcion() {
        asignacionMock.setValidadoCpp(true);
        asignacionMock.setEstado(EstadoAsignacion.EN_CURSO);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.AVAL)).thenReturn(true);

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.generarAval(100L, null)
        );

        assertTrue(ex.getMessage().contains("El Aval de Cumplimiento ya ha sido generado"));
    }

    @Test
    @DisplayName("Deberia generar aval exitosamente marcando asignacion APROBADO y documento APROBADO")
    void generarAval_Exitoso_MarcaAprobadoYGuardaDocumento() {
        String urlFirmada = "/archivos_subidos/practicas/avales/aval_firmado_100.pdf";
        asignacionMock.setValidadoCpp(true);
        asignacionMock.setEstado(EstadoAsignacion.EN_CURSO);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.AVAL)).thenReturn(false);
        when(documentoRepository.findByAsignacionIdAndTipo(100L, TipoDocumento.AVAL)).thenReturn(Optional.empty());
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.generarAval(100L, urlFirmada);

        assertNotNull(resultado);
        assertEquals(EstadoAsignacion.APROBADO, asignacionMock.getEstado());
        verify(documentoRepository, times(1)).save(argThat(doc ->
                doc.getTipo() == TipoDocumento.AVAL &&
                urlFirmada.equals(doc.getUrl()) &&
                doc.getEstado() == EstadoDocumento.APROBADO &&
                Boolean.TRUE.equals(doc.getFirmado())
        ));
    }

    @Test
    @DisplayName("Deberia actualizar horas exitosamente cuando estan dentro del limite")
    void actualizarAsignacion_HorasValidas_Exitoso() {
        asignacionMock.setHorasCompletadas(0);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.actualizarAsignacion(100L, null, null, 180, null);

        assertNotNull(resultado);
        assertEquals(180, asignacionMock.getHorasAsignadas());
        verify(asignacionPracticaRepository, times(1)).save(asignacionMock);
    }

    @Test
    @DisplayName("Deberia lanzar NegocioException si se intenta actualizar con horas menores o iguales a cero")
    void actualizarAsignacion_HorasCeroONegativas_LanzaExcepcion() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);

        NegocioException exCero = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.actualizarAsignacion(100L, null, null, 0, null));
        assertTrue(exCero.getMessage().contains("mayores a 0"));

        NegocioException exNeg = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.actualizarAsignacion(100L, null, null, -10, null));
        assertTrue(exNeg.getMessage().contains("mayores a 0"));
    }

    @Test
    @DisplayName("Deberia lanzar NegocioException si las horas a actualizar exceden el limite de la carrera")
    void actualizarAsignacion_HorasExcedenLimiteCarrera_LanzaExcepcion() {
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);

        // Intenta asignar 500000 horas cuando la carrera requiere 240
        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.actualizarAsignacion(100L, null, null, 500000, null));
        assertTrue(ex.getMessage().contains("exceden el límite"));
    }

    @Test
    @DisplayName("Deberia lanzar NegocioException si las horas son menores a las horas completadas")
    void actualizarAsignacion_HorasMenoresACompletadas_LanzaExcepcion() {
        asignacionMock.setHorasCompletadas(100);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(documentoRepository.existsByAsignacionIdAndTipo(100L, TipoDocumento.CARTA_ASIGNACION)).thenReturn(false);

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.actualizarAsignacion(100L, null, null, 80, null));
        assertTrue(ex.getMessage().contains("no pueden ser menores a las horas ya completadas"));
    }

    @Test
    @DisplayName("Deberia cancelar asignacion exitosamente reiniciando horas a 0")
    void cancelarAsignacion_Exitoso() {
        asignacionMock.setEstado(EstadoAsignacion.EN_CURSO);
        asignacionMock.setHorasCompletadas(50);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.cancelarAsignacion(100L);

        assertNotNull(resultado);
        assertEquals(EstadoAsignacion.CANCELADO, asignacionMock.getEstado());
        assertEquals(0, asignacionMock.getHorasCompletadas());
        verify(asignacionPracticaRepository, times(1)).save(asignacionMock);
        verify(notificacionService, atLeastOnce()).enviar(any(Usuario.class), anyString(), anyString(), any(TipoNotificacion.class), anyString());
    }

    @Test
    @DisplayName("Deberia lanzar NegocioException al intentar cancelar una asignacion ya aprobada")
    void cancelarAsignacion_Aprobada_LanzaExcepcion() {
        asignacionMock.setEstado(EstadoAsignacion.APROBADO);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.cancelarAsignacion(100L));
        assertTrue(ex.getMessage().contains("ya fueron aprobadas"));
        verify(asignacionPracticaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deberia lanzar NegocioException al intentar cancelar una asignacion ya cancelada")
    void cancelarAsignacion_YaCancelada_LanzaExcepcion() {
        asignacionMock.setEstado(EstadoAsignacion.CANCELADO);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.cancelarAsignacion(100L));
        assertTrue(ex.getMessage().contains("ya se encuentra cancelada"));
        verify(asignacionPracticaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deberia reprobar asignacion exitosamente reiniciando horas a 0")
    void reprobarAsignacion_Exitoso() {
        asignacionMock.setEstado(EstadoAsignacion.EN_CURSO);
        asignacionMock.setHorasCompletadas(80);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));
        when(asignacionPracticaRepository.save(any(AsignacionPractica.class))).thenAnswer(inv -> inv.getArgument(0));

        AsignacionPracticaDetalleDto resultado = asignacionPracticaService.reprobarAsignacion(100L);

        assertNotNull(resultado);
        assertEquals(EstadoAsignacion.REPROBADO, asignacionMock.getEstado());
        assertEquals(0, asignacionMock.getHorasCompletadas());
        verify(asignacionPracticaRepository, times(1)).save(asignacionMock);
        verify(notificacionService, atLeastOnce()).enviar(any(Usuario.class), anyString(), anyString(), any(TipoNotificacion.class), anyString());
    }

    @Test
    @DisplayName("Deberia lanzar NegocioException al intentar reprobar asignacion no en curso")
    void reprobarAsignacion_NoEnCurso_LanzaExcepcion() {
        asignacionMock.setEstado(EstadoAsignacion.APROBADO);
        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                asignacionPracticaService.reprobarAsignacion(100L));
        assertTrue(ex.getMessage().contains("se encuentren en curso"));
        verify(asignacionPracticaRepository, never()).save(any());
    }

    @Test
    @DisplayName("buscarDetallePorId - Lanza AccessDeniedException cuando estudiante intenta acceder a asignación de otro estudiante")
    void buscarDetallePorId_EstudianteAjeno_LanzaAccessDeniedException() {
        Usuario estudianteAjeno = new Usuario();
        estudianteAjeno.setId(999L);
        estudianteAjeno.setRol(RolUsuario.ESTUDIANTE);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(estudianteAjeno);

        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(AccessDeniedException.class, () -> asignacionPracticaService.buscarDetallePorId(100L));
    }

    @Test
    @DisplayName("reprobarAsignacion - Lanza AccessDeniedException cuando un estudiante intenta reprobar una asignación")
    void reprobarAsignacion_EstudianteIntentaReprobar_LanzaAccessDeniedException() {
        Usuario estudiante = new Usuario();
        estudiante.setId(estudianteMock.getId());
        estudiante.setRol(RolUsuario.ESTUDIANTE);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(estudiante);

        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(AccessDeniedException.class, () -> asignacionPracticaService.reprobarAsignacion(100L));
    }

    @Test
    @DisplayName("reprobarAsignacion - Lanza AccessDeniedException cuando un tutor que no es el asignado intenta reprobar")
    void reprobarAsignacion_TutorAjeno_LanzaAccessDeniedException() {
        Usuario tutorAjeno = new Usuario();
        tutorAjeno.setId(999L);
        tutorAjeno.setRol(RolUsuario.TUTOR_ACADEMICO);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(tutorAjeno);

        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(AccessDeniedException.class, () -> asignacionPracticaService.reprobarAsignacion(100L));
    }

    @Test
    @DisplayName("reprobarAsignacion - Lanza AccessDeniedException cuando un director de otra carrera intenta reprobar")
    void reprobarAsignacion_DirectorOtraCarrera_LanzaAccessDeniedException() {
        Carrera otraCarrera = new Carrera();
        otraCarrera.setId(99);
        Usuario dcAjeno = new Usuario();
        dcAjeno.setId(88L);
        dcAjeno.setRol(RolUsuario.DIRECTOR_CARRERA);
        dcAjeno.setCarrera(otraCarrera);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(dcAjeno);

        when(asignacionPracticaRepository.findById(100L)).thenReturn(Optional.of(asignacionMock));

        assertThrows(AccessDeniedException.class, () -> asignacionPracticaService.reprobarAsignacion(100L));
    }
}
