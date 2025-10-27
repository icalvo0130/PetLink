// Servicio API para comunicarse con el backend
// Todas las peticiones al servidor se centralizan aquí

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Función helper para obtener el token de autenticación
function getAuthToken() {
  return localStorage.getItem('adminToken');
}

// Función helper para obtener headers con autenticación
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Función helper para hacer peticiones HTTP
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders(),
      ...options,
    });

    // Si la respuesta no es OK, intentar extraer el error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la petición API:', error);
    throw error;
  }
}

// ============================================
// AUTENTICACIÓN (Auth)
// ============================================

// Login de administrador
export function loginAdmin(credentials) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// Registro de administrador
export function signupAdmin(userData) {
  return fetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// Verificar token
export function verifyToken(token) {
  return fetchAPI('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// Logout
export function logoutAdmin(token) {
  return fetchAPI('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// ============================================
// PERROS (Dogs)
// ============================================

// Traer todos los perros
export function getAllDogs() {
  return fetchAPI('/dogs');
}

// Traer un perro específico
export function getDogById(id) {
  return fetchAPI(`/dogs/${id}`);
}

// Buscar perros por nombre
export function searchDogsByName(name) {
  return fetchAPI(`/dogs/search/${encodeURIComponent(name)}`);
}

// Crear un nuevo perro
export function createDog(dogData) {
  return fetchAPI('/dogs', {
    method: 'POST',
    body: JSON.stringify(dogData),
  });
}

// Actualizar un perro
export function updateDog(id, dogData) {
  return fetchAPI(`/dogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dogData),
  });
}

// Eliminar un perro
export function deleteDog(id) {
  return fetchAPI(`/dogs/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// CITAS (Appointments)
// ============================================

// Traer todas las citas
export function getAllAppointments() {
  return fetchAPI('/appointments');
}

// Crear una cita
export function createAppointment(appointmentData) {
  return fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
}

// Traer citas de un perro
export function getAppointmentsByDog(dogId) {
  return fetchAPI(`/appointments/dog/${dogId}`);
}

// Traer citas de un padrino
export function getAppointmentsByPadrino(padrinoId) {
  return fetchAPI(`/appointments/padrino/${padrinoId}`);
}

// Actualizar decisión de una cita (aceptar/rechazar)
export function updateAppointmentDecision(appointmentId, decisionData) {
  return fetchAPI(`/appointments/decision/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(decisionData),
  });
}

// ============================================
// DONACIONES (Donations)
// ============================================

// Traer todas las donaciones
export function getAllDonations() {
  return fetchAPI('/donations');
}

// Crear una donación
export function createDonation(donationData) {
  return fetchAPI('/donations', {
    method: 'POST',
    body: JSON.stringify(donationData),
  });
}

// Traer donaciones de un perro
export function getDonationsByDog(dogId) {
  return fetchAPI(`/donations/dog/${dogId}`);
}

// ============================================
// NECESIDADES (Needs)
// ============================================

// Traer todas las necesidades
export function getAllNeeds() {
  return fetchAPI('/needs');
}

// Traer necesidades de un perro
export function getNeedsByDog(dogId) {
  return fetchAPI(`/needs/dog/${dogId}`);
}

// Traer una necesidad específica
export function getNeedById(id) {
  return fetchAPI(`/needs/${id}`);
}

// Crear una necesidad
export function createNeed(needData) {
  return fetchAPI('/needs', {
    method: 'POST',
    body: JSON.stringify(needData),
  });
}

// Actualizar una necesidad
export function updateNeed(id, needData) {
  return fetchAPI(`/needs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(needData),
  });
}

// Eliminar una necesidad
export function deleteNeed(id) {
  return fetchAPI(`/needs/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// ACCESORIOS (Accessories)
// ============================================

// Traer todos los accesorios
export function getAllAccessories() {
  return fetchAPI('/accessories');
}

// Traer un accesorio específico
export function getAccessoryById(id) {
  return fetchAPI(`/accessories/${id}`);
}

// Crear un accesorio
export function createAccessory(accessoryData) {
  return fetchAPI('/accessories', {
    method: 'POST',
    body: JSON.stringify(accessoryData),
  });
}

// Actualizar un accesorio
export function updateAccessory(id, accessoryData) {
  return fetchAPI(`/accessories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(accessoryData),
  });
}

// Eliminar un accesorio
export function deleteAccessory(id) {
  return fetchAPI(`/accessories/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// ESTADÍSTICAS (Statistics)
// ============================================

// Traer estadísticas de un perro
export function getDogStatistics(dogId) {
  return fetchAPI(`/statistics/${dogId}`);
}

// ============================================
// IA - STABILITY AI
// ============================================

// Generar imagen de perro con accesorio usando IA
export function generateAIImage(imageData) {
  return fetchAPI('/ai/generate-dog-with-accessory', {
    method: 'POST',
    body: JSON.stringify(imageData),
  });
}

// ============================================
// PAGOS (Payments)
// ============================================

// Crear una sesión de pago
export function createPaymentSession(paymentData) {
  return fetchAPI('/payments/create-session', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
}

// Verificar un pago
export function verifyPayment(paymentId) {
  return fetchAPI(`/payments/verify/${paymentId}`);
}

// ============================================
// USUARIOS (Users)
// ============================================

// Traer todos los usuarios
export function getAllUsers() {
  return fetchAPI('/users');
}

// Traer un usuario específico
export function getUserById(id) {
  return fetchAPI(`/users/${id}`);
}

// Crear un usuario
export function createUser(userData) {
  return fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// Actualizar un usuario
export function updateUser(id, userData) {
  return fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

// Eliminar un usuario
export function deleteUser(id) {
  return fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  });
}

