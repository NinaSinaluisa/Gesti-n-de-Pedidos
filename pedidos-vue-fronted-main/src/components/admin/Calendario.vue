<script setup>
import { ref, computed, onMounted } from 'vue'

const pickupOrders = ref([]) // Inicialmente vacío para cargar dinámicamente desde el endpoint
const currentDate = ref(new Date())
const selectedDate = ref(new Date().toISOString().split('T')[0])

// Función para obtener datos desde el backend
const fetchOrders = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/public/fechas') // Endpoint del backend
    if (response.ok) {
      const data = await response.json()
      // Supongamos que la API devuelve las órdenes directamente como un array
      pickupOrders.value = data.ordenes
    } else {
      console.error('Error al obtener las órdenes:', response.statusText)
    }
  } catch (error) {
    console.error('Error de conexión:', error)
  }
}

// Obtener los días del mes actual
const getDaysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDay = new Date(year, month, i)
    days.push({
      date: currentDay.toISOString().split('T')[0],
      dayOfMonth: i,
      dayOfWeek: currentDay.getDay(),
      isFirstOfMonth: i === 1
    })
  }
  
  return days
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  return date.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const getOrdersForDate = (date) => {
  return pickupOrders.value.filter(order => order.fecha_entrega === date)
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

// Determinar el día de la semana para el primer día del mes
const firstDayOfWeek = computed(() => {
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  return firstDay.getDay() === 0 ? 7 : firstDay.getDay()
})

// Cargar datos al montar el componente
onMounted(fetchOrders)
</script>

<template>
  <div class="calendar-dashboard">
    <!-- Columna del Calendario -->
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="previousMonth" class="month-button">&lt;</button>
        <h2>{{ currentDate.toLocaleDateString('es', { month: 'long', year: 'numeric' }) }}</h2>
        <button @click="nextMonth" class="month-button">&gt;</button>
      </div>

      <div class="calendar">
        <!-- Días de la semana -->
        <div class="weekday" v-for="day in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="day">
          {{ day }}
        </div>

        <!-- Espaciado inicial para alinear con el día correcto -->
        <div v-for="n in (firstDayOfWeek - 1)" :key="'empty-' + n" class="calendar-spacer"></div>

        <!-- Días del mes -->
        <div
          v-for="day in getDaysInMonth"
          :key="day.date"
          :class="[ 'calendar-day', { 'has-orders': getOrdersForDate(day.date).length > 0 }, { 'selected': selectedDate === day.date }]"
          @click="selectedDate = day.date"
        >
          <span class="day-number">{{ day.dayOfMonth }}</span>
          <div v-if="getOrdersForDate(day.date).length" class="order-count">
            {{ getOrdersForDate(day.date).length }}
          </div>
        </div>
      </div>
    </div>

    <!-- Columna de Pedidos -->
    <div class="orders-container">
      <h3>Pedidos para {{ formatDate(selectedDate) }}</h3>

      <div class="orders-list">
        <div v-if="!getOrdersForDate(selectedDate).length" class="no-orders">
          No hay pedidos para retirar en esta fecha
        </div>

        <div v-else v-for="order in getOrdersForDate(selectedDate)" 
             :key="order.id" 
             class="order-card">
          <div class="order-header">
            <span class="order-id">{{ order.orderId }}</span>
            <span :class="['status-tag', order.status]">{{ order.status }}</span>
          </div>
          <div class="customer-name">Usuario: {{ order.usuario }}</div>
          <div class="delivery-date">Fecha de Entrega: {{ formatDate(order.fecha_entrega) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.calendar-container, .orders-container {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.month-button {
  padding: 0.25rem 0.5rem;
  border: none;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
}

.month-button:hover {
  background: #e0e0e0;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

.weekday {
  background: #f8f9fa;
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
}

.calendar-spacer {
  background: #f8f9fa;
  padding: 0.5rem;
}

.calendar-day {
  background: white;
  padding: 0.5rem;
  min-height: 60px;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.selected {
  background: #e2f0ff;
  border: 2px solid #0066cc;
}

.day-number {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.has-orders {
  background: #e2f0ff;
}

.order-count {
  font-size: 0.75rem;
  color: #0066cc;
  background: white;
  padding: 0.1rem 0.3rem;
  border-radius: 999px;
  min-width: 1.5rem;
  text-align: center;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.no-orders {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.order-card {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #0066cc;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.order-id {
  font-weight: bold;
  color: #2c3e50;
}

.customer-name {
  color: #666;
}

.status-tag {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.status-tag.pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-tag.confirmado {
  background: #d4edda;
  color: #155724;
}

@media (max-width: 768px) {
  .calendar-dashboard {
    grid-template-columns: 1fr;
  }
}
</style>