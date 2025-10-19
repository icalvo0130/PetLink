// Pantalla para agregar necesidades para los perros

import { navigateTo, makeRequest } from '../app.js';
import { checkAuth } from './admin-login.js';

export default async function renderProductsManage(data) {
  // Verificar autenticación
  const auth = await checkAuth();
  if (!auth.isAuthenticated) {
    navigateTo('/admin-login', {});
    return;
  }

  // Detectar si viene de dog-profile o add-dog
  const fromDogProfile = data && data.fromDogProfile;
  const fromAddDog = data && data.fromAddDog;
  const dogId = data && data.dogId;

  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="products-manage-container">
      <header class="page-header">
        <h1>Gestión de Necesidades/Productos</h1>
        <button id="backBtn" class="back-btn">← ${fromDogProfile ? 'Volver' : fromAddDog ? 'Volver' : 'Volver al Dashboard'}</button>
      </header>
      
      <main class="products-content">
        <div class="form-section">
          <h2>Agregar Nueva Necesidad</h2>
          
          <form id="productForm" enctype="multipart/form-data">
            <div class="form-group">
              <label for="name">Nombre del producto/necesidad:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Ej: Concentrado Dog Chow, Medicamento, etc."
              />
            </div>
            
            <div class="form-group">
              <label for="description">Descripción:</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                rows="4"
                placeholder="Describe la necesidad del perro..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="price">Precio (COP):</label>
              <input 
                type="number" 
                id="price" 
                name="price" 
                required 
                min="0"
                step="100"
                placeholder="0"
              />
            </div>
            
            <div class="form-group">
              <label for="dogId">ID del Perro:</label>
              <input 
                type="number" 
                id="dogId" 
                name="dogId" 
                required 
                min="1"
                placeholder="Ingresa el ID del perro"
                ${fromAddDog && dogId ? `value="${dogId}" readonly` : ''}
              />
            </div>
            
            <div class="form-group">
              <label for="estado">Estado de la necesidad:</label>
              <select id="estado" name="estado" required>
                <option value="">Selecciona un estado</option>
                <option value="pending">Pendiente</option>
                <option value="urgent">Urgente</option>
                <option value="fulfilled">Cumplida</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="image">Imagen del producto:</label>
              <input 
                type="file" 
                id="image" 
                name="image" 
                accept="image/*"
                placeholder="Selecciona una imagen"
              />
            </div>
            
            <div class="form-actions">
              <button type="submit" id="submitBtn" class="submit-btn">Agregar y Finalizar</button>
              <button type="button" id="clearBtn" class="clear-btn">Limpiar Formulario</button>
            </div>
          </form>
        </div>
        
        <div class="messages-section">
          <div id="successMessage" class="success-message" style="display: none;"></div>
          <div id="errorMessage" class="error-message" style="display: none;"></div>
        </div>
      </main>
    </div>
  `;
  
  setupEventListeners(fromDogProfile, fromAddDog, dogId);
}

function setupEventListeners(fromDogProfile, fromAddDog, dogId) {
  const productForm = document.getElementById('productForm');
  const clearBtn = document.getElementById('clearBtn');
  const backBtn = document.getElementById('backBtn');
  
  // Envío del formulario
  productForm.addEventListener('submit', handleSubmit);
  
  // Limpiar formulario
  clearBtn.addEventListener('click', clearForm);
  
  // Volver según el origen
  backBtn.addEventListener('click', () => {
    if (fromDogProfile && dogId) {
      navigateTo('/dog-profile', { dogId: dogId });
    } else if (fromAddDog) {
      navigateTo('/add-pet', {});
    } else {
      navigateTo('/dashboard', {});
    }
  });
}

// Envío del formulario
async function handleSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const formData = new FormData();
  
  // Datos para el formulario
  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const price = parseFloat(document.getElementById('price').value);
  const dogId = parseInt(document.getElementById('dogId').value);
  const state = document.getElementById('estado').value;
  const imageFile = document.getElementById('image').files[0];
  
  if (!name || !description || !price || !dogId || !state) {
    showError('Por favor completa todos los campos obligatorios');
    return;
  }
  
  if (price < 0) {
    showError('El precio no puede ser negativo');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Agregando...';
  hideMessages();
  
  try {
    const needData = {
      name: name,
      description: description,
      price: price,
      id_dog: dogId,
      estado: state
    };
    
    if (imageFile) {
      const base64Image = await convertFileToBase64(imageFile);
      needData.image = base64Image;
      needData.image_name = imageFile.name;
    }
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      navigateTo('/admin-login', {});
      return;
    }
    
    const response = await makeRequestWithAuth('/api/needs', 'POST', needData, token);
    
    if (response && response.id) {
      showSuccess('¡Necesidad agregada exitosamente!');
      clearForm();
    } else {
      showError('Error al agregar la necesidad. Inténtalo nuevamente');
    }
    
  } catch (error) {
    console.error('Error al agregar necesidad:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Agregar y Finalizar';
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

// Petición con autenticación
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

function clearForm() {
  document.getElementById('productForm').reset();
  hideMessages();
}

function showSuccess(message) {
  console.log('Mostrando mensaje de éxito:', message);
  const successMessage = document.getElementById('successMessage');
  if (successMessage) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    console.log('Mensaje de éxito mostrado');
    
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 5000);
  } else {
    console.error('No se encontró el elemento successMessage');
  }
}

function showError(message) {
  console.log('Mostrando mensaje de error:', message);
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    console.log('Mensaje de error mostrado');
    
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 7000);
  } else {
    console.error('No se encontró el elemento errorMessage');
  }
}

function hideMessages() {
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';
}