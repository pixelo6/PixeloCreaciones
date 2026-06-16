package com.pixelo.pixeloCreaciones.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.pixelo.pixeloCreaciones.model.Producto;
import com.pixelo.pixeloCreaciones.service.ProductoService;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<Producto> listar() {
        return productoService.listarProductos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(producto -> ResponseEntity.ok(producto))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Producto crear(
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") int precio,
            @RequestParam("stock") int stock,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "imagenUrl", required = false) String imagenUrl,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        // Instanciamos el producto y mapeamos los campos obligatorios capturados estrictamente.
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setDescripcion(descripcion);

        // Verificamos si el formulario envió un archivo físico válido.
        if (imagen != null && !imagen.isEmpty()) {
            try {
                String directorioUploads = System.getProperty("user.dir") + File.separator + "uploads";
                File carpeta = new File(directorioUploads);
                if (!carpeta.exists()) {
                    carpeta.mkdirs();
                }
                String nombreUnico = UUID.randomUUID().toString() + "_" + imagen.getOriginalFilename();
                Path rutaCompleta = Paths.get(directorioUploads + File.separator + nombreUnico);
                Files.write(rutaCompleta, imagen.getBytes());
                
                producto.setImagenUrl("/uploads/" + nombreUnico);
            } catch (Exception e) {
                throw new RuntimeException("Error al guardar la imagen: " + e.getMessage());
            }
        } else if (imagenUrl != null && !imagenUrl.trim().isEmpty()) {
            // Si no hay archivo físico, pero sí un enlace de texto, priorizamos el enlace web.
            producto.setImagenUrl(imagenUrl);
        } else {
            // Si el formulario no adjuntó archivo ni enlace, aplicamos la imagen por defecto.
            producto.setImagenUrl("img/default.jpg");
        }
        
        return productoService.guardarProducto(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizar(
            @PathVariable Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") int precio,
            @RequestParam("stock") int stock,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "imagenUrl", required = false) String imagenUrl,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        return productoService.obtenerPorId(id).map(p -> {
            // Asignamos estrictamente los datos recibidos al producto existente en la base de datos.
            p.setNombre(nombre);
            p.setPrecio(precio);
            p.setStock(stock);
            p.setDescripcion(descripcion);

            // Verificamos si se adjuntó un nuevo archivo físico para sobrescribir el anterior.
            if (imagen != null && !imagen.isEmpty()) {
                try {
                    String directorioUploads = System.getProperty("user.dir") + File.separator + "uploads";
                    File carpeta = new File(directorioUploads);
                    if (!carpeta.exists()) {
                        carpeta.mkdirs();
                    }
                    String nombreUnico = UUID.randomUUID().toString() + "_" + imagen.getOriginalFilename();
                    Path rutaCompleta = Paths.get(directorioUploads + File.separator + nombreUnico);
                    Files.write(rutaCompleta, imagen.getBytes());
                    
                    p.setImagenUrl("/uploads/" + nombreUnico);
                } catch (Exception e) {
                    throw new RuntimeException("Error al actualizar la imagen: " + e.getMessage());
                }
            } else if (imagenUrl != null && !imagenUrl.trim().isEmpty()) {
                // Si se provee un nuevo enlace de texto desde el formulario, actualizamos la ruta.
                p.setImagenUrl(imagenUrl);
            }
            
            return productoService.guardarProducto(p);
        }).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoService.eliminarProducto(id);
    }
}