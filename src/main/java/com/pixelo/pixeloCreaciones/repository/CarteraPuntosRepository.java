package com.pixelo.pixeloCreaciones.repository;

import com.pixelo.pixeloCreaciones.model.CarteraPuntos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarteraPuntosRepository extends JpaRepository<CarteraPuntos, Long> {
    CarteraPuntos findByUsuarioId(Long usuarioId);
}