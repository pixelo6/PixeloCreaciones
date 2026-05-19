const usuario = JSON.parse(sessionStorage.getItem('usuario'));

if (!usuario || (usuario.rol !== 'ADMIN' && usuario.role !== 'ADMIN')) {
    window.location.href = 'index.html';
}

let editando = false;

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    document.getElementById('formulario-producto').addEventListener('submit', guardarProductoForm);
    document.getElementById('btn-cancelar').addEventListener('click', limpiarFormulario);
});

async function cargarProductos() {
    try {
        const productos = await fetchProductos();
        const tbody = document.getElementById('tabla-productos-body');
        tbody.innerHTML = '';

        productos.forEach(p => {
            const stockDisplay = p.stock === 0 ? '<span class="badge bg-danger">Agotado</span>' : p.stock;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${stockDisplay}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="prepararEdicion(${p.id}, '${p.nombre}', '${p.descripcion || ''}', ${p.precio}, ${p.stock}, '${p.imagenUrl}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="borrarProducto(${p.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

async function guardarProductoForm(e) {
    e.preventDefault();

    const id = document.getElementById('producto-id').value;
    const stockInput = document.getElementById('stock').value;
    const imgInput = document.getElementById('imagenUrl').value.trim();

    const productoData = {
        nombre: document.getElementById('nombre').value.trim(),
        descripcion: document.getElementById('descripcion').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        stock: stockInput === '' ? 0 : parseInt(stockInput),
        imagenUrl: imgInput === '' ? 'img/default.png' : imgInput
    };

    try {
        let res;
        if (editando) {
            res = await apiActualizarProducto(id, productoData);
        } else {
            res = await apiCrearProducto(productoData);
        }

        if (res.ok) {
            alert(editando ? 'Producto actualizado' : 'Producto creado');
            limpiarFormulario();
            cargarProductos();
        } else {
            alert('Error al procesar el producto');
        }
    } catch (error) {
        console.error(error);
    }
}

function prepararEdicion(id, nombre, descripcion, precio, stock, imagenUrl) {
    editando = true;
    document.getElementById('titulo-formulario').textContent = 'Editar Producto';
    document.getElementById('producto-id').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('descripcion').value = descripcion;
    document.getElementById('precio').value = precio;
    document.getElementById('stock').value = stock;
    document.getElementById('imagenUrl').value = imagenUrl;
    document.getElementById('btn-cancelar').classList.remove('d-none');
}

async function borrarProducto(id) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
        try {
            const res = await apiEliminarProducto(id);
            if (res.ok) {
                alert('Producto eliminado');
                cargarProductos();
            } else {
                alert('No se pudo eliminar el producto');
            }
        } catch (error) {
            console.error(error);
        }
    }
}

function limpiarFormulario() {
    editando = false;
    document.getElementById('titulo-formulario').textContent = 'Agregar Producto';
    document.getElementById('formulario-producto').reset();
    document.getElementById('producto-id').value = '';
    document.getElementById('stock').value = '0';
    document.getElementById('imagenUrl').value = '';
    document.getElementById('btn-cancelar').classList.add('d-none');
}