document.addEventListener('DOMContentLoaded', () => {
    cargarDatosPerfil();
});


function cargarDatosPerfil() {
    // 🛡️ CANDADO DEFINITIVO: Si no existe el panel de resumen, el script se detiene en silencio.
    // Esto evita al 100% que aparezcan alertas molestas en index.html o tienda.html
    if (!document.getElementById('modulo-resumen')) {
        return; 
    }

    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));

    if (!usuarioLogueado) {
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = 'login.html';
        return;
    }

    const perfNombre = document.getElementById('perf-nombre');
    const perfCorreo = document.getElementById('perf-correo');
    const perfRol = document.getElementById('perf-rol');
    const perfPuntos = document.getElementById('perf-puntos');
    
    const tabGestionProd = document.getElementById('tab-gestion-productos');
    const tabGestionUser = document.getElementById('tab-gestion-usuarios');
    const tabGestionPed = document.getElementById('tab-gestion-pedidos');

    if (perfNombre) perfNombre.textContent = usuarioLogueado.nombreUsuario;
    if (perfCorreo) perfCorreo.textContent = usuarioLogueado.correoElectronico;
    
    const rolNormalizado = usuarioLogueado.rol ? usuarioLogueado.rol.trim().toUpperCase() : '';

    if (perfRol) {
        perfRol.textContent = rolNormalizado;
        
        if (rolNormalizado === 'ADMINISTRADOR' || rolNormalizado === 'ADMIN') {
            perfRol.className = 'badge bg-danger';
            if (tabGestionProd) tabGestionProd.classList.remove('d-none');
            if (tabGestionUser) tabGestionUser.classList.remove('d-none');
            if (tabGestionPed) tabGestionPed.classList.remove('d-none'); // Revelar pedidos globales
        } else {
            perfRol.className = 'badge bg-secondary';
            if (tabGestionPed) tabGestionPed.classList.add('d-none'); // Bloqueo estricto a clientes
        }
    }

    if (perfPuntos) {
        if (usuarioLogueado.carteraPuntos) {
            perfPuntos.textContent = usuarioLogueado.carteraPuntos.puntosAcumulados || 0;
        } else {
            perfPuntos.textContent = 0;
        }
    }
    
    if (typeof cargarDatosCarteraPuntos === 'function') {
        cargarDatosCarteraPuntos();
    }
}


function cambiarSubModulo(modulo) {
    let moduloActivoId = 'modulo-resumen';
    let botonActivoId = 'tab-resumen';

    const modulosId = ['modulo-resumen', 'modulo-pedidos', 'modulo-puntos-club', 'modulo-productos', 'modulo-usuarios', 'modulo-admin-pedidos'];
    modulosId.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });

    const botonesId = ['tab-resumen', 'tab-historial-pedidos', 'tab-fidelidad-puntos', 'tab-gestion-productos', 'tab-gestion-usuarios', 'tab-gestion-pedidos'];
    botonesId.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('menu-activo');
    });

    if (modulo === 'resumen') {
        moduloActivoId = 'modulo-resumen';
        botonActivoId = 'tab-resumen';
    } else if (modulo === 'productos') {
        moduloActivoId = 'modulo-productos';
        botonActivoId = 'tab-gestion-productos';
    } else if (modulo === 'usuarios') {
        moduloActivoId = 'modulo-usuarios';
        botonActivoId = 'tab-gestion-usuarios';
    } else if (modulo === 'admin-pedidos') { 
        moduloActivoId = 'modulo-admin-pedidos';
        botonActivoId = 'tab-gestion-pedidos';
    } else if (modulo === 'pedidos') {
        moduloActivoId = 'modulo-pedidos';
        botonActivoId = 'tab-historial-pedidos';
        if (typeof cargarHistorialPedidosCliente === 'function') {
            cargarHistorialPedidosCliente();
        }
    } else if (modulo === 'puntos-club') {
        moduloActivoId = 'modulo-puntos-club';
        botonActivoId = 'tab-fidelidad-puntos';
        if (typeof cargarDatosCarteraPuntos === 'function') {
            cargarDatosCarteraPuntos();
        }
    }

    const modActivo = document.getElementById(moduloActivoId);
    const btnActivo = document.getElementById(botonActivoId);

    if (modActivo) modActivo.classList.remove('d-none');
    if (btnActivo) btnActivo.classList.add('menu-activo');

    const subVistasReset = [
        { tabla: 'sub-vista-tabla', form: 'sub-vista-formulario' },
        { tabla: 'sub-vista-tabla-usuarios', form: 'sub-vista-formulario-usuarios' }
    ];

    subVistasReset.forEach(grupo => {
        const t = document.getElementById(grupo.tabla);
        const f = document.getElementById(grupo.form);
        if (t) t.classList.remove('d-none');
        if (f) f.classList.add('d-none');
    });
}

function cargarDatosCarteraPuntos() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    if (!usuarioLogueado) return;

    const walletPuntosTotal = document.getElementById('wallet-puntos-total');
    const walletEquivalencia = document.getElementById('wallet-equivalencia');

    let puntos = 0;
    if (usuarioLogueado.carteraPuntos && usuarioLogueado.carteraPuntos.puntosAcumulados) {
        puntos = usuarioLogueado.carteraPuntos.puntosAcumulados;
    }

    if (walletPuntosTotal) walletPuntosTotal.textContent = puntos;
    if (walletEquivalencia) walletEquivalencia.textContent = puntos.toLocaleString('es-CL');
}


