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
    origin: function (origin, callback) {
      // Permitir localhost y todos los dominios de Vercel
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
      ];
      
      // Permitir cualquier dominio de Vercel
      if (!origin || allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middlewares - CORS ACTUALIZADO
app.use(cors({
  origin: function (origin, callback) {
    // Permitir localhost y todos los dominios de Vercel
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
    ];
    
    // Permitir cualquier dominio de Vercel y solicitudes sin origen (herramientas de desarrollo)
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Configuración para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos de las aplicaciones frontend
app.use('/admin-app', express.static(path.join(__dirname, '../admin-app')));
app.use('/padrino-app', express.static(path.join(__dirname, '../padrino-app')));

console.log('Aplicaciones frontend configuradas:');
console.log('   - Admin App: http://localhost:5050/admin-app');
console.log('   - Padrino App: http://localhost:5050/padrino-app');



console.log('Express iniciado');


// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de PetLink funcionando!',
    endpoints: ['/api/dogs', '/api/users', '/api/appointments', '/api/donations', '/api/needs', '/api/accessories', '/api/ai', '/api/payments'],
    websockets: 'Socket.IO conectado en el mismo puerto'
  });
});

console.log('Ruta / registrada');


// Importar rutas de dogs
const dogsRoutesModule = await import('./routes/dogs.routes.js');
const dogsRoutes = dogsRoutesModule.default;
app.use('/api/dogs', dogsRoutes);
console.log('Ruta /api/dogs registrada exitosamente');


// Importar rutas de users
const usersRoutesModule = await import('./routes/users.routes.js');
const usersRoutes = usersRoutesModule.default;
app.use('/api/users', usersRoutes);
console.log('Ruta /api/users registrada exitosamente');


// Importar rutas de appointments
const appointmentsRoutesModule = await import('./routes/appointments.routes.js');
const appointmentsRoutes = appointmentsRoutesModule.default;
app.use('/api/appointments', appointmentsRoutes);
console.log('Ruta /api/appointments registrada exitosamente');


// Importar rutas de donations
const donationsRoutesModule = await import('./routes/donations.routes.js');
const donationsRoutes = donationsRoutesModule.default;
app.use('/api/donations', donationsRoutes);
console.log('Ruta /api/donations registrada exitosamente');


// Importar rutas de needs
const needsRoutesModule = await import('./routes/needs.routes.js');
const needsRoutes = needsRoutesModule.default;
app.use('/api/needs', needsRoutes);
console.log('Ruta /api/needs registrada exitosamente');
console.log('Ruta /api/needs registrada exitosamente');

// Importar rutas de accessories
const accessoriesRoutesModule = await import('./routes/accessories.routes.js');
const accessoriesRoutes = accessoriesRoutesModule.default;
app.use('/api/accessories', accessoriesRoutes);
console.log('Ruta /api/accessories registrada exitosamente');
console.log('Ruta /api/accessories registrada exitosamente');

// Importar rutas de integraciones AI
const aiIntegrationRoutesModule = await import('./routes/ai-integration.routes.js');
const aiIntegrationRoutes = aiIntegrationRoutesModule.default;
app.use('/api/ai', aiIntegrationRoutes);
console.log('Ruta /api/ai registrada exitosamente');


// Importar rutas de payments
const paymentsRoutesModule = await import('./routes/payments.routes.js');
const paymentsRoutes = paymentsRoutesModule.default;
app.use('/api/payments', paymentsRoutes);
console.log('Ruta /api/payments registrada exitosamente');
// Importar rutas de auth
const authRoutesModule = await import('./routes/auth.routes.js');
const authRoutes = authRoutesModule.default;
app.use('/api/auth', authRoutes);
console.log('Ruta /api/auth registrada exitosamente');

// Importar rutas de statistics
const statisticsRoutesModule = await import('./routes/statistics.routes.js');
const statisticsRoutes = statisticsRoutesModule.default;
app.use('/api/statistics', statisticsRoutes);
console.log('Ruta /api/statistics registrada exitosamente');

