// Este archivo se comunica con el BACKEND (trae y envÃ­a datos)

//  USAR VARIABLE DE ENTORNO en lugar de localhost hardcoded
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// FunciÃ³n helper para hacer peticiones
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la peticiÃ³n:', error);
    throw error;
  }
}

// PERROS (Dogs)

// Traer todos los perros
function getAllDogs() {
  return fetchAPI('/dogs');
}

// Traer un perro especÃ­fico
function getDogById(id) {
  return fetchAPI(`/dogs/${id}`);
}

// Buscar perros por nombre
function searchDogsByName(name) {
  return fetchAPI(`/dogs/search/${name}`);
}

// CITAS (Appointments)

// Crear una cita
function createAppointment(appointmentData) {
  return fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
}

// Traer citas de un perro
function getAppointmentsByDog(dogId) {
  return fetchAPI(`/appointments/dog/${dogId}`);
}

// Traer citas de un padrino
function getAppointmentsByPadrino(padrinoId) {
  return fetchAPI(`/appointments/padrino/${padrinoId}`);
}

// ACCESORIOS (Accessories)

// Traer todos los accesorios
function getAllAccessories() {
  return fetchAPI('/accessories');
}

// Traer un accesorio especÃ­fico
function getAccessoryById(id) {
  return fetchAPI(`/accessories/${id}`);
}

// Crear una compra de accesorio (NUEVO)
function createAccessoryPurchase(accessoryData) {
  return fetchAPI('/accessories', {
    method: 'POST',
    body: JSON.stringify(accessoryData),
  });
}

// DONACIONES (Donations)

// Crear una donaciÃ³n
function createDonation(donationData) {
  return fetchAPI('/donations', {
    method: 'POST',
    body: JSON.stringify(donationData),
  });
}

// Traer donaciones de un perro
function getDonationsByDog(dogId) {
  return fetchAPI(`/donations/dog/${dogId}`);
}

// NECESIDADES (Needs)

// Traer necesidades de un perro
function getNeedsByDog(dogId) {
  return fetchAPI(`/needs/dog/${dogId}`);
}

// Traer una necesidad especÃ­fica
function getNeedById(id) {
  return fetchAPI(`/needs/${id}`);
}

// Traer estadÃ­sticas de un perro
function getDogStatistics(dogId) {
  return fetchAPI(`/statistics/${dogId}`);
}

// IA - STABILITY AI (NUEVO)

// Generar imagen de perro con accesorio usando IA
function generateAIImage(dogData, accessoryData) {
  return fetchAPI('/ai/generate-dog-with-accessory', {
    method: 'POST',
    body: JSON.stringify({ dogData, accessoryData }),
  });
}

// EXPORTAR todas las funciones
export {
  getAllDogs,
  getDogById,
  searchDogsByName,
  createAppointment,
  getAppointmentsByDog,
  getAppointmentsByPadrino,
  getAllAccessories,
  getAccessoryById,
  createAccessoryPurchase,  // NUEVO
  createDonation,
  getDonationsByDog,
  getNeedsByDog,
  getNeedById,
  getDogStatistics,
  generateAIImage  // NUEVO
};