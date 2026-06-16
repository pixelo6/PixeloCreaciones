document.addEventListener('DOMContentLoaded', () => {
    // Redirección si ya está autenticado
    if (sessionStorage.getItem('usuario')) {
        window.location.href = 'index.html';
    }

    const formulario = document.getElementById('formulario-registro');

    if (!formulario) {
        console.error("El elemento 'formulario-registro' no existe en el DOM.");
        return;
    }

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Referencias a los campos
        const inputNombre = document.getElementById('reg-nombre');
        const inputCorreo = document.getElementById('reg-correo');
        const inputPass = document.getElementById('reg-contrasena');
        const inputConfirm = document.getElementById('reg-confirmar-contrasena');

        // Verificación de existencia para evitar errores de null
        if (!inputNombre || !inputCorreo || !inputPass || !inputConfirm) {
            alert("Error interno: No se encontraron todos los campos del formulario.");
            return;
        }

        const nombreUsuario = inputNombre.value.trim();
        const correoElectronico = inputCorreo.value.trim();
        const contrasena = inputPass.value;
        const confirmarContrasena = inputConfirm.value;

        // Validación: las contraseñas deben coincidir
        if (contrasena !== confirmarContrasena) {
            alert('Error: Las contraseñas ingresadas no coinciden.');
            return;
        }

        const formatoCorreoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formatoCorreoRegex.test(correoElectronico)) {
            alert('Error: Por favor, ingresa un correo electrónico válido.');
            return;
        }

        const datosUsuario = {
            nombreUsuario: nombreUsuario,
            correoElectronico: correoElectronico,
            contrasena: contrasena,
            rol: "CLIENTE" 
        };

        try {
            const response = await apiRegistrarUsuario(datosUsuario);

            if (response.ok) {
                alert('¡Usuario registrado con éxito en Pixelo Creaciones!');
                formulario.reset();
                window.location.href = 'login.html';
            } else {
                const errorCrudo = await response.text(); 
                alert('Error al registrar: ' + errorCrudo);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('🔌 No se pudo conectar con el servidor.');
        }
    });
});