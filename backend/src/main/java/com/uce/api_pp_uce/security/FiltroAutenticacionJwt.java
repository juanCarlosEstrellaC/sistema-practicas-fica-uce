package com.uce.api_pp_uce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class FiltroAutenticacionJwt extends OncePerRequestFilter {

    private final UtilidadesJwt utilidadesJwt;
    private final UserDetailsService servicioDetallesUsuario;

    @Override
    protected void doFilterInternal(HttpServletRequest peticion, HttpServletResponse respuesta, FilterChain cadenaFiltros) throws ServletException, IOException {
        final String cabeceraAuth = peticion.getHeader("Authorization");
        final String jwt;
        final String correo;

        if (cabeceraAuth == null || !cabeceraAuth.startsWith("Bearer ")) {
            cadenaFiltros.doFilter(peticion, respuesta);
            return;
        }

        jwt = cabeceraAuth.substring(7);
        try {
            correo = utilidadesJwt.extraerCorreo(jwt);
            
            if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails detallesUsuario = this.servicioDetallesUsuario.loadUserByUsername(correo);
                
                if (detallesUsuario.isEnabled() && detallesUsuario.isAccountNonLocked() && utilidadesJwt.validarToken(jwt, detallesUsuario)) {
                    UsernamePasswordAuthenticationToken tokenAutenticacion = new UsernamePasswordAuthenticationToken(
                            detallesUsuario,
                            null,
                            detallesUsuario.getAuthorities()
                    );
                    tokenAutenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(peticion));
                    SecurityContextHolder.getContext().setAuthentication(tokenAutenticacion);
                }
            }
        } catch (Exception e) {
            // Si el token es invalido o expiro, simplemente no autentica
            // y la excepcion es ignorada, dejando que la peticion siga sin usuario.
        }
        
        cadenaFiltros.doFilter(peticion, respuesta);
    }
}
