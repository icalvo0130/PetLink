// Pantalla de login para administradores
// Maneja la autenticación y redirección

import router from '../utils/router.js';
import { loginAdmin, verifyToken, logoutAdmin } from '../services/admin-api.js';

// Renderizar la pantalla de login
export default function renderAdminLogin() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="login-container">
      <div class="login-form">
        <h1>Iniciar Sesión - Admin</h1>
        
        <form id="loginForm">
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
            <label for="password">Contraseña:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="Ingresa tu contraseña"
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" id="loginBtn">Iniciar Sesión</button>
            <button type="button" id="signupBtn">Crear Cuenta</button>
          </div>
        </form>
        
        <div id="errorMessage" class="error-message" style="display: none;"></div>
      </div>
    </div>
  `;
  
  setupEventListeners();
}

function setupEventListeners() {
  const loginForm = document.getElementById('loginForm');
  const signupBtn = document.getElementById('signupBtn');
  
  // Envío del formulario de login
  loginForm.addEventListener('submit', handleLogin);
  
  // Click en botón de crear cuenta
  signupBtn.addEventListener('click', handleSignup);
}

// Manejar el proceso de login
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  const errorMessage = document.getElementById('errorMessage');
  
  // Validar campos
  if (!username || !password) {
    showError('Por favor completa todos los campos');
    return;
  }
  
  // Deshabilitar botón y mostrar estado de carga
  loginBtn.disabled = true;
  loginBtn.textContent = 'Iniciando sesión...';
  hideError();
  
  try {
    // Realizar petición al backend usando el servicio API
    const response = await loginAdmin({
      username: username,
      password: password 
    });
    
    // Verificar si el login fue exitoso
    if (response.success && response.token) {
      // Verificar que sea un administrador
      if (response.user.rol === 'admin') {
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        console.log('Login exitoso:', response.user);
        
        // Redirigir al dashboard usando el router (igual que padrino-app)
        router.navigateTo('/dashboard');
      } else {
        showError('No tienes permisos de administrador');
      }
    } else {
      // Mostrar error del servidor
      const errorMsg = response.error || 'Error al iniciar sesión';
      showError(errorMsg);
    }
    
  } catch (error) {
    console.error('Error en login:', error);
    showError('Error de conexión. Verifica que el servidor esté funcionando.');
  } finally {

    loginBtn.disabled = false;
    loginBtn.textContent = 'Iniciar Sesión';
  }
}

// Redirección a registro (igual que padrino-app)
function handleSignup() {
  router.navigateTo('/admin-signup');
}

function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function hideError() {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.style.display = 'none';
}

// Verificar si hay una sesión activa
export async function checkAuth() {
  const token = localStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser');
  
  if (!token || !user) {
    return { isAuthenticated: false };
  }
  
  try {
    const userData = JSON.parse(user);
    
    // Verificar token con el backend usando el servicio API
    const response = await verifyToken(token);
    
    if (response.success && response.user) {
      // Verificar que sea un administrador
      if (response.user.rol === 'admin') {
        // Actualizar datos del usuario en localStorage
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        return { isAuthenticated: true, user: response.user, token: token };
      } else {
        // No es administrador proceder a limpiar sesión
        clearSession();
        return { isAuthenticated: false, error: 'No tienes permisos de administrador' };
      }
    } else {
      // Token inválido, proceder a limpiar sesión
      clearSession();
      return { isAuthenticated: false, error: 'Sesión expirada' };
    }
    
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    clearSession();
    return { isAuthenticated: false, error: 'Error de conexión' };
  }
}

// Limpiar datos de sesión
function clearSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
}

// Función para cerrar sesión
export async function logout() {
  const token = localStorage.getItem('adminToken');
  
  try {
  
    if (token) {
      await logoutAdmin(token);
    }
  } catch (error) {
    console.error('Error al cerrar sesión en el servidor:', error);
  
  } finally {

    clearSession();
    router.navigateTo('/admin-login');
  }
}