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
  // Si no hay usuario, crear uno simulado para pruebas
  if (!userId) {
    console.warn('No hay usuario loggeado, creando usuario simulado...');
    const mockUser = createMockUser();
    userId = mockUser.id;
  }
  
  // Mostrar loading mientras se carga el perro
  app.innerHTML = `
    <div class="schedule-container">
      <p class="loading">Cargando...</p>
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
        <p class="error">Error al cargar</p>
        <button onclick="window.history.back()" class="btn-back">Volver</button>
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
      <!-- Boton de volver -->
      <button class="btn-back" id="btn-back">← Volver</button>
      
      <h1 class="schedule-title">Agendar cita con ${dog.name}</h1>
      
      <!-- Calendario -->
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="calendar-nav" id="prev-month">‹</button>
          <span class="calendar-month" id="current-month"></span>
          <button class="calendar-nav" id="next-month">›</button>
        </div>
        <div class="calendar-grid" id="calendar-grid"></div>
      </div>
      
      <!-- Fecha seleccionada -->
      <div class="form-group">
        <label>Fecha seleccionada</label>
        <input 
          type="text" 
          id="selected-date" 
          placeholder="DD/MM/AA"
          readonly
          class="date-input"
        >
      </div>
      
      <!-- Horarios -->
      <div class="time-container">
        <div class="form-group">
          <label for="start-time">Hora de inicio</label>
          <input 
            type="time" 
            id="start-time"
            min="09:00"
            max="18:00"
            class="time-input"
          >
        </div>
        
        <div class="form-group">
          <label for="end-time">Hora de fin</label>
          <input 
            type="time" 
            id="end-time"
            min="09:00"
            max="18:00"
            class="time-input"
          >
        </div>
      </div>
      
      <!-- Boton de agendar -->
      <button class="btn-schedule-appointment" id="btn-schedule">
        Agendar
      </button>
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
  currentMonthEl.textContent = `${monthNames[month]} ${year}`;
  currentMonthEl.dataset.month = month;
  currentMonthEl.dataset.year = year;
  
  renderCalendar(month, year);
}

// Renderizar el calendario
function renderCalendar(month, year) {
  const calendarGrid = document.getElementById('calendar-grid');
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  // Limpiar calendario
  calendarGrid.innerHTML = '';
  
  // Dias de la semana
  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  dayNames.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day-name';
    dayEl.textContent = day;
    calendarGrid.appendChild(dayEl);
  });
  
  // Espacios vacios antes del primer dia
  for (let i = 0; i < firstDay; i++) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyEl);
  }
  
  // Dias del mes
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
  
  // Navegacion del calendario
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
    <div class="schedule-success">
      <div class="success-icon">✓</div>
      <h1>Cita Agendada</h1>
      <p>Tu solicitud de cita con ${dog.name} ha sido enviada</p>
      <p class="success-note">Te notificaremos cuando la fundacion confirme tu cita</p>
      <button class="btn-back-home" id="btn-back-home">Volver al inicio</button>
    </div>
  `;
  
  document.getElementById('btn-back-home').addEventListener('click', () => {
    router.navigateTo('/home');
  });
}