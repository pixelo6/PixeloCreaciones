package com.pixelo.pixeloCreaciones.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pixelo.pixeloCreaciones.dto.ItemCarroDTO;
import com.pixelo.pixeloCreaciones.dto.PedidoRequestDTO;
import com.pixelo.pixeloCreaciones.model.CarteraPuntos;
import com.pixelo.pixeloCreaciones.model.DetallePedido;
import com.pixelo.pixeloCreaciones.model.Pedido;
import com.pixelo.pixeloCreaciones.model.Producto;
import com.pixelo.pixeloCreaciones.model.Usuario;
import com.pixelo.pixeloCreaciones.repository.PedidoRepository;
import com.pixelo.pixeloCreaciones.repository.ProductoRepository;
import com.pixelo.pixeloCreaciones.repository.UsuarioRepository;

@Service
@SuppressWarnings("null")
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public Pedido guardarPedido(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    public void eliminarPedido(Long id) {
        pedidoRepository.deleteById(id);
    }

    @Transactional
    public Pedido registrarPedido(PedidoRequestDTO dto) {
        Pedido pedido = new Pedido();

        if (dto.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + dto.getUsuarioId()));
            pedido.setUsuario(usuario);
        } else {
            pedido.setCorreoInvitado(dto.getCorreoInvitado());
        }

        Double totalAcumulado = 0.0;
        List<DetallePedido> detalles = new ArrayList<>();

        for (ItemCarroDTO itemDto : dto.getItems()) {
            Producto producto = productoRepository.findById(itemDto.getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + itemDto.getId()));

            if (producto.getStock() < itemDto.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - itemDto.getCantidad());
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

        if (pedido.getUsuario() != null) {
            int puntosGanados = (int) (totalAcumulado * 0.10);
            Usuario usuario = pedido.getUsuario();
            if (usuario.getCarteraPuntos() != null) {
                CarteraPuntos cartera = usuario.getCarteraPuntos();
                cartera.setPuntosAcumulados(cartera.getPuntosAcumulados() + puntosGanados);
            } else {
                CarteraPuntos nuevaCartera = new CarteraPuntos();
                nuevaCartera.setPuntosAcumulados(puntosGanados);
                nuevaCartera.setUsuario(usuario);
                usuario.setCarteraPuntos(nuevaCartera);
            }
            usuarioRepository.save(usuario);
        }

        return pedidoRepository.save(pedido);
    }
}