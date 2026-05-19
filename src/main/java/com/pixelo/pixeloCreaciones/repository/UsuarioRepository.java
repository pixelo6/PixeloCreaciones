package com.pixelo.pixeloCreaciones.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pixelo.pixeloCreaciones.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método para buscar por nombre de usuario, útil para el futuro login
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
}