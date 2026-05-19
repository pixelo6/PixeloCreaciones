package com.pixelo.pixeloCreaciones.service;

import java.util.List;
import java.util.Optional;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.pixelo.pixeloCreaciones.model.Producto;
import com.pixelo.pixeloCreaciones.repository.ProductoRepository;

@Service
@SuppressWarnings("all")
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return productoRepository.findById(id);
    }

    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(Objects.requireNonNull(producto));
    }

    public void eliminarProducto(Long id) {
        if (id != null) {
            productoRepository.deleteById(id);
        }
    }
}