document.addEventListener('DOMContentLoaded', () => {
    const formUsuario = document.getElementById('formulario-usuario-admin');
    if (formUsuario) {
        formUsuario.addEventListener('submit', guardarUsuarioAdmin);
    }
});

async function listarUsuariosAdmin() {
    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error('Error al obtener usuarios');
        
        const usuarios = await response.json();
        const tbody = document.getElementById('tabla-perfil-usuarios-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        usuarios.forEach(user => {
            let puntosUsuario = 0;
            if (user.carteraPuntos && user.carteraPuntos.puntosAcumulados !== undefined) {
                puntosUsuario = user.carteraPuntos.puntosAcumulados;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nombreUsuario}</td>
                <td>${user.correoElectronico}</td>
                <td><span class="badge ${user.rol === 'ADMINISTRADOR' ? 'bg-danger' : 'bg-secondary'}">${user.rol}</span></td>
                <td class="fw-bold text-success">${puntosUsuario.toLocaleString('es-CL')} pts</td>
                <td>
                    <button class="btn btn-warning btn-sm fw-bold me-1" onclick="cargarUsuarioParaEditar(${user.id})">✏️</button>
                    <button class="btn btn-danger btn-sm fw-bold" onclick="eliminarUsuarioAdmin(${user.id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
    }
}

async function guardarUsuarioAdmin(e) {
    e.preventDefault();

    const id = document.getElementById('usuario-id-admin').value;
    const puntosInput = document.getElementById('usuario-puntos-admin').value;
    
    const datos = {
        nombreUsuario: document.getElementById('usuario-nombre-admin').value.trim(),
        correoElectronico: document.getElementById('usuario-correo-admin').value.trim(),
        rol: document.getElementById('usuario-rol-admin').value,
        carteraPuntos: {
            puntosAcumulados: puntosInput ? parseInt(puntosInput, 10) : 0
        }
    };

    try {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            alert('¡Usuario y balance de puntos actualizados con éxito!');
            cerrarFormularioUsuarios();
            listarUsuariosAdmin();
        } else {
            const errorText = await response.text();
            alert('Error al actualizar usuario: ' + errorText);
        }
    } catch (error) {
        console.error(error);
        alert('Error de comunicación con el servidor.');
    }
}

async function cargarUsuarioParaEditar(id) {
    try {
        const response = await fetch(`/api/usuarios/${id}`);
        if (!response.ok) throw new Error('Usuario no encontrado');

        const user = await response.json();

        document.getElementById('usuario-id-admin').value = user.id;
        document.getElementById('usuario-nombre-admin').value = user.nombreUsuario;
        document.getElementById('usuario-correo-admin').value = user.correoElectronico;
        document.getElementById('usuario-rol-admin').value = user.rol;

        let puntosUsuario = 0;
        if (user.carteraPuntos && user.carteraPuntos.puntosAcumulados !== undefined) {
            puntosUsuario = user.carteraPuntos.puntosAcumulados;
        }
        
        const badgePuntos = document.getElementById('puntos-actuales-badge');
        if (badgePuntos) {
            badgePuntos.textContent = `${puntosUsuario.toLocaleString('es-CL')} pts actuales`;
        }

        document.getElementById('usuario-puntos-admin').value = puntosUsuario;

        document.getElementById('sub-vista-tabla-usuarios').classList.add('d-none');
        document.getElementById('sub-vista-formulario-usuarios').classList.remove('d-none');
    } catch (error) {
        console.error(error);
        alert('Error al recuperar los datos del usuario.');
    }
}

async function eliminarUsuarioAdmin(id) {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    if (usuarioLogueado && usuarioLogueado.id === id) {
        alert('No puedes eliminar tu propia cuenta de administrador en uso.');
        return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este usuario permanentemente del sistema?')) {
        return;
    }

    try {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Usuario eliminado del sistema.');
            listarUsuariosAdmin();
        } else {
            const errorText = await response.text();
            alert('No se pudo eliminar el usuario: ' + errorText);
        }
    } catch (error) {
        console.error(error);
    }
}

window.cerrarFormularioUsuarios = function() {
    document.getElementById('sub-vista-formulario-usuarios').classList.add('d-none');
    document.getElementById('sub-vista-tabla-usuarios').classList.remove('d-none');
    document.getElementById('formulario-usuario-admin').reset();
    document.getElementById('usuario-id-admin').value = '';
    
    const badgePuntos = document.getElementById('puntos-actuales-badge');
    if (badgePuntos) badgePuntos.textContent = '0 pts actuales';
}