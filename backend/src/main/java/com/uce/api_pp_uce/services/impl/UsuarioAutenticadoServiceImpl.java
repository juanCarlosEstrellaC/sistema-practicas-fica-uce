package com.uce.api_pp_uce.services.impl;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import com.uce.api_pp_uce.security.DetallesUsuarioImpl;
import com.uce.api_pp_uce.services.UsuarioAutenticadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioAutenticadoServiceImpl implements UsuarioAutenticadoService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public Usuario obtenerUsuarioLogueado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof DetallesUsuarioImpl detalles) {
            return detalles.getUsuario();
        }

        if (principal instanceof UserDetails userDetails) {
            return usuarioRepository.findByCorreo(userDetails.getUsername()).orElse(null);
        }

        String nombreUsuario = auth.getName();
        if (nombreUsuario != null && !nombreUsuario.isBlank()) {
            return usuarioRepository.findByCorreo(nombreUsuario).orElse(null);
        }

        return null;
    }
}
