// Este es el CEREBRO de la aplicacion (conecta todo)

import router from './utils/router.js';
import renderWhoAreYou from './screens/WhoAreYou.js';
import renderLoginSignup from './screens/login-signup.js';
import renderLogin from './screens/render-login.js';
import renderSignup from './screens/render-signup.js';
import { renderHome } from './screens/home.js';
import { renderDogProfile } from './screens/dog-profile.js';
import { renderNeedDetail } from './screens/need-detail.js';
import { renderPayment } from './screens/payment.js';
import { renderScheduleAppointment } from './screens/schedule-appointment.js';
import { renderDogStatistics } from './screens/dog-stats.js'; 
import { renderAccessoriesList } from './screens/accessories-list.js';
import { renderAccessoryDetail } from './screens/accessory-detail.js';
import { renderGallery } from './screens/gallery.js';

// Configurar las rutas
function setupRoutes() {
  // Ruta por defecto - Pantalla inicial WhoAreYou
  router.addRoute('/', renderWhoAreYou);
  
  // Ruta de login-signup para padrinos
  router.addRoute('/login-signup', renderLoginSignup);
  
  // Rutas de autenticación
  router.addRoute('/login', renderLogin);
  router.addRoute('/signup', renderSignup);
  
  // Ruta del HOME
  router.addRoute('/home', renderHome);
  
  // Ruta del perfil del perro
  router.addRoute('/dog/:id', (params) => {
    const dogId = params.id;
    renderDogProfile(dogId);
  });
  
  // Ruta del detalle de necesidad
  router.addRoute('/need/:id', (params) => {
    const needId = params.id;
    renderNeedDetail(needId);
  });
  
  // Ruta de pago
  router.addRoute('/payment', renderPayment);
  
  // Ruta de agendar cita
  router.addRoute('/dog/:id/schedule', (params) => {
    const dogId = params.id;
    renderScheduleAppointment(dogId);
  });
  
  // Ruta de estadísticas (ESTA ES NUEVA)
  router.addRoute('/dog/:id/statistics', (params) => {
    const dogId = params.id;
    renderDogStatistics(dogId);

  });

   // Ruta de lista de accesorios
  router.addRoute('/accessories/:dogId', (params) => {
    const dogId = params.dogId;
    renderAccessoriesList(dogId);
  });
  
  // Ruta de detalle de accesorio
  router.addRoute('/accessory/:id', (params) => {
    const accessoryId = params.id;
    renderAccessoryDetail(accessoryId);
  });
  
  // Ruta de galería
  router.addRoute('/gallery/:dogId', (params) => {
    const dogId = params.dogId;
    renderGallery(dogId);
  });
}


// Iniciar la aplicacion
function initApp() {
  console.log('Iniciando aplicacion...');
  
  // Configurar las rutas
  setupRoutes();
  
  // Iniciar el router
  router.init();
  
  console.log('Aplicacion iniciada!');
}

// Cuando el HTML este listo, iniciar la app
document.addEventListener('DOMContentLoaded', initApp);