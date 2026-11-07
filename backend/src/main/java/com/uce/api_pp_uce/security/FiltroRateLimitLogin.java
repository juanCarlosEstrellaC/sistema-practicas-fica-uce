package com.uce.api_pp_uce.security;

import com.uce.api_pp_uce.common.Utilitarios;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class FiltroRateLimitLogin extends OncePerRequestFilter {

    private final ServicioRateLimitIp servicioRateLimitIp;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("POST".equalsIgnoreCase(request.getMethod()) && esRutaLogin(request)) {
            String ipCliente = Utilitarios.obtenerIpCliente(request);
            if (!servicioRateLimitIp.intentarConsumir(ipCliente)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", "60");
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"exito\":false,\"mensaje\":\"Demasiados intentos de inicio de sesion desde esta direccion IP. Por favor espere 1 minuto.\",\"data\":null}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean esRutaLogin(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri != null && (uri.endsWith("/auth/login") || uri.endsWith("/auth/login/"));
    }
}
