// Pantalla para agregar necesidades para los perros

import router from '../utils/router.js';
import { createNeed } from '../services/admin-api.js';
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

// Función para subir imagen de necesidad a Storage
async function uploadNeedImage(file) {
  try {
    console.log('📤 Subiendo imagen de necesidad...', file.name);
    
    const supabase = await initSupabase();
    
    // Generar nombre único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `need-${timestamp}-${randomId}.${extension}`;
    
    // Subir a Storage
    const { data, error } = await supabase.storage
      .from('needs')
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
      .from('needs')
      .getPublicUrl(data.path);
    
    console.log('🔗 URL pública:', urlData.publicUrl);
    
    return {
      success: true,
      publicUrl: urlData.publicUrl,
      path: data.path
    };
    
  } catch (error) {
    console.error('❌ Error en uploadNeedImage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default async function renderProductsManage(params = {}) {
  // Verificar autenticación
  const auth = await checkAuth();
  if (!auth.isAuthenticated) {
    router.navigateTo('/admin-login');
    return;
  }

  // Detectar origen desde sessionStorage
  const origin = sessionStorage.getItem('productsManageOrigin') || params.from || '';
  const dogId = sessionStorage.getItem('productsManageDogId') || params.dogId || '';
  
  const fromDogProfile = origin === 'dog-profile';
  const fromAddDog = origin === 'add-pet';

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
            
            <div class="form-group" style="display: none;">
              <input 
                type="hidden" 
                id="dogId" 
                name="dogId" 
                required 
                ${(fromAddDog || fromDogProfile) && dogId ? `value="${dogId}"` : ''}
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
              <small id="imageStatus" style="display: block; margin-top: 5px; color: #666;"></small>
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
  
  // Volver según el origen (limpiar sessionStorage)
  backBtn.addEventListener('click', () => {
    // Limpiar contexto
    sessionStorage.removeItem('productsManageOrigin');
    sessionStorage.removeItem('productsManageDogId');
    
    if (fromDogProfile && dogId) {
      router.navigateTo(`/dog-profile/${dogId}`);
    } else if (fromAddDog) {
      router.navigateTo('/add-pet');
    } else {
      router.navigateTo('/dashboard');
    }
  });
}

// Envío del formulario
async function handleSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const imageStatus = document.getElementById('imageStatus');
  
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
  submitBtn.textContent = 'Procesando...';
  hideMessages();
  
  try {
    let imageUrl = null;
    
    // Si hay imagen, subirla PRIMERO a Storage
    if (imageFile) {
      imageStatus.textContent = '📤 Subiendo imagen...';
      imageStatus.style.color = '#0066cc';
      
      const uploadResult = await uploadNeedImage(imageFile);
      
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
        submitBtn.textContent = 'Agregar y Finalizar';
        return;
      }
    }
    
    // Preparar datos de la necesidad (SIN base64, solo la URL)
    const needData = {
      name: name,
      description: description,
      price: price,
      id_dog: dogId,
      estado: state
    };
    
    // Agregar la URL de la imagen si existe
    if (imageUrl) {
      needData.image = imageUrl;
    }
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showError('Sesión expirada. Por favor inicia sesión nuevamente');
      router.navigateTo('/admin-login');
      return;
    }
    
    submitBtn.textContent = 'Guardando necesidad...';
    
    // Crear la necesidad en la base de datos
    const response = await createNeed(needData);
    
    if (response && response.id) {
      showSuccess('¡Necesidad agregada exitosamente!');
      imageStatus.textContent = '';
      
      // Limpiar contexto después de agregar
      sessionStorage.removeItem('productsManageOrigin');
      sessionStorage.removeItem('productsManageDogId');
      
      clearForm();
    } else {
      showError('Error al agregar la necesidad. Inténtalo nuevamente');
    }
    
  } catch (error) {
    console.error('Error al agregar necesidad:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando');
    imageStatus.textContent = '';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Agregar y Finalizar';
  }
}

function clearForm() {
  document.getElementById('productForm').reset();
  document.getElementById('imageStatus').textContent = '';
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