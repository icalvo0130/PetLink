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
  
  // Obtener nombre de la fundación
  const foundationName = dog.foundation_name || dog.location || 'Pazanimal';

  app.innerHTML = `
    <div class="dog-profile-container">
      <!-- Header con imagen -->
      <div class="profile-header">
        <button class="btn-back" id="btn-back">‹</button>
        <div class="dog-profile-image">
          <img src="${dog.image}" alt="${dog.name}">
        </div>
      </div>
      
      <!-- Info del perro -->
      <div class="profile-info-card">
        <h1 class="dog-profile-name">${dog.name}</h1>
        <p class="dog-profile-location">📍 ${foundationName}</p>
        
        <!-- Tags -->
        <div class="dog-tags">
          <span class="dog-tag">${dog.weight || '0'} kg</span>
          <span class="dog-tag">${dog.age || '0'} Años</span>
          <span class="dog-tag">${dog.availability ? 'Disponible' : 'No disponible'}</span>
          <span class="dog-tag">${dog.size || 'Mediano'}</span>
        </div>
        
        <!-- Descripcion -->
        <p class="dog-description">${dog.description || 'Sin descripcion'}</p>
        
        <!-- Boton de agendar cita -->
        ${dog.availability ? `
          <button class="btn-schedule" id="btn-schedule">Agendar cita de juego</button>
        ` : ''}
      </div>
      
      <!-- Seccion de necesidades -->
      <div class="dog-needs-section">
        <h2>Mis necesidades</h2>
        <p class="needs-subtitle">Haz click sobre los productos para seleccionar tus donaciones.</p>
        <div id="needs-list" class="needs-list">
          ${needs.length > 0 ? displayNeeds(needs) : '<p class="no-needs">No hay necesidades registradas</p>'}
        </div>
      </div>
      
      <!-- Seccion de estadisticas -->
      <div class="dog-statistics-section">
        <h2>Estadisticas</h2>
        <button class="btn-statistics" id="btn-statistics">
          <img src="/images/Estadisticas.png" alt="Estadísticas" class="stats-dog-image" />
          <span class="stats-text">Haz click aquí y revisa cómo se encuentra este perrito en diferentes aspectos de su bienestar</span>
        </button>
      </div>
      
      <!-- Seccion de accesorios -->
      <div class="dog-accessories-section">
        <h2>Seccion de accesorios</h2>
        <p class="accessories-description">Descubre los accesorios disponibles y con su compra genera una imagen para verlo usandolo</p>
        <div class="accessories-buttons">
          <button class="btn-accessories" id="btn-accessories">Ver accesorios</button>
          <button class="btn-gallery" id="btn-gallery">Ver galeria</button>
        </div>
      </div>
    </div>
  `;
  
  // Agregar eventos
  setupProfileEvents(dog, needs);
}

// Mostrar las necesidades como cards
function displayNeeds(needs) {
  return needs.map((need, index) => `
    <div class="need-card color-${(index % 4) + 1}" data-id="${need.id}">
      <div class="need-image-container">
        <img src="${need.image}" alt="${need.name}" class="need-image">
      </div>
      <div class="need-info">
        <h4 class="need-name">${need.name}</h4>
        <p class="need-description">${need.description || ''}</p>
        <p class="need-price">$ ${need.price?.toLocaleString() || '0'}</p>
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