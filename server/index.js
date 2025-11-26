import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setSocketIO } from './utils/socket-helper.js';
import path from 'path';                    
import { fileURLToPath } from 'url';        

// Cargar variables de entorno PRIMERO
dotenv.config();

const app = express();

// Crear servidor HTTP (necesario para Socket.IO)
const httpServer = createServer(app);

// Configurar Socket.IO con CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint para Railway (DEBE estar primero)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de PetLink funcionando!',
    endpoints: ['/api/dogs', '/api/users', '/api/appointments', '/api/donations', '/api/needs', '/api/accessories', '/api/ai', '/api/payments'],
    websockets: 'Socket.IO conectado en el mismo puerto'
  });
});

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// INICIAR SERVIDOR PRIMERO (antes de cargar rutas)
// ============================================
const PORT = process.env.PORT || 5050;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  console.log('Cargando rutas...');
});

// Hacer io accesible en toda la aplicación
app.set('io', io);
setSocketIO(io);

// ============================================
// CARGAR RUTAS DESPUÉS DE QUE EL SERVIDOR INICIE
// ============================================
async function loadRoutes() {
  try {
    // Importar rutas de dogs
    const dogsRoutesModule = await import('./routes/dogs.routes.js');
    app.use('/api/dogs', dogsRoutesModule.default);
    console.log('Ruta /api/dogs registrada');

    // Importar rutas de users
    const usersRoutesModule = await import('./routes/users.routes.js');
    app.use('/api/users', usersRoutesModule.default);
    console.log('Ruta /api/users registrada');

    // Importar rutas de appointments
    const appointmentsRoutesModule = await import('./routes/appointments.routes.js');
    app.use('/api/appointments', appointmentsRoutesModule.default);
    console.log('Ruta /api/appointments registrada');

    // Importar rutas de donations
    const donationsRoutesModule = await import('./routes/donations.routes.js');
    app.use('/api/donations', donationsRoutesModule.default);
    console.log('Ruta /api/donations registrada');

    // Importar rutas de needs
    const needsRoutesModule = await import('./routes/needs.routes.js');
    app.use('/api/needs', needsRoutesModule.default);
    console.log('Ruta /api/needs registrada');

    // Importar rutas de accessories
    const accessoriesRoutesModule = await import('./routes/accessories.routes.js');
    app.use('/api/accessories', accessoriesRoutesModule.default);
    console.log('Ruta /api/accessories registrada');

    // Importar rutas de integraciones AI
    const aiIntegrationRoutesModule = await import('./routes/ai-integration.routes.js');
    app.use('/api/ai', aiIntegrationRoutesModule.default);
    console.log('Ruta /api/ai registrada');

    // Importar rutas de payments
    const paymentsRoutesModule = await import('./routes/payments.routes.js');
    app.use('/api/payments', paymentsRoutesModule.default);
    console.log('Ruta /api/payments registrada');

    // Importar rutas de auth
    const authRoutesModule = await import('./routes/auth.routes.js');
    app.use('/api/auth', authRoutesModule.default);
    console.log('Ruta /api/auth registrada');

    // Importar rutas de statistics
    const statisticsRoutesModule = await import('./routes/statistics.routes.js');
    app.use('/api/statistics', statisticsRoutesModule.default);
    console.log('Ruta /api/statistics registrada');

    console.log('✅ Todas las rutas cargadas correctamente');
  } catch (error) {
    console.error('Error cargando rutas:', error);
  }
}

// Cargar rutas
loadRoutes();

// CONFIGURACIÓN DE SOCKET.IO
let connectedUsers = 0;

io.on('connection', (socket) => {
  connectedUsers++;
  console.log('Nuevo cliente conectado. ID:', socket.id);
  
  socket.emit('welcome', {
    message: '¡Bienvenido a PetLink! 🐕',
    yourId: socket.id
  });
  
  io.emit('users-count', { count: connectedUsers });
  
  // EVENTOS DE DONACIONES
  socket.on('new-donation', (donationData) => {
    console.log('💰 Nueva donación recibida:', donationData);
    io.emit('donation-created', {
      message: '¡Nueva donación recibida!',
      donation: donationData,
      timestamp: new Date()
    });
  });
  
  // EVENTOS DE NECESIDADES
  socket.on('new-need', (needData) => {
    console.log('Nueva necesidad registrada:', needData);
    io.emit('need-created', {
      message: '¡Nueva necesidad registrada!',
      need: needData,
      timestamp: new Date()
    });
  });
  
  socket.on('urgent-need', (needData) => {
    console.log('¡NECESIDAD URGENTE!:', needData);
    io.emit('urgent-need-alert', {
      message: '¡ALERTA! Necesidad urgente',
      need: needData,
      priority: 'high',
      timestamp: new Date()
    });
  });
  
  // EVENTOS DE CITAS
  socket.on('new-appointment', (appointmentData) => {
    console.log('Nueva cita agendada:', appointmentData);
    io.emit('appointment-created', {
      message: 'Nueva cita agendada',
      appointment: appointmentData,
      timestamp: new Date()
    });
  });
  
  // EVENTOS DE ACCESORIOS
  socket.on('accessory-purchased', (purchaseData) => {
    console.log('Accesorio comprado:', purchaseData);
    io.emit('purchase-notification', {
      message: '¡Nueva compra realizada!',
      purchase: purchaseData,
      timestamp: new Date()
    });
  });

  // DESCONEXIÓN
  socket.on('disconnect', () => {
    connectedUsers--;
    console.log('Cliente desconectado. ID:', socket.id);
    io.emit('users-count', { count: connectedUsers });
  });
});

console.log('Socket.IO configurado');
