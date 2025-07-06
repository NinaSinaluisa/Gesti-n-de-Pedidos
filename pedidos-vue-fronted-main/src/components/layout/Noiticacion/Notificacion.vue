<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const notifications = ref([]);
const showNotifications = ref(false);
const isLoading = ref(false);
const error = ref(null);
const notificationMenu = ref(null); // Referencia al menú de notificaciones

const fetchNotifications = async () => {
  const token = localStorage.getItem('auth');
  
  if (!token) {
    error.value = 'No se encontró token de autenticación';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get('http://localhost:8000/api/notificaciones', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log('API Response:', response.data); // Verifica el formato de los datos

    notifications.value = response.data.notificaciones.map(notification => ({
      id: notification.id,
      data: notification.data,
      createdAt: notification.created_at
    }));

    console.log('Mapped Notifications:', notifications.value); // Verifica que se asignan correctamente

  } catch (err) {
    error.value = 'Error al cargar notificaciones';
    console.error('Error fetching notifications:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchNotifications);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Cerrar notificaciones si se hace clic fuera del menú
const handleClickOutside = (event) => {
  if (notificationMenu.value && !notificationMenu.value.contains(event.target)) {
    showNotifications.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const clearNotifications = async () => {
  const token = localStorage.getItem('auth');
  
  try {
    await axios.delete('http://localhost:8000/api/notificaciones', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    notifications.value = [];
  } catch (err) {
    console.error('Error clearing notifications:', err);
  }
};
</script>

<template>
  <div class="notifications-container">
    <!-- Ícono de notificaciones -->
    <div class="notification-icon" @click.stop="toggleNotifications">
      <span class="material-icons">notifications</span>
      <span v-if="notifications.length" class="badge">{{ notifications.length }}</span>
    </div>
    
    <!-- Menú de notificaciones -->
    <div v-show="showNotifications" ref="notificationMenu" class="notifications-dropdown">
      <div class="notifications-header">
        <span>Notificaciones</span>
        <button 
          class="btn-clear" 
          @click="clearNotifications" 
          :disabled="isLoading || notifications.length === 0"
        >
          Borrar todas
        </button>
      </div>
      
      <div v-if="isLoading" class="loading">
        Cargando notificaciones...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else-if="notifications.length" class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-item"
        >
          <div class="notification-content">
            <span class="order-id">Orden #{{ notification.data.orden_id }}</span>
            <p>{{ notification.data.mensaje }}</p>
          </div>
          <span class="date">
            {{ new Date(notification.createdAt).toLocaleString() }}
          </span>
        </div>
      </div>
      
      <p v-else class="no-notifications">
        No tienes notificaciones.
      </p>
    </div>
  </div>
</template>



<style scoped>
.notifications-container {
  position: relative;
  display: inline-block;
}

.notification-icon {
  cursor: pointer;
  position: relative;
}

.notification-icon .badge {
  background-color: red;
  color: white;
  font-size: 12px;
  border-radius: 50%;
  padding: 2px 6px;
  position: absolute;
  top: -5px;
  right: -5px;
}

.notifications-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  width: 300px;
  background: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  padding-bottom: 5px;
  border-bottom: 1px solid #ddd;
}

.btn-clear {
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 14px;
}

.notifications-list {
  max-height: 250px;
  overflow-y: auto;
}

.notification-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.notification-item:last-child {
  border-bottom: none;
}

.order-id {
  font-weight: bold;
}

.date {
  font-size: 12px;
  color: gray;
}

.no-notifications {
  text-align: center;
  padding: 10px;
  color: gray;
}
</style>
