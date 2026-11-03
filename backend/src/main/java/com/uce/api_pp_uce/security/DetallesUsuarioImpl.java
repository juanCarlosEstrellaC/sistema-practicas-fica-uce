package com.uce.api_pp_uce.security;

import com.uce.api_pp_uce.entities.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class DetallesUsuarioImpl implements UserDetails {

    private final Usuario usuario;

    public DetallesUsuarioImpl(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Mapear el rol a un GrantedAuthority de Spring Security
        // Ej: "DIRECTOR_CARRERA" -> "ROLE_DIRECTOR_CARRERA"
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()));
    }

    @Override
    public String getPassword() {
        return usuario.getClaveHash();
    }

    @Override
    public String getUsername() {
        // Usamos el correo como el username para el login
        return usuario.getCorreo();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        if (usuario.getRol() == com.uce.api_pp_uce.enums.RolUsuario.ESTUDIANTE) {
            return true;
        }
        return usuario.getEstado() != com.uce.api_pp_uce.enums.EstadoUsuario.INACTIVO;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !usuario.isBorrado();
    }

    public Usuario getUsuario() {
        return usuario;
    }
}
