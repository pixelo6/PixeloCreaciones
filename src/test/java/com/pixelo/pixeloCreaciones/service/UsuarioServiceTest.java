package com.pixelo.pixeloCreaciones.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pixelo.pixeloCreaciones.model.Usuario;
import com.pixelo.pixeloCreaciones.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void testValidarYCambiarPassword_UsuarioNoEncontrado() {
        when(usuarioRepository.findAll()).thenReturn(List.of());
        String resultado = usuarioService.validarYCambiarPassword("inexistente@pixelo.com", "123456", "nueva123");
        assertEquals("ERROR_USUARIO_NO_ENCONTRADO", resultado);
    }

    @Test
    void testValidarYCambiarPassword_CodigoExitoso() {
        Usuario u = new Usuario();
        u.setCorreoElectronico("test@pixelo.com");
        u.setCodigoRecuperacion("123456");
        u.setExpiracionCodigo(LocalDateTime.now().plusMinutes(5));
        
        when(usuarioRepository.findAll()).thenReturn(List.of(u));

        String resultado = usuarioService.validarYCambiarPassword("test@pixelo.com", "123456", "nuevaPassword123");

        assertEquals("OK", resultado);
        assertEquals("nuevaPassword123", u.getContrasena());
    }

    @Test
    void testValidarYCambiarPassword_CodigoExpirado() {
        Usuario u = new Usuario();
        u.setCorreoElectronico("test@pixelo.com");
        u.setCodigoRecuperacion("123456");
        u.setExpiracionCodigo(LocalDateTime.now().minusMinutes(10));
        
        when(usuarioRepository.findAll()).thenReturn(List.of(u));

        String resultado = usuarioService.validarYCambiarPassword("test@pixelo.com", "123456", "nueva123");

        assertEquals("ERROR_CODIGO_EXPIRADO", resultado);
    }

    @Test
    @SuppressWarnings("null")
    void testGuardarUsuario_AsignaCarteraPuntosInicial() {
        Usuario usuario = new Usuario();
        usuario.setNombreUsuario("TestUser");
        usuario.setCorreoElectronico("test@pixelo.com");
        
        when(usuarioRepository.save(any(Usuario.class)))
            .thenAnswer(invocation -> (Usuario) invocation.getArgument(0));

        Usuario usuarioGuardado = usuarioService.guardarUsuario(usuario);

        assertNotNull(usuarioGuardado.getCarteraPuntos(), "El usuario debería tener una cartera creada");
        assertEquals(0, usuarioGuardado.getCarteraPuntos().getPuntosAcumulados(), "La cartera debería iniciar en 0 puntos");
        assertEquals(usuarioGuardado, usuarioGuardado.getCarteraPuntos().getUsuario(), "La cartera debe estar vinculada al usuario");
    }
}