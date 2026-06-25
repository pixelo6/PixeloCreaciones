if (sessionStorage.getItem('usuario')) {
    window.location.href = 'perfil.html';
}

document.getElementById('formulario-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correoElectronico = document.getElementById('correoUsuario').value.trim();
    const contrasena = document.getElementById('contrasenaUsuario').value;

    const credenciales = {
        correoElectronico: correoElectronico,
        contrasena: contrasena
    };

    try {
        const response = await apiLoginUsuario(credenciales);

        if (response.ok) {
            const usuarioLogueado = await response.json();
            
            sessionStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
            
            if (usuarioLogueado.id) {
                localStorage.setItem('usuarioId', usuarioLogueado.id);
            }
            
            const rolNormalizado = usuarioLogueado.rol ? usuarioLogueado.rol.trim().toUpperCase() : '';

            if (rolNormalizado === 'ADMINISTRADOR' || rolNormalizado === 'ADMIN') {
                alert('¡Bienvenido Administrador!');
            } else {
                alert('¡Sesión iniciada con éxito!');
            }
            
            window.location.href = 'perfil.html';
        } else {
            alert('Error: Credenciales incorrectas o usuario no encontrado.');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('🔌 No se pudo conectar con el servidor.');
    }
});