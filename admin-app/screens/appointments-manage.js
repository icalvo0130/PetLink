// Solicitud de citas

import router from '../utils/router.js';
import { getAllAppointments, updateAppointmentDecision, getAllUsers, getAllDogs } from '../services/admin-api.js';
import { checkAuth } from './admin-login.js';
import { addEventListener, removeEventListener } from '../services/websocket-admin.js';

let allAppointments = [];
let filteredAppointments = [];

// Referencias a los listeners para poder limpiarlos
let appointmentCreatedListener = null;

export default async function renderAppointmentsManage() {
  const auth = await checkAuth();
  if (!auth.isAuthenticated) {
    router.navigateTo('/admin-login');
    return;
  }

  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="appointments-manage-container">
      <header class="page-header">
        <h1>Gestión de Solicitudes de Citas</h1>
        <button id="backBtn" class="back-btn">← Volver al Dashboard</button>
      </header>
      
      <main class="appointments-content">
        <div class="appointments-section">
          <div class="section-header">
            <h2>Citas Pendientes</h2>
            <span id="appointmentsCount" class="count-badge">0 citas</span>
          </div>
          
          <div class="search-section">
            <div class="search-container">
              <input 
                type="text" 
                id="searchInput" 
                placeholder="Busca un perrito"
                class="search-input"
              />
              <button id="clearSearchBtn" class="clear-search-btn">Limpiar</button>
            </div>
          </div>
          
          <div id="appointmentsList" class="appointments-list">
            <div class="loading-message">Cargando citas...</div>
          </div>
          
          <div id="noAppointmentsMessage" class="no-appointments" style="display: none;">
            <p>No hay citas pendientes</p>
            <p>Las nuevas solicitudes aparecerán aquí</p>
          </div>
        </div>
        
        <div class="messages-section">
          <div id="successMessage" class="success-message" style="display: none;"></div>
          <div id="errorMessage" class="error-message" style="display: none;"></div>
        </div>
      </main>
    </div>
  `;
  
  await loadAppointments();
  setupEventListeners();
  setupRealtimeListeners();
}

/**
 * Configurar listeners en tiempo real
 */
function setupRealtimeListeners() {
  // Limpiar listeners previos si existen
  if (appointmentCreatedListener) {
    removeEventListener('appointment-created', appointmentCreatedListener);
  }
  
  appointmentCreatedListener = async () => {
    await loadAppointments();
    showSuccess('Nueva cita recibida - Vista actualizada');
  };
  
  addEventListener('appointment-created', appointmentCreatedListener);
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const backBtn = document.getElementById('backBtn');
  const appointmentsList = document.getElementById('appointmentsList');
  
  searchInput.addEventListener('input', handleSearch);
  
  clearSearchBtn.addEventListener('click', clearSearch);
  
  backBtn.addEventListener('click', () => router.navigateTo('/dashboard'));
  
  // Event delegation para los botones Accept/Reject
  if (appointmentsList) {
    appointmentsList.addEventListener('click', (e) => {
      const button = e.target.closest('.action-btn');
      if (!button) return;
      
      const appointmentId = button.dataset.appointmentId;
      const decision = button.dataset.decision;
      
      if (appointmentId && decision) {
        e.preventDefault();
        e.stopPropagation();
        
        // Buscar el appointment completo desde allAppointments
        const appointment = allAppointments.find(apt => apt.id === parseInt(appointmentId));
        if (appointment) {
          handleAppointmentDecision(appointment, decision);
        }
      }
    });
  }
}

// Cargar citas desde el backend y enriquecer con datos de usuarios y perros
async function loadAppointments() {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    // Cargar appointments
    const appointmentsResponse = await getAllAppointments();
    
    if (!Array.isArray(appointmentsResponse)) {
      showError('Error al cargar las citas');
      return;
    }
    
    // Extraer IDs únicos de padrinos y perros
    const padrinoIds = [...new Set(appointmentsResponse.map(apt => apt.id_padrino).filter(Boolean))];
    const dogIds = [...new Set(appointmentsResponse.map(apt => apt.id_dog).filter(Boolean))];
    
    // Batch fetch de usuarios y perros en paralelo
    const [usersResponse, dogsResponse] = await Promise.all([
      getAllUsers().catch(() => []),
      getAllDogs().catch(() => [])
    ]);
    
    // Crear mapas para lookup rápido
    const usersMap = new Map();
    const dogsMap = new Map();
    
    if (Array.isArray(usersResponse)) {
      usersResponse.forEach(user => {
        if (user.id) {
          usersMap.set(user.id, user);
        }
      });
    }
    
    if (Array.isArray(dogsResponse)) {
      dogsResponse.forEach(dog => {
        if (dog.id) {
          dogsMap.set(dog.id, dog);
        }
      });
    }
    
    // Enriquecer appointments con datos de usuarios y perros
    allAppointments = appointmentsResponse.map(appointment => {
      const padrino = appointment.id_padrino ? usersMap.get(appointment.id_padrino) : null;
      const dog = appointment.id_dog ? dogsMap.get(appointment.id_dog) : null;
      
      return {
        ...appointment,
        padrino_name: padrino?.name || 'Sin nombre',
        phone_number: padrino?.phone_number || null,
        dog_name: dog?.name || 'Sin nombre',
        dog_image: dog?.image || null
      };
    });
    
    filteredAppointments = [...allAppointments];
    renderAppointmentsList();
    updateAppointmentsCount();
    
  } catch (error) {
    console.error('Error al cargar citas:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando');
  }
}

function renderAppointmentsList() {
  const appointmentsList = document.getElementById('appointmentsList');
  const noAppointmentsMessage = document.getElementById('noAppointmentsMessage');
  
  if (filteredAppointments.length === 0) {
    appointmentsList.innerHTML = '';
    noAppointmentsMessage.style.display = 'block';
    return;
  }
  
  noAppointmentsMessage.style.display = 'none';
  
  appointmentsList.innerHTML = filteredAppointments.map(appointment => `
    <div class="appointment-card" data-appointment-id="${appointment.id}">
      <div class="card-header">
        <div class="dog-info">
          <div class="dog-image">
            ${appointment.dog_image ? 
              `<img src="${appointment.dog_image}" alt="${appointment.dog_name}" />` : 
              '<div class="no-image">🐕</div>'
            }
          </div>
        </div>
        <div class="appointment-status">
          <span class="status-badge ${appointment.status || 'pending'}">${getStatusText(appointment.status)}</span>
        </div>
      </div>
      
      <div class="card-body">
        <div class="card-content">
          <h3 class="dog-name">${appointment.dog_name || 'Sin nombre'}</h3>
          <p class="padrino-name">Padrino: ${appointment.padrino_name || 'Sin nombre'}</p>
          <div class="appointment-details">
            <div class="detail-item">
              <span class="label">Fecha:</span>
              <span class="value">${formatDate(appointment.date)}</span>
            </div>
            <div class="detail-item">
              <span class="label">Hora:</span>
              <span class="value">${formatTimeDisplay(appointment.time)}</span>
            </div>
            <div class="detail-item">
              <span class="label">Teléfono:</span>
              <span class="value">${appointment.phone_number || 'No disponible'}</span>
            </div>
            ${appointment.notes ? `
              <div class="detail-item">
                <span class="label">Notas:</span>
                <span class="value">${appointment.notes}</span>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="card-actions">
          <button 
            class="action-btn accept-btn" 
            data-appointment-id="${appointment.id}"
            data-decision="accepted"
          >
            Aceptar
          </button>
          <button 
            class="action-btn reject-btn" 
            data-appointment-id="${appointment.id}"
            data-decision="rejected"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    filteredAppointments = [...allAppointments];
  } else {
    filteredAppointments = allAppointments.filter(appointment => 
      (appointment.dog_name && appointment.dog_name.toLowerCase().includes(searchTerm)) ||
      (appointment.padrino_name && appointment.padrino_name.toLowerCase().includes(searchTerm))
    );
  }
  
  renderAppointmentsList();
  updateAppointmentsCount();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  filteredAppointments = [...allAppointments];
  renderAppointmentsList();
  updateAppointmentsCount();
}

// Formatear fecha para evitar off-by-one (zona horaria)
// El problema: cuando se envía una fecha como string ISO, puede cambiar un día 
// al interpretarse en diferentes zonas horarias. Solución: enviar YYYY-MM-DD o 
// convertir a UTC con hora fija (mediodía) antes de serializar.
function formatDateForAPI(dateString) {
  if (!dateString) return null;
  
  try {
    // Si ya es YYYY-MM-DD, retornarlo directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parsear la fecha y convertir a UTC con hora mediodía para evitar off-by-one
    const date = new Date(dateString);
    // Usar UTC para crear fecha sin efectos de zona horaria
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    // Retornar formato YYYY-MM-DD (el backend puede parsearlo correctamente)
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    // Fallback: intentar extraer YYYY-MM-DD del string original
    const match = dateString.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : dateString;
  }
}

// Decisión de cita (aceptar/rechazar)
async function handleAppointmentDecision(appointment, decision) {
  // Validar que el appointment tenga todos los datos necesarios
  if (!appointment.padrino_name || !appointment.dog_name || !appointment.phone_number || !appointment.date || !appointment.time) {
    showError('Faltan datos necesarios para procesar la cita. Por favor recarga la página.');
    return;
  }
  
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    const appointmentId = appointment.id;
    const actionText = decision === 'accepted' ? 'aceptar' : 'rechazar';
    
    if (!confirm(`¿Estás seguro de que quieres ${actionText} esta cita?`)) {
      return;
    }
    
    // Deshabilitar botones para este appointment específico
    const buttons = document.querySelectorAll(`[data-appointment-id="${appointmentId}"] .action-btn`);
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.textContent = 'Procesando...';
    });
    
    // Formatear fecha para evitar off-by-one
    const formattedDate = formatDateForAPI(appointment.date);
    
    // Preparar payload completo para el backend
    const payload = {
      decision: decision,
      phoneNumber: appointment.phone_number,
      padrinoName: appointment.padrino_name,
      dogName: appointment.dog_name,
      date: formattedDate,
      time: appointment.time
    };
    
    // Usar el servicio API centralizado
    const response = await updateAppointmentDecision(appointmentId, payload);
    
    if (response.success) {
      const actionTextSuccess = decision === 'accepted' ? 'aceptada' : 'rechazada';
      
      // Mostrar mensaje según si el WhatsApp se envió o no
      if (response.whatsappSent) {
        showSuccess(`✅ Cita ${actionTextSuccess} exitosamente y notificación enviada por WhatsApp a ${appointment.padrino_name}`);
      } else {
        // La cita se procesó pero el WhatsApp falló
        showSuccess(`Cita ${actionTextSuccess} exitosamente`);
        setTimeout(() => {
          showError(`⚠️ Advertencia: No se pudo enviar WhatsApp. ${response.whatsappError || 'Verifica la configuración de Twilio'}`);
        }, 2000);
      }
      
      // Remover la cita de las listas
      allAppointments = allAppointments.filter(apt => apt.id !== appointmentId);
      filteredAppointments = filteredAppointments.filter(apt => apt.id !== appointmentId);
      
      renderAppointmentsList();
      updateAppointmentsCount();
    } else {
      showError(response.error || 'Error al procesar la cita');
      
      // Rehabilitar botones en caso de error
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.textContent = btn.classList.contains('accept-btn') ? 'Aceptar' : 'Rechazar';
      });
    }
    
  } catch (error) {
    console.error('Error al procesar cita:', error);
    showError(error.message || 'Error de conexión. Verifica que el servidor esté funcionando');
    
    // Rehabilitar botones en caso de error
    const buttons = document.querySelectorAll(`[data-appointment-id="${appointment.id}"] .action-btn`);
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.textContent = btn.classList.contains('accept-btn') ? 'Aceptar' : 'Rechazar';
    });
  }
}

// Nota: makeRequestWithAuth ya no es necesario, usamos el servicio API centralizado

function formatDate(dateString) {
  if (!dateString) return 'No especificada';
  
  try {
    // Si viene en formato YYYY-MM-DD, parsearlo directamente sin convertir a Date
    // para evitar problemas de zona horaria que cambian el día
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
      
      const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      
      const weekday = dayNames[date.getDay()];
      const monthName = monthNames[date.getMonth()];
      
      return `${weekday}, ${day} de ${monthName} de ${year}`;
    }
    
    // Fallback para otros formatos
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Formatear hora de formato 24h a 12h AM/PM (si viene en formato 24h)
function formatTimeDisplay(timeString) {
  if (!timeString) return 'No especificada';
  
  // Si ya está en formato con AM/PM, retornarlo tal cual
  if (timeString.includes('a.m.') || timeString.includes('p.m.') || timeString.includes('AM') || timeString.includes('PM')) {
    return timeString;
  }
  
  // Si viene en formato "HH:MM - HH:MM" (24h), convertir a 12h
  if (timeString.includes(' - ')) {
    const [startTime, endTime] = timeString.split(' - ');
    return `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`;
  }
  
  // Si es una sola hora en formato 24h
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return formatTimeTo12Hour(timeString);
  }
  
  // Retornar tal cual si no coincide con ningún formato esperado
  return timeString;
}

// Convertir hora formato 24h a 12h AM/PM
function formatTimeTo12Hour(time24) {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'p.m.' : 'a.m.';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Pendiente',
    'accepted': 'Aceptada',
    'rejected': 'Rechazada',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  };
  
  return statusMap[status] || 'Desconocido';
}

function updateAppointmentsCount() {
  const countElement = document.getElementById('appointmentsCount');
  const count = filteredAppointments.length;
  countElement.textContent = `${count} ${count === 1 ? 'cita' : 'citas'}`;
}

function showSuccess(message) {
  const successMessage = document.getElementById('successMessage');
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 5000);
}

function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 7000);
}

// Función ya no necesita ser global, se maneja con event delegation
