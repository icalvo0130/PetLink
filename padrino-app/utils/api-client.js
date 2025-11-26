// Este archivo es como un mensajero
// Va al backend y trae la informacion que necesitamos

// La direccion base de nuestra API
const API_BASE_URL = 'http://localhost:5050/api';

// Clase que maneja todas las peticiones al backend
class ApiService {
    
    // PERROS
    
    // Traer todos los perros
    async getAllDogs() {
        try {
            const response = await fetch(`${API_BASE_URL}/dogs`);
            if (!response.ok) throw new Error('Error al traer los perros');
            return await response.json();
        } catch (error) {
            console.error('Error en getAllDogs:', error);
            return [];
        }
    }
    
    // Traer un perro por su ID
    async getDogById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/dogs/${id}`);
            if (!response.ok) throw new Error('Error al traer el perro');
            return await response.json();
        } catch (error) {
            console.error('Error en getDogById:', error);
            return null;
        }
    }
    
    // NECESIDADES
    
    // Traer necesidades de un perro
    async getNeedsByDogId(dogId) {
        try {
            const response = await fetch(`${API_BASE_URL}/needs/dog/${dogId}`);
            if (!response.ok) throw new Error('Error al traer necesidades');
            return await response.json();
        } catch (error) {
            console.error('Error en getNeedsByDogId:', error);
            return [];
        }
    }
    
    // Traer una necesidad por su ID
    async getNeedById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/needs/${id}`);
            if (!response.ok) throw new Error('Error al traer la necesidad');
            return await response.json();
        } catch (error) {
            console.error('Error en getNeedById:', error);
            return null;
        }
    }
    
    // ACCESORIOS
    
    // Traer todos los accesorios
    async getAllAccessories() {
        try {
            const response = await fetch(`${API_BASE_URL}/accessories`);
            if (!response.ok) throw new Error('Error al traer accesorios');
            return await response.json();
        } catch (error) {
            console.error('Error en getAllAccessories:', error);
            return [];
        }
    }
    
    // Traer un accesorio por su ID
    async getAccessoryById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/accessories/${id}`);
            if (!response.ok) throw new Error('Error al traer el accesorio');
            return await response.json();
        } catch (error) {
            console.error('Error en getAccessoryById:', error);
            return null;
        }
    }
    
    // CITAS
    
    // Crear una nueva cita
    async createAppointment(appointmentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });
            if (!response.ok) throw new Error('Error al crear la cita');
            return await response.json();
        } catch (error) {
            console.error('Error en createAppointment:', error);
            return null;
        }
    }
    
    // DONACIONES
    
    // Crear una nueva donacion
    async createDonation(donationData) {
        try {
            const response = await fetch(`${API_BASE_URL}/donations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(donationData)
            });
            if (!response.ok) throw new Error('Error al crear la donacion');
            return await response.json();
        } catch (error) {
            console.error('Error en createDonation:', error);
            return null;
        }
    }
    
    // PAGOS
    
    // Procesar un pago
    async processPayment(paymentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            if (!response.ok) throw new Error('Error al procesar el pago');
            return await response.json();
        } catch (error) {
            console.error('Error en processPayment:', error);
            return null;
        }
    }
    
    // AI
    
    // Generar imagen de perro con accesorio
    async generateDogWithAccessory(dogData, accessoryData) {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/generate-dog-with-accessory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dog: dogData, accessory: accessoryData })
            });
            if (!response.ok) throw new Error('Error al generar imagen');
            return await response.json();
        } catch (error) {
            console.error('Error en generateDogWithAccessory:', error);
            return null;
        }
    }
}

// Exportar una unica instancia del servicio
export const apiService = new ApiService();