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
                .map(producto -> ResponseEntity.ok(producto)) // Retorna HTTP 200 con el objeto Producto plano
                .orElse(ResponseEntity.notFound().build());   // Retorna HTTP 404 si el ID no existe en la BD
    }

    @PostMapping
    public Producto crear(
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") Double precio,
            @RequestParam("stock") Integer stock,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setDescripcion(descripcion);

        if (imagen != null && !imagen.isEmpty()) {
            try {
                String directorioUploads = System.getProperty("user.dir") + File.separator + "uploads";
                File carpeta = new File(directorioUploads);
                if (!carpeta.exists()) {
                    carpeta.mkdirs(); // Crea el directorio físico si no existe en el servidor
                }
                // Genera un nombre único con UUID para evitar colisiones de archivos
                String nombreUnico = UUID.randomUUID().toString() + "_" + imagen.getOriginalFilename();
                Path rutaCompleta = Paths.get(directorioUploads + File.separator + nombreUnico);
                Files.write(rutaCompleta, imagen.getBytes());
                
                producto.setImagenUrl("/uploads/" + nombreUnico);
            } catch (Exception e) {
                throw new RuntimeException("Error al guardar la imagen: " + e.getMessage());
            }
        } else {
            producto.setImagenUrl("img/default.jpg"); // Imagen por defecto si no se adjunta archivo
        }
        return productoService.guardarProducto(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizar(
            @PathVariable Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") Double precio,
            @RequestParam("stock") Integer stock,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        return productoService.obtenerPorId(id).map(p -> {
            p.setNombre(nombre);
            p.setPrecio(precio);
            p.setStock(stock);
            p.setDescripcion(descripcion);

            // Si se proporciona una nueva imagen, se procesa y se sobrescribe la ruta anterior
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
            }

            return productoService.guardarProducto(p);
        }).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoService.eliminarProducto(id);
    }
}