// CONFIGURACIÓN DE SOCKET.IO


// Variable para contar usuarios conectados
let connectedUsers = 0;

// Cuando un cliente se conecta
io.on('connection', (socket) => {
  connectedUsers++;
  console.log('Nuevo cliente conectado. ID:', socket.id);
  console.log('Usuarios conectados:', connectedUsers);
  
  // Enviar mensaje de bienvenida al cliente
  socket.emit('welcome', {
    message: '¡Bienvenido a PetLink! 🐕',
    yourId: socket.id
  });
  
  // Notificar a todos sobre el número de usuarios conectados
  io.emit('users-count', {
    count: connectedUsers
  });
  
  // EVENTOS DE DONACIONES
  
  // Escuchar cuando se crea una nueva donación
  socket.on('new-donation', (donationData) => {
    console.log('💰 Nueva donación recibida:', donationData);
    
    // Notificar a TODOS los clientes conectados
    io.emit('donation-created', {
      message: '¡Nueva donación recibida!',
      donation: donationData,
      timestamp: new Date()
    });
  });
  
  // EVENTOS DE NECESIDADES
  
  // Escuchar cuando se crea una nueva necesidad
  socket.on('new-need', (needData) => {
    console.log('Nueva necesidad registrada:', needData);
    console.log('Nueva necesidad registrada:', needData);
    
    // Notificar a TODOS los clientes
    io.emit('need-created', {
      message: '¡Nueva necesidad registrada!',
      need: needData,
      timestamp: new Date()
    });
  });
  
  // Cuando se marca una necesidad como urgente
  socket.on('urgent-need', (needData) => {
    console.log('¡NECESIDAD URGENTE!:', needData);
    console.log('¡NECESIDAD URGENTE!:', needData);
    
    // Notificar con prioridad alta
    io.emit('urgent-need-alert', {
      message: '¡ALERTA! Necesidad urgente',
      message: '¡ALERTA! Necesidad urgente',
      need: needData,
      priority: 'high',
      timestamp: new Date()
    });
  });
  
  // EVENTOS DE CITAS
  
  // Nueva cita agendada
  socket.on('new-appointment', (appointmentData) => {
    console.log('Nueva cita agendada:', appointmentData);
    console.log('Nueva cita agendada:', appointmentData);
    
    // Notificar al usuario específico (si tienes rooms por usuario)
    io.emit('appointment-created', {
      message: 'Nueva cita agendada',
      appointment: appointmentData,
      timestamp: new Date()
    });
  });
  
  // EVENTOS DE ACCESORIOS
  
  // Cuando alguien compra un accesorio
  socket.on('accessory-purchased', (purchaseData) => {
    console.log('Accesorio comprado:', purchaseData);
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
    console.log('Usuarios conectados:', connectedUsers);
    
    // Notificar a todos
    io.emit('users-count', {
      count: connectedUsers
    });
  });
});

// Hacer io accesible en toda la aplicación
app.set('io', io);

// GUARDAR IO EN socket-helper
setSocketIO(io);

console.log('Socket.IO configurado');

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  console.log('   GET  http://localhost:' + PORT + '/');
  console.log('   GET  http://localhost:' + PORT + '/api/dogs');
  console.log('   GET  http://localhost:' + PORT + '/api/users');
  console.log('   GET  http://localhost:' + PORT + '/api/appointments');
  console.log('   GET  http://localhost:' + PORT + '/api/donations');
  console.log('   GET  http://localhost:' + PORT + '/api/needs');
  console.log('   GET  http://localhost:' + PORT + '/api/accessories');
  console.log('   POST http://localhost:' + PORT + '/api/ai/*');
  console.log('   POST http://localhost:' + PORT + '/api/payments/*');
  console.log('');
  console.log('WebSocket disponible en ws://localhost:' + PORT);
});