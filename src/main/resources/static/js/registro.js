if (sessionStorage.getItem('usuario')) {
    window.location.href = 'index.html';
}

document.getElementById('formulario-registro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreUsuario = document.getElementById('nombreUsuario').value.trim();
    const correoElectronico = document.getElementById('correoUsuario').value.trim();
    const contrasena = document.getElementById('contrasenaUsuario').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;

    const formatoCorreoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreoRegex.test(correoElectronico)) {
        alert('Error: Por favor, ingresa un correo electrónico válido (ejemplo: usuario@correo.com).');
        return;
    }

    if (contrasena !== confirmarContrasena) {
        alert('Error: Las contraseñas ingresadas no coinciden. Por favor, verifica de nuevo.');
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
            document.getElementById('formulario-registro').reset();
        } else {
            const errorCrudo = await response.text(); 
            const errorMinusculas = errorCrudo.toLowerCase(); 

            if (errorMinusculas.includes("duplicate") || errorMinusculas.includes("constraint")) {
                
                if (errorMinusculas.includes(correoElectronico.toLowerCase()) || errorMinusculas.includes("correo")) {
                    alert(`Error: El correo electrónico "${correoElectronico}" ya se encuentra registrado. Intenta iniciar sesión.`);
                } 
                else if (errorMinusculas.includes(nombreUsuario.toLowerCase()) || errorMinusculas.includes("nombreusuario") || errorMinusculas.includes("nombre_usuario")) {
                    alert(`Error: El nombre de usuario "${nombreUsuario}" ya está en uso. Por favor, elige otro.`);
                } 
                else {
                    alert('Error: El nombre de usuario o el correo electrónico ya existen en nuestra base de datos.');
                }
            } else {
                alert('Hubo un problema desconocido al crear el usuario. Detalles: ' + errorCrudo);
            }
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('🔌 No se pudo conectar con el servidor. Verifica que Spring Boot y XAMPP estén encendidos.');
    }
});