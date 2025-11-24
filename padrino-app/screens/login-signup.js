// Pantalla login-signup (Padrino)
// Renderiza la pantalla de selección entre Login y Sign Up para padrinos

import router from '../utils/router.js';

// Renderizar la pantalla de selección Login/Sign Up
export default function renderLoginSignup() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="login-signup-container">
      <div class="welcome-section">
        <div class="app-logo">
          <h1>PetLink</h1>
        </div>
      </div>

      <div class="auth-options">
        <div class="auth-card">
          <div class="auth-icon"></div>
          <p>Accede a tu cuenta de padrino</p>
          <button id="loginBtn" class="auth-btn login-btn">Login</button>
        </div>

        <div class="auth-card">
          <div class="auth-icon"></div>
          <p>Crea una nueva cuenta de padrino</p>
          <button id="signupBtn" class="auth-btn signup-btn">Sign Up</button>
        </div>
      </div>
    </div>
  `;
  
  setupEventListeners();
}

// Configurar event listeners para los botones
function setupEventListeners() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  
  // Navegar a la pantalla de login usando el router
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      router.navigateTo('/login');
    });
  }
  
  // Navegar a la pantalla de signup usando el router
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      router.navigateTo('/signup');
    });
  }
}

