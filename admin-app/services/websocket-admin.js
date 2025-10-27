// Servicio de WebSocket para comunicación en tiempo real con el backend
// Usa Socket.IO para eventos en tiempo real

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5050';

let socket = null;
let isConnected = false;
let eventListeners = {};

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializar la conexión de WebSocket
 */
export function initWebSocket() {
  if (socket && isConnected) {
    return socket;
  }

  try {
    // Usar io global desde el CDN cargado en index.html
    socket = window.io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      isConnected = true;
    });

    socket.on('disconnect', () => {
      isConnected = false;
    });

    socket.on('connect_error', () => {
      isConnected = false;
    });

    setupEventListeners();

    return socket;
  } catch (error) {
    console.error('Error al inicializar WebSocket:', error);
    return null;
  }
}

/**
 * Configurar los listeners de eventos del servidor
 */
function setupEventListeners() {
  if (!socket) return;

  // ============================================
  // EVENTOS DE DONACIONES
  // ============================================

  socket.on('donation-created', (data) => {
    triggerCustomEvent('donation-created', data);
  });

  socket.on('need-created', (data) => {
    triggerCustomEvent('need-created', data);
  });

  socket.on('urgent-need-alert', (data) => {
    triggerCustomEvent('urgent-need-alert', data);
  });

  socket.on('appointment-created', (data) => {
    triggerCustomEvent('appointment-created', data);
  });

  socket.on('purchase-notification', (data) => {
    triggerCustomEvent('purchase-notification', data);
  });
}

// ============================================
// EMISIÓN DE EVENTOS
// ============================================

/**
 * Emitir evento de nueva donación
 */
export function emitNewDonation(donationData) {
  if (!socket || !isConnected) return false;
  socket.emit('new-donation', donationData);
  return true;
}

export function emitNewNeed(needData) {
  if (!socket || !isConnected) return false;
  socket.emit('new-need', needData);
  return true;
}

export function emitUrgentNeed(needData) {
  if (!socket || !isConnected) return false;
  socket.emit('urgent-need', needData);
  return true;
}

export function emitNewAppointment(appointmentData) {
  if (!socket || !isConnected) return false;
  socket.emit('new-appointment', appointmentData);
  return true;
}

export function emitAccessoryPurchased(purchaseData) {
  if (!socket || !isConnected) return false;
  socket.emit('accessory-purchased', purchaseData);
  return true;
}

// ============================================
// GESTIÓN DE LISTENERS PERSONALIZADOS
// ============================================

/**
 * Registrar un listener personalizado para un evento
 */
export function addEventListener(eventName, callback) {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = [];
  }
  eventListeners[eventName].push(callback);
}

/**
 * Remover un listener personalizado
 */
export function removeEventListener(eventName, callback) {
  if (!eventListeners[eventName]) return;
  
  eventListeners[eventName] = eventListeners[eventName].filter(
    listener => listener !== callback
  );
}

/**
 * Disparar eventos personalizados
 */
function triggerCustomEvent(eventName, data) {
  if (!eventListeners[eventName]) return;
  
  eventListeners[eventName].forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error al ejecutar listener de ${eventName}:`, error);
    }
  });
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Verificar si el WebSocket está conectado
 */
export function isWebSocketConnected() {
  return isConnected;
}

/**
 * Obtener la instancia del socket
 */
export function getSocket() {
  return socket;
}

/**
 * Desconectar el WebSocket
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    eventListeners = {};
  }
}

export function reconnectWebSocket() {
  if (socket && !isConnected) {
    socket.connect();
  } else if (!socket) {
    initWebSocket();
  }
}

