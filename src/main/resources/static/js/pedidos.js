let cachePedidosAdmin = [];

document.addEventListener('DOMContentLoaded', () => {
    actualizarIndicadoresCarroGlobal();

    if (window.location.pathname.includes('checkout.html')) {
        inicializarPaginaCheckout();
    }
});

function obtenerCarroSincronizado() {
    if (typeof window.obtenerCarroStorage === 'function') {
        return window.obtenerCarroStorage();
    }
    return JSON.parse(localStorage.getItem('carro')) || JSON.parse(sessionStorage.getItem('carro')) || [];
}

function guardarCarroSincronizado(carro) {
    if (typeof window.guardarCarroStorage === 'function') {
        window.guardarCarroStorage(carro);
        return;
    }
    localStorage.setItem('carro', JSON.stringify(carro));
    sessionStorage.setItem('carro', JSON.stringify(carro));
    window.actualizarIndicadoresCarroGlobal();
}

window.actualizarIndicadoresCarroGlobal = function() {
    const carro = obtenerCarroSincronizado();
    const badge = document.getElementById('contador-carro-badge');
    if (badge) {
        badge.innerText = carro.reduce((suma, item) => suma + item.cantidad, 0);
    }

    const listaUI = document.getElementById('carro-items-lista');
    const totalUI = document.getElementById('carro-precio-total');
    
    if (listaUI && totalUI) {
        listaUI.innerHTML = '';
        let totalMonto = 0;

        if (carro.length === 0) {
            listaUI.innerHTML = '<p class="text-center text-muted mt-5">🛒 Tu carro está vacío.</p>';
            totalUI.innerText = '$0';
            return;
        }

        carro.forEach((item, index) => {
            totalMonto += (item.precio * item.cantidad);
            listaUI.innerHTML += `
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <div>
                        <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.9rem;">${item.nombre}</h6>
                        <small class="text-muted">$${item.precio.toLocaleString('es-CL')} x ${item.cantidad}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="eliminarArticuloCarro(${index})">🗑️</button>
                </div>
            `;
        });

        totalUI.innerText = '$' + totalMonto.toLocaleString('es-CL');
    }
};

window.mostrarCarro = window.actualizarIndicadoresCarroGlobal;

window.eliminarArticuloCarro = function(index) {
    const carro = obtenerCarroSincronizado();
    carro.splice(index, 1);
    guardarCarroSincronizado(carro);
};

window.ejecutarVaciadoCarro = function() {
    if(confirm('¿Estás seguro de vaciar todo tu carro de compras?')) {
        guardarCarroSincronizado([]);
    }
};

function ejecutarViajeAlCheckout() {
    const carro = obtenerCarroSincronizado();
    if (carro.length === 0) {
        alert("Tu carro está vacío.");
        return;
    }
    window.location.href = 'checkout.html';
}

window.procesarCheckoutSimulado = function() { ejecutarViajeAlCheckout(); };
window.redirigirAlCheckout = function() { ejecutarViajeAlCheckout(); };

function inicializarPaginaCheckout() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    const inputNombre = document.getElementById('checkout-nombre');
    const contenedorCorreo = document.getElementById('contenedor-correo-invitado');
    const inputCorreo = document.getElementById('checkout-correo');

    if (usuarioLogueado) {
        if (inputNombre) {
            inputNombre.value = usuarioLogueado.nombreUsuario;
            inputNombre.readOnly = true; 
        }
        if (contenedorCorreo) contenedorCorreo.classList.add('d-none');
        if (inputCorreo) {
            inputCorreo.required = false;
            inputCorreo.value = '';
        }
    } else {
        if (inputNombre) {
            inputNombre.value = '';
            inputNombre.readOnly = false;
        }
        if (contenedorCorreo) contenedorCorreo.classList.remove('d-none');
        if (inputCorreo) inputCorreo.required = true;
    }

    const carro = obtenerCarroSincronizado();
    const listaUI = document.getElementById('checkout-lista-productos');
    const totalUI = document.getElementById('checkout-total-monto');
    const badgeUI = document.getElementById('checkout-badge-cantidad');

    if (carro.length === 0) {
        window.location.href = 'tienda.html';
        return;
    }

    let totalAcumulado = 0;
    let cantidadArticulos = 0;
    if (listaUI) listaUI.innerHTML = '';

    carro.forEach(item => {
        totalAcumulado += (item.precio * item.cantidad);
        cantidadArticulos += item.cantidad;

        if (listaUI) {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between lh-sm py-3 bg-transparent';
            li.innerHTML = `
                <div>
                    <h6 class="my-0 fw-bold text-dark">${item.nombre}</h6>
                    <small class="text-muted">Cantidad: ${item.cantidad} x $${item.precio.toLocaleString('es-CL')}</small>
                </div>
                <span class="text-secondary fw-bold">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
            `;
            listaUI.appendChild(li);
        }
    });

    if (totalUI) totalUI.innerText = `$${totalAcumulado.toLocaleString('es-CL')}`;
    if (badgeUI) badgeUI.innerText = cantidadArticulos;
}

