// Permite agregar nueva mascota 

import router from '../utils/router.js';
import { createDog } from '../services/admin-api.js';
import { checkAuth } from './admin-login.js';

export default async function renderAddDog() {
  const auth = await checkAuth();
  if (!auth.isAuthenticated) {
    router.navigateTo('/admin-login');
    return;
  }

  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="add-dog-container">
      <header class="page-header">
        <h1>Agregar Nueva Mascota</h1>
        <button id="backBtn" class="back-btn">← Volver al Dashboard</button>
      </header>
      
      <main class="add-dog-content">
        <form id="dogForm" enctype="multipart/form-data">
          <div class="form-section">
            <h2>Información Básica</h2>
            
            <div class="form-group">
              <label for="name">Nombre del perro:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Ej: Max, Luna, Rocky..."
              />
            </div>
            
            <div class="form-group">
              <label for="age">Edad (años):</label>
              <input 
                type="number" 
                id="age" 
                name="age" 
                required 
                min="0"
                max="20"
                placeholder="0"
              />
            </div>
            
            <div class="form-group">
              <label for="size">Tamaño:</label>
              <select id="size" name="size" required>
                <option value="">Selecciona el tamaño</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="weight">Peso (kg):</label>
              <input 
                type="number" 
                id="weight" 
                name="weight" 
                required 
                min="0"
                step="0.1"
                placeholder="0.0"
              />
            </div>
            
            <div class="form-group">
              <label for="description">Descripción:</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                rows="4"
                placeholder="Describe las características del perro, personalidad, etc..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="availability">Disponibilidad:</label>
              <select id="availability" name="availability" required>
                <option value="">Selecciona disponibilidad</option>
                <option value="disponible">Disponible</option>
                <option value="no_disponible">No disponible</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="image">Imagen del perro:</label>
              <input 
                type="file" 
                id="image" 
                name="image" 
                accept="image/*"
                placeholder="Selecciona una imagen"
              />
            </div>
          </div>
          
          <div class="form-section">
            <h2>Estadísticas del Perro</h2>
            <p class="section-description">Evalúa cada aspecto del 1 al 10 (1 = muy bajo, 10 = excelente)</p>
            
            <div class="stats-grid">
              <div class="stat-item">
                <label for="health">Salud:</label>
                <div class="stat-control">
                  <input 
                    type="range" 
                    id="health" 
                    name="health" 
                    min="1" 
                    max="10" 
                    value="5"
                    class="stat-slider"
                  />
                  <span id="healthValue" class="stat-value">5</span>
                </div>
              </div>
              
              <div class="stat-item">
                <label for="food">Comida:</label>
                <div class="stat-control">
                  <input 
                    type="range" 
                    id="food" 
                    name="food" 
                    min="1" 
                    max="10" 
                    value="5"
                    class="stat-slider"
                  />
                  <span id="foodValue" class="stat-value">5</span>
                </div>
              </div>
              
              <div class="stat-item">
                <label for="wellness">Bienestar / Accesorios:</label>
                <div class="stat-control">
                  <input 
                    type="range" 
                    id="wellness" 
                    name="wellness" 
                    min="1" 
                    max="10" 
                    value="5"
                    class="stat-slider"
                  />
                  <span id="wellnessValue" class="stat-value">5</span>
                </div>
              </div>
              
              <div class="stat-item">
                <label for="love">Cariño / Atención:</label>
                <div class="stat-control">
                  <input 
                    type="range" 
                    id="love" 
                    name="love" 
                    min="1" 
                    max="10" 
                    value="5"
                    class="stat-slider"
                  />
                  <span id="loveValue" class="stat-value">5</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="submitBtn" class="submit-btn">Confirmar y Seguir</button>
            <button type="button" id="clearBtn" class="clear-btn">Limpiar Formulario</button>
          </div>
        </form>
        
        <div class="messages-section">
          <div id="successMessage" class="success-message" style="display: none;"></div>
          <div id="errorMessage" class="error-message" style="display: none;"></div>
        </div>
      </main>
    </div>
  `;
  
  setupEventListeners();
}

function setupEventListeners() {
  const dogForm = document.getElementById('dogForm');
  const clearBtn = document.getElementById('clearBtn');
  const backBtn = document.getElementById('backBtn');
  
  dogForm.addEventListener('submit', handleSubmit);
  
  clearBtn.addEventListener('click', clearForm);
  
  backBtn.addEventListener('click', () => router.navigateTo('/dashboard'));
  
  setupStatSliders();
}

function setupStatSliders() {
  const sliders = document.querySelectorAll('.stat-slider');
  
  sliders.forEach(slider => {
    slider.addEventListener('input', function() {
      const valueSpan = document.getElementById(this.id + 'Value');
      valueSpan.textContent = this.value;
    });
  });
}

// Envío del formulario
async function handleSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  
  // Datos del formulario
  const name = document.getElementById('name').value.trim();
  const age = parseInt(document.getElementById('age').value);
  const size = document.getElementById('size').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const description = document.getElementById('description').value.trim();
  const availabilityValue = document.getElementById('availability').value;
  const availability = availabilityValue === 'disponible';
  const imageFile = document.getElementById('image').files[0];
  
  if (!name || !age || !size || !weight || !description || !availabilityValue) {
    showError('Por favor completa todos los campos obligatorios');
    return;
  }
  
  if (age < 0 || age > 20) {
    showError('La edad debe estar entre 0 y 20 años');
    return;
  }
  
  if (weight <= 0) {
    showError('El peso debe ser mayor a 0');
    return;
  }
  
  // Estadísticas
  const health = parseInt(document.getElementById('health').value) || 0;
  const food = parseInt(document.getElementById('food').value) || 0;
  const wellness = parseInt(document.getElementById('wellness').value) || 0;
  const love = parseInt(document.getElementById('love').value) || 0;
  
  console.log('Estadísticas:', { health, food, wellness, love });
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Agregando perro...';
  hideMessages();
  
  try {
    const dogData = {
      name: name,
      age: age,
      size: size,
      weight: weight,
      description: description,
      availability: availability,
      health_level: health,
      food_level: food,
      wellbeing_level: wellness,
      affection_level: love
    };
    
    if (imageFile) {
      const base64Image = await convertFileToBase64(imageFile);
      dogData.image = base64Image;
      dogData.image_name = imageFile.name;
    }
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    // Usar el servicio API centralizado
    const response = await createDog(dogData);
    
    if (response && response.id) {
      showSuccess('¡Perro agregado exitosamente! Redirigiendo...');
      
      setTimeout(() => {
        // Guardar contexto en sessionStorage y navegar
        sessionStorage.setItem('productsManageOrigin', 'add-pet');
        sessionStorage.setItem('productsManageDogId', response.id);
        router.navigateTo('/products-manage');
      }, 2000);
    } else {
      showError('Error al agregar el perro. Inténtalo nuevamente');
    }
    
  } catch (error) {
    console.error('Error al agregar perro:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar y Seguir';
  }
}

// Convertir archivo a base64
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Nota: makeRequestWithAuth ya no es necesario, usamos el servicio API centralizado

/*
async function makeRequestWithAuth(url, method, body, token) {
  const BASE_URL = "http://localhost:5050";
  
  const response = await fetch(`${BASE_URL}${url}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error en la petición');
  }
  
  return await response.json();
}
*/

// Limpiar formulario
function clearForm() {
  document.getElementById('dogForm').reset();
  
  const sliders = document.querySelectorAll('.stat-slider');
  sliders.forEach(slider => {
    slider.value = 5;
    const valueSpan = document.getElementById(slider.id + 'Value');
    valueSpan.textContent = '5';
  });
  
  hideMessages();
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

function hideMessages() {
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';
}
