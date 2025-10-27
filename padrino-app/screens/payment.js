// Esta es la pantalla de PAGO SIMULADO (version corregida con debugging)

import { createDonation, generateAIImage, getDogById } from '../services/api.js';
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
  
  // Obtener parametros de la URL
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type'); // 'accessory' o 'need'
  const price = params.get('price');
  const dogId = params.get('dogId');
  
  // Verificar tipo de pago
  const isAccessory = type === 'accessory';
  
  // Validar parametros segun el tipo
  if (!price || !dogId) {
    console.error('Faltan parametros en la URL');
    router.navigateTo('/');
    return;
  }
  
  // Titulo segun tipo
  const title = isAccessory ? 'Comprar Accesorio' : 'Realizar Donacion';
  const summaryTitle = isAccessory ? 'Resumen de tu compra' : 'Resumen de tu donacion';
  const summaryLabel = isAccessory ? 'Monto a pagar:' : 'Monto a donar:';
  const buttonText = isAccessory ? `Confirmar Compra de $${price}` : `Confirmar Donacion de $${price}`;
  
  app.innerHTML = `
    <div class="payment-container">
      <button class="btn-back" id="btn-back">← Volver</button>
      
      <h1 class="payment-title">${title}</h1>
      
      <div class="payment-summary">
        <h3>${summaryTitle}</h3>
        <div class="summary-item">
          <span>${summaryLabel}</span>
          <span class="summary-price">$${price}</span>
        </div>
      </div>
      
      <form class="payment-form" id="payment-form">
        <h3>Informacion de pago</h3>
        
        <div class="form-group">
          <label for="card-number">Numero de tarjeta</label>
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
            <label for="card-expiry">Fecha de expiracion</label>
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
            placeholder="Juan Perez"
            required
          >
        </div>
        
        <button type="submit" class="btn-pay" id="btn-pay">
          ${buttonText}
        </button>
      </form>
      
      <p class="payment-note">
        Esta es una simulacion de pago. No se procesara ninguna transaccion real.
      </p>
    </div>
  `;
  
  // Agregar eventos
  setupPaymentEvents(params, userId, isAccessory);
}

// Configurar eventos de la pantalla de pago
function setupPaymentEvents(params, userId, isAccessory) {
  // Boton volver
  document.getElementById('btn-back').addEventListener('click', () => {
    window.history.back();
  });
  
  // Formatear numero de tarjeta mientras se escribe
  const cardNumberInput = document.getElementById('card-number');
  cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
  });
  
  // Formatear fecha de expiracion
  const cardExpiryInput = document.getElementById('card-expiry');
  cardExpiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });
  
  // Solo permitir numeros en CVV
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

