package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.enums.EstadoUsuario;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.dtos.TutorResumenDto;
import com.uce.api_pp_uce.dtos.UsuarioDto;

import com.uce.api_pp_uce.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.uce.api_pp_uce.dtos.ActualizarPerfilDto;
import com.uce.api_pp_uce.dtos.auth.CambiarContraseniaDto;
import jakarta.validation.Valid;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<Page<UsuarioDto>>> listarUsuarios(
            @RequestParam(required = false, name = "search") String search,
            @RequestParam(required = false) RolUsuario rol,
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) Integer sinAsignacionEnPeriodoId,
            @RequestParam(required = false) EstadoUsuario estado,
            Pageable pageable) {
        Page<UsuarioDto> usuarios = usuarioService.buscarConFiltros(search, rol, carreraId, sinAsignacionEnPeriodoId, estado, pageable);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Usuarios obtenidos", usuarios));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS', 'ESTUDIANTE', 'TUTOR_ACADEMICO')")
    public ResponseEntity<RespuestaApi<UsuarioDto>> obtenerUsuario(@PathVariable Long id) {
        UsuarioDto usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Usuario obtenido", usuario));
    }

    @GetMapping("/tutores/resumen")
    @PreAuthorize("hasAnyRole('SUBDECANO', 'DIRECTOR_CARRERA', 'COORDINADOR_PRACTICAS')")
    public ResponseEntity<RespuestaApi<List<TutorResumenDto>>> obtenerResumenTutores(
            @RequestParam(required = false) Integer carreraId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long periodoId) {
        List<TutorResumenDto> tutores = usuarioService.obtenerResumenTutores(carreraId, search, periodoId);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Resumen de tutores obtenido", tutores));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<UsuarioDto>> crear(@Valid @RequestBody UsuarioDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RespuestaApi<>(true, "Usuario creado exitosamente", usuarioService.crear(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<UsuarioDto>> actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioDto dto) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Usuario actualizado", usuarioService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<Void>> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Usuario eliminado", null));
    }

    @PostMapping("/carga-masiva")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<List<UsuarioDto>>> cargaMasivaCsv(@RequestParam("archivo") MultipartFile archivo) {
        List<UsuarioDto> usuarios = usuarioService.cargaMasivaCsv(archivo);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Carga masiva completada exitosamente", usuarios));
    }

    @PutMapping("/{id}/cambiar-contrasenia")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<Void>> cambiarContrasenia(
            @PathVariable Long id,
            @Valid @RequestBody CambiarContraseniaDto dto) {
        usuarioService.cambiarContrasenia(id, dto);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Contraseña actualizada exitosamente", null));
    }

    @PostMapping("/{id}/reenviar-activacion")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<Void>> reenviarActivacion(@PathVariable Long id) {
        usuarioService.reenviarTokenActivacion(id);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Correo de activación reenviado exitosamente", null));
    }

    @PostMapping("/{id}/transferir-subdecanato")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<UsuarioDto>> transferirSubdecanato(@PathVariable Long id) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Cargo de Subdecano transferido exitosamente", usuarioService.transferirSubdecanato(id)));
    }

    @PostMapping("/{id}/validar-contrasenia")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<Boolean>> validarContrasenia(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        boolean valida = usuarioService.validarContrasenia(id, body.get("contrasenia"));
        if (!valida) {
            return ResponseEntity.badRequest().body(new RespuestaApi<>(false, "La contraseña actual es incorrecta", false));
        }
        return ResponseEntity.ok(new RespuestaApi<>(true, "Contraseña validada", true));
    }

    @PostMapping("/{id}/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<String>> subirAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String urlAvatar = usuarioService.subirAvatar(id, file);
        return ResponseEntity.ok(new RespuestaApi<>(true, "Avatar actualizado", urlAvatar));
    }

    @PatchMapping("/{id}/perfil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<UsuarioDto>> actualizarPerfil(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPerfilDto dto) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Perfil actualizado exitosamente", usuarioService.actualizarPerfil(id, dto)));
    }

    @PutMapping("/{id}/perfil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RespuestaApi<UsuarioDto>> actualizarPerfilPut(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPerfilDto dto) {
        return ResponseEntity.ok(new RespuestaApi<>(true, "Perfil actualizado exitosamente", usuarioService.actualizarPerfil(id, dto)));
    }
}
