package com.pixelo.pixeloCreaciones.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "cartera_puntos")
public class CarteraPuntos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "puntos_acumulados")
    private int puntosAcumulados = 0;

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;

    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    @JsonBackReference
    private Usuario usuario;

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.ultimaActualizacion = LocalDateTime.now();
    }

    public CarteraPuntos() {}

    // --- Getters y Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getPuntosAcumulados() { return puntosAcumulados; }
    public void setPuntosAcumulados(int puntosAcumulados) { this.puntosAcumulados = puntosAcumulados; }

    public LocalDateTime getUltimaActualizacion() { return ultimaActualizacion; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}