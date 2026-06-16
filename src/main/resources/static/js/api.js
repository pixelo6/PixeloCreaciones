const API_BASE_URL = '/api';

// Función para registrar un nuevo usuario
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

// Función para iniciar sesión
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

// Función para cargar los productos en la tienda
async function fetchProductos() {
    const response = await fetch(`${API_BASE_URL}/productos`);
    return await response.json();
}

// Función para obtener los datos de un usuario por ID
async function fetchUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
    return await response.json();
}

// Función de Pasarela de Pago
async function procesarPagoTransbank(montoReal, emailInvitado) {
    if (!montoReal) {
        alert("Error técnico: Monto no válido");
        return;
    }

    const carro = JSON.parse(localStorage.getItem('carro')) || [];
    const itemsParaBackend = carro.map(item => ({
        id: parseInt(item.id),
        cantidad: parseInt(item.cantidad)
    }));

    const urlApiTransbank = "/api/v1/transbank/transaction/create";

    try {
        const response = await fetch(urlApiTransbank, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                amount: montoReal,
                items: itemsParaBackend,
                correoInvitado: emailInvitado || ""
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error al contactar con el servidor' }));
            throw new Error(errorData.error || 'La API no respondió correctamente');
        }

        const data = await response.json();
        
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.url;
        form.hidden = true;

        const inputToken = document.createElement("input");
        inputToken.hidden = true;
        inputToken.value = data.token;
        inputToken.name = 'token_ws';

        form.appendChild(inputToken);
        document.body.appendChild(form);
        form.submit();

    } catch (error) {
        console.error('Error en el flujo de Transbank:', error);
        alert('Error en la transacción: ' + error.message);
    }
}

// --- NUEVAS FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ---

async function apiSolicitarRecuperacion(email) {
    const response = await fetch(`${API_BASE_URL}/usuarios/recuperar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });
    return response;
}

// NUEVA FUNCIÓN AÑADIDA: Exclusiva para validar el código en el Paso 2
async function apiValidarCodigo(email, codigo) {
    const response = await fetch(`${API_BASE_URL}/usuarios/validar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
    });
    return response;
}

// Función actualizada para procesar directamente la respuesta del servidor y evitar conflictos externos
async function apiCambiarPassword(email, codigo, nuevaPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/cambiar-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo, nuevaPassword })
        });

        // Evaluamos si el servidor respondió con un código de éxito para redireccionar
        if (response.ok) {
            const data = await response.json();
            alert(data.mensaje);
            window.location.href = 'login.html';
        } else {
            // Leemos el error en texto plano enviado por el backend y evitamos la conversión JSON
            const errorText = await response.text();
            
            // Traducimos el código interno a un mensaje descriptivo para el usuario
            if (errorText === "ERROR_CODIGO_INCORRECTO") {
                alert("El código ingresado es incorrecto. Verifica los números.");
            } else if (errorText === "ERROR_CODIGO_EXPIRADO") {
                alert("El código ha caducado. Por favor, solicita uno nuevo.");
            } else if (errorText === "ERROR_USUARIO_NO_ENCONTRADO") {
                alert("No se encontró un usuario con ese correo electrónico.");
            } else {
                alert("Ocurrió un error: " + errorText);
            }
        }
    } catch (error) {
        // Capturamos caídas del servidor o problemas de red para que la interfaz no colapse en silencio
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}