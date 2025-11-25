// Esta es la pantalla de DETALLE DE UN ACCESORIO

import { getAccessoryById, getDogById } from '../services/api.js';
import router from '../utils/router.js';

// Renderizar (mostrar) el detalle del accesorio
export async function renderAccessoryDetail(accessoryId) {
  const app = document.getElementById('app');
  
  // Obtener dogId de los parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const dogId = params.get('dogId');
  
  if (!dogId) {
    console.error('No se encontró dogId en la URL');
    router.navigateTo('/home');
    return;
  }
  
  app.innerHTML = `
    <div class="accessory-detail-container">
      <button class="btn-back" id="btn-back">← Volver</button>
      <p class="loading">Cargando accesorio...</p>
    </div>
  `;
  
  try {
    // Cargar accesorio y perro en paralelo
    const [accessory, dog] = await Promise.all([
      getAccessoryById(accessoryId),
      getDogById(dogId)
    ]);
    
    displayAccessoryDetail(accessory, dog);
    
  } catch (error) {
    console.error('Error al cargar accesorio:', error);
    app.innerHTML = `
      <div class="accessory-detail-container">
        <button class="btn-back" id="btn-back">← Volver</button>
        <p class="error">Error al cargar el accesorio</p>
      </div>
    `;
    setupBackButton(dogId);
  }
}

// Mostrar el detalle del accesorio
function displayAccessoryDetail(accessory, dog) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="accessory-detail-container">
      <!-- Botón volver -->
      <button class="btn-back" id="btn-back">← Volver</button>
      
      <!-- Imagen grande del accesorio -->
      <div class="accessory-detail-image">
        <img 
          src="${accessory.image_url || getPlaceholderImage(accessory.category)}" 
          alt="${accessory.name}"
        >
      </div>
      
      <!-- Información del accesorio -->
      <div class="accessory-detail-info">
        <p class="accessory-detail-category">${accessory.category || 'Accesorio'}</p>
        <h1 class="accessory-detail-name">${accessory.name}</h1>
        
        <p class="accessory-detail-description">
          ${accessory.description || 'Un hermoso accesorio para tu perrito. Dale un toque especial y único.'}
        </p>
        
        <p class="accessory-detail-for">Para: <strong>${dog.name}</strong></p>
        
        <p class="accessory-detail-price">$${accessory.price?.toLocaleString('es-CO') || '0'}</p>
        
        <button class="btn-buy-accessory" id="btn-buy">
          Comprar Accesorio
        </button>
        
        <p class="accessory-note">
          💡 Al comprar este accesorio, generaremos una foto especial de ${dog.name} usándolo
        </p>
      </div>
    </div>
  `;
  
  // Eventos
  setupBackButton(dog.id);
  setupBuyButton(accessory, dog);
}

// Configurar botón volver
function setupBackButton(dogId) {
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      router.navigateTo(`/accessories/${dogId}`);
    });
  }
}

// Configurar botón comprar
function setupBuyButton(accessory, dog) {
  const btnBuy = document.getElementById('btn-buy');
  
  btnBuy.addEventListener('click', () => {
    // Redirigir a pago con parámetros del accesorio
    const params = new URLSearchParams({
      type: 'accessory',           // IMPORTANTE: tipo = accessory
      accessoryId: accessory.id,
      price: accessory.price,
      dogId: dog.id,
      dogName: dog.name,
      dogBreed: dog.breed || 'dog',
      dogSize: dog.size || 'medium',
      dogAge: dog.age || 'adult',
      accessoryCategory: accessory.category || 'accesorio',
      accessoryName: accessory.name
    });
    
    router.navigateTo(`/payment?${params.toString()}`);
  });
}

// Obtener imagen placeholder según categoría
function getPlaceholderImage(category) {
  const placeholders = {
    'gorra': 'https://via.placeholder.com/600x600/FF6B35/FFFFFF?text=Gorra',
    'corbata': 'https://via.placeholder.com/600x600/4ECDC4/FFFFFF?text=Corbata',
    'gafas': 'https://via.placeholder.com/600x600/95E1D3/FFFFFF?text=Gafas',
    'sombrero': 'https://via.placeholder.com/600x600/F38181/FFFFFF?text=Sombrero',
    'collar': 'https://via.placeholder.com/600x600/AA96DA/FFFFFF?text=Collar',
    'bandana': 'https://via.placeholder.com/600x600/FCBAD3/FFFFFF?text=Bandana',
    'default': 'https://via.placeholder.com/600x600/CCCCCC/FFFFFF?text=Accesorio'
  };
  
  return placeholders[category?.toLowerCase()] || placeholders.default;
}