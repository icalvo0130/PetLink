// Esta es la pantalla de PAGO SIMULADO (versión simplificada para debugging)

import { createDonation, generateAIImage } from '../services/api.js';
import router from '../utils/router.js';
import { getCurrentUserId, isUserLoggedIn, createMockUser } from '../utils/auth.js';
import supabase from '../supabase.service.js';

// Renderizar (mostrar) la pantalla de pago
export function renderPayment() {
  const app = document.getElementById('app');
  
  // Verificar si hay usuario loggeado
  let userId = getCurrentUserId();
  
  // Si no hay usuario, crear uno simulado para pruebas
  if (!userId) {
    console.warn('No hay usuario loggeado, creando usuario simulado...');
    const mockUser = createMockUser();
    userId = mockUser.id;
  }
  
  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type'); // 'accessory' o 'need'
  const price = params.get('price');
  const dogId = params.get('dogId');
  
  // Verificar tipo de pago
  const isAccessory = type === 'accessory';
  
  // Validar parámetros según el tipo
  if (!price || !dogId) {
    console.error('Faltan parámetros en la URL');
    router.navigateTo('/home');
    return;
  }
  
  // Título según tipo
  const title = isAccessory ? 'Comprar Accesorio' : 'Realizar Donación';
  const summaryTitle = isAccessory ? 'Resumen de tu compra' : 'Resumen de tu donación';
  const summaryLabel = isAccessory ? 'Monto a pagar:' : 'Monto a donar:';
  const buttonText = isAccessory ? `Confirmar Compra de $${price}` : `Confirmar Donación de $${price}`;
  
  // Calcular costos
  const subtotal = parseFloat(price);
  const costosAdicionales = 0;
  const total = subtotal + costosAdicionales;
  
  // Formatear precios en formato colombiano
  const formatCOP = (value) => {
    return value.toLocaleString('es-CO');
  };

  app.innerHTML = `
    <div class="payment-container">
      <!-- Botón de volver -->
      <button class="payment-btn-back" id="btn-back">
        <span>‹</span>
      </button>
      
      <!-- Título -->
      <h1 class="payment-title">Elige tu <span class="payment-title-highlight">pago</span></h1>
      
      <!-- Métodos de pago -->
      <div class="payment-methods">
        <label class="payment-method-card">
          <input type="radio" name="payment-method" value="card" checked>
          <div class="payment-method-content">
            <div class="payment-method-icon">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#EB001B"/>
                <circle cx="22" cy="10" r="10" fill="#F79E1B"/>
                <path d="M16 3.82a9.96 9.96 0 0 0-3.64 7.68c0 3.08 1.39 5.83 3.64 7.68a9.96 9.96 0 0 0 3.64-7.68A9.96 9.96 0 0 0 16 3.82z" fill="#FF5F00"/>
              </svg>
            </div>
            <span class="payment-method-label">Tarjeta de credito/debito</span>
          </div>
        </label>
        
        <label class="payment-method-card">
          <input type="radio" name="payment-method" value="paypal">
          <div class="payment-method-content">
            <div class="payment-method-icon">
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                <path d="M20.1 4.5C18.9 3.1 16.6 2.5 13.7 2.5H5.5c-.5 0-1 .4-1.1.9L1.3 22.1c-.1.4.2.7.6.7h4.4l1.1-7-.1.2c.1-.5.5-.9 1.1-.9h2.2c4.4 0 7.9-1.8 8.9-7 0-.2.1-.3.1-.5.3-1.7.0-2.9-.5-4.1z" fill="#003087"/>
                <path d="M20.6 8.6c-1 5.2-4.5 7-8.9 7H9.5c-.5 0-1 .4-1.1.9l-1.1 7.2-.3 2c-.1.3.2.6.5.6h3.8c.5 0 .9-.3 1-.8v-.2l.7-4.5v-.2c.1-.5.5-.8 1-.8h.6c4 0 7.1-1.6 8-6.3.4-2 .2-3.6-.8-4.8-.3-.4-.7-.7-1.2-1.1z" fill="#009CDE"/>
              </svg>
            </div>
            <span class="payment-method-label">Paypal</span>
          </div>
        </label>
        
        <label class="payment-method-card">
          <input type="radio" name="payment-method" value="google">
          <div class="payment-method-content">
            <div class="payment-method-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <span class="payment-method-label">Google pay</span>
          </div>
        </label>
      </div>
      
      <!-- Resumen de pago -->
      <div class="payment-summary-section">
        <div class="payment-summary-row">
          <span class="payment-summary-label">Subtotal</span>
          <span class="payment-summary-value">COP ${formatCOP(subtotal)}</span>
        </div>
        
        <div class="payment-summary-row">
          <span class="payment-summary-label">Costos Adicionales</span>
          <span class="payment-summary-value">COP ${costosAdicionales}</span>
        </div>
        
        <div class="payment-summary-row payment-summary-total-row">
          <span class="payment-summary-label">Total</span>
        </div>
        
        <div class="payment-summary-divider"></div>
        
        <div class="payment-summary-total">
          <span class="payment-total-amount">COP ${formatCOP(total)}</span>
        </div>
      </div>
      
      <!-- Botón de pagar -->
      <form id="payment-form">
        <button type="submit" class="payment-btn-submit" id="btn-pay">
          Donar ahora
        </button>
      </form>
    </div>
  `;
  
  // Agregar eventos
  setupPaymentEvents(params, userId, isAccessory);
}