async function listarProductosAdmin() {
    const tbody = document.getElementById('tabla-perfil-productos-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2">Cargando catálogo...</td></tr>';

    try {
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al obtener productos.');
        
        const productos = await response.json();
        tbody.innerHTML = '';

        productos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td class="fw-semibold">${p.nombre}</td>
                <td>$${p.precio.toLocaleString('es-CL')}</td>
                <td><span class="badge ${p.stock > 5 ? 'bg-success' : 'bg-danger'}">${p.stock} u.</span></td>
                <td>
                    <button class="btn btn-sm btn-warning py-0 px-2" onclick="abrirFormularioEditarProducto(${p.id})">✏️</button>
                    <button class="btn btn-sm btn-danger py-0 px-2" onclick="eliminarProductoAdmin(${p.id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-2">Fallo de enlace con inventario.</td></tr>';
    }
}

function abrirFormularioAdmin(editar) {
    const tabla = document.getElementById('sub-vista-tabla');
    const formulario = document.getElementById('sub-vista-formulario');
    if (tabla) tabla.classList.add('d-none');
    if (formulario) formulario.classList.remove('d-none');
    
    if (!editar) {
        // Limpiamos solo los campos de texto
        const fields = ['prod-id', 'prod-nombre', 'prod-precio', 'prod-stock', 'prod-imagen', 'prod-descripcion'];
        fields.forEach(f => {
            const el = document.getElementById(f);
            if (el) el.value = '';
        });
    }
}

async function guardarProductoAdmin() {
    const id = document.getElementById('prod-id')?.value;
    const formData = new FormData();
    
    // Empaquetamos los datos en el formato que Java reconoce a través de @ModelAttribute
    formData.append('nombre', document.getElementById('prod-nombre').value);
    formData.append('precio', document.getElementById('prod-precio').value);
    formData.append('stock', document.getElementById('prod-stock').value);
    formData.append('descripcion', document.getElementById('prod-descripcion').value);

    // Capturamos el campo de la imagen. Si el usuario ingresó un enlace, 
    // lo adjuntamos como texto para que Java lo asigne directamente al objeto Producto.
    const urlImagen = document.getElementById('prod-imagen')?.value;
    if (urlImagen && urlImagen.trim() !== '') {
        formData.append('imagenUrl', urlImagen);
    }

    const url = id ? `/api/productos/${id}` : '/api/productos';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData 
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Error del servidor: ' + errorText);
        }
        
        alert('Producto procesado correctamente.');
        cambiarSubModulo('productos');
        listarProductosAdmin();
        
    } catch (error) {
        console.error(error);
        alert('Error: ' + error.message);
    }
}

async function eliminarProductoAdmin(id) {
    if (!confirm('¿Estás seguro de dar de baja este producto del catálogo comercial?')) return;
    try {
        const response = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar.');
        listarProductosAdmin();
    } catch (error) {
        alert(error.message);
    }
}

async function listarUsuariosAdmin() {
    const tbody = document.getElementById('tabla-perfil-usuarios-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-2">Sincronizando cuentas...</td></tr>';

    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error('Error de enlace.');
        const usuarios = await response.json();
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            const puntos = u.carteraPuntos ? (u.carteraPuntos.puntosAcumulados || 0) : 0;
            tr.innerHTML = `
                <td>${u.id}</td>
                <td class="fw-semibold">${u.nombreUsuario}</td>
                <td class="text-muted">${u.correoElectronico}</td>
                <td><span class="badge ${u.rol === 'ADMIN' ? 'bg-danger' : 'bg-primary'}">${u.rol}</span></td>
                <td class="text-success fw-bold">${puntos} pts</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="modificarRolUsuarioAdmin(${u.id}, '${u.rol}')">🔄 Rol</button>
                    <button class="btn btn-sm btn-danger py-0 px-2" onclick="eliminarUsuarioAdmin(${u.id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-2">Fallo al conectar con tabla de usuarios.</td></tr>';
    }
}

async function modificarRolUsuarioAdmin(id, rolActual) {
    const nuevoRol = rolActual === 'ADMIN' ? 'CLIENTE' : 'ADMIN';
    if (!confirm(`¿Deseas cambiar el rango de acceso del usuario a ${nuevoRol}?`)) return;

    try {
        const response = await fetch(`/api/usuarios/${id}/rol?nuevoRol=${nuevoRol}`, { method: 'PUT' });
        if (!response.ok) throw new Error('No se pudo alterar el rol en el servidor.');
        listarUsuariosAdmin();
    } catch (error) {
        alert(error.message);
    }
}

async function eliminarUsuarioAdmin(id) {
    if (!confirm('¿Estás seguro de eliminar permanentemente esta cuenta de la base de datos?')) return;
    try {
        const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Fallo en la baja del usuario.');
        listarUsuariosAdmin();
    } catch (error) {
        alert(error.message);
    }
}