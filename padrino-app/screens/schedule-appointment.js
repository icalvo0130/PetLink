// Esta es la pantalla de AGENDAR CITA

import { createAppointment, getDogById } from '../services/api.js';
import router from '../utils/router.js';
import { getCurrentUserId, getCurrentUser } from '../utils/auth.js';

let selectedDate = null;

// Convertir hora formato 24h a 12h AM/PM
function formatTimeTo12Hour(time24) {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'p.m.' : 'a.m.';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Renderizar (mostrar) la pantalla de agendar cita
export function renderScheduleAppointment(dogId) {
  const app = document.getElementById('app');
  
  // Verificar si hay usuario loggeado
  const userId = getCurrentUserId();
  if (!userId) {
    alert('Debes iniciar sesion para agendar una cita');
    router.navigateTo('/home');
    return;
  }
  
  // Mostrar loading mientras se carga el perro
  app.innerHTML = `
    <div class="schedule-container">
      <div class="schedule-header">
        <img src="/images/logo.png" alt="PetLink" class="schedule-logo-img">
      </div>
      <div class="schedule-content">
        <p class="loading" style="text-align: center; padding: 40px; color: #666;">Cargando...</p>
      </div>
    </div>
  `;
  
  // Cargar datos del perro
  loadScheduleScreen(dogId);
}

// Cargar la pantalla de agendar cita
async function loadScheduleScreen(dogId) {
  try {
    const dog = await getDogById(dogId);
    displayScheduleScreen(dog);
  } catch (error) {
    console.error('Error al cargar:', error);
    document.getElementById('app').innerHTML = `
      <div class="schedule-container">
        <div class="schedule-header">
          <img src="/images/logo.png" alt="PetLink" class="schedule-logo-img">
        </div>
        <div class="schedule-content">
          <button class="schedule-btn-back" onclick="window.history.back()">
            <span>‹</span>
          </button>
          <p class="error" style="text-align: center; padding: 40px; color: #ff0000;">Error al cargar</p>
        </div>
      </div>
    `;
  }
}

// Mostrar la pantalla de agendar cita
function displayScheduleScreen(dog) {
  const app = document.getElementById('app');
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  app.innerHTML = `
    <div class="schedule-container">
      <!-- Header naranja con logo -->
      <div class="schedule-header">
        <img src="/images/logo.png" alt="PetLink" class="schedule-logo-img">
      </div>
      
      <!-- Contenido principal -->
      <div class="schedule-content">
        <!-- Boton de volver -->
        <button class="schedule-btn-back" id="btn-back">
          <span>‹</span>
        </button>
        
        <!-- Navegación del calendario -->
        <div class="calendar-navigation">
          <button class="calendar-nav-btn" id="prev-year">«</button>
          <button class="calendar-nav-btn" id="prev-month">‹</button>
          <span class="calendar-month-display" id="current-month"></span>
          <button class="calendar-nav-btn" id="next-month">›</button>
          <button class="calendar-nav-btn" id="next-year">»</button>
        </div>
        
        <!-- Calendario -->
        <div class="calendar-card">
          <div class="calendar-grid" id="calendar-grid"></div>
        </div>
        
        <!-- Fecha seleccionada -->
        <div class="schedule-form-group">
          <label class="schedule-label">Selecciona una fecha</label>
          <input 
            type="text" 
            id="selected-date" 
            placeholder="DD/MM/AA"
            readonly
            class="schedule-date-input"
          >
        </div>
        
        <!-- Horarios -->
        <div class="schedule-time-row">
          <div class="schedule-time-group">
            <label class="schedule-label">Hora de Inicio</label>
            <input 
              type="time" 
              id="start-time"
              min="09:00"
              max="18:00"
              value="10:00"
              class="schedule-time-input schedule-time-start"
            >
          </div>
          
          <div class="schedule-time-group">
            <label class="schedule-label">Hora de fin</label>
            <input 
              type="time" 
              id="end-time"
              min="09:00"
              max="18:00"
              value="12:00"
              class="schedule-time-input schedule-time-end"
            >
          </div>
        </div>
        
        <!-- Boton de agendar -->
        <button class="schedule-btn-submit" id="btn-schedule">
          Agendar
        </button>
      </div>
    </div>
  `;
  
  // Inicializar calendario
  initCalendar(currentMonth, currentYear);
  
  // Agregar eventos
  setupScheduleEvents(dog);
}

// Inicializar calendario
function initCalendar(month, year) {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const currentMonthEl = document.getElementById('current-month');
  currentMonthEl.textContent = monthNames[month];
  currentMonthEl.dataset.month = month;
  currentMonthEl.dataset.year = year;
  
  renderCalendar(month, year);
}

// Renderizar el calendario
function renderCalendar(month, year) {
  const calendarGrid = document.getElementById('calendar-grid');
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  
  // Limpiar calendario
  calendarGrid.innerHTML = '';
  
  // Dias de la semana (empezando por Lunes)
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  dayNames.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day-name';
    dayEl.textContent = day;
    calendarGrid.appendChild(dayEl);
  });
  
  // Ajustar para que la semana empiece en Lunes (0 = Lunes, 6 = Domingo)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  
  // Dias del mes anterior (en gris claro)
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day calendar-day-other';
    dayEl.textContent = prevMonthDays - i;
    calendarGrid.appendChild(dayEl);
  }
  
  // Dias del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;
    
    const currentDate = new Date(year, month, day);
    
    // Deshabilitar dias pasados
    if (currentDate < today.setHours(0, 0, 0, 0)) {
      dayEl.classList.add('disabled');
    } else {
      dayEl.addEventListener('click', () => selectDate(day, month, year));
    }
    
    calendarGrid.appendChild(dayEl);
  }
  
  // Dias del siguiente mes (en gris claro)
  const totalCells = adjustedFirstDay + daysInMonth;
  const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day calendar-day-other';
    dayEl.textContent = day;
    calendarGrid.appendChild(dayEl);
  }
}