window.ejecutarPagoSimuladoConDespacho = function() {
    const formulario = document.getElementById('form-despacho-checkout');
    if (formulario && !formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }
    window.open('webpay-simulado.html', 'Webpay', 'width=550,height=650,toolbar=no,scrollbars=no,resizable=no');
};

window.finalizarPagoGlobal = async function(aprobado) {
    if (!aprobado) {
        window.location.href = 'resultado-pago.html?estado=rechazo';
        return;
    }

    const btnConfirmar = document.getElementById('btn-confirmar-despacho-pago');
    if (btnConfirmar) {
        btnConfirmar.innerText = 'Procesando orden... ⏳';
        btnConfirmar.disabled = true;
    }

    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    const carro = obtenerCarroSincronizado();
    const inputCorreo = document.getElementById('checkout-correo');
    const correoInvitado = inputCorreo ? inputCorreo.value.trim() : null;

    const itemsDTO = carro.map(item => ({
        id: item.id, 
        cantidad: item.cantidad
    }));

    let totalAcumulado = carro.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);

    const pedidoRequestDTO = {
        usuarioId: usuarioLogueado ? usuarioLogueado.id : null,
        correoInvitado: usuarioLogueado ? null : correoInvitado,
        items: itemsDTO,
        amount: totalAcumulado
    };

    try {
        await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoRequestDTO)
        });

        if (usuarioLogueado) {
            const puntosGanados = Math.floor(totalAcumulado * 0.10);
            if (!usuarioLogueado.carteraPuntos) {
                usuarioLogueado.carteraPuntos = { puntosAcumulados: 0 };
            }
            usuarioLogueado.carteraPuntos.puntosAcumulados += puntosGanados;
            sessionStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
        }

    } catch (error) {
        console.warn("Aviso de persistencia en el Backend:", error);
    } finally {
        localStorage.removeItem('carro');
        sessionStorage.removeItem('carro');
        guardarCarroSincronizado([]);
        
        setTimeout(() => {
            window.location.href = 'resultado-pago.html?estado=exito';
        }, 200);
    }
};

