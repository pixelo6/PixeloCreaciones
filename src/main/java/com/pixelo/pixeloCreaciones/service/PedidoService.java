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
        System.out.println("DEBUG: El ID de usuario que recibí es: " + dto.getUsuarioId());
        Pedido pedido = new Pedido();
        pedido.setBuyOrder(buyOrder);
        pedido.setEstado("PENDIENTE");

        // 1. ASIGNACIÓN DEL CORREO Y USUARIO
        if (dto.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getUsuarioId()).orElse(null);
            pedido.setUsuario(usuario);
            
            // Copia el correo del usuario registrado en la venta
            if (usuario != null) {
                pedido.setCorreoInvitado(usuario.getCorreoElectronico());
            }
        } else {
            // Si es invitado, guarda el correo que digitó a mano
            pedido.setCorreoInvitado(dto.getCorreoInvitado());
        }

        // 2. PROCESAMIENTO DE LOS PRODUCTOS DEL CARRO
        int totalAcumulado = 0;
        List<DetallePedido> detalles = new ArrayList<>();

        if (dto.getItems() != null) {
            for (ItemCarroDTO itemDto : dto.getItems()) {
                Producto producto = productoRepository.findById(itemDto.getId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                
                DetallePedido detalle = new DetallePedido();
                detalle.setPedido(pedido);
                detalle.setProducto(producto);
                detalle.setCantidad(itemDto.getCantidad());
                detalle.setPrecioUnitario(producto.getPrecio());
                
                detalles.add(detalle);
                totalAcumulado += (producto.getPrecio() * itemDto.getCantidad());
            }
        }

        pedido.setTotal(totalAcumulado);
        pedido.setDetalles(detalles);
        
        // Guardamos todo el pedido con sus productos y su correo al final
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido confirmarPagoYDescontarStock(String buyOrder) {
        Pedido pedido = pedidoRepository.findByBuyOrder(buyOrder);
        
        if (pedido != null && !"PAGADO".equals(pedido.getEstado())) {
            pedido.setEstado("PAGADO");
            
            for (DetallePedido detalle : pedido.getDetalles()) {
                Producto producto = detalle.getProducto();
                int nuevoStock = producto.getStock() - detalle.getCantidad();
                
                producto.setStock(Math.max(0, nuevoStock));
                productoRepository.save(producto);
            }
            
            // 3. SOLUCIÓN AL ERROR DEL CORREO: Despertar al usuario antes de cerrar
            if (pedido.getUsuario() != null) {
                pedido.getUsuario().getCorreoElectronico();
            }
            
            return pedidoRepository.save(pedido);
        }
        return pedido;
    }
}