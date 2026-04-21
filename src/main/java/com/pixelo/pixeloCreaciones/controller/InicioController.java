package com.pixelo.pixeloCreaciones.controller; // Define la ubicación exacta según la carpeta

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InicioController {

    @GetMapping("/")
    public String inicio() {
        // Este endpoint servirá para que Render verifique que la app está "viva"
        return "Servidor de Pixelo Creaciones: Estructura validada y operativa.";
    }
}