async function cargarHistorialPedidosCliente() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    if (!usuarioLogueado || !usuarioLogueado.id) return;

    const tbody = document.getElementById('tabla-historial-pedidos-body');
    if (!tbody) return;

    try {
        const response = await fetch(`/api/pedidos/usuario/${usuarioLogueado.id}`);
        if (!response.ok) throw new Error('Error al recuperar pedidos');

        const pedidos = await response.json();
        tbody.innerHTML = '';

        if (pedidos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Aún no registras compras comerciales.</td></tr>`;
            return;
        }

        pedidos.forEach(p => {
            const tr = document.createElement('tr');
            let listaArticulos = '<ul class="mb-0 ps-3" style="font-size: 0.85rem;">';
            
            if (p.detalles && p.detalles.length > 0) {
                p.detalles.forEach(d => {
                    const nombreArt = (d.producto && d.producto.nombre) ? d.producto.nombre : `Artículo #${d.id}`;
                    listaArticulos += `<li>${nombreArt} (x${d.cantidad})</li>`;
                });
            } else {
                listaArticulos += '<li>Sin detalles</li>';
            }
            listaArticulos += '</ul>';

            const totalFormateado = p.total ? Math.floor(p.total).toLocaleString('es-CL') : '0';
            let fechaFormateada = p.fechaPedido ? p.fechaPedido.split('T')[0] : '---';

            tr.innerHTML = `
                <td class="fw-bold text-secondary">#${p.id}</td>
                <td>${fechaFormateada}</td>
                <td>${listaArticulos}</td>
                <td class="fw-bold text-primary">$${totalFormateado}</td>
                <td><span class="badge bg-success">Completado</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

async function listarPedidosAdminGlobal() {
    const tbody = document.getElementById('tabla-admin-pedidos-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-3"><div class="spinner-border spinner-border-sm text-secondary me-2"></div>Sincronizando con Spring Boot...</td></tr>';

    try {
        const response = await fetch('/api/pedidos');
        if (!response.ok) throw new Error('Error al conectar con la base de datos.');

        const pedidos = await response.json();
        
        if (typeof cachePedidosAdmin !== 'undefined') {
            cachePedidosAdmin = pedidos; 
        }
        
        tbody.innerHTML = '';
        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">No hay registros de transacciones comerciales.</td></tr>';
            return;
        }

        pedidos.forEach(p => {
            // -- FORMATO FECHA --
            let fechaFormateada = '-';
            if (p.fechaCreacion) {
                const fechaObjeto = new Date(p.fechaCreacion);
                fechaFormateada = fechaObjeto.toLocaleDateString('es-CL', {
                    year: 'numeric', month: '2-digit', day: 'numeric'
                });
            }

            // -- TIPO USUARIO Y CORREO (Tus estilos originales) --
            const esRegistrado = p.usuario != null;
            const tipoUsuario = esRegistrado 
                ? '<span class="badge bg-info text-dark">Registrado</span>' 
                : '<span class="badge bg-light text-secondary border">Invitado</span>';
            const correo = esRegistrado ? p.usuario.correoElectronico : p.correoInvitado;

            // -- COLOR ESTADO --
            let badgeColor = 'bg-warning text-dark'; 
            if (p.estado === 'PAGADO') badgeColor = 'bg-success';
            if (p.estado === 'RECHAZADO') badgeColor = 'bg-danger';

            const tr = document.createElement('tr');
            
            // ORDEN ESTRICTO BASADO EN TUS <th> HTML
            tr.innerHTML = `
                <td class="fw-bold">#${p.id}</td>
                
                <td class="fw-semibold">${fechaFormateada}</td>
                
                <td class="font-monospace small text-muted">${p.buyOrder || '-'}</td>
                
                <td><span class="badge ${badgeColor}">${p.estado}</span></td>
                
                <td>${tipoUsuario}</td>
                
                <td class="text-muted">${correo || '-'}</td>
                
                <td class="text-success fw-bold">$${p.total ? p.total.toLocaleString('es-CL') : 0}</td>
                
                <td class="text-center">
                    <button class="btn btn-xs btn-primary btn-sm fw-bold px-3" onclick="verDetalleArmadoFichaAdmin(${p.id})">🔍 Ver Detalle</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-3">⚠️ Error de conexión con el servidor.</td></tr>';
    }
}

window.verDetalleArmadoFichaAdmin = function(pedidoId) {
    const pedido = cachePedidosAdmin.find(p => p.id == pedidoId);
    if (!pedido) return;

    document.getElementById('modalDetalleTitulo').innerText = `📦 Ficha de Armado: Orden #${pedidoId}`;
    document.getElementById('modalDetalleMontoTotal').innerText = `$${pedido.total ? Math.floor(pedido.total).toLocaleString('es-CL') : '0'}`;

    const lista = document.getElementById('modalDetalleListaItems');
    lista.innerHTML = '';

    if (pedido.detalles && pedido.detalles.length > 0) {
        pedido.detalles.forEach(d => {
            const nombreArticulo = (d.producto && d.producto.nombre) ? d.producto.nombre : `Producto Ref #${d.id}`;
            const precioArticulo = d.precioUnitario || (d.producto && d.producto.precio ? d.producto.precio : 0);

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center bg-transparent py-2';
            li.innerHTML = `
                <div>
                    <span class="fw-bold d-block text-dark">${nombreArticulo}</span>
                    <small class="text-muted">Precio Unitario: $${Math.floor(precioArticulo).toLocaleString('es-CL')}</small>
                </div>
                <span class="badge bg-dark rounded-pill fs-6">x${d.cantidad}</span>
            `;
            lista.appendChild(li);
        });
    } else {
        lista.innerHTML = '<li class="list-group-item text-muted">Esta orden no contiene especificaciones de artículos.</li>';
    }

    const btnImprimir = document.getElementById('btn-imprimir-ticket-admin');
    if (btnImprimir) {
        btnImprimir.onclick = function() {
            ejecutarImpresionFisicaTicket(pedido);
        };
    }

    const modalEl = document.getElementById('modalDetallePedidoAdmin');
    if (modalEl) {
        const modalInstancia = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstancia.show();
    }
};

