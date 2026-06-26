async function cargarDatosCarteraPuntos() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    if (!usuarioLogueado || !usuarioLogueado.id) return;

    const totalDisplay = document.getElementById('wallet-puntos-total');
    const equivDisplay = document.getElementById('wallet-equivalencia');
    const tbody = document.getElementById('tabla-historial-puntos-body');

    try {
        const response = await fetch(`/api/usuarios/${usuarioLogueado.id}`);
        if (!response.ok) throw new Error('Error al obtener datos de fidelidad');

        const user = await response.json();
        
        let puntosActuales = 0;
        if (response.ok) {
        const cartera = await response.json();
        puntosActuales = cartera.puntosAcumulados;
    }

        if (totalDisplay) totalDisplay.textContent = puntosActuales.toLocaleString('es-CL');
    if (equivDisplay) equivDisplay.textContent = `$${puntosActuales.toLocaleString('es-CL')}`;

        if (!tbody) return;
        tbody.innerHTML = '';

        const resPedidos = await fetch(`/api/pedidos/usuario/${usuarioLogueado.id}`);
        if (!resPedidos.ok) throw new Error('Error al cruzar historial de pedidos');

        const pedidos = await resPedidos.json();

        if (pedidos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        No se registran abonos ni movimientos de puntos en tu cuenta.
                    </td>
                </tr>
            `;
            return;
        }

        pedidos.forEach(p => {
            if (p.estado === 'COMPLETADO' || p.estado === 'APROBADO') {
                const tr = document.createElement('tr');
                
                let fecha = p.fechaPedido ? p.fechaPedido.split('T')[0] : '---';
                const montoBase = p.total ? Math.floor(p.total).toLocaleString('es-CL') : '0';
                
                const puntosGanados = p.total ? Math.floor(p.total * 0.01) : 0;

                tr.innerHTML = `
                    <td>${fecha}</td>
                    <td class="text-secondary small">Abono por compra procesada exitosamente - Pedido #${p.id}</td>
                    <td>$${montoBase}</td>
                    <td class="fw-bold text-success">+${puntosGanados} pts</td>
                `;
                tbody.appendChild(tr);
            }
        });

        if (tbody.children.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        Tus pedidos están procesándose. Los puntos se abonarán al completarse la transacción.
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        console.error(error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger py-4">
                        🔌 Error al comunicar con el servicio de billetera electrónica.
                    </td>
                </tr>
            `;
        }
    }
}