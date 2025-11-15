// Pantalla de registro para administradores

import router from '../utils/router.js';
import { signupAdmin } from '../services/admin-api.js';

// Renderizar la pantalla de registro
export default function renderAdminSignup() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="signup-container">
      <div class="signup-form">
        <h1>Registro de Administrador</h1>
        
        <form id="signupForm">
          <div class="form-group">
            <label for="foundationName">Nombre de la fundación:</label>
            <input 
              type="text" 
              id="foundationName" 
              name="foundationName" 
              required 
              placeholder="Ingresa el nombre de tu fundación"
            />
          </div>
          
          <div class="form-group">
            <label for="name">Nombre completo:</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              placeholder="Ingresa tu nombre completo"
            />
          </div>
          
          <div class="form-group">
            <label for="username">Nombre de usuario:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>
          
          <div class="form-group">
            <label for="email">Correo electrónico:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="Ingresa tu contraseña"
              minlength="6"
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              required 
              placeholder="Confirma tu contraseña"
              minlength="6"
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" id="signupBtn">Registrar</button>
            <button type="button" id="loginBtn">Accede a tu cuenta</button>
          </div>
        </form>
        
        <div id="errorMessage" class="error-message" style="display: none;"></div>
        <div id="successMessage" class="success-message" style="display: none;"></div>
      </div>
    </div>
  `;
  
  setupEventListeners();
}

function setupEventListeners() {
  const signupForm = document.getElementById('signupForm');
  const loginBtn = document.getElementById('loginBtn');
  
  // Formulario de registro
  signupForm.addEventListener('submit', handleSignup);
  
  // click botón de login
  loginBtn.addEventListener('click', handleLogin);
  
  // validación
  setupRealTimeValidation();
}

// Proceso de registro
async function handleSignup(event) {
  event.preventDefault();
  
  const foundationName = document.getElementById('foundationName').value.trim();
  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const signupBtn = document.getElementById('signupBtn');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  
  // Validar campos obligatorios
  if (!foundationName || !name || !username || !email || !password || !confirmPassword) {
    showError('Por favor completa todos los campos obligatorios');
    return;
  }
  
  // Validar contraseñas
  if (password !== confirmPassword) {
    showError('Las contraseñas no coinciden');
    return;
  }
  
  // Validar longitud de contraseña
  if (password.length < 6) {
    showError('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Por favor ingresa un correo electrónico válido');
    return;
  }
  
  signupBtn.disabled = true;
  signupBtn.textContent = 'Creando cuenta...';
  hideMessages();
  
  try {
    // Preparar datos para el registro
    const userData = {
      name: name,
      username: username,
      'e-mail': email,
      password: password, 
      foundation_name: foundationName, 
      rol: 'admin' 
    };
    
    const response = await signupAdmin(userData);
    
    if (response.success && response.token) {

      if (response.user.rol === 'admin') {
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        console.log('Registro exitoso:', response.user);
        
        showSuccess('¡Registro exitoso! Bienvenido a PetLink Admin. Redirigiendo al dashboard...');
        
        setTimeout(() => {
          router.navigateTo('/dashboard');
        }, 3000);
      } else {
        showError('Error: No se pudo asignar el rol de administrador');
      }
      
    } else {
      let errorMsg = 'Error al crear la cuenta';
      
      if (response.error) {
        if (response.error.includes('username ya está en uso')) {
          errorMsg = 'El nombre de usuario ya está registrado. Por favor elige otro.';
        } else if (response.error.includes('email ya está registrado')) {
          errorMsg = 'El correo electrónico ya está registrado. Por favor usa otro.';
        } else if (response.error.includes('Faltan campos obligatorios')) {
          errorMsg = 'Faltan campos obligatorios. Por favor completa todos los campos.';
        } else {
          errorMsg = response.error;
        }
      }
      
      showError(errorMsg);
    }
    
  } catch (error) {
    console.error('Error en registro:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando.');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Registrar';
  }
}

// Redirección a login (igual que padrino-app)
function handleLogin() {
  router.navigateTo('/admin-login');
}

function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function showSuccess(message) {
  const successMessage = document.getElementById('successMessage');
  successMessage.textContent = message;
  successMessage.style.display = 'block';
}

function hideMessages() {
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
}

// Limpiar formulario
function clearForm() {
  document.getElementById('signupForm').reset();
  hideMessages();
}

// Validar en tiempo real la confirmación de contraseña
function setupRealTimeValidation() {
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  
  if (confirmPassword) {
    confirmPassword.addEventListener('input', function() {
      if (this.value && this.value !== password.value) {
        this.setCustomValidity('Las contraseñas no coinciden');
      } else {
        this.setCustomValidity('');
      }
    });
  }
  
  if (password) {
    password.addEventListener('input', function() {
      if (confirmPassword.value && this.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('Las contraseñas no coinciden');
      } else {
        confirmPassword.setCustomValidity('');
      }
    });
  }
}
