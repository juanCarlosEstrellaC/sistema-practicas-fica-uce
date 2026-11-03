package com.uce.api_pp_uce.services.pp.impl;

import com.uce.api_pp_uce.enums.RolUsuario;

import com.uce.api_pp_uce.entities.Carrera;
import com.uce.api_pp_uce.entities.pp.Observacion;
import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.pp.EstadoObservacion;
import com.uce.api_pp_uce.enums.TipoNotificacion;
import com.uce.api_pp_uce.enums.pp.TipoObservacion;
import com.uce.api_pp_uce.excepciones.RecursoNoEncontradoException;
import com.uce.api_pp_uce.dtos.pp.NuevaObservacionDto;
import com.uce.api_pp_uce.dtos.pp.ObservacionDto;
import com.uce.api_pp_uce.mapeadores.pp.ObservacionMapeador;
import com.uce.api_pp_uce.repositories.CarreraRepository;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.repositories.pp.ObservacionRepository;
import com.uce.api_pp_uce.services.NotificacionService;
import com.uce.api_pp_uce.services.pp.ObservacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ObservacionServiceImpl implements ObservacionService {

    private final ObservacionRepository observacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarreraRepository carreraRepository;
    private final NotificacionService notificacionService;
    private final ObservacionMapeador observacionMapeador;

    @Override
    @Transactional
    public ObservacionDto crearObservacion(NuevaObservacionDto dto) {
        Usuario remitente = usuarioRepository.findById(dto.remitenteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Remitente no encontrado"));
        
        Carrera carrera = carreraRepository.findById(dto.carreraId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrera no encontrada"));

        Observacion observacion = observacionMapeador.aEntidad(dto);
        observacion.setRemitente(remitente);
        observacion.setCarrera(carrera);
        observacion.setEstado(EstadoObservacion.PENDIENTE);

        observacion = observacionRepository.save(observacion);

        // Notificar al Subdecano
        Usuario subdecano = usuarioRepository.findFirstByRol(RolUsuario.SUBDECANO).orElse(null);
                
        String tituloSubdecano = dto.tipo() == TipoObservacion.ANULACION ? "Observacion de Anulación de Convenio" : "Nueva Observacion de Convenio";
        String mensajeSubdecano = dto.tipo() == TipoObservacion.ANULACION ?
                remitente.getNombres() + " " + remitente.getApellidos() + " ha sugerido anular el convenio con " + dto.empresa() :
                remitente.getNombres() + " " + remitente.getApellidos() + " ha sugerido a " + dto.empresa();

        if (subdecano != null) {
            enviarNotificacion(subdecano, 
                tituloSubdecano, 
                mensajeSubdecano,
                TipoNotificacion.INFORMACION, "/dashboard/practicas/convenios?subtab=observaciones&observacionId=" + observacion.getId() + "&abrirObservacion=true");
        }

        String tituloRemitente = "Observacion Enviada";
        String mensajeRemitente = dto.tipo() == TipoObservacion.ANULACION ?
                "Tu Observacion de anulación para " + dto.empresa() + " fue enviada al Subdecanato exitosamente." :
                "Tu Observacion para " + dto.empresa() + " fue enviada al Subdecanato exitosamente.";

        // Notificar al Remitente
        enviarNotificacion(remitente, 
            tituloRemitente, 
            mensajeRemitente,
            TipoNotificacion.EXITO, "/dashboard/practicas/convenios?subtab=observaciones&observacionId=" + observacion.getId() + "&abrirObservacion=true");

        return observacionMapeador.aDto(observacion);
    }

    @Override
    @Transactional
    public ObservacionDto crearObservacion(Long remitenteId, Integer carreraId, TipoObservacion tipo, String empresa, String contacto, String correo, String descripcion) {
        return crearObservacion(new NuevaObservacionDto(remitenteId, carreraId, tipo, empresa, contacto, correo, descripcion));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ObservacionDto> listarTodas(Long remitenteId, TipoObservacion tipo, EstadoObservacion estado, String busqueda, Pageable pageable) {
        return observacionRepository.findByFiltros(remitenteId, tipo, estado, busqueda, pageable)
                .map(observacionMapeador::aDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ObservacionDto obtenerPorId(Long id) {
        Observacion observacion = observacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Observacion no encontrada"));
        return observacionMapeador.aDto(observacion);
    }

    @Override
    @Transactional
    public ObservacionDto procesarObservacion(Long id, EstadoObservacion nuevoEstado, String motivoRechazo) {
        Observacion observacion = observacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Observacion no encontrada"));
        
        observacion.setEstado(nuevoEstado);
        
        if (nuevoEstado == EstadoObservacion.RECHAZADA && motivoRechazo != null && !motivoRechazo.trim().isEmpty()) {
            observacion.setDescripcion(observacion.getDescripcion() + "\n\nMotivo de rechazo: " + motivoRechazo);
        }
        
        String tipoMensaje = observacion.getTipo() == TipoObservacion.ANULACION ? "Observacion de anulación" : "Observacion";

        enviarNotificacion(observacion.getRemitente(), 
            "Estado de Observacion Actualizado", 
            "Tu " + tipoMensaje + " para " + observacion.getEmpresa() + " ha sido: " + nuevoEstado,
            nuevoEstado == EstadoObservacion.APROBADA ? TipoNotificacion.EXITO : TipoNotificacion.ADVERTENCIA, 
            "/dashboard/practicas/convenios?subtab=observaciones&observacionId=" + observacion.getId() + "&abrirObservacion=true");

        return observacionMapeador.aDto(observacionRepository.save(observacion));
    }

    private void enviarNotificacion(Usuario usuario, String titulo, String mensaje, TipoNotificacion tipo, String accionUrl) {
        notificacionService.enviar(usuario, titulo, mensaje, tipo, accionUrl);
    }
}
