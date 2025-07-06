
<script setup>
import User from '../apis/User';
import { useRouter } from 'vue-router';
import { show_alerta } from '../apis/Api';
import { useUserStore } from '@/stores/authstore';
import { useCartStore } from '@/stores/cartStore';

const userStore = useUserStore(); // Accede al store de usuario
const cartStore = useCartStore();
const router = useRouter();

const logout = async () => {
  try {
   
    const [response] = await Promise.all([
      User.logout(),
      cartStore.clearCart() // Limpiar carrito inmediatamente
    ]);
    if (response?.data) {
      userStore.resetState();
      router.push({ name: 'home' }).then(() => {
        show_alerta('Cierre de sesión exitoso', 'success');
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
    show_alerta('Error al cerrar sesión', 'error');
    userStore.resetState();
    cartStore.clearCart();
  }
};
import NotificationComponent from '@/components/layout/Noiticacion/Notificacion.vue';
import { ref, onMounted } from 'vue';
import Empresa from '@/apis/Empresa.js';
import { IMAGE_BASE_URL } from '@/apis/Api.js';

const empresa = ref(null);

const fetchEmpresaData = async () => {
  try {
    const response = await Empresa.fetchEmpresaPublica();
    if (response?.data?.length > 0) {
      empresa.value = response.data[0];
    } else if (response?.length > 0) {
      empresa.value = response[0];
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
    empresa.value = {
      nombre: 'New Blessings',
      logo: null
    };
  }
};

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_BASE_URL}/${path.replace(/^\//, '')}`;
};

onMounted(fetchEmpresaData);

</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
    <div class="container-fluid px-4">
      <!-- Logo y enlaces principales -->
      <div class="d-flex align-items-center">
        <router-link to="/" class="navbar-brand d-flex align-items-center me-4" v-if="empresa">
        <!-- Logo dinámico -->
        <img 
          :src="getFullImageUrl(empresa.logo)" 
          height="50" 
          alt="Logo" 
          class="logo-image" 
          v-if="empresa.logo"
        />
        <!-- Logo por defecto si no hay logo en la API -->
        <img 
          src="/logo.jpeg" 
          height="50" 
          alt="Logo" 
          class="logo-image" 
          v-else
        />
        <!-- Nombre de la empresa dinámico -->
        <span class="brand-name ms-3">{{ empresa.nombre || 'New Blessings' }}</span>
      </router-link>
        <!-- Enlaces principales -->
        <div class="main-links d-none d-lg-flex">
          <router-link :to="{ name: 'Pedidos' }" v-if="userStore.authenticated" class="nav-link">Mis Pedidos</router-link>
          <router-link :to="{ name: 'Nosotros' }" class="nav-link">Nosotros</router-link>
          <router-link :to="{ name: 'Contactos' }" class="nav-link">Contáctanos</router-link>
        </div>
      </div>

      <!-- Botón hamburguesa para móvil -->
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Contenido del navbar -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <!-- Enlaces para móvil -->
        <div class="d-lg-none mobile-links">
          <router-link :to="{ name: 'Pedidos' }" v-if="userStore.authenticated" class="nav-link">Mis Pedidos</router-link>
          <router-link :to="{ name: 'Nosotros' }" class="nav-link">Nosotros</router-link>
          <router-link :to="{ name: 'Contactos' }" class="nav-link">Contáctanos</router-link>
        </div>
    

        <!-- Sección derecha: Carrito y Usuario -->
          <div class="ms-lg-auto d-flex align-items-center user-section " >
            
            <NotificationComponent v-if="userStore.authenticated" />
  
          <!-- Carrito -->
          <div v-if="userStore.authenticated" class="cart-section me-3">
            <router-link :to="{ name: 'Carrito' }" class="cart-link">
              <span class="material-icons cart-icon">shopping_cart</span>
              <span v-if="cartStore.cartItemsCount > 0" class="cart-badge">
                {{ cartStore.cartItemsCount }}
              </span>
            </router-link>
          </div>
          
          <!-- Separador vertical -->
          <div v-if="userStore.authenticated" class="vertical-divider "></div>
         
          <!-- Sección de autenticación -->
          <div v-if="!userStore.authenticated" class="auth-section">
            <router-link :to="{ name: 'Login' }" class="login-button">
              <span class="material-icons">login</span>
              <span>Iniciar sesión</span>
            </router-link>
          </div>

          <!-- Dropdown de usuario autenticado -->
          <div class="dropdown " v-if="userStore.authenticated">
            <button class="user-dropdown-btn" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false">
                    <span class="material-icons">face_6</span>
              <span class="username">{{ userStore.user.nombre }}</span>
              <span class="material-icons">expand_more</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end custom-dropdown" aria-labelledby="userDropdown">
              <li>
                <router-link class="dropdown-item" :to="{ name: 'Perfil' }">
                  <span class="material-icons">person</span>
                  <span>Mi Perfil</span>
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" :to="{ name: 'Pedidos' }">
                  <span class="material-icons">shopping_bag</span>
                  <span>Mis Pedidos</span>
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a href="#" @click.prevent="logout" class="dropdown-item text-danger">
                  <span class="material-icons">logout</span>
                  <span>Cerrar Sesión</span>
                </a>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.container-fluid {
  max-width: 1400px;
}

.brand-name {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  text-decoration: none;
}

.main-links {
  display: flex;
  gap: 2rem;
  margin-left: 2rem;
}

.nav-link {
  color: #2c3e50;
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #3498db;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.cart-section {
  position: relative;
}

.cart-link {
  text-decoration: none;
  color: #2c3e50;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.cart-link:hover {
  background-color: #f8f9fa;
}

.cart-icon {
  font-size: 1.5rem;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 0.25rem;
  font-size: 0.75rem;
  min-width: 1.25rem;
  height: 1.08rem;
  display: flex;
  align-items: center;
  justify-content: center;
}


.vertical-divider {
  width: 1px;
  height: 24px;
  background-color: #e0e0e0;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.login-button:hover {
  background-color: #f8f9fa;
}

.user-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  color: #2c3e50;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.user-dropdown-btn:hover {
  background-color: #f8f9fa;
}

.username {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-dropdown {
  margin-top: 0.5rem;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #2c3e50;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item .material-icons {
  font-size: 1.25rem;
}

/* Estilos móviles */
@media (max-width: 991.98px) {
  .mobile-links {
    padding: 1rem 0;
  }

  .mobile-links .nav-link {
    padding: 0.5rem 0;
    margin: 0.25rem 0;
  }

  .user-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
  }
}
</style>