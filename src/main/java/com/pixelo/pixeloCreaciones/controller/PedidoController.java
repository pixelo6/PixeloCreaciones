package com.pixelo.pixeloCreaciones.controller;

import com.pixelo.pixeloCreaciones.model.*;
import com.pixelo.pixeloCreaciones.repository.*;
import com.pixelo.pixeloCreaciones.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarteraPuntosRepository carteraPuntosRepository;

    @Autowired
    public PedidoController(PedidoRepository pedidoRepository, 
                            ProductoRepository productoRepository, 
                            UsuarioRepository usuarioRepository,
                            CarteraPuntosRepository carteraPuntosRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.carteraPuntosRepository = carteraPuntosRepository;
    }

    // Historial Global
    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

    // Historial por Usuario (La nueva función que faltaba)
    @GetMapping("/usuario/{usuarioId}")
    public List<Pedido> listarPedidosPorUsuario(@PathVariable Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
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
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        if (pedidoGuardado.getUsuario() != null) {
            CarteraPuntos cartera = carteraPuntosRepository.findByUsuarioId(pedidoGuardado.getUsuario().getId());
            if (cartera != null) {
                int puntosGanados = totalAcumulado / 100;
                cartera.setPuntosAcumulados(cartera.getPuntosAcumulados() + puntosGanados);
                carteraPuntosRepository.save(cartera);
            }
        }
        
        return pedidoGuardado; 
    }
}