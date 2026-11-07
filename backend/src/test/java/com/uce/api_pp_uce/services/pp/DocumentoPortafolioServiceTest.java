package com.uce.api_pp_uce.services.pp;

import com.uce.api_pp_uce.dtos.pp.DocumentoPortafolioDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoResubirDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoRevisarDto;
import com.uce.api_pp_uce.dtos.pp.DocumentoSubirDto;
import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.entities.pp.AsignacionPractica;
import com.uce.api_pp_uce.entities.pp.DocumentoPortafolio;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.pp.EstadoDocumento;
import com.uce.api_pp_uce.enums.pp.TipoDocumento;
import com.uce.api_pp_uce.excepciones.NegocioException;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.AsignacionPracticaRepository;
import com.uce.api_pp_uce.repositories.pp.DocumentoPortafolioRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.pp.impl.DocumentoPortafolioServiceImpl;
import com.uce.api_pp_uce.mapeadores.pp.DocumentoPortafolioMapeador;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentoPortafolioServiceTest {

    @Mock
    private DocumentoPortafolioRepository documentoRepository;

    @Mock
    private AsignacionPracticaRepository asignacionPracticaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private NotificacionService notificacionService;

    @Mock
    private com.uce.api_pp_uce.services.UsuarioAutenticadoService usuarioAutenticadoService;

    @Spy
    private DocumentoPortafolioMapeador documentoPortafolioMapeador = Mappers.getMapper(DocumentoPortafolioMapeador.class);

    @InjectMocks
    private DocumentoPortafolioServiceImpl documentoService;

    private Usuario estudianteMock;
    private Usuario coordinadorMock;
    private Usuario tutorAcademicoMock;
    private Carrera carreraMock;
    private DocumentoPortafolio documentoMock;

    @BeforeEach
    void setUp() {
        coordinadorMock = new Usuario();
        coordinadorMock.setId(2L);
        coordinadorMock.setNombres("Coordinador");
        coordinadorMock.setApellidos("General");
        coordinadorMock.setRol(RolUsuario.COORDINADOR_PRACTICAS);

        carreraMock = new Carrera();
        carreraMock.setId(1);
        carreraMock.setNombre("Sistemas");
        carreraMock.setCoordinador(coordinadorMock);

        estudianteMock = new Usuario();
        estudianteMock.setId(10L);
        estudianteMock.setNombres("Maria");
        estudianteMock.setApellidos("Lopez");
        estudianteMock.setRol(RolUsuario.ESTUDIANTE);
        estudianteMock.setCarrera(carreraMock);

        tutorAcademicoMock = new Usuario();
        tutorAcademicoMock.setId(20L);
        tutorAcademicoMock.setNombres("Pedro");
        tutorAcademicoMock.setApellidos("Gomez");
        tutorAcademicoMock.setRol(RolUsuario.TUTOR_ACADEMICO);

        documentoMock = new DocumentoPortafolio();
        documentoMock.setId(100L);
        documentoMock.setEstudiante(estudianteMock);
        documentoMock.setTipo(TipoDocumento.CV);
        documentoMock.setNombre("Maria Lopez - cv.pdf");
        documentoMock.setUrl("/archivos/cv.pdf");
        documentoMock.setFirmado(false);
        documentoMock.setEstado(EstadoDocumento.PENDIENTE_REVISION);
        documentoMock.setFechaSubida(LocalDateTime.now());
    }

    @Test
    @DisplayName("Debe listar documentos por estudiante exitosamente")
    void buscarPorEstudiante_Exitoso() {
        when(documentoRepository.findByEstudianteIdOrderByIdDesc(10L)).thenReturn(List.of(documentoMock));

        List<DocumentoPortafolioDto> resultado = documentoService.buscarPorEstudiante(10L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(100L, resultado.get(0).id());
        assertEquals(TipoDocumento.CV, resultado.get(0).tipo());
    }

    @Test
    @DisplayName("Debe obtener todos los documentos paginados")
    void obtenerTodos_Exitoso() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<DocumentoPortafolio> pagina = new PageImpl<>(List.of(documentoMock));

        when(documentoRepository.findAll(pageable)).thenReturn(pagina);

        Page<DocumentoPortafolioDto> resultado = documentoService.obtenerTodos(pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(100L, resultado.getContent().get(0).id());
    }

    @Test
    @DisplayName("Debe revisar documento aprobando y notificando al estudiante")
    void revisarDocumento_Aprobado_Exitoso() {
        DocumentoRevisarDto dto = new DocumentoRevisarDto(EstadoDocumento.APROBADO, "Documento correcto");

        when(documentoRepository.findById(100L)).thenReturn(Optional.of(documentoMock));
        when(documentoRepository.save(any(DocumentoPortafolio.class))).thenAnswer(i -> i.getArgument(0));

        DocumentoPortafolioDto resultado = documentoService.revisarDocumento(100L, dto);

        assertNotNull(resultado);
        assertEquals(EstadoDocumento.APROBADO, resultado.estado());
        assertEquals("Documento correcto", resultado.observacion());
        verify(notificacionService).enviar(eq(estudianteMock), any(String.class), any(String.class), eq(TipoNotificacion.EXITO), any(String.class));
    }

    @Test
    @DisplayName("Debe revisar documento rechazando y notificando al tutor academico si es informe final")
    void revisarDocumento_Rechazado_NotificaTutorAcademico() {
        documentoMock.setTipo(TipoDocumento.INFORME_FINAL);
        AsignacionPractica asignacion = new AsignacionPractica();
        asignacion.setId(50L);
        asignacion.setTutorAcademico(tutorAcademicoMock);
        documentoMock.setAsignacion(asignacion);

        DocumentoRevisarDto dto = new DocumentoRevisarDto(EstadoDocumento.RECHAZADO, "Corregir conclusiones");

        when(documentoRepository.findById(100L)).thenReturn(Optional.of(documentoMock));
        when(documentoRepository.save(any(DocumentoPortafolio.class))).thenAnswer(i -> i.getArgument(0));

        DocumentoPortafolioDto resultado = documentoService.revisarDocumento(100L, dto);

        assertNotNull(resultado);
        assertEquals(EstadoDocumento.RECHAZADO, resultado.estado());
        assertEquals("Corregir conclusiones", resultado.observacion());
        verify(notificacionService).enviar(eq(tutorAcademicoMock), any(String.class), any(String.class), eq(TipoNotificacion.ADVERTENCIA), any(String.class));
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException si el documento a revisar no existe")
    void revisarDocumento_NoEncontrado() {
        DocumentoRevisarDto dto = new DocumentoRevisarDto(EstadoDocumento.APROBADO, "Ok");
        when(documentoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> documentoService.revisarDocumento(999L, dto));
    }

    @Test
    @DisplayName("Debe resubir documento actualizando url y notificando al coordinador")
    void resubirDocumento_Exitoso() {
        DocumentoResubirDto dto = new DocumentoResubirDto("/archivos/cv_nuevo.pdf", "cv_nuevo.pdf");

        when(documentoRepository.findById(100L)).thenReturn(Optional.of(documentoMock));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(coordinadorMock));

        DocumentoPortafolioDto resultado = documentoService.resubirDocumento(100L, dto);

        assertNotNull(resultado);
        assertEquals(EstadoDocumento.PENDIENTE_REVISION, resultado.estado());
        assertEquals("/archivos/cv_nuevo.pdf", resultado.url());
        assertNull(resultado.observacion());

        verify(documentoRepository).save(documentoMock);
        verify(notificacionService).enviar(eq(coordinadorMock), any(String.class), any(String.class), eq(TipoNotificacion.INFORMACION), any(String.class));
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException si el documento a resubir no existe")
    void resubirDocumento_NoEncontrado() {
        DocumentoResubirDto dto = new DocumentoResubirDto("/archivos/nuevo.pdf", "nuevo.pdf");
        when(documentoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> documentoService.resubirDocumento(999L, dto));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException si el estudiante autenticado no es el duenio del documento")
    void resubirDocumento_EstudianteNoCoincide_LanzaNegocioException() {
        DocumentoResubirDto dto = new DocumentoResubirDto("/archivos/cv_nuevo.pdf", "cv_nuevo.pdf");
        when(documentoRepository.findById(100L)).thenReturn(Optional.of(documentoMock));

        assertThrows(NegocioException.class, () -> documentoService.resubirDocumento(100L, dto, 999L));
    }

    @Test
    @DisplayName("Debe permitir al tutor academico resubir documento de seguimiento exitosamente")
    void resubirDocumento_TutorAcademico_Exitoso() {
        DocumentoPortafolio docSeguimiento = new DocumentoPortafolio();
        docSeguimiento.setId(101L);
        docSeguimiento.setEstudiante(estudianteMock);
        docSeguimiento.setTipo(TipoDocumento.SEGUIMIENTO_TA);
        docSeguimiento.setNombre("1. Registro de Seguimiento - Juan Estrella.pdf");
        docSeguimiento.setUrl("/archivos/antiguo.pdf");
        docSeguimiento.setEstado(EstadoDocumento.RECHAZADO);
        docSeguimiento.setObservacion("Faltan firmas");

        AsignacionPractica asignacion = new AsignacionPractica();
        asignacion.setId(50L);
        asignacion.setTutorAcademico(tutorAcademicoMock);
        docSeguimiento.setAsignacion(asignacion);

        DocumentoResubirDto dto = new DocumentoResubirDto("/archivos/nuevo_seguimiento.pdf", "seguimiento_firmado.pdf");

        when(documentoRepository.findById(101L)).thenReturn(Optional.of(docSeguimiento));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(coordinadorMock));

        DocumentoPortafolioDto resultado = documentoService.resubirDocumento(101L, dto, tutorAcademicoMock);

        assertNotNull(resultado);
        assertEquals(EstadoDocumento.PENDIENTE_REVISION, resultado.estado());
        assertEquals("/archivos/nuevo_seguimiento.pdf", resultado.url());
        assertNull(resultado.observacion());

        verify(documentoRepository).save(docSeguimiento);
        verify(notificacionService).enviar(eq(coordinadorMock), any(String.class), any(String.class), eq(TipoNotificacion.INFORMACION), any(String.class));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException si el tutor academico intenta resubir documento del estudiante")
    void resubirDocumento_TutorAcademico_DocumentoEstudiante_LanzaNegocioException() {
        DocumentoResubirDto dto = new DocumentoResubirDto("/archivos/cv_nuevo.pdf", "cv_nuevo.pdf");
        when(documentoRepository.findById(100L)).thenReturn(Optional.of(documentoMock));

        assertThrows(NegocioException.class, () -> documentoService.resubirDocumento(100L, dto, tutorAcademicoMock));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException si el tutor academico no esta asignado al estudiante")
    void resubirDocumento_TutorAcademico_NoAsignado_LanzaNegocioException() {
        DocumentoPortafolio docSeguimiento = new DocumentoPortafolio();
        docSeguimiento.setId(101L);
        docSeguimiento.setEstudiante(estudianteMock);
        docSeguimiento.setTipo(TipoDocumento.SEGUIMIENTO_TA);

        Usuario otroTutor = new Usuario();
        otroTutor.setId(99L);
        otroTutor.setRol(RolUsuario.TUTOR_ACADEMICO);

        AsignacionPractica asignacion = new AsignacionPractica();
        asignacion.setId(50L);
        asignacion.setTutorAcademico(otroTutor);
        docSeguimiento.setAsignacion(asignacion);

        DocumentoResubirDto dto = new DocumentoResubirDto("/archivos/nuevo.pdf", "nuevo.pdf");
        when(documentoRepository.findById(101L)).thenReturn(Optional.of(docSeguimiento));

        assertThrows(NegocioException.class, () -> documentoService.resubirDocumento(101L, dto, tutorAcademicoMock));
    }

    @Test
    @DisplayName("Debe lanzar NegocioException si el estudiante intenta resubir documento de tutor")
    void resubirDocumento_Estudiante_DocumentoTutor_LanzaNegocioException() {
        DocumentoPortafolio docSeguimiento = new DocumentoPortafolio();
        docSeguimiento.setId(101L);
        docSeguimiento.setEstudiante(estudianteMock);
        docSeguimiento.setTipo(TipoDocumento.SEGUIMIENTO_TA);

        DocumentoResubirDto dto = new DocumentoResubirDto("/archivos/nuevo.pdf", "nuevo.pdf");
        when(documentoRepository.findById(101L)).thenReturn(Optional.of(docSeguimiento));

        assertThrows(NegocioException.class, () -> documentoService.resubirDocumento(101L, dto, estudianteMock));
    }

    @Test
    @DisplayName("Debe subir documento portafolio nuevo exitosamente")
    void subirDocumentoPortafolio_Nuevo_Exitoso() {
        DocumentoSubirDto dto = new DocumentoSubirDto(10L, TipoDocumento.DOCUMENTO_IDENTIDAD, "/archivos/cedula.pdf", "cedula.pdf");

        when(usuarioRepository.findById(10L)).thenReturn(Optional.of(estudianteMock));
        when(documentoRepository.findByEstudianteIdOrderByIdDesc(10L)).thenReturn(new ArrayList<>());
        when(documentoRepository.save(any(DocumentoPortafolio.class))).thenAnswer(i -> {
            DocumentoPortafolio d = i.getArgument(0);
            d.setId(200L);
            return d;
        });
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(coordinadorMock));

        DocumentoPortafolioDto resultado = documentoService.subirDocumentoPortafolio(dto);

        assertNotNull(resultado);
        assertEquals(200L, resultado.id());
        assertEquals(TipoDocumento.DOCUMENTO_IDENTIDAD, resultado.tipo());
        assertEquals(EstadoDocumento.PENDIENTE_REVISION, resultado.estado());
        assertFalse(resultado.firmado());

        verify(documentoRepository).save(any(DocumentoPortafolio.class));
        verify(notificacionService).enviar(eq(coordinadorMock), any(String.class), any(String.class), eq(TipoNotificacion.INFORMACION), any(String.class));
    }

    @Test
    @DisplayName("Debe lanzar RecursoNoEncontradoException si el estudiante no existe al subir documento")
    void subirDocumentoPortafolio_EstudianteNoEncontrado() {
        DocumentoSubirDto dto = new DocumentoSubirDto(999L, TipoDocumento.CV, "/archivos/cv.pdf", "cv.pdf");
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> documentoService.subirDocumentoPortafolio(dto));
    }

    @Test
    @DisplayName("filtrarDocumentosPorRol - Oculta observaciones de docs 4, 5 y 6 para ESTUDIANTE, DC y SUB, pero las mantiene para TA y CPP")
    void filtrarDocumentosPorRol_ReglasObservaciones() {
        DocumentoPortafolioDto docCv = new DocumentoPortafolioDto(
                1L, 10L, 50L, TipoDocumento.CV, "cv.pdf", "/archivos/cv.pdf", false, EstadoDocumento.RECHAZADO, "Foto borrosa", LocalDateTime.now()
        );
        DocumentoPortafolioDto docSeguimiento = new DocumentoPortafolioDto(
                2L, 10L, 50L, TipoDocumento.SEGUIMIENTO_TA, "seguimiento.pdf", "/archivos/seg.pdf", false, EstadoDocumento.RECHAZADO, "Faltan firmas", LocalDateTime.now()
        );
        DocumentoPortafolioDto docInforme = new DocumentoPortafolioDto(
                3L, 10L, 50L, TipoDocumento.INFORME_FINAL, "informe.pdf", "/archivos/inf.pdf", false, EstadoDocumento.RECHAZADO, "Corregir formato", LocalDateTime.now()
        );
        DocumentoPortafolioDto docCertificado = new DocumentoPortafolioDto(
                4L, 10L, 50L, TipoDocumento.CERTIFICADO_CUMPLIMIENTO, "cert.pdf", "/archivos/cert.pdf", false, EstadoDocumento.RECHAZADO, "Falta sello", LocalDateTime.now()
        );

        List<DocumentoPortafolioDto> docs = List.of(docCv, docSeguimiento, docInforme, docCertificado);

        // Para DIRECTOR_CARRERA: observaciones de 4, 5 y 6 deben ser null, doc 1 conserva observacion
        List<DocumentoPortafolioDto> paraDc = documentoService.filtrarDocumentosPorRol(docs, RolUsuario.DIRECTOR_CARRERA);
        assertEquals("Foto borrosa", paraDc.get(0).observacion());
        assertNull(paraDc.get(1).observacion());
        assertNull(paraDc.get(2).observacion());
        assertNull(paraDc.get(3).observacion());

        // Para SUBDECANO: observaciones de 4, 5 y 6 deben ser null
        List<DocumentoPortafolioDto> paraSub = documentoService.filtrarDocumentosPorRol(docs, RolUsuario.SUBDECANO);
        assertEquals("Foto borrosa", paraSub.get(0).observacion());
        assertNull(paraSub.get(1).observacion());
        assertNull(paraSub.get(2).observacion());
        assertNull(paraSub.get(3).observacion());

        // Para ESTUDIANTE: observaciones de 4, 5 y 6 deben ser null
        List<DocumentoPortafolioDto> paraEst = documentoService.filtrarDocumentosPorRol(docs, RolUsuario.ESTUDIANTE);
        assertEquals("Foto borrosa", paraEst.get(0).observacion());
        assertNull(paraEst.get(1).observacion());
        assertNull(paraEst.get(2).observacion());
        assertNull(paraEst.get(3).observacion());

        // Para TUTOR_ACADEMICO: mantiene todas las observaciones
        List<DocumentoPortafolioDto> paraTa = documentoService.filtrarDocumentosPorRol(docs, RolUsuario.TUTOR_ACADEMICO);
        assertEquals("Faltan firmas", paraTa.get(1).observacion());
        assertEquals("Corregir formato", paraTa.get(2).observacion());
        assertEquals("Falta sello", paraTa.get(3).observacion());

        // Para COORDINADOR_PRACTICAS: mantiene todas las observaciones
        List<DocumentoPortafolioDto> paraCpp = documentoService.filtrarDocumentosPorRol(docs, RolUsuario.COORDINADOR_PRACTICAS);
        assertEquals("Faltan firmas", paraCpp.get(1).observacion());
        assertEquals("Corregir formato", paraCpp.get(2).observacion());
        assertEquals("Falta sello", paraCpp.get(3).observacion());
    }
}
