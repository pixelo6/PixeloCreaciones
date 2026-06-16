package com.pixelo.pixeloCreaciones.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pixelo.pixeloCreaciones.dto.ItemCarroDTO;
import com.pixelo.pixeloCreaciones.dto.PedidoRequestDTO;
import com.pixelo.pixeloCreaciones.model.*;
import com.pixelo.pixeloCreaciones.repository.*;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Pedido registrarPedido(PedidoRequestDTO dto, String buyOrder) {
        Pedido pedido = new Pedido();
        pedido.setBuyOrder(buyOrder); // Asignamos el código aquí
        pedido.setEstado("PENDIENTE");

        if (dto.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            pedido.setUsuario(usuario);
        } else {
            pedido.setCorreoInvitado(dto.getCorreoInvitado());
        }

        int totalAcumulado = 0;
        List<DetallePedido> detalles = new ArrayList<>();

        for (ItemCarroDTO itemDto : dto.getItems()) {
            Producto producto = productoRepository.findById(itemDto.getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            // Lógica de stock y creación de detalles...
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(itemDto.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            
            detalles.add(detalle);
            totalAcumulado += (producto.getPrecio() * itemDto.getCantidad());
        }

        pedido.setTotal(totalAcumulado);
        pedido.setDetalles(detalles);
        return pedidoRepository.save(pedido); // Se guarda en BD ANTES del pago
    }
    
    @Transactional
    public Pedido confirmarPagoYDescontarStock(String buyOrder) {
        // Buscamos el pedido por su código de Transbank
        Pedido pedido = pedidoRepository.findByBuyOrder(buyOrder);
        
        // Verificamos que exista y que NO esté pagado ya (para evitar descontar el stock dos veces)
        if (pedido != null && !"PAGADO".equals(pedido.getEstado())) {
            pedido.setEstado("PAGADO");
            
            // Gracias a @Transactional, podemos recorrer los detalles sin que la BD nos desconecte
            for (DetallePedido detalle : pedido.getDetalles()) {
                Producto producto = detalle.getProducto();
                int nuevoStock = producto.getStock() - detalle.getCantidad();
                
                // Aseguramos que el inventario jamás quede en negativo
                producto.setStock(Math.max(0, nuevoStock));
                productoRepository.save(producto);
            }
            
            return pedidoRepository.save(pedido);
        }
        return pedido;
    }
}