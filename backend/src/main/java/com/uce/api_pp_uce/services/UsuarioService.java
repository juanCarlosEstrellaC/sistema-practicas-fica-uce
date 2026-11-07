package com.uce.api_pp_uce.services;

import com.uce.api_pp_uce.dtos.ActualizarPerfilDto;
import com.uce.api_pp_uce.dtos.TutorResumenDto;
import com.uce.api_pp_uce.dtos.UsuarioDto;
import com.uce.api_pp_uce.dtos.auth.CambiarContraseniaDto;
import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.enums.EstadoUsuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UsuarioService {
    Page<UsuarioDto> buscarTodos(Pageable pageable);
    Page<UsuarioDto> buscarConFiltros(String search, RolUsuario rol, Integer carreraId, Integer sinAsignacionEnPeriodoId, EstadoUsuario estado, Pageable pageable);
    UsuarioDto buscarPorId(Long id);
    List<TutorResumenDto> obtenerResumenTutores(Integer carreraId, String search, Long periodoId);
    UsuarioDto login(LoginDto request);
    UsuarioDto crear(UsuarioDto dto);
    UsuarioDto actualizar(Long id, UsuarioDto dto);
    UsuarioDto actualizarPerfil(Long id, ActualizarPerfilDto dto);
    void eliminar(Long id);
    List<UsuarioDto> cargaMasivaCsv(MultipartFile archivo);
    void cambiarContrasenia(Long id, CambiarContraseniaDto dto);
    boolean validarContrasenia(Long id, String contrasenia);
    void actualizarAvatar(Long id, String urlAvatar);
    String subirAvatar(Long id, MultipartFile file);
    void reenviarTokenActivacion(Long id);
    UsuarioDto transferirSubdecanato(Long nuevoSubdecanoId);
}
