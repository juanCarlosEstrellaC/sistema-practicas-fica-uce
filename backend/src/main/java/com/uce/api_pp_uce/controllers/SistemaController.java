package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.common.RespuestaApi;
import com.uce.api_pp_uce.services.SistemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sistema")
@RequiredArgsConstructor
@Profile("dev")
public class SistemaController {

    private final SistemaService sistemaService;

    @PostMapping("/reiniciar")
    @PreAuthorize("hasRole('SUBDECANO')")
    public ResponseEntity<RespuestaApi<Void>> reiniciarSistema() {
        sistemaService.reiniciarSistema();
        return ResponseEntity.ok(new RespuestaApi<>(true, "Sistema y archivos reiniciados correctamente", null));
    }
}
