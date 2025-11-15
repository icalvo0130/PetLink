// Esta es la pantalla de la TIENDA DE ACCESORIOS

import { getAllAccessories } from '../services/api.js';
import router from '../utils/router.js';

// Renderizar (mostrar) la tienda de accesorios
export function renderAccessoriesList(dogId) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="accessories-container">
      <!-- Botón de volver -->
      <button class="btn-back" id="btn-back">← Volver</button>
      
      <!-- Título -->
      <h1 class="accessories-title">Tienda de Accesorios</h1>
      <p class="accessories-subtitle">Dale un regalo especial a tu perrito</p>
      
      <!-- Lista de accesorios -->
      <div id="accessories-list" class="accessories-list">
        <p class="loading">Cargando accesorios...</p>
      </div>
    </div>
  `;
  
  // Cargar los accesorios
  loadAccessories(dogId);
  
  // Evento del botón volver
  document.getElementById('btn-back').addEventListener('click', () => {
    router.navigateTo(`/dog/${dogId}`);
  });
}

// Cargar todos los accesorios
async function loadAccessories(dogId) {
  try {
    const accessories = await getAllAccessories();
    displayAccessories(accessories, dogId);
  } catch (error) {
    console.error('Error al cargar accesorios:', error);
    document.getElementById('accessories-list').innerHTML = 
      '<p class="error">Error al cargar los accesorios</p>';
  }
}

// Mostrar los accesorios en pantalla
function displayAccessories(accessories, dogId) {
  const accessoriesList = document.getElementById('accessories-list');
  
  if (accessories.length === 0) {
    accessoriesList.innerHTML = '<p class="no-accessories">No hay accesorios disponibles</p>';
    return;
  }
  
  // Filtrar accesorios que no tengan id_dog o id_user (accesorios generales de la tienda)
  const generalAccessories = accessories.filter(acc => !acc.id_dog && !acc.id_user);
  
  if (generalAccessories.length === 0) {
    accessoriesList.innerHTML = '<p class="no-accessories">No hay accesorios disponibles en la tienda</p>';
    return;
  }
  
  accessoriesList.innerHTML = generalAccessories.map(accessory => `
    <div class="accessory-card" data-id="${accessory.id}" data-dog-id="${dogId}">
      <div class="accessory-image-container">
        <img 
          src="${accessory.imagen_original || getPlaceholderImage(accessory.category)}" 
          alt="${accessory.name}" 
          class="accessory-image"
          onerror="this.src='${getPlaceholderImage(accessory.category)}'"
        >
      </div>
      <div class="accessory-info">
        <p class="accessory-category">${accessory.category?.toUpperCase() || 'ACCESORIO'}</p>
        <p class="accessory-name">${accessory.name}</p>
        <p class="accessory-price">$${accessory.price?.toLocaleString('es-CO') || '0'}</p>
        <button class="btn-view-accessory">Ver detalles</button>
      </div>
    </div>
  `).join('');
  
  // Agregar evento de click a cada card
  document.querySelectorAll('.accessory-card').forEach(card => {
    card.addEventListener('click', () => {
      const accessoryId = card.dataset.id;
      const dogId = card.dataset.dogId;
      router.navigateTo(`/accessory/${accessoryId}?dogId=${dogId}`);
    });
  });
}

// Obtener imagen placeholder según categoría
function getPlaceholderImage(category) {
  const placeholders = {
    'gorra': 'https://via.placeholder.com/300x300/FF6B35/FFFFFF?text=Gorra',
    'corbata': 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Corbata',
    'gafas': 'https://via.placeholder.com/300x300/95E1D3/FFFFFF?text=Gafas',
    'sombrero': 'https://via.placeholder.com/300x300/F38181/FFFFFF?text=Sombrero',
    'collar': 'https://via.placeholder.com/300x300/AA96DA/FFFFFF?text=Collar',
    'bandana': 'https://via.placeholder.com/300x300/FCBAD3/FFFFFF?text=Bandana',
    'default': 'https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=Accesorio'
  };
  
  return placeholders[category?.toLowerCase()] || placeholders.default;
}