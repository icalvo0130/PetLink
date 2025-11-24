// Solicitud de citas

import router from '../utils/router.js';
import { getAllAppointments, updateAppointmentDecision } from '../services/admin-api.js';
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
        <div class="search-section">
          <div class="search-container">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Buscar por nombre del perro..."
              class="search-input"
            />
            <button id="clearSearchBtn" class="clear-search-btn">Limpiar</button>
          </div>
        </div>
        
        <div class="appointments-section">
          <div class="section-header">
            <h2>Citas Pendientes</h2>
            <span id="appointmentsCount" class="count-badge">0 citas</span>
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
      const dogName = button.dataset.dogName || '';
      const padrinoName = button.dataset.padrinoName || '';
      const phoneNumber = button.dataset.phoneNumber || '';
      const date = button.dataset.date || '';
      const time = button.dataset.time || '';
      
      if (appointmentId && decision) {
        e.preventDefault();
        e.stopPropagation();
        handleAppointmentDecision(
          parseInt(appointmentId),
          decision,
          dogName,
          padrinoName,
          phoneNumber,
          date,
          time
        );
      }
    });
  }
}

// Cargar citas desde el backend
async function loadAppointments() {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    // Usar el servicio API centralizado
    const response = await getAllAppointments();
    
    if (Array.isArray(response)) {
      allAppointments = response;
      filteredAppointments = [...allAppointments];
      renderAppointmentsList();
      updateAppointmentsCount();
    } else {
      showError('Error al cargar las citas');
    }
    
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
          <div class="dog-details">
            <h3>${appointment.dog_name || 'Sin nombre'}</h3>
            <p class="padrino-name">Padrino: ${appointment.padrino_name || 'Sin nombre'}</p>
          </div>
        </div>
        <div class="appointment-status">
          <span class="status-badge ${appointment.status || 'pending'}">${getStatusText(appointment.status)}</span>
        </div>
      </div>
      
      <div class="card-body">
        <div class="appointment-details">
          <div class="detail-item">
            <span class="label">Fecha:</span>
            <span class="value">${formatDate(appointment.date)}</span>
          </div>
          <div class="detail-item">
            <span class="label">Hora:</span>
            <span class="value">${appointment.time || 'No especificada'}</span>
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
          data-dog-name="${appointment.dog_name || ''}"
          data-padrino-name="${appointment.padrino_name || ''}"
          data-phone-number="${appointment.phone_number || ''}"
          data-date="${appointment.date || ''}"
          data-time="${appointment.time || ''}"
        >
          Aceptar
        </button>
        <button 
          class="action-btn reject-btn" 
          data-appointment-id="${appointment.id}"
          data-decision="rejected"
          data-dog-name="${appointment.dog_name || ''}"
          data-padrino-name="${appointment.padrino_name || ''}"
          data-phone-number="${appointment.phone_number || ''}"
          data-date="${appointment.date || ''}"
          data-time="${appointment.time || ''}"
        >
          Rechazar
        </button>
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

// Decisión de cita (aceptar/rechazar)
async function handleAppointmentDecision(appointmentId, decision, dogName, padrinoName, phoneNumber, date, time) {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    const actionText = decision === 'accepted' ? 'aceptar' : 'rechazar';
    if (!confirm(`¿Estás seguro de que quieres ${actionText} esta cita?`)) {
      return;
    }
    
    const buttons = document.querySelectorAll(`[data-appointment-id="${appointmentId}"] .action-btn`);
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.textContent = 'Procesando...';
    });
    
    // Usar el servicio API centralizado
    const response = await updateAppointmentDecision(appointmentId, {
      decision: decision,
      phoneNumber: phoneNumber,
      padrinoName: padrinoName,
      dogName: dogName,
      date: date,
      time: time
    });
    
    if (response.success) {
      const actionTextSuccess = decision === 'accepted' ? 'aceptada' : 'rechazada';
      
      // Mostrar mensaje según si el WhatsApp se envió o no
      if (response.whatsappSent) {
        showSuccess(`✅ Cita ${actionTextSuccess} exitosamente y notificación enviada por WhatsApp a ${padrinoName}`);
      } else {
        // La cita se procesó pero el WhatsApp falló
        showSuccess(`Cita ${actionTextSuccess} exitosamente`);
        setTimeout(() => {
          showError(`⚠️ Advertencia: No se pudo enviar WhatsApp. ${response.whatsappError || 'Verifica la configuración de Twilio'}`);
        }, 2000);
      }
      
      allAppointments = allAppointments.filter(apt => apt.id !== appointmentId);
      filteredAppointments = filteredAppointments.filter(apt => apt.id !== appointmentId);
      
      renderAppointmentsList();
      updateAppointmentsCount();
    } else {
      showError(response.error || 'Error al procesar la cita');
      
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.textContent = btn.classList.contains('accept-btn') ? '✅ Aceptar' : '❌ Rechazar';
      });
    }
    
  } catch (error) {
    console.error('Error al procesar cita:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando');
    
    const buttons = document.querySelectorAll(`[data-appointment-id="${appointmentId}"] .action-btn`);
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.textContent = btn.classList.contains('accept-btn') ? '✅ Aceptar' : '❌ Rechazar';
    });
  }
}

// Nota: makeRequestWithAuth ya no es necesario, usamos el servicio API centralizado

function formatDate(dateString) {
  if (!dateString) return 'No especificada';
  
  try {
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
