<template>
    <nav class="topbar bg-white shadow-sm">
      <div class="container-fluid d-flex align-items-center justify-content-between px-4">
        <!-- Nombre del usuario (a la izquierda) -->
        <span class="navbar-brand mb-0 h1">Bienvenido, {{ formattedUserName }}</span>
  
        <!-- Botones de notificaciones y salir (a la derecha) -->
        <div class="d-flex align-items-center gap-3">
          <!-- Botón de notificaciones -->
          <button class="btn btn-link text-dark p-0 position-relative" @click="toggleNotifications">
            <span class="material-icons">notifications</span>
            <!-- Indicador de notificaciones no leídas -->
            <span v-if="unreadNotificationsCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ unreadNotificationsCount }}
            </span>
          </button>
  
          <!-- Botón de salir -->
          <button class="btn btn-link text-dark p-0" @click="logout">
            <span class="material-icons">logout</span>
            <span class="ms-2">Salir</span>
          </button>
        </div>
      </div>
  
      <!-- Contenedor de notificaciones -->
      <div v-if="showNotifications" class="notifications-container bg-white shadow-sm p-3">
        <div v-if="notifications.length > 0">
          <div v-for="notification in notifications" :key="notification.id" class="notification-item mb-2">
            <div class="d-flex justify-content-between align-items-center">
              <span>{{ notification.data.mensaje }}</span>
              <div>
                <button class="btn btn-sm btn-link text-success" @click="markAsRead(notification.id)">
                  <span class="material-icons">check</span>
                </button>
                <button class="btn btn-sm btn-link text-danger" @click="deleteNotification(notification.id)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="text-muted">No hay notificaciones nuevas.</p>
        </div>
      </div>
    </nav>
  </template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import User from '@/apis/User';
import { useUserStore } from '@/stores/authstore';
import { useRouter } from 'vue-router';
import { show_alerta } from '@/apis/Api';
import Notification from '@/apis/Notification'; // Importa el servicio de notificaciones
import axios from 'axios';

const userStore = useUserStore();
const router = useRouter();

// Estado para mostrar/ocultar notificaciones
const showNotifications = ref(false);

// Estado para almacenar las notificaciones
const notifications = ref([]);

// Obtener el nombre del usuario formateado
const formattedUserName = computed(() => {
  const name = userStore.user.nombre || '';
  const lastName = userStore.user.apellido || '';
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
});

// Contador de notificaciones no leídas
const unreadNotificationsCount = computed(() => {
  return notifications.value.filter(notification => !notification.read_at).length;
});

// Cargar notificaciones al montar el componente
onMounted(async () => {
  await loadNotifications();
});

// Función para cargar notificaciones
const token = localStorage.getItem('auth');
const loadNotifications = async () => {
  try {
    const token = localStorage.getItem('auth');
    const response = await axios.get('http://localhost:8000/api/admin/notificaciones', {
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });

    // Si hay respuesta, actualiza las notificaciones (aunque estén vacías)
    notifications.value = response.data?.notificaciones || [];
    
  } catch (error) {
    // Solo muestra error si NO es un 500 (Internal Server Error)
    if (error.response?.status !== 500) {
      show_alerta('Error al cargar notificaciones', 'error', '');
    }
    notifications.value = []; // Asegura un array vacío
  }
};

// Función para mostrar/ocultar notificaciones
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Función para marcar una notificación como leída
const markAsRead = async (notifiable_id) => {
  try {
    await Notification.markAsRead(notifiable_id); // Llama al endpoint para marcar como leída
    await loadNotifications(); // Recarga las notificaciones
    show_alerta('Notificación marcada como leída', 'success', '');
  } catch (error) {
    show_alerta('Error al marcar como leída', 'error', '');
    console.error('Error:', error);
  }
};

// Función para eliminar una notificación
const deleteNotification = async (id) => {
  try {
    await Notification.deleteNotification(id); // Llama al endpoint para eliminar
    await loadNotifications(); // Recarga las notificaciones
    show_alerta('Notificación eliminada', 'success', '');
  } catch (error) {
    show_alerta('Error al eliminar notificación', 'error', '');
    console.error('Error:', error);
  }
};

// Función para manejar el cierre de sesión
const logout = async () => {
  try {
    const response = await User.logout();
    if (response.data) {
      localStorage.removeItem('auth');
      userStore.authenticated = false;
      userStore.token = null;
      userStore.user = null;
      router.push({ name: 'home' });
      show_alerta('Cierre de sesión con éxito', 'success', '');
    }
  } catch (error) {
    show_alerta('Error al cerrar sesión', 'error', '');
    console.error('Error:', error);
  }
};
</script>
  
  <style scoped>
  .topbar {
    height: 60px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .navbar-brand {
    font-size: 1.25rem; /* Tamaño del texto del nombre */
    font-weight: 500; /* Grosor de la fuente */
  }
  
  .btn-link {
    text-decoration: none; /* Quitar subrayado de los botones */
    display: flex;
    align-items: center;
  }
  
  .btn-link:hover {
    opacity: 0.8; /* Efecto hover suave */
  }
  
  .material-icons {
    font-size: 24px; /* Tamaño de los íconos */
  }
  .notifications-container {
  position: absolute;
  top: 10%;
  right: 0;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 1000;
}

.notification-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.notification-item:last-child {
  border-bottom: none;
}

.badge {
  font-size: 0.75rem;
}
  </style>