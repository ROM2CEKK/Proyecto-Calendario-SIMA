class EventosManager {
    static init() {
        console.log("✅ EventosManager inicializado");
        this.setupImageUpload();
        this.setupEventForm();
    }

    static setupImageUpload() {
        const uploadBox = document.querySelector('.item__image-upload');
        const imageInput = document.getElementById('imagen_file');
        const urlInput = document.getElementById('imagen_url');
        const preview = document.getElementById('preview');

        if (!uploadBox) {
            console.log("❌ No se encontró el contenedor de imagen");
            return;
        }

        // Drag & Drop
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.style.backgroundColor = '#dfe9ff';
        });

        uploadBox.addEventListener('dragleave', () => {
            uploadBox.style.backgroundColor = '#f9f9ff';
        });

        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.style.backgroundColor = '#f9f9ff';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.mostrarPreview(file);
                imageInput.files = e.dataTransfer.files;
            }
        });

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.mostrarPreview(file);
            }
        });

        urlInput.addEventListener('input', () => {
            const url = urlInput.value.trim();
            if (url.startsWith('http')) {
                this.mostrarPreview(url);
            }
        });

        preview.addEventListener('click', (e) => {
            if (e.target.id === 'removeBtn') {
                preview.innerHTML = '';
                imageInput.value = '';
                urlInput.value = '';
            }
        });
    }

    static setupEventForm() {
        const form = document.getElementById('eventoForm');
        if (!form) {
            console.error("❌ No se encontró el formulario de evento");
            return;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("📝 Enviando formulario de evento...");
            await this.handleCreateEvent(e);
        });
    }

static async handleCreateEvent(event) {
    // Construir FormData desde el formulario enviado
    const form = event.target;
    const formData = new FormData(form);
    this.showLoading(true);

    try {
        console.log("🌐 [DEBUG] Llamando a EventosAPI.crearEvento...");

        const result = await EventosAPI.crearEvento(formData);

        console.log("📨 [DEBUG] Tipo de respuesta:", typeof result);
        console.log("📨 [DEBUG] Respuesta completa:", result);

        // VERIFICAR SI ES JSON O TEXTO
        let responseData;
        if (typeof result === 'string') {
            try {
                responseData = JSON.parse(result);
                console.log("📨 [DEBUG] Respuesta parseada como JSON:", responseData);
            } catch (e) {
                console.log("📨 [DEBUG] Respuesta es texto plano:", result);
                responseData = { success: result.includes('éxito'), message: result };
            }
        } else {
            responseData = result;
        }

        if (responseData.success) {
            console.log("✅ [DEBUG] Evento creado - Redirigiendo...");
            this.showMessage('Evento creado con éxito ✅', 'success');
            form.reset();
            document.getElementById("preview").innerHTML = "";

            setTimeout(() => {
                window.location.href = 'main_windows.html';
            }, 2000);
        } else {
            console.log("❌ [DEBUG] Error en la respuesta:", responseData);
            this.showMessage(`Error: ${responseData.message || 'No se pudo crear el evento'}`, 'error');
        }
    } catch (error) {
        console.error("💥 [DEBUG] Error capturado:", error);
        this.showMessage(`Error de conexión: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
    }
}
    
    static mostrarPreview(data) {
        const preview = document.getElementById('preview');
        let src = '';
        
        if (typeof data === 'string') {
            src = data;
            document.getElementById('imagen_file').value = '';
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = this.generarHTMLPreview(e.target.result);
            };
            reader.readAsDataURL(data);
            return;
        }
        preview.innerHTML = this.generarHTMLPreview(src);
    }

    static generarHTMLPreview(src) {
        return `
            <div class="image__wrapper">
                <img src="${src}" alt="Vista previa">
                <button type="button" class="remove-btn" id="removeBtn">✖</button>
            </div>
        `;
    }

    static showMessage(text, type = 'info') {
        const mensaje = document.getElementById('mensaje');
        if (mensaje) {
            mensaje.textContent = text;
            mensaje.className = `message ${type}`;
            mensaje.style.display = 'block';
            
            setTimeout(() => {
                mensaje.style.display = 'none';
            }, 5000);
        }
    }

    static showLoading(show) {
        const submitBtn = document.querySelector('#eventoForm button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando Evento...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Crear Evento';
            }
        }
    }
}

// Hacer disponible globalmente
window.EventosManager = EventosManager;

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando gestor de eventos...');
    EventosManager.init();
});