// Configurar eventos de la pantalla de pago
function setupPaymentEvents(params, userId, isAccessory) {
  // Botón volver
  document.getElementById('btn-back').addEventListener('click', () => {
    window.history.back();
  });
  
  // Enviar formulario
  const form = document.getElementById('payment-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isAccessory) {
      await processAccessoryPayment(params, userId);
    } else {
      await processNeedPayment(params, userId);
    }
  });
}

// Procesar pago de ACCESORIO (VERSIÓN SIMPLIFICADA)
async function processAccessoryPayment(params, userId) {
  const btnPay = document.getElementById('btn-pay');
  
  // Deshabilitar botón mientras se procesa
  btnPay.disabled = true;
  btnPay.textContent = 'Procesando compra...';
  
  try {
    const dogId = params.get('dogId');
    const price = params.get('price');
    
    console.log('Procesando compra de accesorio...');
    
    // Paso 1: Generar imagen con IA
    btnPay.textContent = 'Generando imagen IA...';
    
    const dogData = {
      id: parseInt(dogId),
      breed: params.get('dogBreed') || 'dog',
      size: params.get('dogSize') || 'medium',
      age: params.get('dogAge') || 'adult'
    };
    
    const accessoryData = {
      category: params.get('accessoryCategory') || 'accesorio',
      description: params.get('accessoryName') || ''
    };
    
    console.log('Generando imagen IA:', { dogData, accessoryData });
    
    let imageUrl = '/images/Tigre.png'; // Imagen por defecto
    
    try {
      const imageResult = await generateAIImage(dogData, accessoryData);
      
      if (imageResult.success) {
        imageUrl = imageResult.storageUrl || imageResult.imageUrl;
        console.log('Imagen generada:', imageUrl);
      } else {
        console.warn('No se pudo generar imagen IA, usando imagen por defecto');
      }
    } catch (aiError) {
      console.warn('Error en IA, continuando con imagen por defecto:', aiError.message);
    }
    
    // Paso 2: Insertar DIRECTAMENTE con Supabase (sin usar API)
    btnPay.textContent = 'Guardando compra...';
    
    console.log('Creando registro de compra:', {
      id_dog: parseInt(dogId),
      id_user: userId,
      category: params.get('accessoryCategory'),
      name: params.get('accessoryName'),
      price: parseFloat(price),
      imagen_ia: imageUrl
    });
    
    // Insertar directamente con Supabase
    const { data, error } = await supabase
      .from('Accessories')
      .insert([{
        id_dog: parseInt(dogId),
        id_user: userId,
        category: params.get('accessoryCategory'),
        name: params.get('accessoryName'),
        price: parseFloat(price),
        imagen_ia: imageUrl
      }])
      .select();
    
    if (error) {
      console.error('Error de Supabase:', error);
      throw new Error(error.message);
    }
    
    console.log('Compra registrada:', data);
    
    // Actualizar estadisticas del perro (accesorio = wellbeing_level)
    try {
      const response = await fetch(`http://localhost:5050/api/dogs/${dogId}/update-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'accesorio' })
      });
      
      if (response.ok) {
        console.log('Estadisticas actualizadas por compra de accesorio');
      }
    } catch (statsError) {
      console.error('Error al actualizar estadisticas:', statsError);
      // No fallar la compra si falla la actualizacion de stats
    }
    
    // Paso 3: Mostrar mensaje de éxito
    showAccessorySuccessMessage(data[0], imageUrl, dogId);
    
    // Paso 4: Redirigir a galería después de 4 segundos
    setTimeout(() => {
      router.navigateTo(`/gallery/${dogId}`);
    }, 4000);
    
  } catch (error) {
    console.error('Error al procesar compra de accesorio:', error);
    
    // Mostrar mensaje de error
    btnPay.disabled = false;
    btnPay.textContent = 'Reintentar';
    
    alert('Error al procesar la compra: ' + error.message);
  }
}

// Procesar pago de NECESIDAD (donación)
async function processNeedPayment(params, userId) {
  const btnPay = document.getElementById('btn-pay');
  
  // Deshabilitar botón mientras se procesa
  btnPay.disabled = true;
  btnPay.textContent = 'Procesando...';
  
  try {
    const needId = params.get('needId');
    const price = params.get('price');
    const dogId = params.get('dogId');
    
    // Generar un ID de transacción simulado
    const transactionId = 'TXN-' + Date.now();
    
    // Crear la donación
    const donationData = {
      id_padrino: userId,
      id_dog: parseInt(dogId),
      id_need: parseInt(needId),
      price: parseFloat(price),
      transaction_id: transactionId,
      state: 'completed'
    };
    
    console.log('Enviando donación:', donationData);
    
    const donation = await createDonation(donationData);
    
    console.log('Donación creada exitosamente:', donation);
    
    // Mostrar mensaje de éxito
    showNeedSuccessMessage(donation);
    
    // Redirigir al perfil del perro después de 3 segundos
    setTimeout(() => {
      router.navigateTo(`/dog/${dogId}`);
    }, 3000);
    
  } catch (error) {
    console.error('Error al procesar donación:', error);
    
    // Mostrar mensaje de error
    btnPay.disabled = false;
    btnPay.textContent = 'Reintentar';
    
    alert('Error al procesar la donación. Por favor intenta de nuevo.');
  }
}

// Mostrar mensaje de éxito para ACCESORIO
function showAccessorySuccessMessage(purchase, imageUrl, dogId) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="payment-success-container">
      <!-- Header naranja con logo -->
      <div class="payment-success-header">
        <img src="/images/logo.png" alt="PetLink" class="payment-success-logo">
      </div>
      
      <!-- Contenido -->
      <div class="payment-success-content">
        <!-- Ilustración del perrito -->
        <div class="payment-success-illustration">
          <img src="${imageUrl}" alt="Foto generada" class="payment-success-image">
        </div>
        
        <!-- Título -->
        <h1 class="payment-success-title">¡Donación <span class="highlight">exitosa!</span></h1>
        
        <!-- Subtítulo -->
        <p class="payment-success-subtitle">recibirá tu accesorio<br>gracias a ti.</p>
        
        <!-- Botón -->
        <button class="payment-success-btn" id="btn-gallery">
          ir a galeria de imagenes
        </button>
      </div>
    </div>
  `;
  
  // Evento del botón
  document.getElementById('btn-gallery').addEventListener('click', () => {
    router.navigateTo(`/gallery/${dogId}`);
  });
}

// Mostrar mensaje de éxito para NECESIDAD
function showNeedSuccessMessage(donation) {
  const app = document.getElementById('app');
  
  // Obtener dogId de los parámetros
  const params = new URLSearchParams(window.location.search);
  const dogId = params.get('dogId');
  
  app.innerHTML = `
    <div class="payment-success-container">
      <!-- Header naranja con logo -->
      <div class="payment-success-header">
        <img src="/images/logo.png" alt="PetLink" class="payment-success-logo">
      </div>
      
      <!-- Contenido -->
      <div class="payment-success-content payment-success-donation">
        <!-- Ilustración del perrito -->
        <div class="payment-success-illustration">
          <img src="/images/Tigre.png" alt="Tigre" class="payment-success-mascot-img">
        </div>
        
        <!-- Título -->
        <h1 class="payment-success-title">¡Gracias por tu <span class="highlight">donación!</span></h1>
        
        <!-- Subtítulo -->
        <p class="payment-success-subtitle">Tu apoyo hace la diferencia<br>en la vida de muchos perritos.</p>
      </div>
    </div>
  `;
  
  // Redirigir al perfil del perro después de 4 segundos
  setTimeout(() => {
    router.navigateTo(`/dog/${dogId}`);
  }, 4000);
}