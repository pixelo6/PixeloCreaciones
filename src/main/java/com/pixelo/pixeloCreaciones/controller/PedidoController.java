package com.pixelo.pixeloCreaciones.controller;

import com.pixelo.pixeloCreaciones.model.*;
import com.pixelo.pixeloCreaciones.repository.*;
import com.pixelo.pixeloCreaciones.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(PedidoRepository pedidoRepository, 
                            ProductoRepository productoRepository, 
                            UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

    @PostMapping
    @Transactional 
    public Pedido crearPedido(@RequestBody PedidoRequestDTO dto) {
        Pedido pedido = new Pedido();
        pedido.setBuyOrder("PIXELO-" + System.currentTimeMillis());
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
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemDto.getId()));

            int nuevoStock = producto.getStock() - itemDto.getCantidad();
            if (nuevoStock < 0) throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            
            producto.setStock(nuevoStock);
            productoRepository.save(producto); 

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
        
        return pedidoRepository.save(pedido); 
    }
}