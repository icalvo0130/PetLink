// Renderizar pantalla de Login para Padrino
// Renderiza el contenido del login.html usando el router

import router from '../utils/router.js';

// Renderizar la pantalla de login
export default function renderLogin() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="login-signup-container">
      <header class="page-header" style="width:100%; max-width:800px;">
        <button id="backBtn" class="back-btn">← Volver</button>
        <h1 style="margin:0 auto;">PetLink</h1>
        <div style="width:80px;"></div>
      </header>

      <div class="auth-options" style="max-width:600px; width:100%;">
        <div class="auth-card" style="width:100%;">
          <h2 style="margin-top:0;">Iniciar sesión</h2>
          <form id="loginForm">
            <div class="form-group">
              <label for="username">Usuario</label>
              <input id="username" type="text" placeholder="Ingresa tu usuario" />
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input id="password" type="password" placeholder="Ingresa tu contraseña" />
            </div>
            <div class="action-buttons">
              <button id="loginBtn" type="submit" class="auth-btn login-btn">Login</button>
            </div>
          </form>

          <div class="messages-section" style="margin-top:12px;">
            <div id="errorMessage" class="error-message" style="display:none;"></div>
            <div id="successMessage" class="success-message" style="display:none;"></div>
          </div>

          <div style="margin-top:16px; text-align:center;">
            <small>¿Aún no estás registrado?</small>
            <div style="margin-top:8px;">
              <button id="goSignupBtn" class="auth-btn signup-btn" style="padding:10px 16px; width:auto;">Crea una cuenta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Cargar dinámicamente la lógica de login.js después de renderizar
  setTimeout(() => {
    import('./login.js').catch(err => console.error('Error loading login logic:', err));
  }, 0);
}

