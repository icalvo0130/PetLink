// Este es el CEREBRO de la aplicación admin-app
// Conecta todas las pantallas y servicios

import router from './utils/router.js';
import { initWebSocket } from './services/websocket-admin.js';

// Importar todas las pantallas
import renderAdminLoginSignup from "./screens/admin-login-signup.js";
import renderAdminLogin from "./screens/admin-login.js";
import renderAdminSignup from "./screens/admin-signup.js";
import renderDashboard from "./screens/dashboard.js";
import renderProductsManage from "./screens/products-manage.js";
import renderAddDog from "./screens/add-dog.js";
import renderAppointmentsManage from "./screens/appointments-manage.js";
import renderDonationsView from "./screens/donations-view.js";
import renderDonationsProfileDog from "./screens/donations-profile-dog.js";
import renderDogEstadistics from "./screens/dog-estadistics.js";
import renderDogManagement from "./screens/dog-management.js";
import renderDogProfile from "./screens/dog-profile.js";

/**
 * Configurar todas las rutas de la aplicación
 * Patrón igual a padrino-app: usar parámetros en la URL
 */
function setupRoutes() {
  // Ruta por defecto (redirigir a login si no hay sesión)
  router.addRoute('/', () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.navigateTo('/dashboard');
    } else {
      router.navigateTo('/admin-login');
    }
  });
  
  // Rutas de autenticación
  router.addRoute('/admin-login-signup', renderAdminLoginSignup);
  router.addRoute('/admin-login', renderAdminLogin);
  router.addRoute('/admin-signup', renderAdminSignup);
  
  // Ruta principal - Dashboard
  router.addRoute('/dashboard', renderDashboard);
  
  // Rutas de gestión
  router.addRoute('/dog-management', renderDogManagement);
  router.addRoute('/add-pet', renderAddDog);
  router.addRoute('/appointments', renderAppointmentsManage);
  router.addRoute('/donations', renderDonationsView);
  
  // Rutas con parámetros (igual que padrino-app)
  router.addRoute('/dog-profile/:dogId', (params) => {
    const dogId = params.dogId;
    renderDogProfile(dogId);
  });
  
  router.addRoute('/dog-estadistics/:dogId', (params) => {
    const dogId = params.dogId;
    renderDogEstadistics(dogId);
  });
  
  router.addRoute('/donations-profile-dog/:dogId', (params) => {
    const dogId = params.dogId;
    renderDonationsProfileDog(dogId);
  });
  
  // Ruta simple para products-manage (usa sessionStorage para contexto)
  router.addRoute('/products-manage', renderProductsManage);
}

/**
 * Configurar listeners de eventos en tiempo real
 */
function setupRealtimeListeners() {
  // Importar funciones del servicio de websockets
  import('./services/websocket-admin.js').then(module => {
    const { addEventListener } = module;
    
    // Listener para nuevas donaciones
    addEventListener('donation-created', (data) => {
      showNotification('Nueva donación recibida', 'success');
    });
    
    // Listener para nuevas citas
    addEventListener('appointment-created', (data) => {
      showNotification('Nueva cita registrada', 'info');
    });
    
    // Listener para necesidades urgentes
    addEventListener('urgent-need-alert', (data) => {
      showNotification('¡NECESIDAD URGENTE! - ' + (data.need?.name || 'Ver detalles'), 'warning');
    });
    
    // Listener para nuevas compras
    addEventListener('purchase-notification', (data) => {
      showNotification('Nueva compra de accesorio', 'success');
    });
  });
}

/**
 * Mostrar notificación visual
 */
function showNotification(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Estilos inline para asegurar visibilidad
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

/**
 * Iniciar la aplicación
 */
function initApp() {
  setupRoutes();
  router.init();
  initWebSocket();
  setupRealtimeListeners();
}

// Cuando el HTML esté listo, iniciar la app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Exportar router para uso en otras partes de la app
export { router };
