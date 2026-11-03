package com.uce.api_pp_uce.controllers;

import com.uce.api_pp_uce.entities.Usuario;
import com.uce.api_pp_uce.enums.RolUsuario;
import com.uce.api_pp_uce.repositories.UsuarioRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "COORDINADOR_PRACTICAS")
public class UsuarioControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private JavaMailSender mailSender;

    private Usuario usuarioPrueba;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        usuarioRepository.deleteAll();

        MimeMessage mensajeMime = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mensajeMime);

        Usuario usuario = new Usuario();
        usuario.setCorreo("admin@uce.edu.ec");
        usuario.setClaveHash(BCrypt.hashpw("admin123", BCrypt.gensalt()));
        usuario.setNombres("Admin");
        usuario.setApellidos("Sistema");
        usuario.setIdentificacion("1700000001");
        usuario.setRol(RolUsuario.COORDINADOR_PRACTICAS);
        usuarioPrueba = usuarioRepository.save(usuario);
    }

    @Test
    void testContextoCargaCorrectamente() {
        assertNotNull(mockMvc);
        assertEquals(1, usuarioRepository.count());
    }

    @Test
    @DisplayName("Deberia reenviar correo de activacion exitosamente por ID de usuario")
    void testReenviarActivacionExitoso() throws Exception {
        mockMvc.perform(post("/usuarios/{id}/reenviar-activacion", usuarioPrueba.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Correo de activación reenviado exitosamente"));
    }

    @Test
    @DisplayName("Deberia actualizar telefono de perfil exitosamente mediante PATCH /usuarios/{id}/perfil")
    void testActualizarPerfilExitoso() throws Exception {
        String jsonCuerpo = """
            {
                "telefono": "0991234567"
            }
            """;

        mockMvc.perform(patch("/usuarios/{id}/perfil", usuarioPrueba.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonCuerpo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.mensaje").value("Perfil actualizado exitosamente"))
                .andExpect(jsonPath("$.data.telefono").value("0991234567"));
    }
}
