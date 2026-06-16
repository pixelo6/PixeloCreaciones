package com.pixelo.pixeloCreaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import com.pixelo.pixeloCreaciones.model.Pedido;
import java.util.List; 

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Usamos @EntityGraph para traer 'detalles' y 'producto' en una sola consulta
    // Esto previene el LazyInitializationException en EmailService
    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    Pedido findByBuyOrder(String buyOrder);
    
    // Método para buscar pedidos por usuario
    List<Pedido> findByUsuarioId(Long usuarioId);
}