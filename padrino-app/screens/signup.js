// Signup Padrino - Manejo de eventos, validación y registro
(function initPadrinoSignup() {
  const backBtn = document.getElementById('backBtn');
  const signupForm = document.getElementById('signupForm');
  const signupBtn = document.getElementById('signupBtn');
  const goLoginBtn = document.getElementById('goLoginBtn');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Utilidades simples de UI
  function showError(msg) {
    if (!errorMessage) return;
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
    setTimeout(() => { errorMessage.style.display = 'none'; }, 7000);
  }

  function showSuccess(msg) {
    if (!successMessage) return;
    successMessage.textContent = msg;
    successMessage.style.display = 'block';
    setTimeout(() => { successMessage.style.display = 'none'; }, 5000);
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

  if (goLoginBtn) {
    goLoginBtn.addEventListener('click', () => {
      // Ir a login usando el router
      if (window.router) {
        window.router.navigateTo('/login');
      } else {
        window.location.href = './login.html';
      }
    });
  }

  // Validadores simples
  function isValidEmail(email) {
    return /.+@.+\..+/.test(email);
  }

  function isValidPassword(pwd) {
    return typeof pwd === 'string' && pwd.length >= 6;
  }

  // Manejo de submit registro
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessages();

      const fullName = (document.getElementById('fullName') || {}).value?.trim();
      const username = (document.getElementById('username') || {}).value?.trim();
      const email = (document.getElementById('email') || {}).value?.trim();
      const phone = (document.getElementById('phone') || {}).value?.trim();
      const password = (document.getElementById('password') || {}).value;

      if (!fullName || !username || !email || !phone || !password) {
        showError('Por favor completa todos los campos.');
        return;
      }
      if (!isValidEmail(email)) {
        showError('El correo no tiene un formato válido.');
        return;
      }
      if (!isValidPassword(password)) {
        showError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      try {
        // Placeholder de registro; reemplazar con tu endpoint real
        await new Promise((r) => setTimeout(r, 700));
        showSuccess('Registro exitoso');

        // Redirigir al home usando el router
        setTimeout(() => {
          if (window.router) {
            window.router.navigateTo('/home');
          } else {
            window.location.href = '/home';
          }
        }, 600);
      } catch (err) {
        console.error(err);
        showError(err?.message || 'No fue posible completar el registro.');
      }
    });
  }
})();