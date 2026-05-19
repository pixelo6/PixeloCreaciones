window.datosPedidoPendiente = null;

async function procesarCheckoutSimulado() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    const carro = JSON.parse(localStorage.getItem('carro_pixelo')) || [];

    if (carro.length === 0) {
        alert('Tu carro de compras está vacío.');
        return;
    }

    const itemsDTO = carro.map(item => ({
        id: item.id,
        cantidad: item.cantidad
    }));

    const pedidoData = {
        usuarioId: usuarioLogueado ? usuarioLogueado.id : null,
        correoInvitado: usuarioLogueado ? null : "",
        items: itemsDTO
    };

    if (!usuarioLogueado) {
        let modalInvitado = document.getElementById('modal-checkout-invitado');
        if (!modalInvitado) {
            modalInvitado = document.createElement('div');
            modalInvitado.id = 'modal-checkout-invitado';
            modalInvitado.className = 'modal fade';
            modalInvitado.setAttribute('tabindex', '-1');
            modalInvitado.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title fw-bold">Finalizar Pedido</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-content p-4 border-0">
                            <p class="text-muted small">Ingresa tu correo electrónico para recibir el comprobante digital de tu compra como invitado en Pixelo Creaciones.</p>
                            <form id="form-invitado-checkout">
                                <div class="mb-3">
                                    <label for="emailInvitado" class="form-label fw-bold">Correo de Contacto:</label>
                                    <input type="email" class="form-control" id="emailInvitado" required placeholder="correo@ejemplo.com">
                                </div>
                                <button type="submit" class="btn btn-success w-100 fw-bold mb-3 py-2">Proceder al Pago</button>
                                <div class="text-center border-top pt-3">
                                    <p class="text-muted small mb-2">¿Ya tienes una cuenta o deseas registrarte?</p>
                                    <a href="login.html" class="btn btn-outline-primary w-100 btn-sm fw-bold">Iniciar Sesión / Crear Cuenta</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalInvitado);

            document.getElementById('form-invitado-checkout').addEventListener('submit', (e) => {
                e.preventDefault();
                pedidoData.correoInvitado = document.getElementById('emailInvitado').value.trim();
                
                const modalInstance = bootstrap.Modal.getInstance(modalInvitado);
                if (modalInstance) modalInstance.hide();
                
                levantarPasarelaPagoGlobal(pedidoData);
            });
        }
        const modalBootstrap = new bootstrap.Modal(modalInvitado);
        modalBootstrap.show();
    } else {
        levantarPasarelaPagoGlobal(pedidoData);
    }
}

function levantarPasarelaPagoGlobal(pedidoData) {
    window.datosPedidoPendiente = pedidoData;
    window.open('webpay-simulado.html', '_blank');
}

window.finalizarPagoGlobal = async function(aprobado) {
    if (!window.datosPedidoPendiente) return;

    if (aprobado) {
        const res = await apiEnviarPedido(window.datosPedidoPendiente);
        if (res.ok) {
            alert(window.datosPedidoPendiente.usuarioId 
                ? '¡Transacción Aprobada! El pedido se ha guardado en el servidor y tus puntos de fidelidad fueron acumulados exitosamente.' 
                : `¡Transacción Aprobada! Tu compra como invitado se completó de forma exitosa. El recibo comercial fue enviado a: ${window.datosPedidoPendiente.correoInvitado}`);
            
            localStorage.setItem('carro_pixelo', JSON.stringify([]));
            
            if (typeof actualizarIndicadoresCarroGlobal === 'function') {
                actualizarIndicadoresCarroGlobal();
            }
            
            const offcanvasEl = document.getElementById('canvasCarro');
            if (offcanvasEl) {
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
                if (offcanvasInstance) offcanvasInstance.hide();
            }
            
            if (window.datosPedidoPendiente.usuarioId && window.location.pathname.includes('perfil.html')) {
                window.location.reload();
            }
        } else {
            const errorText = await res.text();
            alert('El pago fue visado, pero ocurrió un error en la base de datos: ' + errorText);
        }
    } else {
        alert('Transacción Rechazada: La operación fue cancelada por el banco o el usuario. Tu carro de compras permanece intacto para reintentar.');
    }

    window.datosPedidoPendiente = null;
}