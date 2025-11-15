// Pantalla de estadísticas detalladas de un perro específico
// Usa la misma lógica que padrino-app con actualización en tiempo real

import router from '../utils/router.js';
import { getDogById } from '../services/admin-api.js';
import { checkAuth } from './admin-login.js';
import { addEventListener, removeEventListener } from '../services/websocket-admin.js';

let dogData = null;
let dogId = null;
let statsUpdatedListener = null;

export default async function renderDogEstadistics(id) {
  const auth = await checkAuth();
  if (!auth.isAuthenticated) {
    router.navigateTo('/admin-login');
    return;
  }

  // Obtener ID del perro desde parámetro de URL
  dogId = id;
  
  if (!dogId) {
    showError('ID del perro no proporcionado');
    router.navigateTo('/dashboard');
    return;
  }

  const app = document.getElementById('app');
  
  // Mostrar loading mientras se cargan los datos
  app.innerHTML = `
    <div class="statistics-container">
      <p class="loading">Cargando estadísticas...</p>
    </div>
  `;
  
  // Cargar las estadísticas
  await loadStatistics(dogId);
  setupRealtimeListeners();
}

/**
 * Configurar listeners en tiempo real para estadísticas
 */
function setupRealtimeListeners() {
  // Limpiar listener previo si existe
  if (statsUpdatedListener) {
    removeEventListener('stats-updated', statsUpdatedListener);
  }
  
  // Listener para estadísticas actualizadas
  statsUpdatedListener = (data) => {
    // Solo actualizar si es el perro que estamos viendo
    if (data.dogId === parseInt(dogId)) {
      updateStatisticsInRealTime(data.stats, data.changes);
    }
  };
  
  addEventListener('stats-updated', statsUpdatedListener);
}

/**
 * Cargar las estadísticas del perro
 */
async function loadStatistics(dogId) {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    // Cargar datos del perro (incluye food_level, health_level, wellbeing_level, affection_level)
    const stats = await getDogById(dogId);
    
    if (stats && stats.id) {
      dogData = stats;
      displayStatistics(stats, dogId);
    } else {
      showError('No se pudo cargar la información del perro');
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="statistics-container">
        <p class="error">Error al cargar las estadísticas</p>
        <button onclick="window.history.back()" class="btn-back">Volver</button>
      </div>
    `;
  }
}

/**
 * Mostrar las estadísticas
 */
function displayStatistics(stats, dogId) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="statistics-container">
      <button class="btn-back" id="btn-back">← Volver</button>
      
      <h1 class="statistics-title">Estadísticas de ${stats.name}</h1>
      
      <div class="realtime-indicator">
        <span class="realtime-dot"></span>
        <span class="realtime-text">Actualización en tiempo real</span>
      </div>
      
      <div class="statistics-bars">
        <div class="stat-item" data-stat="food">
          <div class="stat-header">
            <span class="stat-label">Comida</span>
            <span class="stat-value" id="food-value">${stats.food_level || 0}/10</span>
          </div>
          <div class="stat-bar-container">
            <div class="stat-bar stat-bar-food" id="food-bar" style="width: ${(stats.food_level || 0) * 10}%"></div>
          </div>
        </div>
        
        <div class="stat-item" data-stat="health">
          <div class="stat-header">
            <span class="stat-label">Salud</span>
            <span class="stat-value" id="health-value">${stats.health_level || 0}/10</span>
          </div>
          <div class="stat-bar-container">
            <div class="stat-bar stat-bar-health" id="health-bar" style="width: ${(stats.health_level || 0) * 10}%"></div>
          </div>
        </div>
        
        <div class="stat-item" data-stat="wellbeing">
          <div class="stat-header">
            <span class="stat-label">Bienestar / Accesorios</span>
            <span class="stat-value" id="wellbeing-value">${stats.wellbeing_level || 0}/10</span>
          </div>
          <div class="stat-bar-container">
            <div class="stat-bar stat-bar-wellbeing" id="wellbeing-bar" style="width: ${(stats.wellbeing_level || 0) * 10}%"></div>
          </div>
        </div>
        
        <div class="stat-item" data-stat="affection">
          <div class="stat-header">
            <span class="stat-label">Cariño / Atención</span>
            <span class="stat-value" id="affection-value">${stats.affection_level || 0}/10</span>
          </div>
          <div class="stat-bar-container">
            <div class="stat-bar stat-bar-affection" id="affection-bar" style="width: ${(stats.affection_level || 0) * 10}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Configurar evento del botón volver
  document.getElementById('btn-back').addEventListener('click', () => {
    // Limpiar listener antes de salir
    if (statsUpdatedListener) {
      removeEventListener('stats-updated', statsUpdatedListener);
      statsUpdatedListener = null;
    }
    router.navigateTo(`/dog-profile/${dogId}`);
  });
}

/**
 * Actualizar estadísticas en tiempo real (con animación)
 */
function updateStatisticsInRealTime(newStats, changes) {
  // Actualizar cada estadística que cambió
  if (changes.food_level !== undefined) {
    updateStatBar('food', newStats.food_level);
  }
  
  if (changes.health_level !== undefined) {
    updateStatBar('health', newStats.health_level);
  }
  
  if (changes.wellbeing_level !== undefined) {
    updateStatBar('wellbeing', newStats.wellbeing_level);
  }
  
  if (changes.affection_level !== undefined) {
    updateStatBar('affection', newStats.affection_level);
  }
  
  // Mostrar notificación temporal
  showUpdateNotification(changes);
}

/**
 * Actualizar una barra de estadística con animación
 */
function updateStatBar(statName, newValue) {
  const valueElement = document.getElementById(`${statName}-value`);
  const barElement = document.getElementById(`${statName}-bar`);
  const statItem = document.querySelector(`[data-stat="${statName}"]`);
  
  if (!valueElement || !barElement || !statItem) return;
  
  // Animar el valor
  valueElement.textContent = `${newValue}/10`;
  
  // Animar la barra
  barElement.style.width = `${newValue * 10}%`;
  
  // Agregar efecto de pulso
  statItem.classList.add('stat-updated');
  
  // Quitar efecto después de 1 segundo
  setTimeout(() => {
    statItem.classList.remove('stat-updated');
  }, 1000);
}

/**
 * Mostrar notificación de actualización
 */
function showUpdateNotification(changes) {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = 'stats-notification';
  
  // Determinar qué cambió
  let message = 'Estadísticas actualizadas';
  
  if (changes.health_level !== undefined) {
    message = 'Salud actualizada +1';
  } else if (changes.food_level !== undefined) {
    message = 'Alimentación actualizada +1';
  } else if (changes.wellbeing_level !== undefined) {
    message = 'Bienestar actualizado +1';
  } else if (changes.affection_level !== undefined) {
    message = 'Cariño actualizado +1';
  }
  
  notification.textContent = message;
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Quitar después de 3 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function showError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="statistics-container">
      <p class="error">${message}</p>
      <button onclick="window.history.back()" class="btn-back">Volver</button>
    </div>
  `;
}
