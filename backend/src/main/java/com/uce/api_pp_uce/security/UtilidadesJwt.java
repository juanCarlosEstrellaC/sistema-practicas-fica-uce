package com.uce.api_pp_uce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Component
public class UtilidadesJwt {

    // Se recomienda que la clave sea de al menos 256 bits (32 caracteres)
    @Value("${jwt.secret}")
    private String secreto;

    // 8 horas en milisegundos (estandar solicitado)
    @Value("${jwt.expiration:28800000}")
    private long expiracionJwtMs;

    @Value("${jwt.issuer:api_pp_uce}")
    private String emisor;

    @Value("${jwt.audience:ppp_uce}")
    private String audiencia;

    private SecretKey obtenerClaveFirma() {
        byte[] bytesClave = secreto.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(bytesClave);
    }

    public String generarToken(UserDetails detallesUsuario) {
        Long versionToken = ((DetallesUsuarioImpl) detallesUsuario).getUsuario().getVersionToken();
        if (versionToken == null) {
            versionToken = 0L;
        }
        return Jwts.builder()
                .issuer(emisor)
                .audience().add(audiencia).and()
                .subject(detallesUsuario.getUsername())
                .claim("versionToken", versionToken)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiracionJwtMs))
                .signWith(obtenerClaveFirma())
                .compact();
    }

    public String extraerCorreo(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public Long extraerVersionToken(String token) {
        return extraerClaim(token, claims -> claims.get("versionToken", Long.class));
    }

    public Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClaveFirma())
                .requireIssuer(emisor)
                .requireAudience(audiencia)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean estaExpiradoToken(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    public boolean validarToken(String token, UserDetails detallesUsuario) {
        final String correo = extraerCorreo(token);
        Long versionTokenJwt = extraerVersionToken(token);
        if (versionTokenJwt == null) {
            versionTokenJwt = 0L;
        }
        Long versionTokenBd = ((DetallesUsuarioImpl) detallesUsuario).getUsuario().getVersionToken();
        if (versionTokenBd == null) {
            versionTokenBd = 0L;
        }
        
        return (correo.equals(detallesUsuario.getUsername()) 
                && !estaExpiradoToken(token)
                && versionTokenJwt.equals(versionTokenBd));
    }
}
