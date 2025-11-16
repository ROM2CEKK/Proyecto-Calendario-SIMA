const API_BASE = '/IS/Eventos%20IS';

class ApiClient {
    static async post(url, data = {}) {
        try {
            const response = await fetch(API_BASE + url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data)
            });
            return await response.text();
        } catch (error) {
            console.error('Error en API call:', error);
            throw error;
        }
    }

    static async postFormData(url, formData) {
        try {
            const response = await fetch(API_BASE + url, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error en API call:', error);
            throw error;
        }
    }

    static async get(url) {
        try {
            const response = await fetch(API_BASE + url);
            return await response.json();
        } catch (error) {
            console.error('Error en API call:', error);
            throw error;
        }
    }
}

const EventosAPI = {
    // Login
    async login(email, password, userType) {
        const response = await fetch('procesos/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, userType })
        });
        return await response.text();
    },

    // Registro de usuario
    registrarUsuario: async (userData) => {
        return await ApiClient.post('/procesos/registrar_usuario.php', userData);
    },

    // Crear evento 
    crearEvento: async (formData) => {
        return await ApiClient.postFormData('/procesos/registrar_evento.php', formData);
    },

    // Obtener eventos
    obtenerEventos: async () => {
        return await ApiClient.get('/procesos/obtener_eventos.php');
    },

    obtenerEventosPorTipo: async (tipoId) => {
        return await ApiClient.get(`/procesos/obtener_eventos.php?tipo=${tipoId}`);
    },

    // Inscripciones
    inscribirEnEvento: async (idEvento, idUsuario) => {
        return await ApiClient.post('/procesos/inscribir.php', {
            id_evento: idEvento,
            id_usuario: idUsuario
        });
    },

    desinscribirDeEvento: async (idEvento, idUsuario) => {
        return await ApiClient.post('/procesos/desinscribir.php', {
            id_evento: idEvento,
            id_usuario: idUsuario
        });
    },
    
    obtenerMisInscripciones: async (userId) => {
        return await ApiClient.get(`/procesos/mis_inscripciones.php?usuario_id=${userId}`);
    },

    // Gestión de usuarios
    obtenerUsuarios: async () => {
        return await ApiClient.get('/procesos/obtener_usuarios.php');
    },

    eliminarUsuario: async (userId) => {
        return await ApiClient.post('/procesos/eliminar_usuario.php', {
            id_usuario: userId
        });
    },

    eliminarEvento: async (eventId) => {
        return await ApiClient.post('/procesos/eliminar_evento.php', {
            id_evento: eventId
        });
    }
};

window.ApiClient = ApiClient;
window.EventosAPI = EventosAPI;
console.log('✅ API.js cargado correctamente');