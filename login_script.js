class AuthManager {
    static init() {
        this.checkLoginState();
        this.setupLoginHandler();
        this.setupRegisterHandler();
        this.setupLogoutHandler();
        this.loadSavedImage();
        this.setupVisualEffects();
        this.setupEnterKey();
    }

    static checkLoginState() {
        if (localStorage.getItem('isLoggedIn') && !window.location.href.includes('Login.html')) {
            this.updateUIForLoggedIn();
        }
    }

    static setupLoginHandler() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    static setupRegisterHandler() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        const registerLink = document.getElementById('registerLink');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleRegister();
            });
        }

        const regRole = document.getElementById('regRole');
        if (regRole) {
            regRole.addEventListener('change', () => this.toggleOrganizationField());
        }
    }

    static setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    static setupVisualEffects() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }

    static setupEnterKey() {
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const loginForm = document.getElementById('loginForm');
                if (loginForm && loginForm.style.display !== 'none') {
                    AuthManager.handleLogin(new Event('submit'));
                }
            }
        });
    }

    static async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        if (!this.validateLoginForm(email, password, userType)) {
            return;
        }

        this.showLoading(true, '.login-btn');

        try {
            const result = await EventosAPI.login(email, password, userType);
            
            if (result.includes('éxito') || result.includes('Location')) {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userType', userType);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', 'user-' + Date.now());
                localStorage.setItem('userName', email.split('@')[0]);
                
                this.showMessage('¡Acceso exitoso! Redirigiendo...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'main_windows.html';
                }, 1000);
            } else {
                this.showMessage('Usuario o contraseña incorrectos', 'error');
            }
        } catch (error) {
            this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
        } finally {
            this.showLoading(false, '.login-btn');
        }
    }

   static async handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const organization = document.getElementById('regOrganization').value;

    if (!this.validateRegisterForm(name, email, password, role)) {
        return;
    }

    const userData = {
        nombre: name,
        email: email,
        telefono: phone,
        password: password,
        rol: role,
        organizacion: organization
    };

    this.showLoading(true, '.register-btn');

    try {
        console.log("🔄 Enviando registro...");
        const result = await EventosAPI.registrarUsuario(userData);
        
        console.log("📥 Respuesta recibida:", result);
        
        // SIMPLEMENTE MOSTRAR ÉXITO SI LLEGA AQUÍ
        this.showMessage('¡Cuenta creada exitosamente! Ya puedes iniciar sesión', 'success');
        
        // Limpiar formulario
        event.target.reset();
        document.getElementById('organizationField').style.display = 'none';
        
        // Volver al login después de 2 segundos
        setTimeout(() => {
            this.toggleRegister();
        }, 2000);
        
    } catch (error) {
        console.error("❌ Error:", error);
        this.showMessage('Error al crear cuenta: ' + error.message, 'error');
    } finally {
        this.showLoading(false, '.register-btn');
    }
}

    static validateLoginForm(email, password, userType) {
        if (!email || !password || !userType) {
            this.showMessage('Por favor complete todos los campos', 'error');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage('Por favor use un correo electrónico válido', 'error');
            return false;
        }

        if (password.length < 4) {
            this.showMessage('La contraseña debe tener al menos 4 caracteres', 'error');
            return false;
        }

        return true;
    }

    static validateRegisterForm(name, email, password, role) {
        if (!name || !email || !password || !role) {
            this.showMessage('Por favor complete todos los campos obligatorios', 'error');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage('Por favor use un correo electrónico válido', 'error');
            return false;
        }

        if (password.length < 6) {
            this.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return false;
        }

        if (role === 'organizer' && !document.getElementById('regOrganization').value) {
            this.showMessage('Los organizadores deben especificar su organización', 'error');
            return false;
        }

        return true;
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static toggleRegister() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const registerLink = document.getElementById('registerLink');
        const message = document.getElementById('message');
        
        message.className = 'message-container';
        message.innerHTML = '';
        
        if (registerForm.style.display === 'none' || !registerForm.style.display) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            if (registerLink) registerLink.style.display = 'none';
            document.querySelector('.image-upload-section').style.display = 'none';
        } else {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            if (registerLink) registerLink.style.display = 'inline';
            document.querySelector('.image-upload-section').style.display = 'block';
        }
    }

    static toggleOrganizationField() {
        const role = document.getElementById('regRole').value;
        const organizationField = document.getElementById('organizationField');
        
        if (role === 'organizer') {
            organizationField.style.display = 'block';
            document.getElementById('regOrganization').required = true;
        } else {
            organizationField.style.display = 'none';
            document.getElementById('regOrganization').required = false;
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
            if (!file.type.match('image.*')) {
                this.showMessage('Por favor seleccione un archivo de imagen válido', 'error');
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                this.showMessage('La imagen debe ser menor a 2MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                localStorage.setItem('customLogo', e.target.result);
                document.getElementById('logoImage').src = e.target.result;
                AuthManager.showMessage('Logo actualizado correctamente', 'success');
            }
            
            reader.readAsDataURL(file);
        }
    }

    static loadSavedImage() {
        const savedImage = localStorage.getItem('customLogo');
        if (savedImage) {
            document.getElementById('logoImage').src = savedImage;
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.innerHTML = `<img src="${savedImage}" alt="Logo guardado">`;
            }
        }
    }

    static removeImage() {
        localStorage.removeItem('customLogo');
        document.getElementById('logoImage').src = 'logo.png';
        const preview = document.getElementById('imagePreview');
        if (preview) preview.innerHTML = '';
        const upload = document.getElementById('imageUpload');
        if (upload) upload.value = '';
        this.showMessage('Logo restaurado al predeterminado', 'success');
    }

    static handleLogout() {
        localStorage.clear();
        window.location.href = 'Login.html';
    }

    static showMessage(text, type) {
        const message = document.getElementById('message');
        if (message) {
            message.innerHTML = text;
            message.className = `message-container ${type}`;
        }
    }

    static showLoading(show, selector) {
        const button = document.querySelector(selector);
        if (button) {
            if (show) {
                button.disabled = true;
                const originalText = button.innerHTML;
                button.setAttribute('data-original-text', originalText);
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            } else {
                button.disabled = false;
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.innerHTML = originalText;
                }
            }
        }
    }

    static updateUIForLoggedIn() {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        const userElements = document.querySelectorAll('.user-info, .username');
        userElements.forEach(element => {
            if (element.classList.contains('username')) {
                element.textContent = userName || userEmail;
            }
        });
    }
}