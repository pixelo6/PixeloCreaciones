package com.pixelo.pixeloCreaciones.model;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime; // Necesario para la expiración

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nombreUsuario;

    @Column(nullable = false)
    private String contrasena;

    @Column(unique = true, nullable = false)
    private String correoElectronico;

    @Column(nullable = false)
    private String rol; 

    // --- NUEVOS CAMPOS PARA RECUPERACIÓN ---
    @Column(name = "codigo_recuperacion")
    private String codigoRecuperacion;

    @Column(name = "expiracion_codigo")
    private LocalDateTime expiracionCodigo;
    // ----------------------------------------

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("usuario")
    private CarteraPuntos carteraPuntos;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private List<Pedido> pedidos = new ArrayList<>();

    public Usuario() {}

    // --- Getters y Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getCorreoElectronico() { return correoElectronico; }
    public void setCorreoElectronico(String correoElectronico) { this.correoElectronico = correoElectronico; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    // --- Getters y Setters para recuperación ---
    public String getCodigoRecuperacion() { return codigoRecuperacion; }
    public void setCodigoRecuperacion(String codigoRecuperacion) { this.codigoRecuperacion = codigoRecuperacion; }

    public LocalDateTime getExpiracionCodigo() { return expiracionCodigo; }
    public void setExpiracionCodigo(LocalDateTime expiracionCodigo) { this.expiracionCodigo = expiracionCodigo; }
    // -------------------------------------------

    public CarteraPuntos getCarteraPuntos() { return carteraPuntos; }
    public void setCarteraPuntos(CarteraPuntos carteraPuntos) { this.carteraPuntos = carteraPuntos; }

    public List<Pedido> getPedidos() { return pedidos; }
    public void setPedidos(List<Pedido> pedidos) { this.pedidos = pedidos; }
}