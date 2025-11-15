// Permite agregar nueva mascota 

import router from '../utils/router.js';
import { createDog } from '../services/admin-api.js';
import { checkAuth } from './admin-login.js';

// IMPORTANTE: Reemplaza con tus credenciales de Supabase
const SUPABASE_URL = 'https://wnqbazvzarypvgirqnef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducWJhenZ6YXJ5cHZnaXJxbmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzYyOTMsImV4cCI6MjA3NDQ1MjI5M30.QhZj1SAPP5nB5DZ8aBKLPHrT7DiWXzTzjGgWQsWb-w4';

let supabaseClient = null;

// Inicializar Supabase Client
async function initSupabase() {
  if (!supabaseClient) {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// Función para subir imagen de perro a Storage
async function uploadDogImage(file) {
  try {
    console.log('📤 Subiendo imagen de perro...', file.name);
    
    const supabase = await initSupabase();
    
    // Generar nombre único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `dog-${timestamp}-${randomId}.${extension}`;
    
    // Subir a Storage
    const { data, error } = await supabase.storage
      .from('dog-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error al subir:', error);
      throw error;
    }
    
    console.log('✅ Imagen subida:', data.path);
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('dog-images')
      .getPublicUrl(data.path);
    
    console.log('🔗 URL pública:', urlData.publicUrl);
    
    return {
      success: true,
      publicUrl: urlData.publicUrl,
      path: data.path
    };
    
  } catch (error) {
    console.error('❌ Error en uploadDogImage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

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
              <small id="imageStatus" style="display: block; margin-top: 5px; color: #666;"></small>
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
  const imageStatus = document.getElementById('imageStatus');
  
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
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Procesando...';
  hideMessages();
  
  try {
    let imageUrl = null;
    
    // Si hay imagen, subirla PRIMERO a Storage
    if (imageFile) {
      imageStatus.textContent = '📤 Subiendo imagen...';
      imageStatus.style.color = '#0066cc';
      
      const uploadResult = await uploadDogImage(imageFile);
      
      if (uploadResult.success) {
        imageUrl = uploadResult.publicUrl;
        imageStatus.textContent = '✅ Imagen subida exitosamente';
        imageStatus.style.color = '#00aa00';
        console.log('Imagen subida:', imageUrl);
      } else {
        imageStatus.textContent = '❌ Error al subir imagen';
        imageStatus.style.color = '#cc0000';
        showError('Error al subir la imagen: ' + uploadResult.error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar y Seguir';
        return;
      }
    }
    
    // Preparar datos del perro (SIN base64, solo la URL)
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
    
    // Agregar la URL de la imagen si existe
    if (imageUrl) {
      dogData.image = imageUrl;
    }
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    submitBtn.textContent = 'Guardando perro...';
    
    // Crear el perro en la base de datos
    const response = await createDog(dogData);
    
    if (response && response.id) {
      showSuccess('¡Perro agregado exitosamente! Redirigiendo...');
      imageStatus.textContent = '';
      
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
    imageStatus.textContent = '';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar y Seguir';
  }
}

// Limpiar formulario
function clearForm() {
  document.getElementById('dogForm').reset();
  document.getElementById('imageStatus').textContent = '';
  
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