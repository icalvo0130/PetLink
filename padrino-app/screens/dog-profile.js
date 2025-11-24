// Esta es la pantalla del PERFIL DEL PERRO

import { getDogById, getNeedsByDog } from '../services/api.js';
import router from '../utils/router.js';

// Renderizar (mostrar) el perfil del perro
export function renderDogProfile(dogId) {
  const app = document.getElementById('app');
  
  // Mostrar loading mientras se cargan los datos
  app.innerHTML = `
    <div class="dog-profile-container">
      <p class="loading">Cargando perfil del perro...</p>
    </div>
  `;
  
  // Cargar los datos del perro y sus necesidades
  loadDogProfile(dogId);
}

// Cargar el perfil completo del perro
async function loadDogProfile(dogId) {
  try {
    // Traer el perro y sus necesidades al mismo tiempo
    const [dog, needs] = await Promise.all([
      getDogById(dogId),
      getNeedsByDog(dogId)
    ]);
    
    displayDogProfile(dog, needs);
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    document.getElementById('app').innerHTML = `
      <div class="dog-profile-container">
        <p class="error">Error al cargar el perfil del perro</p>
        <button onclick="window.history.back()" class="btn-back">Volver</button>
      </div>
    `;
  }
}

// Mostrar el perfil del perro
function displayDogProfile(dog, needs) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="dog-profile-container">
      <!-- Boton de volver -->
      <button class="btn-back" id="btn-back">← Volver</button>
      
      <!-- Imagen del perro -->
      <div class="dog-profile-image">
        <img src="${dog.image}" alt="${dog.name}">
      </div>
      
      <!-- Informacion del perro -->
      <div class="dog-profile-info">
        <h1 class="dog-profile-name">${dog.name}</h1>
        <p class="dog-profile-location">${dog.location || 'Sin ubicacion'}</p>
        
        <!-- Caracteristicas -->
        <div class="dog-characteristics">
          <div class="characteristic">
            <span class="characteristic-label">Edad:</span>
            <span class="characteristic-value">${dog.age || 'N/A'} años</span>
          </div>
          <div class="characteristic">
            <span class="characteristic-label">Tamaño:</span>
            <span class="characteristic-value">${dog.size || 'N/A'}</span>
          </div>
          <div class="characteristic">
            <span class="characteristic-label">Peso:</span>
            <span class="characteristic-value">${dog.weight || 'N/A'} kg</span>
          </div>
        </div>
        
        <!-- Descripcion -->
        <div class="dog-description">
          <h3>Sobre mi</h3>
          <p>${dog.description || 'Sin descripcion'}</p>
        </div>
        
        <!-- Boton de agendar cita (solo si esta disponible) -->
        ${dog.availability ? `
          <button class="btn-schedule" id="btn-schedule">Agendar cita</button>
        ` : ''}
      </div>
      
      <!-- Seccion de necesidades -->
      <div class="dog-needs-section">
        <h2>Mis necesidades</h2>
        <div id="needs-list" class="needs-list">
          ${needs.length > 0 ? displayNeeds(needs) : '<p class="no-needs">No hay necesidades registradas</p>'}
        </div>
      </div>
      
      <!-- Boton de estadisticas -->
      <button class="btn-statistics" id="btn-statistics">Ver estadisticas</button>
      
      <!-- Seccion de accesorios -->
      <div class="dog-accessories-section">
        <h2>Accesorios</h2>
        <p class="accessories-description">Dale un regalo especial a ${dog.name}</p>
        <div class="accessories-buttons">
          <button class="btn-accessories" id="btn-accessories">Ver Accesorios</button>
          <button class="btn-gallery" id="btn-gallery">Ver Galeria</button>
        </div>
      </div>
    </div>
  `;
  
  // Agregar eventos
  setupProfileEvents(dog, needs);
}

// Mostrar las necesidades como cards
function displayNeeds(needs) {
  return needs.map(need => `
    <div class="need-card" data-id="${need.id}">
      <img src="${need.image}" alt="${need.name}" class="need-image">
      <div class="need-info">
        <h4 class="need-name">${need.name}</h4>
        <p class="need-description">${need.description || ''}</p>
        <p class="need-price">$${need.price}</p>
      </div>
    </div>
  `).join('');
}

// Configurar eventos de la pantalla
function setupProfileEvents(dog, needs) {
  // Boton volver
  document.getElementById('btn-back').addEventListener('click', () => {
    router.navigateTo('/home');
  });
  
  // Boton agendar cita
  const btnSchedule = document.getElementById('btn-schedule');
  if (btnSchedule) {
    btnSchedule.addEventListener('click', () => {
      router.navigateTo(`/dog/${dog.id}/schedule`);
    });
  }
  
  // Click en cada necesidad
  document.querySelectorAll('.need-card').forEach(card => {
    card.addEventListener('click', () => {
      const needId = card.dataset.id;
      router.navigateTo(`/need/${needId}`);
    });
  });
  
  // Boton de estadisticas
  document.getElementById('btn-statistics').addEventListener('click', () => {
    router.navigateTo(`/dog/${dog.id}/statistics`);
  });
  
  // Boton ver accesorios (CORREGIDO)
  const btnAccessories = document.getElementById('btn-accessories');
  if (btnAccessories) {
    btnAccessories.addEventListener('click', () => {
      router.navigateTo(`/accessories/${dog.id}`);
    });
  }
  
  // Boton ver galeria (CORREGIDO)
  const btnGallery = document.getElementById('btn-gallery');
  if (btnGallery) {
    btnGallery.addEventListener('click', () => {
      router.navigateTo(`/gallery/${dog.id}`);
    });
  }
}