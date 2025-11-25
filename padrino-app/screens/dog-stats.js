// Esta es la pantalla de ESTADISTICAS del perro con WebSocket en tiempo real

import { getDogStatistics } from '../services/api.js';
import router from '../utils/router.js';
import { io } from 'socket.io-client';

let socket = null;
let currentDogId = null;

// Renderizar la pantalla de estadisticas
export function renderDogStatistics(dogId) {
  const app = document.getElementById('app');
  currentDogId = dogId;
  
  // Mostrar loading mientras se cargan los datos
  app.innerHTML = `
    <div class="statistics-container">
      <p class="loading">Cargando estadisticas...</p>
    </div>
  `;
  
  // Conectar a WebSocket
  connectToSocket(dogId);
  
  // Cargar las estadisticas
  loadStatistics(dogId);
}

// Conectar a Socket.IO
function connectToSocket(dogId) {
  // Si ya hay una conexion, desconectar primero
  if (socket) {
    socket.disconnect();
  }
  
  // Conectar al servidor WebSocket
  socket = io('http://localhost:5050');
  
  socket.on('connect', () => {
    console.log('WebSocket conectado. ID:', socket.id);
  });
  
  // Escuchar evento de estadisticas actualizadas
  socket.on('stats-updated', (data) => {
    console.log('Evento recibido: stats-updated', data);
    
    // Solo actualizar si es el perro que estamos viendo
    if (data.dogId === parseInt(dogId)) {
      console.log('Actualizando estadisticas en tiempo real...');
      updateStatisticsInRealTime(data.stats, data.changes);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('WebSocket desconectado');
  });
}

// Cargar las estadisticas del perro
async function loadStatistics(dogId) {
  try {
    const stats = await getDogStatistics(dogId);
    displayStatistics(stats, dogId);
  } catch (error) {
    console.error('Error al cargar estadisticas:', error);
    document.getElementById('app').innerHTML = `
      <div class="statistics-container">
        <p class="error">Error al cargar las estadisticas</p>
        <button onclick="window.history.back()" class="btn-back">Volver</button>
      </div>
    `;
  }
}

// Mostrar las estadisticas
function displayStatistics(stats, dogId) {
  const app = document.getElementById('app');
  
  // Datos del perro
  const dogName = stats.name || 'Sin nombre';
  const foundationName = stats.foundation_name || 'Pazanimal';
  const weight = stats.weight || '0';
  const age = stats.age || '0';
  const availability = stats.availability ? 'Disponible' : 'No disponible';
  const size = stats.size || '0cm';
  
  app.innerHTML = `
    <div class="statistics-container">
      <!-- Header amarillo -->
      <div class="stats-header">
        <button class="btn-back" id="btn-back">‹</button>
      </div>
      
      <!-- Card de info -->
      <div class="stats-info-card">
        <h1 class="dog-name">${dogName}</h1>
        
        <!-- Barras de estadisticas -->
        <div class="statistics-bars">
          <div class="stat-item" data-stat="food">
            <div class="stat-bar-container">
              <div class="stat-bar stat-bar-food" id="food-bar" style="width: ${stats.food_level * 10}%; background-color: #9c27b0;">
                <img src="/images/Pata4.png" class="paw-icon" alt="">
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-value" id="food-value">${stats.food_level}/10</span>
              <span class="stat-label">Comida</span>
            </div>
          </div>
          
          <div class="stat-item" data-stat="health">
            <div class="stat-bar-container">
              <div class="stat-bar stat-bar-health" id="health-bar" style="width: ${stats.health_level * 10}%; background-color: #26c6da;">
                <img src="/images/Pata3.png" class="paw-icon" alt="">
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-value" id="health-value">${stats.health_level}/10</span>
              <span class="stat-label">Salud</span>
            </div>
          </div>
          
          <div class="stat-item" data-stat="wellbeing">
            <div class="stat-bar-container">
              <div class="stat-bar stat-bar-wellbeing" id="wellbeing-bar" style="width: ${stats.wellbeing_level * 10}%; background-color: #f48fb1;">
                <img src="/images/Pata1.png" class="paw-icon" alt="">
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-value" id="wellbeing-value">${stats.wellbeing_level}/10</span>
              <span class="stat-label">Bienestar/Accesorios</span>
            </div>
          </div>
          
          <div class="stat-item" data-stat="affection">
            <div class="stat-bar-container">
              <div class="stat-bar stat-bar-affection" id="affection-bar" style="width: ${stats.affection_level * 10}%; background-color: #ff7043;">
                <img src="/images/Pata2.png" class="paw-icon" alt="">
              </div>
            </div>
            <div class="stat-footer">
              <span class="stat-value" id="affection-value">${stats.affection_level}/10</span>
              <span class="stat-label">Cariño / Atención</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Configurar evento del boton volver
  document.getElementById('btn-back').addEventListener('click', () => {
    // Desconectar socket antes de salir
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    router.navigateTo(`/dog/${dogId}`);
  });
}

// Actualizar estadisticas en tiempo real (con animacion)
function updateStatisticsInRealTime(newStats, changes) {
  console.log('Nuevas estadisticas:', newStats);
  console.log('Cambios:', changes);
  
  // Actualizar cada estadistica que cambio
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
  
  // Mostrar notificacion temporal
  showUpdateNotification(changes);
}

// Actualizar una barra de estadistica con animacion
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
  
  // Quitar efecto despues de 1 segundo
  setTimeout(() => {
    statItem.classList.remove('stat-updated');
  }, 1000);
}

// Mostrar notificacion de actualizacion
function showUpdateNotification(changes) {
  // Crear elemento de notificacion
  const notification = document.createElement('div');
  notification.className = 'stats-notification';
  
  // Determinar que cambio
  let message = 'Estadisticas actualizadas';
  
  if (changes.health_level !== undefined) {
    message = 'Salud actualizada +1';
  } else if (changes.food_level !== undefined) {
    message = 'Alimentacion actualizada +1';
  } else if (changes.wellbeing_level !== undefined) {
    message = 'Bienestar actualizado +1';
  } else if (changes.affection_level !== undefined) {
    message = 'Carino actualizado +1';
  }
  
  notification.textContent = message;
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Quitar despues de 3 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Limpiar al salir
window.addEventListener('beforeunload', () => {
  if (socket) {
    socket.disconnect();
  }
});