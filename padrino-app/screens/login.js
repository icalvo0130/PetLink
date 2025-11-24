// Login Padrino - Manejo de eventos, validación y autenticación
(function initPadrinoLogin() {
  const backBtn = document.getElementById('backBtn');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
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

  // Navegaciones solicitadas
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Volver a selección de flujo usando el router
      if (window.router) {
        window.router.navigateTo('/login-signup');
      } else {
        window.location.href = './login-signup.html';
      }
    });
  }

  if (goSignupBtn) {
    goSignupBtn.addEventListener('click', () => {
      // Ir a registro usando el router
      if (window.router) {
        window.router.navigateTo('/signup');
      } else {
        window.location.href = './signup.html';
      }
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
        // Placeholder de autenticación. Ajusta a tu endpoint si aplica.
        // const res = await fetch('http://localhost:5050/api/padrino/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ username, password })
        // });
        // if (!res.ok) throw new Error('Credenciales inválidas');
        // const data = await res.json();
        // localStorage.setItem('padrinoToken', data.token);
        // localStorage.setItem('padrinoUser', JSON.stringify(data.user));

        // Simulación básica de éxito (quítalo cuando conectes tu endpoint real)
        await new Promise((r) => setTimeout(r, 600));
        showSuccess('Inicio de sesión exitoso');

        // Redirigir al home usando el router
        setTimeout(() => {
          if (window.router) {
            window.router.navigateTo('/home');
          } else {
            window.location.href = '/home';
          }
        }, 500);
      } catch (err) {
        console.error(err);
        showError('No fue posible iniciar sesión. Verifica tus datos.');
      }
    });
  }
})();