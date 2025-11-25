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
      <div class="accessory-detail-header" style="height: 200px;">
        <button class="accessory-detail-btn-back" id="btn-back">
          <span>‹</span>
        </button>
      </div>
      <div class="accessory-detail-card">
        <p class="loading" style="text-align: center; padding: 40px;">Cargando accesorio...</p>
      </div>
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
        <div class="accessory-detail-header" style="height: 200px;">
          <button class="accessory-detail-btn-back" id="btn-back">
            <span>‹</span>
          </button>
        </div>
        <div class="accessory-detail-card">
          <p class="error" style="text-align: center; padding: 40px; color: #ff0000;">Error al cargar el accesorio</p>
        </div>
      </div>
    `;
    setupBackButton(dogId);
  }
}

// Mostrar el detalle del accesorio
function displayAccessoryDetail(accessory, dog) {
  const app = document.getElementById('app');
  
  const priceFormatted = accessory.price?.toLocaleString('es-CO') || '0';
  
  app.innerHTML = `
    <div class="accessory-detail-container">
      <!-- Header con imagen del producto -->
      <div class="accessory-detail-header">
        <button class="accessory-detail-btn-back" id="btn-back">
          <span>‹</span>
        </button>
        <div class="accessory-detail-image">
          <img 
            src="${accessory.imagen_original || getPlaceholderImage(accessory.category)}" 
            alt="${accessory.name}"
          >
        </div>
      </div>
      
      <!-- Card de información -->
      <div class="accessory-detail-card">
        <!-- Imagen del hueso decorativo -->
        <div class="accessory-detail-bone">
          <img src="/images/Bone.png" alt="bone">
        </div>
        
        <!-- Nombre del producto -->
        <h1 class="accessory-detail-name">${accessory.name}</h1>
        
        <!-- Descripción -->
        <p class="accessory-detail-description">
          A este perrito le quedaria genial un accesorio como este, no te gustaria verlo usandola? Comprala ya!
        </p>
        
        <!-- Precio y cantidad -->
        <div class="accessory-detail-price-row">
          <p class="accessory-detail-price">
            <span class="price-currency">$</span> ${priceFormatted}
          </p>
          
          <div class="accessory-quantity-selector">
            <button class="quantity-btn quantity-minus" id="btn-minus">−</button>
            <span class="quantity-value" id="quantity-value">1</span>
            <button class="quantity-btn quantity-plus" id="btn-plus">+</button>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="accessory-detail-actions">
          <button class="accessory-detail-chat-btn" id="btn-chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          
          <button class="accessory-detail-buy-btn" id="btn-buy">
            Comprar
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Eventos
  setupBackButton(dog.id);
  setupBuyButton(accessory, dog);
  setupQuantityButtons();
}

// Configurar botones de cantidad
function setupQuantityButtons() {
  const quantityValue = document.getElementById('quantity-value');
  const btnMinus = document.getElementById('btn-minus');
  const btnPlus = document.getElementById('btn-plus');
  
  let quantity = 1;
  
  btnMinus.addEventListener('click', (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      quantity--;
      quantityValue.textContent = quantity;
    }
  });
  
  btnPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    if (quantity < 10) {
      quantity++;
      quantityValue.textContent = quantity;
    }
  });
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