// Seleccionar una fecha
function selectDate(day, month, year) {
  // Quitar seleccion anterior
  document.querySelectorAll('.calendar-day').forEach(el => {
    el.classList.remove('selected');
  });
  
  // Marcar nueva seleccion
  event.target.classList.add('selected');
  
  // Guardar fecha seleccionada como objeto con valores directos (evita problemas de zona horaria)
  selectedDate = { day, month, year };
  
  // Mostrar fecha en el input
  const dateInput = document.getElementById('selected-date');
  const formattedDate = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  dateInput.value = formattedDate;
}

// Configurar eventos
function setupScheduleEvents(dog) {
  // Boton volver
  document.getElementById('btn-back').addEventListener('click', () => {
    router.navigateTo(`/dog/${dog.id}`);
  });
  
  // Navegacion del calendario - Mes anterior
  document.getElementById('prev-month').addEventListener('click', () => {
    const currentMonthEl = document.getElementById('current-month');
    let month = parseInt(currentMonthEl.dataset.month);
    let year = parseInt(currentMonthEl.dataset.year);
    
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
    
    initCalendar(month, year);
  });
  
  // Navegacion del calendario - Mes siguiente
  document.getElementById('next-month').addEventListener('click', () => {
    const currentMonthEl = document.getElementById('current-month');
    let month = parseInt(currentMonthEl.dataset.month);
    let year = parseInt(currentMonthEl.dataset.year);
    
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    
    initCalendar(month, year);
  });
  
  // Navegacion del calendario - Año anterior
  document.getElementById('prev-year').addEventListener('click', () => {
    const currentMonthEl = document.getElementById('current-month');
    let month = parseInt(currentMonthEl.dataset.month);
    let year = parseInt(currentMonthEl.dataset.year);
    
    year--;
    initCalendar(month, year);
  });
  
  // Navegacion del calendario - Año siguiente
  document.getElementById('next-year').addEventListener('click', () => {
    const currentMonthEl = document.getElementById('current-month');
    let month = parseInt(currentMonthEl.dataset.month);
    let year = parseInt(currentMonthEl.dataset.year);
    
    year++;
    initCalendar(month, year);
  });
  
  // Validar hora de fin cuando se cambia hora de inicio
  document.getElementById('start-time').addEventListener('change', (e) => {
    const endTimeInput = document.getElementById('end-time');
    const startTime = e.target.value;
    
    if (endTimeInput.value && endTimeInput.value <= startTime) {
      endTimeInput.value = '';
      alert('La hora de fin debe ser posterior a la hora de inicio');
    }
  });
  
  // Boton agendar
  document.getElementById('btn-schedule').addEventListener('click', () => {
    scheduleAppointment(dog);
  });
}

