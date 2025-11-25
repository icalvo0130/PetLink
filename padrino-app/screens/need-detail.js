// Esta es la pantalla de DETALLE DE UNA NECESIDAD

import { getNeedById } from '../services/api.js';
import router from '../utils/router.js';

// Renderizar (mostrar) el detalle de la necesidad
export function renderNeedDetail(needId) {
  const app = document.getElementById('app');
  
  // Mostrar loading mientras se cargan los datos
  app.innerHTML = `
    <div class="need-detail-container">
      <p class="loading">Cargando necesidad...</p>
    </div>
  `;
  
  // Cargar los datos de la necesidad
  loadNeedDetail(needId);
}

// Cargar el detalle de la necesidad
async function loadNeedDetail(needId) {
  try {
    const need = await getNeedById(needId);
    displayNeedDetail(need);
  } catch (error) {
    console.error('Error al cargar necesidad:', error);
    document.getElementById('app').innerHTML = `
      <div class="need-detail-container">
        <p class="error">Error al cargar la necesidad</p>
        <button onclick="window.history.back()" class="btn-back">Volver</button>
      </div>
    `;
  }
}

// Mostrar el detalle de la necesidad
function displayNeedDetail(need) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="need-detail-container">
      <!-- Header con imagen -->
      <div class="need-header">
        <button class="btn-back" id="btn-back">‹</button>
        <div class="need-detail-image">
          <img src="${need.image}" alt="${need.name}">
        </div>
      </div>
      
      <!-- Decoracion hueso -->
      <div class="bone-decoration">
        <img src="/images/Bone.png" alt="Hueso decorativo">
      </div>
      
      <!-- Card de informacion -->
      <div class="need-detail-card">
        <h1 class="need-detail-name">${need.name}</h1>
        <p class="need-detail-description">${need.description || 'Sin descripcion'}</p>
        
        <!-- Precio y cantidad -->
        <div class="price-quantity-row">
          <p class="need-detail-price">$ ${need.price?.toLocaleString() || '0'}</p>
          <div class="quantity-selector">
            <button class="qty-btn minus" id="qty-minus">−</button>
            <span class="qty-value" id="qty-value">1</span>
            <button class="qty-btn plus" id="qty-plus">+</button>
          </div>
        </div>
        
        <!-- Boton donar -->
        <button class="btn-donate" id="btn-donate">Donar</button>
      </div>
    </div>
  `;
  
  // Agregar eventos
  setupNeedDetailEvents(need);
}

// Configurar eventos de la pantalla
function setupNeedDetailEvents(need) {
  let quantity = 1;
  const qtyValue = document.getElementById('qty-value');
  
  // Boton volver
  document.getElementById('btn-back').addEventListener('click', () => {
    window.history.back();
  });
  
  // Boton menos cantidad
  document.getElementById('qty-minus').addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      qtyValue.textContent = quantity;
    }
  });
  
  // Boton mas cantidad
  document.getElementById('qty-plus').addEventListener('click', () => {
    quantity++;
    qtyValue.textContent = quantity;
  });
  
  // Boton donar
  document.getElementById('btn-donate').addEventListener('click', () => {
    const totalPrice = need.price * quantity;
    router.navigateTo(`/payment?needId=${need.id}&price=${totalPrice}&quantity=${quantity}&dogId=${need.id_dog}`);
  });
}