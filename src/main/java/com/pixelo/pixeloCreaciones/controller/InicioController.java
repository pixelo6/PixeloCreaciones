package com.pixelo.pixeloCreaciones.controller; // Define la ubicación exacta según la carpeta

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InicioController {

    @GetMapping("/estado-servidor")
    public String inicio() {
        return "Servidor de Pixelo Creaciones: Estructura validada y operativa.";
    }
}