// Agendar la cita
async function scheduleAppointment(dog) {
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;
  const btnSchedule = document.getElementById('btn-schedule');
  
  // Validaciones
  if (!selectedDate) {
    alert('Por favor selecciona una fecha');
    return;
  }
  
  if (!startTime || !endTime) {
    alert('Por favor selecciona la hora de inicio y fin');
    return;
  }
  
  if (endTime <= startTime) {
    alert('La hora de fin debe ser posterior a la hora de inicio');
    return;
  }
  
  // Validar horario (9am - 6pm)
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);
  
  if (startHour < 9 || endHour > 18) {
    alert('El horario debe estar entre 9:00 AM y 6:00 PM');
    return;
  }
  
  // Deshabilitar boton
  btnSchedule.disabled = true;
  btnSchedule.textContent = 'Agendando...';
  
  try {
    const userId = getCurrentUserId();
    
    // Formatear fecha para la BD (YYYY-MM-DD) usando valores directos para evitar problemas de zona horaria
    const year = selectedDate.year;
    const month = String(selectedDate.month + 1).padStart(2, '0');
    const day = String(selectedDate.day).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Formatear hora para mostrar (HH:MM - HH:MM en formato 12h AM/PM)
    const formattedStartTime = formatTimeTo12Hour(startTime);
    const formattedEndTime = formatTimeTo12Hour(endTime);
    const timeString = `${formattedStartTime} - ${formattedEndTime}`;
    
    const appointmentData = {
      id_padrino: userId,
      id_dog: dog.id,
      date: formattedDate,
      time: timeString
    };
    
    console.log('Creando cita:', appointmentData);
    
    const appointment = await createAppointment(appointmentData);
    
    console.log('Cita creada exitosamente:', appointment);
    
    // Mostrar mensaje de exito
    showSuccessMessage(dog);
    
  } catch (error) {
    console.error('Error completo:', error);
    btnSchedule.disabled = false;
    btnSchedule.textContent = 'Agendar';
    alert('Error al agendar la cita. Por favor intenta de nuevo.');
  }
}

// Mostrar mensaje de exito
function showSuccessMessage(dog) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="schedule-success-container">
      <!-- Header naranja con logo -->
      <div class="schedule-success-header">
        <img src="/images/logo.png" alt="PetLink" class="schedule-success-logo">
      </div>
      
      <!-- Contenido -->
      <div class="schedule-success-content">
        <!-- Ilustración del perrito -->
        <div class="schedule-success-illustration">
          <img src="/images/Tigre.png" alt="Tigre" class="schedule-success-mascot">
        </div>
        
        <!-- Título -->
        <h1 class="schedule-success-title"><span class="highlight">¡Cita agendada</span> con éxito!</h1>
        
        <!-- Subtítulo -->
        <p class="schedule-success-subtitle">Pronto recibirás un mensaje<br>por WhatsApp con los<br>detalles de la cita.</p>
        
        <!-- Botón -->
        <button class="schedule-success-btn" id="btn-back-home">
          Todo listo!
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('btn-back-home').addEventListener('click', () => {
    router.navigateTo('/home');
  });
}