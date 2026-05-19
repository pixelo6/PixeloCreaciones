package com.pixelo.pixeloCreaciones.controller;

import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelo.pixeloCreaciones.model.Usuario;
import com.pixelo.pixeloCreaciones.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    public Optional<Usuario> obtenerUsuario(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id);
    }

    @PostMapping(consumes = "application/json")
    public Usuario crearUsuario(@RequestBody String jsonCrudo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Usuario usuario = mapper.readValue(jsonCrudo, Usuario.class);
            return usuarioService.guardarUsuario(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Error al leer el JSON: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUsuario(@RequestBody Map<String, String> credenciales) {
        String correo = credenciales.get("correoElectronico");
        String contrasena = credenciales.get("contrasena");
        
        Optional<Usuario> usuarioValidado = usuarioService.listarUsuarios().stream()
            .filter(u -> u.getCorreoElectronico().equals(correo) && u.getContrasena().equals(contrasena))
            .findFirst();
            
        if (usuarioValidado.isPresent()) {
            return ResponseEntity.ok(usuarioValidado.get());
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario detalles) {
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, detalles);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}