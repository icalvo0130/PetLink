// Esta es la GALERÍA de fotos generadas por IA

import { getDogById } from '../services/api.js';
import router from '../utils/router.js';
import supabase from '../supabase.service.js';

// Renderizar (mostrar) la galería
export async function renderGallery(dogId) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="gallery-container">
      <div class="gallery-header" style="height: 200px;">
        <button class="gallery-btn-back" id="btn-back">
          <span>‹</span>
        </button>
      </div>
      <div class="gallery-info-card">
        <p class="loading" style="text-align: center; padding: 40px; color: #666;">Cargando galería...</p>
      </div>
    </div>
  `;
  
  try {
    // Cargar perro y sus fotos generadas
    const dog = await getDogById(dogId);
    const photos = await getAIPhotosForDog(dogId);
    
    displayGallery(dog, photos);
    
  } catch (error) {
    console.error('Error al cargar galería:', error);
    app.innerHTML = `
      <div class="gallery-container">
        <div class="gallery-header" style="height: 200px;">
          <button class="gallery-btn-back" id="btn-back">
            <span>‹</span>
          </button>
        </div>
        <div class="gallery-info-card">
          <p class="error" style="text-align: center; padding: 40px; color: #ff0000;">Error al cargar la galería</p>
        </div>
      </div>
    `;
    setupBackButton(dogId);
  }
}

// Obtener fotos generadas por IA para un perro específico
async function getAIPhotosForDog(dogId) {
  try {
    console.log('Buscando fotos IA para perro:', dogId);
    
    // Consultar tabla Accessories donde:
    // - id_dog = dogId (fotos de este perro)
    // - imagen_ia no es null (tiene foto generada)
    const { data, error } = await supabase
      .from('Accessories')
      .select('*')
      .eq('id_dog', parseInt(dogId))
      .not('imagen_ia', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al buscar fotos:', error);
      throw error;
    }
    
    console.log('Fotos encontradas:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('Error en getAIPhotosForDog:', error);
    return [];
  }
}

// Mostrar la galería
function displayGallery(dog, photos) {
  const app = document.getElementById('app');
  
  // Formatear datos del perro
  const weight = dog.weight ? `${dog.weight} kg` : '20 kg';
  const age = dog.age ? `${dog.age} Años` : '3 Años';
  const availability = dog.availability ? 'Disponible' : 'No disponible';
  const size = dog.size || 'Grande';
  const foundation = dog.foundation_name || 'Pazanimal';
  
  // Obtener mensaje según la última compra/donación
  const lastPhoto = photos[0];
  const message = lastPhoto 
    ? `¡Tu apoyo llenó el plato de ${dog.name} con comida nutritiva!`
    : `Compra un accesorio para generar una foto especial de ${dog.name}`;
  
  app.innerHTML = `
    <div class="gallery-container">
      <!-- Header amarillo con imagen del perro -->
      <div class="gallery-header">
        <button class="gallery-btn-back" id="btn-back">
          <span>‹</span>
        </button>
        
        <!-- Decoración de patitas -->
        <img src="/images/Pata4.png" class="gallery-paw gallery-paw-left" alt="">
        <img src="/images/Pata4.png" class="gallery-paw gallery-paw-right" alt="">
        
        <!-- Imagen del perro con blob -->
        <div class="gallery-dog-hero">
          <div class="gallery-dog-blob"></div>
          <img src="${dog.image}" alt="${dog.name}" class="gallery-dog-image">
        </div>
      </div>
      
      <!-- Card de información -->
      <div class="gallery-info-card">
        <!-- Nombre del perro -->
        <h1 class="gallery-dog-name">${dog.name}</h1>
        
        <!-- Ubicación -->
        <p class="gallery-dog-location">
          <span class="location-icon">📍</span>
          ${foundation}
        </p>
        
        <!-- Tags -->
        <div class="gallery-tags">
          <span class="gallery-tag">${weight}</span>
          <span class="gallery-tag">${age}</span>
          <span class="gallery-tag">${availability}</span>
          <span class="gallery-tag">${size}</span>
        </div>
        
        <!-- Mensaje -->
        <p class="gallery-message">${message}</p>
        
        <!-- Fotos -->
        <div class="gallery-photos">
          ${photos.length === 0 ? `
            <div class="no-photos">
              <p>😊 Aún no hay fotos generadas</p>
              <button class="gallery-btn-accessories" id="btn-go-accessories">
                Ver Accesorios
              </button>
            </div>
          ` : photos.map((photo, index) => `
            <div class="gallery-photo-card ${index === 0 ? 'gallery-photo-featured' : ''}" data-photo-id="${photo.id}">
              <img 
                src="${photo.imagen_ia}" 
                alt="${dog.name} con ${photo.category}"
                class="gallery-photo-image"
              >
            </div>
          `).join('')}
        </div>
        
        <!-- Botón volver al menú -->
        <button class="gallery-btn-menu" id="btn-menu">
          Volver a menu principal
        </button>
      </div>
    </div>
  `;
  
  // Eventos
  setupBackButton(dog.id);
  setupMenuButton();
  
  if (photos.length === 0) {
    setupGoToAccessoriesButton(dog.id);
  } else {
    setupPhotoClickEvents(photos);
  }
}

// Configurar botón menú principal
function setupMenuButton() {
  const btn = document.getElementById('btn-menu');
  if (btn) {
    btn.addEventListener('click', () => {
      router.navigateTo('/home');
    });
  }
}

// Configurar botón volver
function setupBackButton(dogId) {
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      router.navigateTo(`/dog/${dogId}`);
    });
  }
}

// Configurar botón ir a accesorios
function setupGoToAccessoriesButton(dogId) {
  const btn = document.getElementById('btn-go-accessories');
  if (btn) {
    btn.addEventListener('click', () => {
      router.navigateTo(`/accessories/${dogId}`);
    });
  }
}

// Configurar eventos de click en las fotos
function setupPhotoClickEvents(photos) {
  document.querySelectorAll('.gallery-photo-card').forEach(card => {
    card.addEventListener('click', () => {
      const photoId = card.dataset.photoId;
      const photo = photos.find(p => p.id == photoId);
      if (photo) {
        showPhotoModal(photo);
      }
    });
  });
}

// Mostrar modal con la foto grande
function showPhotoModal(photo) {
  const modal = document.createElement('div');
  modal.className = 'photo-modal';
  modal.innerHTML = `
    <div class="photo-modal-content">
      <button class="photo-modal-close" id="modal-close">✕</button>
      <img src="${photo.imagen_ia}" alt="Foto" class="photo-modal-image">
      <div class="photo-modal-info">
        <p class="photo-modal-category">${photo.category}</p>
        <p class="photo-modal-date">${formatDate(photo.created_at)}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Cerrar al hacer click en X o fuera de la imagen
  document.getElementById('modal-close').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('es-ES', options);
}