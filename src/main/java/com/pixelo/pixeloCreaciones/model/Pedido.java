package com.pixelo.pixeloCreaciones.model;


import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "pedidos")
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "buy_order")
    private String buyOrder;

    @Column(name = "transbank_transaction_id")
    private String transbankTransactionId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion;

    @Column(nullable = false)
    private int total;

    private String estado;
    
    @Column(name = "correo_invitado")
    private String correoInvitado;


  @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"pedidos", "carteraPuntos", "hibernateLazyInitializer", "handler"}) 
    private Usuario usuario;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("pedido")
    private List<DetallePedido> detalles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        fechaCreacion = new Date();
        if (estado == null) estado = "PENDIENTE";
    }

    // --- Getters y Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBuyOrder() { return buyOrder; }
    public void setBuyOrder(String buyOrder) { this.buyOrder = buyOrder; }

    public String getTransbankTransactionId() { return transbankTransactionId; }
    public void setTransbankTransactionId(String transbankTransactionId) { this.transbankTransactionId = transbankTransactionId; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCorreoInvitado() { return correoInvitado; }
    public void setCorreoInvitado(String correoInvitado) { this.correoInvitado = correoInvitado; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<DetallePedido> getDetalles() { return detalles; }
    public void setDetalles(List<DetallePedido> detalles) { this.detalles = detalles; }
}