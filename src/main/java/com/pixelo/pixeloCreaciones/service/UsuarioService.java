package com.pixelo.pixeloCreaciones.service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pixelo.pixeloCreaciones.model.CarteraPuntos;
import com.pixelo.pixeloCreaciones.model.Usuario;
import com.pixelo.pixeloCreaciones.repository.UsuarioRepository;

@Service
@SuppressWarnings("null")
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JavaMailSender mailSender;

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional
    public Usuario guardarUsuario(Usuario usuario) {
        if (usuario.getId() == null) {
            CarteraPuntos nuevaCartera = new CarteraPuntos();
            nuevaCartera.setPuntosAcumulados(0);
            nuevaCartera.setUsuario(usuario);
            usuario.setCarteraPuntos(nuevaCartera);
        }
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizarUsuario(Long id, Usuario detalles) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombreUsuario(detalles.getNombreUsuario());
            usuario.setCorreoElectronico(detalles.getCorreoElectronico());
            usuario.setRol(detalles.getRol());
            
            if (detalles.getContrasena() != null && !detalles.getContrasena().isEmpty()) {
                usuario.setContrasena(detalles.getContrasena());
            }

            if (detalles.getCarteraPuntos() != null && usuario.getCarteraPuntos() != null) {
                usuario.getCarteraPuntos().setPuntosAcumulados(
                    detalles.getCarteraPuntos().getPuntosAcumulados()
                );
            }

            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public void iniciarRecuperacion(String email) {
        Usuario usuario = usuarioRepository.findAll().stream()
            .filter(u -> email.equals(u.getCorreoElectronico()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String codigo = String.format("%06d", new java.util.Random().nextInt(1000000));
        usuario.setCodigoRecuperacion(codigo);
        usuario.setExpiracionCodigo(LocalDateTime.now().plusMinutes(10));
        
        usuarioRepository.save(usuario);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Código de Recuperación de Contraseña - Pixelo");
        message.setText("Hola,\n\nTu código de recuperación es: " + codigo + "\nEste código expira en 10 minutos.");
        mailSender.send(message);
    }

    @Transactional
    public String validarYCambiarPassword(String email, String codigo, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findAll().stream()
            .filter(u -> email.equals(u.getCorreoElectronico()))
            .findFirst()
            .orElse(null);

        if (usuario == null) {
            return "ERROR_USUARIO_NO_ENCONTRADO";
        }
        
        if (usuario.getExpiracionCodigo() == null || usuario.getExpiracionCodigo().isBefore(LocalDateTime.now())) {
            return "ERROR_CODIGO_EXPIRADO";
        }
        
        if (codigo == null || !codigo.equals(usuario.getCodigoRecuperacion())) {
            return "ERROR_CODIGO_INCORRECTO";
        }

        if (nuevaPassword == null || nuevaPassword.trim().isEmpty()) {
            return "ERROR_PASSWORD_VACIA";
        }
        
        usuario.setContrasena(nuevaPassword);
        usuario.setCodigoRecuperacion(null);
        usuario.setExpiracionCodigo(null);
        usuarioRepository.save(usuario);
        
        return "OK";
    }
}