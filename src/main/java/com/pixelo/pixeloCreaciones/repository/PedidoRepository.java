package com.pixelo.pixeloCreaciones.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import com.pixelo.pixeloCreaciones.model.Pedido;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    Pedido findByBuyOrder(String buyOrder);

    @EntityGraph(attributePaths = {"detalles", "detalles.producto", "usuario"})
    List<Pedido> findAll();

    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    List<Pedido> findByUsuarioId(Long usuarioId);
}