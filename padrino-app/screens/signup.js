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
    // Variable para prevenir doble submit
    let isSubmitting = false;
    
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Prevenir doble submit
      if (isSubmitting) {
        return;
      }
      
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

      // Deshabilitar botón durante el proceso
      isSubmitting = true;
      const submitBtn = document.getElementById('signupBtn');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Registrar';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';
      }

      try {
        // Importar función de registro
        const { register } = await import('../utils/auth.js');
        
        // Preparar datos según lo que espera el backend
        // Backend espera: { username, 'e-mail', name, phone_number, rol }
        const userData = {
          username: username,
          'e-mail': email,
          name: fullName,
          phone_number: phone,
          rol: 'padrino'
        };
        
        // Llamar al endpoint real
        const result = await register(userData);
        
        if (result.success) {
          showSuccess('Registro exitoso. Bienvenido a PetLink!');
          
          // Redirigir al home usando el router
          setTimeout(() => {
            if (window.router) {
              window.router.navigateTo('/home');
            } else {
              window.location.href = '/home';
            }
          }, 1000);
        } else {
          showError(result.error || 'No fue posible completar el registro.');
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      } catch (err) {
        console.error('Error en registro:', err);
        showError(err?.message || 'No fue posible completar el registro. Intenta nuevamente.');
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }
})();