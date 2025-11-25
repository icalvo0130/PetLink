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
  
  app.innerHTML = `
    <div class="payment-container">
      <!-- Botón de volver -->
      <button class="btn-back" id="btn-back">← Volver</button>
      
      <h1 class="payment-title">${title}</h1>
      
      <!-- Resumen -->
      <div class="payment-summary">
        <h3>${summaryTitle}</h3>
        <div class="summary-item">
          <span>${summaryLabel}</span>
          <span class="summary-price">$${price}</span>
        </div>
      </div>
      
      <!-- Formulario de pago (simulado) -->
      <form class="payment-form" id="payment-form">
        <h3>Información de pago</h3>
        
        <div class="form-group">
          <label for="card-number">Número de tarjeta</label>
          <input 
            type="text" 
            id="card-number" 
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="card-expiry">Fecha de expiración</label>
            <input 
              type="text" 
              id="card-expiry" 
              placeholder="MM/YY"
              maxlength="5"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="card-cvv">CVV</label>
            <input 
              type="text" 
              id="card-cvv" 
              placeholder="123"
              maxlength="3"
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="card-name">Nombre en la tarjeta</label>
          <input 
            type="text" 
            id="card-name" 
            placeholder="Juan Pérez"
            required
          >
        </div>
        
        <button type="submit" class="btn-pay" id="btn-pay">
          ${buttonText}
        </button>
      </form>
      
      <p class="payment-note">
        Esta es una simulación de pago. No se procesará ninguna transacción real.
      </p>
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
  
  // Formatear número de tarjeta mientras se escribe
  const cardNumberInput = document.getElementById('card-number');
  cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
  });
  
  // Formatear fecha de expiración
  const cardExpiryInput = document.getElementById('card-expiry');
  cardExpiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });
  
  // Solo permitir números en CVV
  const cardCvvInput = document.getElementById('card-cvv');
  cardCvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
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
    
    const imageResult = await generateAIImage(dogData, accessoryData);
    
    if (!imageResult.success) {
      throw new Error('No se pudo generar la imagen: ' + imageResult.error);
    }
    
    console.log('Imagen generada:', imageResult.imageUrl);
    
    // Paso 2: Insertar DIRECTAMENTE con Supabase (sin usar API)
    btnPay.textContent = 'Guardando compra...';
    
    const imageUrl = imageResult.storageUrl || imageResult.imageUrl;
    
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
    <div class="payment-success">
      <div class="success-icon">✓</div>
      <h1>Compra Exitosa</h1>
      <p>Tu accesorio ha sido comprado</p>
      
      <!-- Mostrar la imagen generada -->
      <div class="success-image-preview">
        <img src="${imageUrl}" alt="Foto generada" class="generated-image">
      </div>
      
      <div class="success-details">
        <p>Accesorio: ${purchase.category}</p>
        <p>Monto: $${purchase.price}</p>
      </div>
      
      <p class="redirect-message">Generamos una foto especial para ti</p>
      <p class="redirect-message">Redirigiendo a la galería...</p>
    </div>
  `;
}

// Mostrar mensaje de éxito para NECESIDAD
function showNeedSuccessMessage(donation) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="payment-success">
      <div class="success-icon">✓</div>
      <h1>Donación Exitosa</h1>
      <p>Gracias por tu generosidad</p>
      <div class="success-details">
        <p>Transacción: ${donation.transaction_id}</p>
        <p>Monto: $${donation.price}</p>
      </div>
      <p class="redirect-message">Redirigiendo al perfil...</p>
    </div>
  `;
}