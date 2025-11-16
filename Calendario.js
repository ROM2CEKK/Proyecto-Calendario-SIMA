console.log("✅ calendario.js cargado");

// Variables globales (mantener tus variables)
let currentDate = new Date();
let events = [];
let currentUserType = localStorage.getItem('userType') || 'student';

class CalendarioManager {
    static init() {
        this.initializeCalendar();
        this.setupEventListeners();
        this.checkPermissions();
    }

    static checkPermissions() {
        if (currentUserType !== 'admin') {
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) adminBtn.style.display = 'none';
            
            const studentRegistrations = document.getElementById('studentRegistrations');
            if (studentRegistrations) studentRegistrations.style.display = 'block';
        } else {
            const studentRegistrations = document.getElementById('studentRegistrations');
            if (studentRegistrations) studentRegistrations.style.display = 'none';
        }
    }

    static setupEventListeners() {
        // Navegación del calendario
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousMonth());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextMonth());

        // Filtros de eventos
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.filterEvents(type);
            });
        });

        // Navegación de secciones
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.target.dataset.section;
                this.showSection(sectionId);
            });
        });

        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    static async initializeCalendar() {
        await this.loadEventsFromDB();
        this.updateCalendar();
        if (currentUserType === 'student') {
            this.updateEventRegistrations();
        }
    }

    static async loadEventsFromDB() {
        try {
            const data = await EventosAPI.obtenerEventos();
            
            if (data.success) {
                events = data.eventos.map(evento => ({
                    id: evento.id_evento,
                    title: evento.nombre_evento,
                    date: evento.fecha_hora.split('T')[0],
                    time: evento.fecha_hora.split('T')[1]?.substring(0, 5),
                    location: evento.lugar,
                    description: evento.descripcion_larga,
                    type: this.getEventTypeName(evento.id_tipo),
                    maxCapacity: evento.cupos,
                    price: evento.costo,
                    priceType: evento.costo > 0 ? 'paid' : 'free',
                    registeredUsers: evento.inscritos || []
                }));
                console.log('Eventos cargados:', events);
            } else {
                console.error("Error al cargar eventos:", data.message);
                events = [];
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            events = [];
        }
    }

    static getEventTypeName(idTipo) {
        const tipos = {
            1: 'Conferencia',
            2: 'Taller', 
            3: 'Seminario',
            4: 'Evento Cultural'
        };
        return tipos[idTipo] || 'General';
    }

    static updateCalendar() {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    calendarGrid.innerHTML = '';
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.innerHTML = `<div class="day-number">${day}</div>`;
        
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === currentDay.toDateString();
        });
        
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event';
            
            // Asegurar que registeredUsers sea un array
            const registeredUsers = Array.isArray(event.registeredUsers) ? event.registeredUsers : [];
            const registeredCount = registeredUsers.length;
            
            const hasCapacity = !event.maxCapacity || registeredCount < event.maxCapacity;
            const userEmail = localStorage.getItem('userEmail');
            
            // Verificar si el usuario está inscrito (manejar tanto array como otros tipos)
            let isRegistered = false;
            if (Array.isArray(registeredUsers)) {
                isRegistered = registeredUsers.includes(userEmail);
            } else if (typeof registeredUsers === 'string') {
                isRegistered = registeredUsers === userEmail;
            }
            
            eventElement.innerHTML = `
                <div class="event-title">${event.title}</div>
                ${event.time ? `<div class="event-time">🕒 ${event.time}</div>` : ''}
                ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
                ${event.maxCapacity ? `<div class="event-capacity">👥 ${registeredCount}/${event.maxCapacity}</div>` : ''}
                ${event.priceType === 'paid' ? `<div class="event-price">💰 $${event.price}</div>` : '<div class="event-free">🆓 Gratuito</div>'}
                ${currentUserType === 'student' ? 
                  `<button class="btn-register" onclick="CalendarioManager.registerForEvent(${event.id})" 
                    ${isRegistered || !hasCapacity ? 'disabled' : ''}>
                    ${isRegistered ? 'Inscrito ✓' : (hasCapacity ? 'Inscribirse' : 'Sin cupo')}
                   </button>` : 
                  `<button class="btn-delete" onclick="CalendarioManager.deleteEvent(${event.id})">Eliminar</button>`
                }
            `;
            dayElement.appendChild(eventElement);
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

    static previousMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        this.updateCalendar();
    }

    static nextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        this.updateCalendar();
    }

    static filterEvents(type) {
        // Por ahora mostrar todos los eventos
        this.updateCalendar();
    }

    static async registerForEvent(eventId) {
    const userEmail = localStorage.getItem('userEmail');
    let userId = localStorage.getItem('userId');
    
    console.log("🔍 [DEBUG] Datos para inscripción:", {
        eventId: eventId,
        userEmail: userEmail,
        userId: userId
    });

    // Validar userId
    if (!userId || userId === 'null' || userId === 'undefined') {
        const userMap = {
            'diego@uadec.mx': 1,
            'mas@uadec.mx': 2, 
            'set@uadec.mx': 3,
            'brayan@uadec.mx': 4,
            'test@test.com': 5
        };
        userId = userMap[userEmail] || 1;
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
        this.showMessage('Error: ID de usuario inválido', 'error');
        return;
    }

    const event = events.find(e => e.id === eventId);
    
    if (!event) {
        this.showMessage('Evento no encontrado', 'error');
        return;
    }
    
    // Asegurar que registeredUsers sea un array
    if (!Array.isArray(event.registeredUsers)) {
        event.registeredUsers = [];
    }
    
    if (event.registeredUsers.includes(userEmail)) {
        this.showMessage('Ya estás inscrito en este evento', 'warning');
        return;
    }
    
    // Deshabilitar botón temporalmente
    const buttons = document.querySelectorAll(`.btn-register[onclick*="${eventId}"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Inscribiendo...';
    });

    try {
        console.log("📤 [DEBUG] Enviando inscripción...");
        
        const result = await EventosAPI.inscribirEnEvento(eventId, userIdNum);
        
        console.log("📨 [DEBUG] Respuesta del servidor:", result);
        
        if (result.includes('éxito') || result.includes('Inscripción exitosa')) {
            event.registeredUsers.push(userEmail);
            await this.updateEventRegistrations();
            this.updateCalendar();
            this.showMessage('✅ Inscrito exitosamente en: ' + event.title, 'success');
        } else {
            this.showMessage('❌ ' + result, 'error');
        }
    } catch (error) {
        console.error('💥 Error al inscribirse:', error);
        this.showMessage('❌ Error de conexión al inscribirse', 'error');
    } finally {
        // Rehabilitar botones
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.textContent = 'Inscribirse';
        });
    }
}

   static async unregisterFromEvent(eventId) {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        this.showMessage('Error: No se pudo identificar tu usuario', 'error');
        return;
    }

    // Confirmación
    if (!confirm('¿Estás seguro de que quieres desinscribirte de este evento?')) {
        return;
    }

    // Deshabilitar el botón temporalmente para evitar múltiples clics
    const buttons = document.querySelectorAll(`.btn-unregister[onclick*="${eventId}"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Desinscribiendo...';
    });

    try {
        const result = await EventosAPI.desinscribirDeEvento(eventId, userId);
        
        // SOLO UN MENSAJE - verificar diferentes respuestas posibles
        if (result.includes('éxito') || 
            result.includes('Desinscripción exitosa') || 
            result === 'Desinscripción exitosa') {
            
            this.showMessage('✅ Desinscripción exitosa', 'success');
            
            // Actualizar la interfaz
            await this.updateEventRegistrations();
            this.updateCalendar();
            
        } else {
            // Cualquier otra respuesta se considera error
            this.showMessage('❌ ' + result, 'error');
        }
        
    } catch (error) {
        console.error('Error al desinscribirse:', error);
        this.showMessage('❌ Error de conexión al desinscribirse', 'error');
    } finally {
        // Rehabilitar botones
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.textContent = 'Desinscribirse';
        });
    }
}

    static async updateEventRegistrations() {
    const registrationsList = document.getElementById('registrationsList');
    if (!registrationsList) return;

    const userId = localStorage.getItem('userId');
    
    if (!userId || userId === 'null') {
        registrationsList.innerHTML = '<p>No se pudo identificar tu usuario</p>';
        return;
    }

    try {
        // Obtener inscripciones reales de la base de datos
        const result = await EventosAPI.obtenerMisInscripciones(userId);
        
        if (result.success && result.inscripciones.length > 0) {
            registrationsList.innerHTML = result.inscripciones.map(inscripcion => `
                <div class="registered-event">
                    <strong>${inscripcion.title}</strong>
                    <div class="event-date">📅 ${new Date(inscripcion.date).toLocaleDateString('es-ES')}</div>
                    ${inscripcion.time ? `<div class="event-time">🕒 ${inscripcion.time}</div>` : ''}
                    ${inscripcion.location ? `<div class="event-location">📍 ${inscripcion.location}</div>` : ''}
                    <div class="inscription-date">Inscrito el: ${new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-ES')}</div>
                    <button class="btn-unregister" onclick="CalendarioManager.unregisterFromEvent(${inscripcion.id_evento})">
                        Desinscribirse
                    </button>
                </div>
            `).join('');
        } else {
            registrationsList.innerHTML = '<p>No estás inscrito en ningún evento</p>';
        }
    } catch (error) {
        console.error('Error al cargar inscripciones:', error);
        registrationsList.innerHTML = '<p>Error al cargar tus inscripciones</p>';
    }
}

    static async deleteEvent(eventId) {
        if (confirm('¿Está seguro de eliminar este evento?')) {
            try {
                // Aquí iría tu llamada a la API para eliminar evento
                this.showMessage('Función de eliminar evento en desarrollo', 'info');
            } catch (error) {
                console.error('Error al eliminar evento:', error);
                this.showMessage('Error de conexión al eliminar evento', 'error');
            }
        }
    }

    static showSection(sectionId) {
        console.log("Mostrando sección:", sectionId);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.main__contenido, .calendar-section, .admin-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            if (sectionId === 'calendar') {
                this.initializeCalendar();
            }
        }
    }

    static async mostrarContenido(tipo) {
        const contenido = document.getElementById("contenido");
        if (!contenido) return;

        const tipos = {
            facultativos: 1,       // Conferencia
            universitarios: 2,     // Taller
            sociedad: 3,           // Seminario
            totales: 4             // Evento cultural
        };

        const idTipo = tipos[tipo];

        try {
            const data = await EventosAPI.obtenerEventosPorTipo(idTipo);

            if (data.success) {
                if (data.eventos.length === 0) {
                    contenido.innerHTML = `<p>No hay eventos de este tipo aún.</p>`;
                    return;
                }

                contenido.innerHTML = data.eventos.map(evento => `
                    <div class="evento">
                        <h2>${evento.nombre_evento}</h2>
                        <p>${evento.descripcion_corta}</p>
                        <p><strong>Lugar:</strong> ${evento.lugar}</p>
                        <p><strong>Fecha:</strong> ${new Date(evento.fecha_hora).toLocaleString()}</p>
                        ${evento.imagen_url ? `<img src="${evento.imagen_url}" width="300">` : ''}
                    </div>
                `).join('');
            } else {
                contenido.innerHTML = `<p>Error al cargar los eventos: ${data.message}</p>`;
            }
        } catch (err) {
            contenido.innerHTML = `<p>Error de conexión: ${err.message}</p>`;
        }
    }

    static logout() {
        localStorage.clear();
        window.location.href = 'Login.html';
    }

    static showMessage(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            max-width: 400px;
            ${type === 'success' ? 'background: #4CAF50;' : ''}
            ${type === 'error' ? 'background: #f44336;' : ''}
            ${type === 'warning' ? 'background: #ff9800;' : ''}
            ${type === 'info' ? 'background: #2196F3;' : ''}
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}
// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página cargada - Inicializando Calendario");
    
    // Verificar autenticación
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'Login.html';
        return;
    }
    
    // Configurar permisos 
    currentUserType = localStorage.getItem('userType') || 'student';
    
    // Inicializar calendario
    CalendarioManager.init();
    
    // Mostrar home por defecto
    CalendarioManager.showSection('home');
});

// Exportar funciones globales para HTML
window.mostrarContenido = CalendarioManager.mostrarContenido;
window.previousMonth = CalendarioManager.previousMonth;
window.nextMonth = CalendarioManager.nextMonth;
window.registerForEvent = CalendarioManager.registerForEvent;
window.unregisterFromEvent = CalendarioManager.unregisterFromEvent;
window.showSection = CalendarioManager.showSection;
window.logout = CalendarioManager.logout;