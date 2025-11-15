// Pantalla inicial de selección entre Login y Sign Up para administradores
// Primera pantalla que se muestra al ingresar a la app

import router from '../utils/router.js';

// Renderizar la pantalla de selección Login/Sign Up
export default function renderAdminLoginSignup() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="login-signup-container">
      <div class="welcome-section">
        <div class="app-logo">
          <h1>🐕 PetLink Admin</h1>
          <p class="app-subtitle">Panel de Administración</p>
        </div>
        
        <div class="welcome-message">
          <h2>¡Bienvenido!</h2>
          <p>Gestiona tu fundación y ayuda a los perros que más lo necesitan</p>
        </div>
      </div>
      
      <div class="auth-options">
        <div class="auth-card">
          <div class="auth-icon">🔐</div>
          <h3>Iniciar Sesión</h3>
          <p>Accede a tu cuenta existente</p>
          <button id="loginBtn" class="auth-btn login-btn">
            Iniciar Sesión
          </button>
        </div>
        
        <div class="auth-card">
          <div class="auth-icon">📝</div>
          <h3>Registrarse</h3>
          <p>Crea una nueva cuenta de administrador</p>
          <button id="signupBtn" class="auth-btn signup-btn">
            Registrarse
          </button>
        </div>
      </div>
      
      <div class="footer-info">
        <p>¿Necesitas ayuda? Contacta al soporte técnico</p>
      </div>
    </div>
  `;
  
  setupEventListeners();
}

// Configurar event listeners para los botones
function setupEventListeners() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  
  // Navegar a la pantalla de login (igual que padrino-app)
  loginBtn.addEventListener('click', () => {
    router.navigateTo('/admin-login');
  });
  
  // Navegar a la pantalla de registro (igual que padrino-app)
  signupBtn.addEventListener('click', () => {
    router.navigateTo('/admin-signup');
  });
}

// Función para verificar si hay una sesión activa
export function checkExistingSession() {
  const token = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  if (token && adminUser) {
    // Si hay una sesión activa, redirigir al dashboard
    router.navigateTo('/dashboard');
    return true;
  }
  
  return false;
}

// Función para limpiar sesión (útil para logout)
export function clearSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  router.navigateTo('/admin-login-signup');
}
