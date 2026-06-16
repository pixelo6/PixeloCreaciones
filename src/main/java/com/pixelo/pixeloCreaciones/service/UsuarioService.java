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

    // Retorna todos los usuarios existentes en la base de datos
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Busca y retorna un usuario según su identificador único
    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // Registra un nuevo usuario en el sistema y le asigna una cartera de puntos inicial en cero
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

    // Actualiza la información de un usuario existente reemplazando sus datos anteriores
    @Transactional
    public Usuario actualizarUsuario(Long id, Usuario detalles) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombreUsuario(detalles.getNombreUsuario());
            usuario.setCorreoElectronico(detalles.getCorreoElectronico());
            usuario.setRol(detalles.getRol());
            
            // Solo se actualiza la contraseña si se proporciona una nueva cadena válida
            if (detalles.getContrasena() != null && !detalles.getContrasena().isEmpty()) {
                usuario.setContrasena(detalles.getContrasena());
            }

            // Mantiene la sincronización de los puntos acumulados en la cartera asociada
            if (detalles.getCarteraPuntos() != null && usuario.getCarteraPuntos() != null) {
                usuario.getCarteraPuntos().setPuntosAcumulados(
                    detalles.getCarteraPuntos().getPuntosAcumulados()
                );
            }

            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Elimina un registro de usuario de forma permanente
    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    // --- LÓGICA DE RECUPERACIÓN DE CONTRASEÑA ---

    // Genera un código de seis dígitos, establece su expiración y lo envía por correo electrónico
    @Transactional
    public void iniciarRecuperacion(String email) {
        // Se utiliza email.equals() para prevenir errores fatales si el getCorreoElectronico() devuelve nulo
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

    // Valida rigurosamente la solicitud de cambio de clave antes de persistir la nueva información
    @Transactional
    public String validarYCambiarPassword(String email, String codigo, String nuevaPassword) {
        // Se busca al usuario de forma segura evitando excepciones de punteros nulos
        Usuario usuario = usuarioRepository.findAll().stream()
            .filter(u -> email.equals(u.getCorreoElectronico()))
            .findFirst()
            .orElse(null);

        if (usuario == null) {
            return "ERROR_USUARIO_NO_ENCONTRADO";
        }
        
        // Verifica que exista un código activo y que el tiempo límite no haya sido superado
        if (usuario.getExpiracionCodigo() == null || usuario.getExpiracionCodigo().isBefore(LocalDateTime.now())) {
            return "ERROR_CODIGO_EXPIRADO";
        }
        
        // Compara el código recibido con el almacenado garantizando coincidencias exactas
        if (codigo == null || !codigo.equals(usuario.getCodigoRecuperacion())) {
            return "ERROR_CODIGO_INCORRECTO";
        }

        // Filtro de seguridad que impide la creación de contraseñas vacías o compuestas por espacios
        if (nuevaPassword == null || nuevaPassword.trim().isEmpty()) {
            return "ERROR_PASSWORD_VACIA";
        }
        
        // Aplica el cambio y limpia los datos temporales de recuperación para inhabilitar el código usado
        usuario.setContrasena(nuevaPassword);
        usuario.setCodigoRecuperacion(null);
        usuario.setExpiracionCodigo(null);
        usuarioRepository.save(usuario);
        
        return "OK";
    }
}