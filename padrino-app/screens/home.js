// Esta es la pantalla del HOME (donde se ven las cards de los perros)

import { getAllDogs, searchDogsByName } from '../services/api.js';
import router from '../utils/router.js';

// Renderizar (mostrar) el HOME
export function renderHome() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="home-container">
      <!-- Header -->
      <header class="header">
        <div class="logo">P</div>
        <input type="text" id="search-input" class="search-bar" placeholder="Busca un perrito">
      </header>

      <!-- Titulo -->
      <h1 class="title">Elige tu media naranja</h1>

      <!-- Lista de perros -->
      <div id="dogs-list" class="dogs-list">
        <p class="loading">Cargando perros...</p>
      </div>
    </div>
  `;

  // Cargar los perros
  loadDogs();

  // Agregar evento de busqueda
  setupSearch();

  // Agregar eventos de filtros
  setupFilters();
}

// Cargar todos los perros
async function loadDogs() {
  try {
    const dogs = await getAllDogs();
    displayDogs(dogs);
  } catch (error) {
    console.error('Error al cargar perros:', error);
    document.getElementById('dogs-list').innerHTML = '<p class="error">Error al cargar los perros</p>';
  }
}

// Mostrar los perros en pantalla
function displayDogs(dogs) {
  const dogsList = document.getElementById('dogs-list');

  if (dogs.length === 0) {
    dogsList.innerHTML = '<p class="no-dogs">No se encontraron perros</p>';
    return;
  }

  dogsList.innerHTML = dogs.map(dog => `
    <div class="dog-card" data-id="${dog.id}">
      <div class="dog-image-container">
        <img src="${dog.image}" alt="${dog.name}" class="dog-image">
      </div>
      <div class="dog-info">
        <p class="dog-label">Mi nombre es</p>
        <p class="dog-name">${dog.name}</p>
        <p class="dog-location">${dog.location || 'Sin ubicacion'}</p>
        <button class="btn-ver-mas">Ver mas</button>
      </div>
    </div>
  `).join('');

  // Agregar evento de click a cada card
  document.querySelectorAll('.dog-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const dogId = card.dataset.id;
      router.navigateTo(`/dog/${dogId}`);
    });
  });
}

// Configurar la busqueda
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  
  searchInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.trim();
    
    if (searchTerm === '') {
      loadDogs();
      return;
    }

    try {
      const dogs = await searchDogsByName(searchTerm);
      displayDogs(dogs);
    } catch (error) {
      console.error('Error al buscar:', error);
    }
  });
}

// Configurar los filtros
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Quitar la clase 'active' de todos los botones
      filterButtons.forEach(b => b.classList.remove('active'));
      
      // Agregar 'active' al boton clickeado
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      
      // Por ahora solo funciona "Todos"
      // Los otros filtros los implementaremos despues
      if (filter === 'all') {
        loadDogs();
      } else {
        console.log('Filtro:', filter, '- Por implementar');
        // TODO: Implementar filtros de cachorros y menos apadrinados
      }
    });
  });
}