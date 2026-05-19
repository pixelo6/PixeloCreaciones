package com.pixelo.pixeloCreaciones.dto;

import java.util.List;

public class PedidoRequestDTO {

    private Long usuarioId;
    private String correoInvitado;
    private List<ItemCarroDTO> items;

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getCorreoInvitado() { return correoInvitado; }
    public void setCorreoInvitado(String correoInvitado) { this.correoInvitado = correoInvitado; }

    public List<ItemCarroDTO> getItems() { return items; }
    public void setItems(List<ItemCarroDTO> items) { this.items = items; }
}