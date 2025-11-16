class AuthManager {
    static init() {
        console.log("✅ AuthManager inicializado");
        this.setupLoginHandler();
        this.setupRegisterHandler();
        this.loadSavedImage();
    }

    static setupLoginHandler() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.replaceWith(loginForm.cloneNode(true));
            document.getElementById('loginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.onclick = (e) => {
                e.preventDefault();
                this.handleLogin(e);
            };
        }
    }

    static setupRegisterHandler() {
        const registerLink = document.getElementById('registerLink');
        if (registerLink) {
            registerLink.onclick = (e) => {
                e.preventDefault();
                this.toggleRegister();
            };
        }

        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.onclick = (e) => {
                this.handleRegister(e);
            };
        }
    }

    static async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        console.log("🔐 Iniciando proceso de login...");
        this.showLoading(true, '.login-btn');

        try {
            const result = await EventosAPI.login(email, password, userType);
            console.log("📨 Respuesta del servidor:", result);

            if (result.startsWith("Login exitoso")) {
                const parts = result.split("|");
                const userId = parts[1] || '1';
                const userName = parts[2] || email.split('@')[0];

                console.log("✅ Login exitoso - Guardando datos:", { userId, userName });

                localStorage.setItem('userEmail', email);
                localStorage.setItem('userType', userType);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', userId);
                localStorage.setItem('userName', userName);

                this.showMessage('¡Acceso exitoso! Redirigiendo...', 'success');

                setTimeout(() => {
                    window.location.href = 'main_windows.html';
                }, 1000);
            } else {
                this.showMessage(result, 'error');
            }
        } catch (error) {
            console.error('💥 Error:', error);
            this.showMessage('Error de conexión: ' + error.message, 'error');
        } finally {
            this.showLoading(false, '.login-btn');
        }
    }

    static async handleRegister(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    // Obtener TODOS los campos del formulario
    const nameInput = document.getElementById('regName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const passwordInput = document.getElementById('regPassword');
    const roleInput = document.getElementById('regRole');
    const organizationInput = document.getElementById('regOrganization');

    if (!nameInput || !emailInput || !passwordInput || !roleInput) {
        this.showMessage('Error: campos de registro no encontrados en el DOM.', 'error');
        return;
    }

    const name = nameInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value || ''; // Opcional
    const password = passwordInput.value;
    const role = roleInput.value;
    const organization = organizationInput ? organizationInput.value : ''; // Opcional

    // DEBUG: Ver qué datos se van a enviar
    console.log("📤 Datos a registrar:", {
        nombre: name,
        email: email,
        telefono: phone,
        password: password,
        rol: role,
        organizacion: organization
    });

    if (!name || !email || !password || !role) {
        this.showMessage('Por favor completa todos los campos obligatorios.', 'error');
        return;
    }

    // Preparar datos para enviar
    const userData = {
        nombre: name,
        email: email,
        telefono: phone,
        password: password,
        rol: role,
        organizacion: organization
    };

    try {
        const result = await EventosAPI.registrarUsuario(userData);
        console.log("📨 Respuesta registro:", result);
        
        if (result.includes('éxito')) {
            this.showMessage('✅ ' + result, 'success');
            // Limpiar formulario
            if (nameInput) nameInput.value = '';
            if (emailInput) emailInput.value = '';
            if (phoneInput) phoneInput.value = '';
            if (passwordInput) passwordInput.value = '';
            if (roleInput) roleInput.value = '';
            if (organizationInput) organizationInput.value = '';
            
            // Volver al login después de 2 segundos
            setTimeout(() => {
                this.toggleRegister();
            }, 2000);
        } else {
            this.showMessage('❌ ' + result, 'error');
        }
    } catch (error) {
        console.error("💥 Error de registro:", error);
        this.showMessage('❌ Error de registro: ' + error.message, 'error');
    }
}

    static toggleRegister() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const registerLink = document.getElementById('registerLink');

        if (registerForm.style.display === 'none' || !registerForm.style.display) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            registerLink.style.display = 'none';
        } else {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            registerLink.style.display = 'inline';
        }
    }

    static togglePassword() {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            eyeIcon.className = 'fas fa-eye';
        }
    }

    static previewImage(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('imagePreview');

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                localStorage.setItem('customLogo', e.target.result);
                document.getElementById('logoImage').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    static loadSavedImage() {
        const savedImage = localStorage.getItem('customLogo');
        if (savedImage) {
            document.getElementById('logoImage').src = savedImage;
        }
    }

    static removeImage() {
        localStorage.removeItem('customLogo');
        document.getElementById('logoImage').src = 'logo.png';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('imageUpload').value = '';
    }

    static showMessage(text, type = 'info') {
        const message = document.getElementById('message');
        if (message) {
            message.innerHTML = text;
            message.className = `message-container ${type}`;
            message.style.display = 'block';

            setTimeout(() => {
                message.style.display = 'none';
            }, 5000);
        }
    }

    static showLoading(show, selector = '.login-btn') {
        const loginBtn = document.querySelector(selector);
        if (loginBtn) {
            if (show) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            } else {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Acceder al Sistema';
            }
        }
    }
}

// Hacer disponible globalmente
window.AuthManager = AuthManager;
window.togglePassword = AuthManager.togglePassword;
window.toggleRegister = AuthManager.toggleRegister;
window.previewImage = AuthManager.previewImage;
window.removeImage = AuthManager.removeImage;