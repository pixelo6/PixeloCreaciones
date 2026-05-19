package com.pixelo.pixeloCreaciones.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

    // Lista todos los usuarios registrados
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Busca un usuario específico por su ID
    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // Registra un nuevo usuario e inicializa su cartera de puntos (Relación 1:1)
    @Transactional
    public Usuario guardarUsuario(Usuario usuario) {
        // Si es un usuario nuevo (no tiene ID), le creamos su cartera
        if (usuario.getId() == null) {
            CarteraPuntos nuevaCartera = new CarteraPuntos();
            nuevaCartera.setPuntosAcumulados(0); // Inicia en 0 según diseño
            nuevaCartera.setUsuario(usuario);
            usuario.setCarteraPuntos(nuevaCartera);
        }
        return usuarioRepository.save(usuario);
    }

    // Actualiza los datos de un usuario existente
    @Transactional // AÑADIDO: Crucial para guardar datos en tablas anidadas
    public Usuario actualizarUsuario(Long id, Usuario detalles) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombreUsuario(detalles.getNombreUsuario());
            usuario.setCorreoElectronico(detalles.getCorreoElectronico());
            usuario.setRol(detalles.getRol());
            
            // La contraseña solo se actualiza si viene en el envío
            if (detalles.getContrasena() != null && !detalles.getContrasena().isEmpty()) {
                usuario.setContrasena(detalles.getContrasena());
            }

            // AÑADIDO: Sincronización de la Cartera de Puntos para MySQL
            if (detalles.getCarteraPuntos() != null && usuario.getCarteraPuntos() != null) {
                usuario.getCarteraPuntos().setPuntosAcumulados(
                    detalles.getCarteraPuntos().getPuntosAcumulados()
                );
            }

            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Elimina un usuario y su cartera asociada (CascadeType.ALL se encarga de la cartera)
    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }
}