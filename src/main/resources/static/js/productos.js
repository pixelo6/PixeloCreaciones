document.addEventListener('DOMContentLoaded', () => {
    const formProducto = document.getElementById('formulario-producto-admin');
    if (formProducto) {
        formProducto.addEventListener('submit', guardarProductoConImagen);
    }
    
    const tabProductos = document.getElementById('tab-gestion-productos');
    if (tabProductos) {
        tabProductos.addEventListener('click', listarProductosAdmin);
    }
});

async function listarProductosAdmin() {
    try {
        const response = await fetch(`/api/productos?_=${Date.now()}`);
        if (!response.ok) throw new Error('Error de conectividad al recuperar el catálogo');
        
        const productos = await response.json();
        const tbody = document.getElementById('tabla-perfil-productos-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        productos.forEach(prod => {
            const precioFormateado = prod.precio ? Math.floor(prod.precio).toLocaleString('es-CL') : '0';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prod.id}</td>
                <td>${prod.nombre || ''}</td>
                <td>$${precioFormateado}</td>
                <td>${prod.stock || 0}</td>
                <td>
                    <button class="btn btn-warning btn-sm fw-bold me-1" onclick="cargarProductoParaEditar(Number(${prod.id}))">✏️</button>
                    <button class="btn btn-danger btn-sm fw-bold" onclick="eliminarProductoAdmin(Number(${prod.id}))">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Fallo detectado durante la renderización de la tabla:", error);
    }
}

async function guardarProductoConImagen(e) {
    e.preventDefault();

    const id = document.getElementById('prod-id').value;
    const fileInput = document.getElementById('prod-imagen');
    const file = fileInput ? fileInput.files[0] : null;

    const formData = new FormData();
    formData.append('nombre', document.getElementById('prod-nombre').value.trim());
    formData.append('precio', document.getElementById('prod-precio').value);
    formData.append('stock', document.getElementById('prod-stock').value);
    formData.append('descripcion', document.getElementById('prod-descripcion').value.trim());
    
    if (file) {
        formData.append('imagen', file);
    }

    let url = '/api/productos';
    let metodo = 'POST';

    if (id) {
        url = `/api/productos/${id}`;
        metodo = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: metodo,
            body: formData
        });

        if (response.ok) {
            alert(id ? 'Producto actualizado.' : 'Producto añadido.');
            cerrarFormularioAdmin();
            listarProductosAdmin();
        } else {
            const errorText = await response.text();
            alert('El servidor rechazó la operación logística: ' + errorText);
        }
    } catch (error) {
        console.error("Colapso en la transacción de guardado:", error);
        alert('Fallo crítico de comunicación con el puerto local.');
    }
}

async function cargarProductoParaEditar(id) {
    console.log("Iniciando auditoría de recuperación para el producto numérico:", id);
    try {
        const response = await fetch(`/api/productos/${id}?_=${Date.now()}`);
        
        if (!response.ok) {
            const mensajeServidor = await response.text();
            throw new Error(`Excepción en el backend [Código ${response.status}]: ${mensajeServidor}`);
        }

        const prod = await response.json();

        if (!prod || !prod.id) {
            throw new Error('La cadena devuelta no corresponde a una entidad de producto válida.');
        }

        document.getElementById('prod-id').value = (prod.id !== null && prod.id !== undefined) ? prod.id : '';
        document.getElementById('prod-nombre').value = (prod.nombre !== null && prod.nombre !== undefined) ? prod.nombre : '';
        document.getElementById('prod-precio').value = (prod.precio !== null && prod.precio !== undefined) ? prod.precio : '';
        document.getElementById('prod-stock').value = (prod.stock !== null && prod.stock !== undefined) ? prod.stock : 0;
        document.getElementById('prod-descripcion').value = (prod.descripcion !== null && prod.descripcion !== undefined) ? prod.descripcion : '';

        abrirFormularioAdmin(true);
    } catch (error) {
        console.error("Trazabilidad del fallo en edición:", error);
        alert('Alerta de Sistema: ' + error.message);
    }
}

async function eliminarProductoAdmin(id) {
    if (!confirm('Esta acción destruirá el registro físico en la base de datos. ¿Proceder?')) {
        return;
    }

    try {
        const response = await fetch(`/api/productos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Producto eliminado del catálogo.');
            listarProductosAdmin();
        } else {
            const errorText = await response.text();
            alert('Conflicto referencial detectado al intentar eliminar: ' + errorText);
        }
    } catch (error) {
        console.error("Colapso en la directriz de eliminación:", error);
        alert('Ruptura de conexión al emitir la orden de borrado.');
    }
}

window.abrirFormularioAdmin = function(esEditar) {
    const titulo = document.getElementById('titulo-formulario-admin');
    if (titulo) {
        titulo.textContent = esEditar ? 'Modificar Producto Existente' : 'Añadir Nuevo Producto al Catálogo';
    }
    
    if (!esEditar) {
        const form = document.getElementById('formulario-producto-admin');
        if (form) form.reset();
        const prodId = document.getElementById('prod-id');
        if (prodId) prodId.value = '';
    }
    
    const vistaTabla = document.getElementById('sub-vista-tabla');
    const vistaForm = document.getElementById('sub-vista-formulario');
    if (vistaTabla) vistaTabla.classList.add('d-none');
    if (vistaForm) vistaForm.classList.remove('d-none');
}

window.cerrarFormularioAdmin = function() {
    const vistaForm = document.getElementById('sub-vista-formulario');
    const vistaTabla = document.getElementById('sub-vista-tabla');
    const form = document.getElementById('formulario-producto-admin');
    const prodId = document.getElementById('prod-id');

    if (vistaForm) vistaForm.classList.add('d-none');
    if (vistaTabla) vistaTabla.classList.remove('d-none');
    if (form) form.reset();
    if (prodId) prodId.value = '';
}