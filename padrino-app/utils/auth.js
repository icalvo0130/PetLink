// Este archivo maneja el USUARIO ACTUAL y la autenticacion

const API_URL = 'http://localhost:5050/api';

// LOGIN - Iniciar sesion con el backend
export async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error('Credenciales invalidas');
    }

    const data = await response.json();
    
    // Guardar usuario y token en localStorage
    saveCurrentUser(data.user);
    localStorage.setItem('padrinoToken', data.token);
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: error.message };
  }
}

// REGISTER - Registrar nuevo usuario
export async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrar');
    }

    const data = await response.json();
    
    // Guardar usuario y token en localStorage
    saveCurrentUser(data.user);
    localStorage.setItem('padrinoToken', data.token);
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error en register:', error);
    return { success: false, error: error.message };
  }
}

// Guardar usuario en localStorage
export function saveCurrentUser(userData) {
  localStorage.setItem('padrinoUser', JSON.stringify(userData));
  localStorage.setItem('padrinoId', userData.id);
}

// Obtener usuario actual
export function getCurrentUser() {
  const userJson = localStorage.getItem('padrinoUser');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    return null;
  }
}

// Obtener ID del usuario actual
export function getCurrentUserId() {
  const userId = localStorage.getItem('padrinoId');
  return userId ? parseInt(userId) : null;
}

// Verificar si hay usuario loggeado
export function isUserLoggedIn() {
  return getCurrentUserId() !== null;
}

// Cerrar sesion
export async function logout() {
  try {
    const token = localStorage.getItem('padrinoToken');
    
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
  } catch (error) {
    console.error('Error al hacer logout:', error);
  } finally {
    // Limpiar localStorage
    localStorage.removeItem('padrinoUser');
    localStorage.removeItem('padrinoId');
    localStorage.removeItem('padrinoToken');
  }
}

// Crear usuario simulado (para testing cuando no hay login)
export function createMockUser(id = 1) {
  const mockUser = {
    id: id,
    name: 'Usuario de Prueba',
    username: 'usuario_test',
    email: 'test@petlink.com',
    phone_numb: '1234567890',
    rol: 'padrino'
  };
  
  saveCurrentUser(mockUser);
  return mockUser;
}