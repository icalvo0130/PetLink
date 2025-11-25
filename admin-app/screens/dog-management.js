// Catálogo de perros para edición

import router from '../utils/router.js';
import { getAllDogs, getAllDonations, searchDogsByName } from '../services/admin-api.js';
import { checkAuth } from './admin-login.js';
import { addEventListener, removeEventListener } from '../services/websocket-admin.js';

let allDogs = [];
let filteredDogs = [];
let allDonations = [];
let currentFilter = 'all';

// Referencias a los listeners para poder limpiarlos
let donationCreatedListener = null;
let needCreatedListener = null;

export default async function renderDogManagement() {
  const auth = await checkAuth();
  if (!auth.isAuthenticated) {
    router.navigateTo('/admin-login');
    return;
  }

  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="dog-management-container">
      <header class="page-header">
        <h1>Gestión de Perros</h1>
        <button id="backBtn" class="back-btn">← Volver al Dashboard</button>
      </header>
      
      <main class="management-content">
        <div class="search-section">
          <div class="search-container">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Buscar perros por nombre..."
              class="search-input"
            />
            <button id="clearSearchBtn" class="clear-search-btn">Limpiar</button>
          </div>
        </div>
        
        <div class="filters-section">
          <h3>Filtros:</h3>
          <div class="filter-buttons">
            <button id="filterAll" class="filter-btn active">Todos</button>
            <button id="filterPuppies" class="filter-btn">Cachorros</button>
            <button id="filterLessSponsored" class="filter-btn">Menos apadrinados</button>
          </div>
        </div>
        
        <div class="dogs-section">
          <div class="section-header">
            <h2>Perros</h2>
            <span id="dogsCount" class="count-badge">0 perros</span>
          </div>
          
          <div id="dogsList" class="dogs-list">
            <div class="loading-message">Cargando perros...</div>
          </div>
          
          <div id="noDogsMessage" class="no-dogs" style="display: none;">
            <p>No hay perros disponibles</p>
            <p>Intenta con otros filtros o términos de búsqueda</p>
          </div>
        </div>
        
        <div class="messages-section">
          <div id="successMessage" class="success-message" style="display: none;"></div>
          <div id="errorMessage" class="error-message" style="display: none;"></div>
        </div>
      </main>
    </div>
  `;
  
  setupEventListeners();
  await loadInitialData();
  setupRealtimeListeners();
}

/**
 * Configurar listeners en tiempo real
 */
function setupRealtimeListeners() {
  // Limpiar listeners previos si existen
  if (donationCreatedListener) {
    removeEventListener('donation-created', donationCreatedListener);
  }
  if (needCreatedListener) {
    removeEventListener('need-created', needCreatedListener);
  }
  
  donationCreatedListener = async () => {
    try {
      const donationsResponse = await getAllDonations();
      if (Array.isArray(donationsResponse)) {
        allDonations = donationsResponse;
        renderDogsList();
        updateDogsCount();
        showSuccess('Nueva donación recibida - Vista actualizada');
      }
    } catch (error) {
      console.error('Error al actualizar donaciones:', error);
    }
  };
  
  needCreatedListener = async () => {
    try {
      const dogsResponse = await getAllDogs();
      if (Array.isArray(dogsResponse)) {
        allDogs = dogsResponse;
        applyCurrentFilter();
        renderDogsList();
        updateDogsCount();
        showSuccess('Nueva necesidad registrada - Vista actualizada');
      }
    } catch (error) {
      console.error('Error al actualizar perros:', error);
    }
  };
  
  addEventListener('donation-created', donationCreatedListener);
  addEventListener('need-created', needCreatedListener);
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const backBtn = document.getElementById('backBtn');
  const filterAll = document.getElementById('filterAll');
  const filterPuppies = document.getElementById('filterPuppies');
  const filterLessSponsored = document.getElementById('filterLessSponsored');
  
  searchInput.addEventListener('input', handleSearch);
  
  clearSearchBtn.addEventListener('click', clearSearch);
  
  backBtn.addEventListener('click', () => router.navigateTo('/dashboard'));
  
  filterAll.addEventListener('click', () => applyFilter('all'));
  filterPuppies.addEventListener('click', () => applyFilter('puppies'));
  filterLessSponsored.addEventListener('click', () => applyFilter('lessSponsored'));
}

async function loadInitialData() {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    // Usar el servicio API centralizado
    const [dogsResponse, donationsResponse] = await Promise.allSettled([
      getAllDogs(),
      getAllDonations()
    ]);
    
    if (dogsResponse.status === 'fulfilled' && Array.isArray(dogsResponse.value)) {
      allDogs = dogsResponse.value;
      filteredDogs = [...allDogs];
    } else {
      console.error('Error al cargar perros:', dogsResponse.reason);
      showError('Error al cargar la lista de perros');
    }
    
    if (donationsResponse.status === 'fulfilled' && Array.isArray(donationsResponse.value)) {
      allDonations = donationsResponse.value;
    } else {
      console.error('Error al cargar donaciones:', donationsResponse.reason);
    }
    
    renderDogsList();
    updateDogsCount();
    
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando');
  }
}

async function handleSearch(event) {
  const searchTerm = event.target.value.trim();
  
  if (searchTerm === '') {
    filteredDogs = [...allDogs];
    applyCurrentFilter();
  } else {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showError('Sesión expirada. Por favor inicia sesión nuevamente');
        router.navigateTo('/admin-login', {});
        return;
      }
      
      // Usar el servicio API centralizado
      const response = await searchDogsByName(searchTerm);
      
      if (Array.isArray(response)) {
        filteredDogs = response;
        applyCurrentFilter();
      } else {
        filteredDogs = [];
        applyCurrentFilter();
      }
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      showError('Error al buscar perros');
      filteredDogs = [];
      applyCurrentFilter();
    }
  }
  
  renderDogsList();
  updateDogsCount();
}

function applyFilter(filterType) {
  currentFilter = filterType;
  
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`filter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`).classList.add('active');
  
  applyCurrentFilter();
  renderDogsList();
  updateDogsCount();
}

function applyCurrentFilter() {
  // Siempre empezar con todos los perros disponibles (después de búsqueda si aplica)
  let baseDogs = [...allDogs];
  
  // Si hay búsqueda activa, usar los resultados de búsqueda como base
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm !== '') {
    // Si hay búsqueda, filteredDogs ya contiene los resultados de búsqueda
    baseDogs = [...filteredDogs];
  }
  
  // Aplicar filtro según el tipo seleccionado
  switch (currentFilter) {
    case 'all':
      filteredDogs = [...baseDogs];
      break;
    case 'puppies':
      filteredDogs = baseDogs.filter(dog => dog.age && dog.age < 2);
      break;
    case 'lessSponsored':
      filteredDogs = baseDogs.filter(dog => {
        const dogDonations = allDonations.filter(donation => donation.id_dog === dog.id);
        return dogDonations.length <= 2;
      });
      break;
  }
}

function renderDogsList() {
  const dogsList = document.getElementById('dogsList');
  const noDogsMessage = document.getElementById('noDogsMessage');
  
  if (filteredDogs.length === 0) {
    dogsList.innerHTML = '';
    noDogsMessage.style.display = 'block';
    return;
  }
  
  noDogsMessage.style.display = 'none';
  
  dogsList.innerHTML = filteredDogs.map(dog => {
    const dogDonations = allDonations.filter(donation => donation.id_dog === dog.id);
    const donationCount = dogDonations.length;
    
    return `
      <div class="dog-card" data-dog-id="${dog.id}">
        <div class="card-header">
          <div class="dog-image">
            ${dog.image ? 
              `<img src="${dog.image}" alt="${dog.name}" />` : 
              '<div class="no-image">🐶</div>'
            }
          </div>
          <div class="dog-info">
            <h3>${dog.name || 'Sin nombre'}</h3>
            <p class="dog-age">Edad: ${dog.age || 'No especificada'} años</p>
            <p class="donation-count">Donaciones: ${donationCount}</p>
          </div>
        </div>
        
        <div class="card-body">
          <div class="dog-details">
            <div class="detail-item">
              <span class="label">Tamaño:</span>
              <span class="value">${dog.size || 'No especificado'}</span>
            </div>
            <div class="detail-item">
              <span class="label">Peso:</span>
              <span class="value">${dog.weight || 'No especificado'} kg</span>
            </div>
            <div class="detail-item">
              <span class="label">Disponibilidad:</span>
              <span class="value">${getAvailabilityText(dog.availability)}</span>
            </div>
            ${dog.description ? `
              <div class="detail-item">
                <span class="label">Descripción:</span>
                <span class="value">${dog.description.substring(0, 100)}${dog.description.length > 100 ? '...' : ''}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="card-actions">
          <button 
            class="action-btn edit-btn" 
            onclick="editDog(${dog.id})"
          >
            Editar
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  filteredDogs = [...allDogs];
  applyCurrentFilter();
  renderDogsList();
  updateDogsCount();
}

// Editar perro (navegar con parámetro en URL como padrino-app)
function editDog(dogId) {
  router.navigateTo(`/dog-profile/${dogId}`);
}

function getAvailabilityText(availability) {
  const availabilityMap = {
    'disponible': 'Disponible',
    'no_disponible': 'No disponible',
    'adoptado': 'Adoptado',
    'en_proceso': 'En proceso de adopción'
  };
  
  return availabilityMap[availability] || 'Desconocido';
}

// Nota: makeRequestWithAuth ya no es necesario, usamos el servicio API centralizado

function updateDogsCount() {
  const countElement = document.getElementById('dogsCount');
  const count = filteredDogs.length;
  countElement.textContent = `${count} ${count === 1 ? 'perro' : 'perros'}`;
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

window.editDog = editDog;
