// Renderizar pantalla de Signup para Padrino
// Renderiza el contenido del signup.html usando el router

import router from '../utils/router.js';

// Renderizar la pantalla de signup
export default function renderSignup() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="login-signup-container">
      <header class="page-header" style="width:100%; max-width:800px;">
        <button id="backBtn" class="back-btn">← Volver</button>
        <h1 style="margin:0 auto;">PetLink</h1>
        <div style="width:80px;"></div>
      </header>

      <div class="auth-options" style="max-width:700px; width:100%;">
        <div class="auth-card" style="width:100%;">
          <h2 style="margin-top:0;">Crear cuenta</h2>
          <form id="signupForm">
            <div class="form-group">
              <label for="fullName">Nombre completo</label>
              <input id="fullName" type="text" placeholder="Tu nombre y apellidos" />
            </div>
            <div class="form-group">
              <label for="username">Nombre de usuario</label>
              <input id="username" type="text" placeholder="Elige un nombre de usuario" />
            </div>
            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input id="email" type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div class="form-group">
              <label for="phone">Número de teléfono</label>
              <input id="phone" type="tel" placeholder="Tu número de contacto" />
            </div>
            <div class="form-group">
              <label for="password">Contraseña</label>
              <input id="password" type="password" placeholder="Mínimo 6 caracteres" />
            </div>
            <div class="action-buttons">
              <button id="signupBtn" type="submit" class="auth-btn signup-btn">Registrar</button>
            </div>
          </form>

          <div class="messages-section" style="margin-top:12px;">
            <div id="errorMessage" class="error-message" style="display:none;"></div>
            <div id="successMessage" class="success-message" style="display:none;"></div>
          </div>

          <div style="margin-top:16px; text-align:center;">
            <small>¿Ya tienes cuenta?</small>
            <div style="margin-top:8px;">
              <button id="goLoginBtn" class="auth-btn login-btn" style="padding:10px 16px; width:auto;">Accede a tu cuenta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Cargar dinámicamente la lógica de signup.js después de renderizar
  setTimeout(() => {
    import('./signup.js').catch(err => console.error('Error loading signup logic:', err));
  }, 0);
}

