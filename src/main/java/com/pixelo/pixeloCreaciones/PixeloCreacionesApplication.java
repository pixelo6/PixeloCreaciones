package com.pixelo.pixeloCreaciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.pixelo.pixeloCreaciones"}) 
public class PixeloCreacionesApplication {
    public static void main(String[] args) {
        SpringApplication.run(PixeloCreacionesApplication.class, args);
    }
}