// Pantalla inicial: ¿Quién eres?
// Primera pantalla que se muestra siempre al iniciar la aplicación

import router from '../utils/router.js';

// Renderizar la pantalla WhoAreYou
export default function renderWhoAreYou() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="who-are-you-container">
      <div class="who-are-you-content">
        <div class="welcome-section">
          <div class="app-logo">
            <h1>🐕 PetLink</h1>
          </div>
        </div>
        
        <div class="who-are-you-title">
          <h2>¿Quién eres?</h2>
        </div>
        
        <div class="user-options">
          <button type="button" id="adminBtn" class="user-option-btn admin-btn" onclick="window.handleAdminClick()">
            Administrador
          </button>
          
          <button type="button" id="padrinoBtn" class="user-option-btn padrino-btn" onclick="window.handlePadrinoClick()">
            Padrino
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Configurar handlers globales (solo una vez)
  if (!window.handleAdminClick) {
    window.handleAdminClick = () => {
      router.navigateTo('/admin-login-signup');
    };
  }
  
  if (!window.handlePadrinoClick) {
    window.handlePadrinoClick = () => {
      window.location.href = 'http://localhost:5173/';
    };
  }
}

