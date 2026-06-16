document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoPublicoTienda();
});

async function cargarCatalogoPublicoTienda() {
    try {
        const productos = await fetchProductos();
        const contenedor = document.getElementById('contenedor-catalogo');
        if (!contenedor) return;
        contenedor.innerHTML = '';

        if (productos.length === 0) {
            contenedor.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No hay productos disponibles.</p></div>';
            return;
        }

        productos.forEach(p => {
            const col = document.createElement('div');
            col.className = 'col';
            
            const estaAgotado = p.stock === 0;
            const badgeStock = estaAgotado 
                ? '<span class="badge bg-danger position-absolute top-0 end-0 m-3">Agotado</span>' 
                : `<span class="badge bg-success position-absolute top-0 end-0 m-3">Stock: ${p.stock}</span>`;

            let rutaImagen = p.imagenUrl || 'img/default.jpg';
            const precioFormateado = p.precio ? Math.floor(p.precio).toLocaleString('es-CL') : '0';

            col.innerHTML = `
                <div class="card h-100 position-relative">
                    ${badgeStock}
                    <img src="${rutaImagen}" 
                         class="card-img-top p-3" 
                         alt="${p.nombre}" 
                         style="height: 200px; object-fit: contain;"
                         onerror="this.onerror=null; this.src='https://placehold.co/300x200/e0e0e0/666666/png?text=Pixelo+Creaciones';">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="card-text text-muted small flex-grow-1">${p.descripcion || ''}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="fs-4 fw-bold text-primary">$${precioFormateado}</span>
                            <button class="btn btn-primary btn-sm" ${estaAgotado ? 'disabled' : ''} onclick="añadirArticuloAlCarroDesdeCatalogo(${p.id}, '${p.nombre}', ${p.precio}, ${p.stock}, '${rutaImagen}')">
                                ${estaAgotado ? 'Sin Stock' : 'Añadir al carro'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            contenedor.appendChild(col);
        });
    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
    }
}

function añadirArticuloAlCarroDesdeCatalogo(id, nombre, precio, stockMax, imagenUrl) {
    let carro = obtenerCarroStorage();
    const indice = carro.findIndex(item => item.id === id);

    if (indice > -1) {
        if (carro[indice].cantidad >= stockMax) {
            alert(`Límite alcanzado. Solo quedan ${stockMax} unidades en stock.`);
            return;
        }
        carro[indice].cantidad += 1;
    } else {
        carro.push({ id, nombre, precio, stockMax, imagenUrl, cantidad: 1 });
    }

    guardarCarroStorage(carro);
    
    // IMPORTANTE: Llamar a la función que refresca el offcanvas
    if (typeof actualizarVistaCarro === 'function') {
        actualizarVistaCarro();
    }
    
    alert('Producto añadido al carro');
}