// Login Padrino - Manejo de eventos, validación y autenticación
import { login, saveCurrentUser } from '../utils/auth.js';
import router from '../utils/router.js';

(function initPadrinoLogin() {
  const backBtn = document.getElementById('backBtn');
  const loginForm = document.getElementById('loginForm');
  const goSignupBtn = document.getElementById('goSignupBtn');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Utilidades simples de UI
  function showError(msg) {
    if (!errorMessage) return;
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
    setTimeout(() => { errorMessage.style.display = 'none'; }, 6000);
  }

  function showSuccess(msg) {
    if (!successMessage) return;
    successMessage.textContent = msg;
    successMessage.style.display = 'block';
    setTimeout(() => { successMessage.style.display = 'none'; }, 4000);
  }

  function clearMessages() {
    if (errorMessage) errorMessage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
  }

  // Navegaciones
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      router.navigateTo('/login-signup');
    });
  }

  if (goSignupBtn) {
    goSignupBtn.addEventListener('click', () => {
      router.navigateTo('/signup');
    });
  }

  // Manejo de submit login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessages();

      const username = (document.getElementById('username') || {}).value?.trim();
      const password = (document.getElementById('password') || {}).value;

      if (!username || !password) {
        showError('Por favor completa usuario y contraseña.');
        return;
      }

      try {
        // Usar la función login de auth.js
        const result = await login(username, password);
        
        if (result.success) {
          showSuccess('Inicio de sesión exitoso');
          
          // Redirigir al home
          setTimeout(() => {
            router.navigateTo('/home');
          }, 500);
        } else {
          showError(result.error || 'Credenciales inválidas');
        }
      } catch (err) {
        console.error(err);
        showError('No fue posible iniciar sesión. Verifica tus datos.');
      }
    });
  }
})();
