window.obtenerCarroStorage = function() {
    const carroStr = localStorage.getItem('carro_pixelo') || localStorage.getItem('carro') || '[]';
    try {
        return JSON.parse(carroStr);
    } catch (e) {
        return [];
    }
};

window.guardarCarroStorage = function(carroArray) {
    localStorage.setItem('carro_pixelo', JSON.stringify(carroArray));
    localStorage.setItem('carro', JSON.stringify(carroArray));
    
    if (typeof window.actualizarIndicadoresCarroGlobal === 'function') {
        window.actualizarIndicadoresCarroGlobal();
    }
};

(function() {
    try {
        const carroPixelo = localStorage.getItem('carro_pixelo');
        if (!carroPixelo || !carroPixelo.trim().startsWith('[')) {
            localStorage.setItem('carro_pixelo', JSON.stringify([]));
        }
    } catch (e) {
        localStorage.setItem('carro_pixelo', JSON.stringify([]));
    }

    try {
        const carroGenerico = localStorage.getItem('carro');
        if (!carroGenerico || !carroGenerico.trim().startsWith('[')) {
            localStorage.setItem('carro', JSON.stringify([]));
        }
    } catch (e) {
        localStorage.setItem('carro', JSON.stringify([]));
    }
})();


document.addEventListener('DOMContentLoaded', () => {
    // Sincroniza el menú de sesión superior
    sincronizarNavbarGlobal();
    
    // Dibuja el carrito por primera vez al abrir la página
    if (typeof actualizarIndicadoresCarroGlobal === 'function') {
        actualizarIndicadoresCarroGlobal();
    }
    
    // Controlador para cerrar sesión
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('usuario');
            window.location.href = 'index.html';
        });
    }
});

function sincronizarNavbarGlobal() {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuario'));
    const labelNombre = document.getElementById('nav-nombre-usuario');
    const linkLogin = document.getElementById('nav-link-login');
    const linkRegistro = document.getElementById('nav-link-registro');
    const linkMiCuenta = document.getElementById('nav-link-micuenta');
    const linkLogout = document.getElementById('nav-link-logout');

    if (usuarioLogueado) {
        if (labelNombre) labelNombre.textContent = usuarioLogueado.nombreUsuario;
        if (linkLogin) linkLogin.classList.add('d-none');
        if (linkRegistro) linkRegistro.classList.add('d-none');
        if (linkMiCuenta) linkMiCuenta.classList.remove('d-none');
        if (linkLogout) linkLogout.classList.remove('d-none');
    } else {
        if (labelNombre) labelNombre.textContent = 'Cuenta';
        if (linkLogin) linkLogin.classList.remove('d-none');
        if (linkRegistro) linkRegistro.classList.remove('d-none');
        if (linkMiCuenta) linkMiCuenta.classList.add('d-none');
        if (linkLogout) linkLogout.classList.add('d-none');
    }
}

function cerrarCanvasCarro() {
    const offcanvasEl = document.getElementById('canvasCarro');
    if (offcanvasEl) {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (offcanvasInstance) offcanvasInstance.hide();
    }
}