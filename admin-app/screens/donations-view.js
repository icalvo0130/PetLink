// Pantalla de las donaciones

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

export default async function renderDonationsView() {
  const auth = await checkAuth();
  if (!auth.isAuthenticated) {
    router.navigateTo('/admin-login');
    return;
  }

  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="donations-view-container">
      <header class="page-header">
        <h1>Vista General de Donaciones</h1>
        <button id="backBtn" class="back-btn">← Volver al Dashboard</button>
      </header>
      
      <main class="donations-content">
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
            <button id="filterAll" class="filter-btn active">Todos los perros</button>
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
            <p>No hay resultados disponibles</p>
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
  
  addEventListener('donation-created', donationCreatedListener);
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

// Manejar búsqueda
async function handleSearch(event) {
  const searchTerm = event.target.value.trim();
  
  if (searchTerm === '') {
    // Si no hay término de búsqueda, usar todos los perros y aplicar filtro actual
    applyCurrentFilter();
  } else {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showError('Sesión expirada. Por favor inicia sesión nuevamente');
        router.navigateTo('/admin-login');
        return;
      }
      
      // Usar el servicio API centralizado
      const response = await searchDogsByName(searchTerm);
      
      if (Array.isArray(response)) {
        // Actualizar la lista base con los resultados de búsqueda
        allDogs = response;
        applyCurrentFilter();
      } else {
        allDogs = [];
        applyCurrentFilter();
      }
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      showError('Error al buscar perros');
      allDogs = [];
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
  // Siempre empezar con todos los perros disponibles
  let baseDogs = [...allDogs];
  
  switch (currentFilter) {
    case 'all':
      // No aplicar filtro adicional, usar todos los perros
      filteredDogs = baseDogs;
      break;
    case 'puppies':
      // Filtrar solo cachorros (menores de 2 años)
      filteredDogs = baseDogs.filter(dog => dog.age && dog.age < 2);
      break;
    case 'lessSponsored':
      // Filtrar perros con 2 o menos donaciones
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
              '<div class="no-image">🐕</div>'
            }
          </div>
          <div class="dog-info">
            <h3>${dog.name || 'Sin nombre'}</h3>
            <p class="dog-age">${dog.age || 'No especificada'} años</p>
          </div>
        </div>
        
        <div class="card-actions">
          <button 
            class="action-btn view-donations-btn" 
            onclick="viewDogDonations(${dog.id})"
          >
            Ver donaciones
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function clearSearch() {
  document.getElementById('searchInput').value = '';
  
  // Recargar todos los perros originales
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    // Usar el servicio API centralizado
    const response = await getAllDogs();
    
    if (Array.isArray(response)) {
      allDogs = response;
      applyCurrentFilter();
    } else {
      allDogs = [];
      applyCurrentFilter();
    }
    
  } catch (error) {
    console.error('Error al limpiar búsqueda:', error);
    showError('Error al limpiar búsqueda');
    allDogs = [];
    applyCurrentFilter();
  }
  
  renderDogsList();
  updateDogsCount();
}

// Ver donaciones de un perro específico (pasar dogId en URL)
function viewDogDonations(dogId) {
  router.navigateTo(`/donations-profile-dog/${dogId}`);
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

window.viewDogDonations = viewDogDonations;