// Procesar pago de ACCESORIO (VERSION MEJORADA CON DEBUGGING)
async function processAccessoryPayment(params, userId) {
  const btnPay = document.getElementById('btn-pay');
  
  btnPay.disabled = true;
  btnPay.textContent = 'Procesando compra...';
  
  try {
    const dogId = params.get('dogId');
    const price = params.get('price');
    const accessoryCategory = params.get('accessoryCategory');
    const accessoryName = params.get('accessoryName');
    
    console.log('===== INICIO COMPRA ACCESORIO =====');
    console.log('Parametros URL:', { dogId, price, accessoryCategory, accessoryName });
    
    // Paso 1: Obtener datos del perro
    btnPay.textContent = 'Obteniendo info del perro...';
    
    let dogData;
    try {
      const dog = await getDogById(dogId);
      console.log('Perro obtenido de BD:', dog);
      
      dogData = {
        id: parseInt(dogId),
        name: dog.name || 'perro',
        breed: dog.breed || 'perro mestizo',
        size: dog.size || 'mediano',
        age: dog.age ? dog.age.toString() : 'adulto',
        color: dog.color || 'cafe'
      };
      
      console.log('dogData preparado:', dogData);
      
    } catch (error) {
      console.warn('Error al obtener perro, usando valores por defecto:', error);
      dogData = {
        id: parseInt(dogId),
        name: 'perro',
        breed: 'perro mestizo',
        size: 'mediano',
        age: 'adulto',
        color: 'cafe'
      };
    }
    
    // Paso 2: Preparar datos del accesorio
    const accessoryData = {
      category: accessoryCategory || 'accesorio',
      name: accessoryName || 'accesorio para perro',
      description: accessoryName || 'accesorio'
    };
    
    console.log('accessoryData preparado:', accessoryData);
    
    // Validacion critica antes de llamar a la IA
    if (!dogData || !dogData.id) {
      throw new Error('VALIDACION: dogData esta vacio o sin ID');
    }
    if (!accessoryData || !accessoryData.category) {
      throw new Error('VALIDACION: accessoryData esta vacio o sin categoria');
    }
    
    console.log('Validacion OK. Llamando a generateAIImage...');
    
    // Paso 3: Generar imagen con IA
    btnPay.textContent = 'Generando imagen IA...';
    
    const imageResult = await generateAIImage(dogData, accessoryData);
    
    console.log('Respuesta de generateAIImage:', imageResult);
    
    if (!imageResult || !imageResult.success) {
      throw new Error('No se pudo generar la imagen: ' + (imageResult?.error || 'Error desconocido'));
    }
    
    console.log('Imagen generada OK. URL:', imageResult.imageUrl);
    
    // Paso 4: Guardar en base de datos
    btnPay.textContent = 'Guardando compra...';
    
    const imageUrl = imageResult.storageUrl || imageResult.imageUrl;
    
    const purchaseData = {
      id_dog: parseInt(dogId),
      id_user: userId,
      category: accessoryCategory,
      name: accessoryName,
      price: parseFloat(price),
      imagen_ia: imageUrl
    };
    
    console.log('Insertando en Supabase:', purchaseData);
    
    const { data, error } = await supabase
      .from('Accessories')
      .insert([purchaseData])
      .select();
    
    if (error) {
      console.error('Error de Supabase:', error);
      throw new Error(error.message);
    }
    
    console.log('Compra registrada OK:', data);
    
    // Paso 5: Actualizar estadisticas
    try {
      const response = await fetch(`http://localhost:5050/api/dogs/${dogId}/update-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'accesorio' })
      });
      
      if (response.ok) {
        console.log('Estadisticas actualizadas OK');
      }
    } catch (statsError) {
      console.error('Error al actualizar estadisticas:', statsError);
    }
    
    console.log('===== FIN COMPRA ACCESORIO (EXITO) =====');
    
    // Paso 6: Mostrar exito
    showAccessorySuccessMessage(data[0], imageUrl, dogId);
    
    // Paso 7: Redirigir a galeria
    setTimeout(() => {
      router.navigateTo(`/gallery/${dogId}`);
    }, 4000);
    
  } catch (error) {
    console.error('===== ERROR EN COMPRA ACCESORIO =====');
    console.error('Error completo:', error);
    console.error('Stack:', error.stack);
    
    btnPay.disabled = false;
    btnPay.textContent = 'Reintentar';
    
    alert('Error al procesar la compra: ' + error.message);
  }
}

// Procesar pago de NECESIDAD (donacion)
async function processNeedPayment(params, userId) {
  const btnPay = document.getElementById('btn-pay');
  
  btnPay.disabled = true;
  btnPay.textContent = 'Procesando...';
  
  try {
    const needId = params.get('needId');
    const price = params.get('price');
    const dogId = params.get('dogId');
    
    const transactionId = 'TXN-' + Date.now();
    
    const donationData = {
      id_padrino: userId,
      id_dog: parseInt(dogId),
      id_need: parseInt(needId),
      price: parseFloat(price),
      transaction_id: transactionId,
      state: 'completed'
    };
    
    console.log('Enviando donacion:', donationData);
    
    const donation = await createDonation(donationData);
    
    console.log('Donacion creada exitosamente:', donation);
    
    showNeedSuccessMessage(donation);
    
    setTimeout(() => {
      router.navigateTo(`/dog/${dogId}`);
    }, 3000);
    
  } catch (error) {
    console.error('Error al procesar donacion:', error);
    
    btnPay.disabled = false;
    btnPay.textContent = 'Reintentar';
    
    alert('Error al procesar la donacion. Por favor intenta de nuevo.');
  }
}

// Mostrar mensaje de exito para ACCESORIO
function showAccessorySuccessMessage(purchase, imageUrl, dogId) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="payment-success">
      <div class="success-icon">✓</div>
      <h1>Compra Exitosa</h1>
      <p>Tu accesorio ha sido comprado</p>
      
      <div class="success-image-preview">
        <img src="${imageUrl}" alt="Foto generada" class="generated-image">
      </div>
      
      <div class="success-details">
        <p>Accesorio: ${purchase.category}</p>
        <p>Monto: $${purchase.price}</p>
      </div>
      
      <p class="redirect-message">Generamos una foto especial para ti</p>
      <p class="redirect-message">Redirigiendo a la galeria...</p>
    </div>
  `;
}

// Mostrar mensaje de exito para NECESIDAD
function showNeedSuccessMessage(donation) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="payment-success">
      <div class="success-icon">✓</div>
      <h1>Donacion Exitosa</h1>
      <p>Gracias por tu generosidad</p>
      <div class="success-details">
        <p>Transaccion: ${donation.transaction_id}</p>
        <p>Monto: $${donation.price}</p>
      </div>
      <p class="redirect-message">Redirigiendo al perfil...</p>
    </div>
  `;
}