function ejecutarImpresionFisicaTicket(pedido) {
    const esRegistrado = pedido.usuario != null;
    const nombreUsuario = esRegistrado ? pedido.usuario.nombreUsuario : 'Comprador Invitado';
    const correo = esRegistrado ? pedido.usuario.correoElectronico : pedido.correoInvitado;
    const fecha = pedido.fechaPedido ? pedido.fechaPedido.split('T')[0] : new Date().toLocaleDateString('es-CL');

    let itemsHtml = '';
    if (pedido.detalles && pedido.detalles.length > 0) {
        pedido.detalles.forEach(d => {
            const nombreRealArticulo = (d.producto && d.producto.nombre) ? d.producto.nombre : `Producto Ref #${d.id}`;
            const precioArticulo = d.precioUnitario || (d.producto && d.producto.precio ? d.producto.precio : 0);

            itemsHtml += `
                <tr>
                    <td style="padding: 6px 0; font-size: 13px;">${nombreRealArticulo}</td>
                    <td style="text-align: center; padding: 6px 0; font-size: 13px;">x${d.cantidad}</td>
                    <td style="text-align: right; padding: 6px 0; font-size: 13px;">$${Math.floor(precioArticulo).toLocaleString('es-CL')}</td>
                </tr>
            `;
        });
    }

    const ventanaImpresion = window.open('', '_blank', 'width=650,height=750');
    ventanaImpresion.document.write(`
        <html>
        <head>
            <title>Ticket Despacho - Pixelo</title>
            <style>
                body { font-family: 'Courier New', Courier, monospace; padding: 25px; color: #000; background: #fff; line-height: 1.4; }
                .text-center { text-align: center; }
                .dashed-line { border-top: 1px dashed #000; margin: 12px 0; }
                table { width: 100%; border-collapse: collapse; }
                .total-box { font-size: 16px; font-weight: bold; text-align: right; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <h2 style="margin: 0; letter-spacing: 1px;">PIXELO CREACIONES</h2>
                <p style="margin: 3px 0; font-size: 12px;">Estrategia Casa Matriz Digital</p>
                <h4 style="margin: 8px 0; text-transform: uppercase;">📦 Ticket de Despacho y Armado 📦</h4>
            </div>
            <div class="dashed-line"></div>
            <div>
                <p style="margin: 4px 0;"><strong>Nº ORDEN:</strong> #${pedido.id}</p>
                <p style="margin: 4px 0;"><strong>FECHA VAL:</strong> ${fecha}</p>
                <p style="margin: 4px 0;"><strong>CLIENTE:</strong> ${nombreUsuario}</p>
                <p style="margin: 4px 0;"><strong>CONTACTO:</strong> ${correo || 'Sin correo registrado'}</p>
            </div>
            <div class="dashed-line"></div>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left; border-bottom: 1px solid #000; padding-bottom: 5px;">Descripción</th>
                        <th style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px;">Cant.</th>
                        <th style="text-align: right; border-bottom: 1px solid #000; padding-bottom: 5px;">Unitario</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div class="dashed-line"></div>
            <div class="total-box">
                VALOR RECAUDADO: $${pedido.total ? Math.floor(pedido.total).toLocaleString('es-CL') : '0'} CLP
            </div>
            <div class="dashed-line" style="margin-top: 35px;"></div>
            <div class="text-center" style="font-size: 11px; margin-top: 15px; color: #444;">
                <p style="margin: 2px 0; font-weight: bold;">DOCUMENTO INTERNO DE CONTROL DE STOCK</p>
                <p style="margin: 2px 0;">Verifique que las cantidades coincidan antes de sellar el empaque.</p>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => { window.close(); }, 500);
                };
            </script>
        </body>
        </html>
    `);
    ventanaImpresion.document.close();
}