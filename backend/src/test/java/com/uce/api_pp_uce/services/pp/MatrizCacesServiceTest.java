package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.pp.MatrizCacesDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.PeriodoAcademico;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.pp.MatrizCaces;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.pp.EstadoMatrizCaces;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.MatrizCacesRepository;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.services.ArchivoService;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import com.uce.api_pp_uce.services.pp.impl.MatrizCacesServiceImpl;
import jakarta.persistence.EntityManager;
import com.uce.api_pp_uce.exportadores.pp.MatrizCacesExcelExportador;
import com.uce.api_pp_uce.mapeadores.pp.MatrizCacesMapeador;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatrizCacesServiceTest {

    @Mock
    private MatrizCacesRepository matrizCacesRepository;

    @Mock
    private AsignacionPracticaRepository asignacionPracticaRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private ArchivoService archivoService;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Spy
    private MatrizCacesMapeador matrizCacesMapeador = Mappers.getMapper(MatrizCacesMapeador.class);

    @Spy
    private MatrizCacesExcelExportador matrizCacesExcelExportador = new MatrizCacesExcelExportador();

    @InjectMocks
    private MatrizCacesServiceImpl matrizCacesService;

    private Carrera carreraMock;
    private PeriodoAcademico periodoMock;
    private MatrizCaces matrizMock;
    private Usuario subdecanoMock;
    private Usuario directorCarreraMock;
    private Usuario coordinadorPracticasMock;

    @BeforeEach
    void setUp() {
        carreraMock = new Carrera();
        carreraMock.setId(1);
        carreraMock.setNombre("Sistemas de Informacion");
        carreraMock.setCodigoCarrera("SIS");

        periodoMock = new PeriodoAcademico();
        periodoMock.setId(10L);
        periodoMock.setNombre("2026-2026");

        matrizMock = new MatrizCaces();
        matrizMock.setId(100L);
        matrizMock.setCarrera(carreraMock);
        matrizMock.setPeriodoAcademico(periodoMock);
        matrizMock.setEstado(EstadoMatrizCaces.PENDIENTE);
        matrizMock.setFechaGeneracion(LocalDateTime.now());

        subdecanoMock = new Usuario();
        subdecanoMock.setId(201L);
        subdecanoMock.setNombres("Carlos");
        subdecanoMock.setApellidos("Subdecano");
        subdecanoMock.setRol(RolUsuario.SUBDECANO);

        directorCarreraMock = new Usuario();
        directorCarreraMock.setId(202L);
        directorCarreraMock.setNombres("Ana");
        directorCarreraMock.setApellidos("Directora");
        directorCarreraMock.setRol(RolUsuario.DIRECTOR_CARRERA);
        directorCarreraMock.setCarrera(carreraMock);

        coordinadorPracticasMock = new Usuario();
        coordinadorPracticasMock.setId(203L);
        coordinadorPracticasMock.setNombres("Luis");
        coordinadorPracticasMock.setApellidos("Coordinador");
        coordinadorPracticasMock.setRol(RolUsuario.COORDINADOR_PRACTICAS);
        coordinadorPracticasMock.setCarrera(carreraMock);
    }

    @Test
    @DisplayName("Debe listar matrices por carrera paginadas")
    void listarPorCarrera_Exitoso() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MatrizCaces> pagina = new PageImpl<>(List.of(matrizMock));

        when(matrizCacesRepository.findByCarreraId(1, pageable)).thenReturn(pagina);

        Page<MatrizCacesDto> resultado = matrizCacesService.listarPorCarrera(1, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(100L, resultado.getContent().get(0).id());
        assertEquals("Sistemas de Informacion", resultado.getContent().get(0).carreraNombre());
    }

    @Test
    @DisplayName("Debe listar matrices por periodo con busqueda")
    void listarPorPeriodo_ConBusqueda_Exitoso() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MatrizCaces> pagina = new PageImpl<>(List.of(matrizMock));

        when(matrizCacesRepository.findByPeriodoAcademicoIdAndEstadoAndSearch(10L, EstadoMatrizCaces.PENDIENTE, "Sistemas", pageable))
                .thenReturn(pagina);

        Page<MatrizCacesDto> resultado = matrizCacesService.listarPorPeriodo(10L, EstadoMatrizCaces.PENDIENTE, "Sistemas", pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
    }

    @Test
    @DisplayName("Debe listar matrices por periodo sin filtro de estado")
    void listarPorPeriodo_SinEstado_Exitoso() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MatrizCaces> pagina = new PageImpl<>(List.of(matrizMock));

        when(matrizCacesRepository.findByPeriodoAcademicoId(10L, pageable)).thenReturn(pagina);

        Page<MatrizCacesDto> resultado = matrizCacesService.listarPorPeriodo(10L, null, null, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
    }

    @Test
    @DisplayName("Debe listar matrices por periodo con filtro de estado")
    void listarPorPeriodo_ConEstado_Exitoso() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<MatrizCaces> pagina = new PageImpl<>(List.of(matrizMock));

        when(matrizCacesRepository.findByPeriodoAcademicoIdAndEstado(10L, EstadoMatrizCaces.PENDIENTE, pageable)).thenReturn(pagina);

        Page<MatrizCacesDto> resultado = matrizCacesService.listarPorPeriodo(10L, EstadoMatrizCaces.PENDIENTE, null, pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
    }

    @Test
    @DisplayName("Debe obtener matriz por periodo y carrera")
    void obtenerPorPeriodoYCarrera_Exitoso() {
        when(matrizCacesRepository.findByPeriodoAcademicoIdAndCarreraId(10L, 1)).thenReturn(Optional.of(matrizMock));

        MatrizCacesDto resultado = matrizCacesService.obtenerPorPeriodoYCarrera(10L, 1);

        assertNotNull(resultado);
        assertEquals(100L, resultado.id());
    }

    @Test
    @DisplayName("Debe retornar matriz existente al crear o actualizar")
    void crearOActualizar_Existente_Exitoso() {
        when(matrizCacesRepository.findByPeriodoAcademicoIdAndCarreraId(10L, 1)).thenReturn(Optional.of(matrizMock));
        when(matrizCacesRepository.save(matrizMock)).thenReturn(matrizMock);

        MatrizCacesDto resultado = matrizCacesService.crearOActualizar(10L, 1);

        assertNotNull(resultado);
        assertEquals(100L, resultado.id());
    }

    @Test
    @DisplayName("Debe crear nueva matriz si no existe al crear o actualizar")
    void crearOActualizar_Nuevo_Exitoso() {
        when(matrizCacesRepository.findByPeriodoAcademicoIdAndCarreraId(10L, 1)).thenReturn(Optional.empty());
        when(entityManager.getReference(PeriodoAcademico.class, 10L)).thenReturn(periodoMock);
        when(entityManager.getReference(Carrera.class, 1)).thenReturn(carreraMock);
        when(matrizCacesRepository.save(any(MatrizCaces.class))).thenAnswer(i -> {
            MatrizCaces m = i.getArgument(0);
            m.setId(101L);
            return m;
        });

        MatrizCacesDto resultado = matrizCacesService.crearOActualizar(10L, 1);

        assertNotNull(resultado);
        assertEquals(101L, resultado.id());
        assertEquals(EstadoMatrizCaces.PENDIENTE, resultado.estado());
    }

    @Test
    @DisplayName("Debe cambiar estado a ENVIADA_A_SUBDECANO y notificar al subdecano")
    void cambiarEstado_EnviadaASubdecano_Exitoso() {
        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));
        when(matrizCacesRepository.save(any(MatrizCaces.class))).thenAnswer(i -> i.getArgument(0));
        when(usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO)).thenReturn(Optional.of(subdecanoMock));

        MatrizCacesDto resultado = matrizCacesService.cambiarEstado(100L, EstadoMatrizCaces.ENVIADA_A_SUBDECANO, null);

        assertNotNull(resultado);
        assertEquals(EstadoMatrizCaces.ENVIADA_A_SUBDECANO, resultado.estado());
        verify(notificacionService).enviar(eq(subdecanoMock), any(String.class), any(String.class), eq(TipoNotificacion.INFORMACION), any(String.class));
    }

    @Test
    @DisplayName("Debe cambiar estado a ENVIADA_A_DC y notificar al director de carrera")
    void cambiarEstado_EnviadaADirectorCarrera_Exitoso() {
        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));
        when(matrizCacesRepository.save(any(MatrizCaces.class))).thenAnswer(i -> i.getArgument(0));
        when(usuarioRepository.findByRolAndCarreraId(RolUsuario.DIRECTOR_CARRERA, 1)).thenReturn(Optional.of(directorCarreraMock));

        MatrizCacesDto resultado = matrizCacesService.cambiarEstado(100L, EstadoMatrizCaces.ENVIADA_A_DC, null);

        assertNotNull(resultado);
        assertEquals(EstadoMatrizCaces.ENVIADA_A_DC, resultado.estado());
        verify(notificacionService).enviar(eq(directorCarreraMock), any(String.class), any(String.class), eq(TipoNotificacion.INFORMACION), any(String.class));
    }

    @Test
    @DisplayName("Debe cambiar estado con observaciones y notificar al coordinador de practicas")
    void cambiarEstado_ConObservacionesACoordinador_Exitoso() {
        matrizMock.setEstado(EstadoMatrizCaces.ENVIADA_A_DC);
        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));
        when(matrizCacesRepository.save(any(MatrizCaces.class))).thenAnswer(i -> i.getArgument(0));
        when(usuarioRepository.findByRolAndCarreraId(RolUsuario.COORDINADOR_PRACTICAS, 1)).thenReturn(Optional.of(coordinadorPracticasMock));

        MatrizCacesDto resultado = matrizCacesService.cambiarEstado(100L, EstadoMatrizCaces.PENDIENTE, "Faltan firmas");

        assertNotNull(resultado);
        assertEquals(EstadoMatrizCaces.PENDIENTE, resultado.estado());
        verify(notificacionService).enviar(eq(coordinadorPracticasMock), any(String.class), any(String.class), eq(TipoNotificacion.INFORMACION), any(String.class));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException si se intenta devolver a PENDIENTE desde un estado que no es ENVIADA_A_DC")
    void cambiarEstado_DesdeEnviadaASubdecanoAPendiente_LanzaNegocioException() {
        matrizMock.setEstado(EstadoMatrizCaces.ENVIADA_A_SUBDECANO);
        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));

        assertThrows(NegocioException.class, () ->
                matrizCacesService.cambiarEstado(100L, EstadoMatrizCaces.PENDIENTE, "Observacion invalida de subdecano"));
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException si la matriz no existe al cambiar estado")
    void cambiarEstado_NoEncontrado() {
        when(matrizCacesRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () ->
                matrizCacesService.cambiarEstado(999L, EstadoMatrizCaces.PENDIENTE, null));
    }

    @Test
    @DisplayName("Debe subir archivo firmado exitosamente")
    void subirArchivoFirmado_Exitoso() {
        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));
        when(matrizCacesRepository.save(any(MatrizCaces.class))).thenAnswer(i -> i.getArgument(0));

        MatrizCacesDto resultado = matrizCacesService.subirArchivoFirmado(100L, "/archivos/matriz_firmada.pdf");

        assertNotNull(resultado);
        assertEquals("/archivos/matriz_firmada.pdf", resultado.archivoFirmadoUrl());
        verify(matrizCacesRepository).save(matrizMock);
    }

    @Test
    @DisplayName("Debe generar Excel de matriz CACES exitosamente")
    void generarExcelMatrizCaces_Exitoso() {
        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));
        when(asignacionPracticaRepository.findByPeriodoAcademicoIdAndProcesoPracticaCarreraId(10L, 1))
                .thenReturn(new ArrayList<AsignacionPractica>());
        when(usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO)).thenReturn(Optional.of(subdecanoMock));

        byte[] excelBytes = matrizCacesService.generarExcelMatrizCaces(100L);

        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);
    }

    @Test
    @DisplayName("Debe retornar archivo firmado existente cuando la matriz ya fue firmada")
    void generarExcelMatrizCaces_RetornaArchivoFirmadoExistente() {
        matrizMock.setArchivoFirmadoUrl("/archivos_subidos/matrices_caces/matriz_firmada.xlsx");
        byte[] bytesFirmados = new byte[]{9, 8, 7, 6};
        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));
        when(archivoService.cargarArchivo("/archivos_subidos/matrices_caces/matriz_firmada.xlsx"))
                .thenReturn(new ByteArrayResource(bytesFirmados));

        byte[] resultado = matrizCacesService.generarExcelMatrizCaces(100L);

        assertNotNull(resultado);
        assertEquals(4, resultado.length);
        assertEquals(9, resultado[0]);
    }

    @Test
    @DisplayName("validarCarrera - Lanza NegocioException si usuario autenticado es de otra carrera")
    void listarPorCarrera_UsuarioDeOtraCarrera_LanzaNegocioException() {
        Carrera carreraOtra = new Carrera();
        carreraOtra.setId(99);
        Usuario dcAjeno = new Usuario();
        dcAjeno.setId(88L);
        dcAjeno.setRol(RolUsuario.DIRECTOR_CARRERA);
        dcAjeno.setCarrera(carreraOtra);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(dcAjeno);

        NegocioException ex = assertThrows(NegocioException.class, () ->
                matrizCacesService.listarPorCarrera(1, PageRequest.of(0, 10)));
        assertTrue(ex.getMessage().contains("otra carrera"));
    }

    @Test
    @DisplayName("validarCarrera - Permite acceso si el usuario es SUBDECANO sin importar la carrera")
    void listarPorCarrera_Subdecano_Permitido() {
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(subdecanoMock);
        when(matrizCacesRepository.findByCarreraId(eq(1), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(matrizMock)));

        Page<MatrizCacesDto> resultado = matrizCacesService.listarPorCarrera(1, PageRequest.of(0, 10));
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
    }

    @Test
    @DisplayName("cambiarEstado - Lanza NegocioException si usuario autenticado intenta modificar matriz de otra carrera")
    void cambiarEstado_UsuarioDeOtraCarrera_LanzaNegocioException() {
        Carrera carreraOtra = new Carrera();
        carreraOtra.setId(99);
        Usuario cppAjeno = new Usuario();
        cppAjeno.setId(88L);
        cppAjeno.setRol(RolUsuario.COORDINADOR_PRACTICAS);
        cppAjeno.setCarrera(carreraOtra);
        when(usuarioAutenticadoService.obtenerUsuarioLogueado()).thenReturn(cppAjeno);

        when(matrizCacesRepository.findById(100L)).thenReturn(Optional.of(matrizMock));

        NegocioException ex = assertThrows(NegocioException.class, () ->
                matrizCacesService.cambiarEstado(100L, EstadoMatrizCaces.FIRMADA_POR_DC, "Obs"));
        assertTrue(ex.getMessage().contains("otra carrera"));
    }
}
