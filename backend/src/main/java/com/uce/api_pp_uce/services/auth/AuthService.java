package com.uce.api_pp_uce.services.auth;

import com.uce.api_pp_uce.dtos.auth.LoginDto;
import com.uce.api_pp_uce.dtos.auth.RespuestaAuthDto;
import com.uce.api_pp_uce.dtos.auth.RestaurarContraseniaDto;
import com.uce.api_pp_uce.entities.Usuario;

public interface AuthService {
    RespuestaAuthDto login(LoginDto peticion);
    void solicitarRestaurarContrasenia(String correo);
    void restaurarContrasenia(RestaurarContraseniaDto peticion);
    void enviarTokenActivacion(Usuario usuario);
    void activarCuenta(RestaurarContraseniaDto peticion);
}
