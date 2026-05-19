const API_BASE_URL = '/api';

async function apiRegistrarUsuario(datosUsuario) {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
    });
    return response;
}

async function apiLoginUsuario(credenciales) {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credenciales)
    });
    return response;
}

async function fetchProductos() {
    const response = await fetch(`${API_BASE_URL}/productos`);
    return await response.json();
}

async function fetchUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
    return await response.json();
}