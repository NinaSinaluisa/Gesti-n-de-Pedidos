<script setup>
import User from '../apis/User';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {show_alerta} from '../apis/Api';
import { useUserStore } from '@/stores/authstore'; //
import { useRoute } from 'vue-router';  // Agregar esta importación al inicio

const route = useRoute(); 
const router = useRouter();
const form = reactive({
  
  email: '',
  password: '',
  
});
const userStore = useUserStore();
const isPasswordVisible = ref(false);

// Alternar visibilidad de contraseña
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const errors = reactive({});

// Función para validar el formulario
const validateForm = () => {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => delete errors[key]);
  
  

  // Validar campos vacíos
  if (!form.email.trim()) {
    errors.email = ['El email es requerido'];
    return false;
  }

  if (!form.password.trim()) {
    errors.password = ['La contraseña es requerida'];
    return false;
  }

  // Validar longitud mínima de contraseña
  if (form.password.length < 8) {
    errors.password = ['La contraseña debe tener al menos 8 caracteres'];
    return false;
  }

  return true;
};


const login = async () => {
  if (!validateForm()) return;

  try {
    const { data } = await User.login(form);
    if (!data?.token) {
      throw new Error('No se recibió token');
    }
    await handleSuccessfulLogin(data);
  } catch (error) {
    handleLoginError(error);
  }
};


const handleSuccessfulLogin = async (data) => {
  userStore.setSession(data.token, data.user);
  const redirectTo = determineRedirectPath(data.user);
  await router.replace(redirectTo);
  setTimeout(() => userStore.syncAuthentication(), 0);
};

const determineRedirectPath = (user) => {
  if (user?.esadmin) {
    return { name: 'Dashboard' };
  }
  if (route.query.returnTo === 'PedidoOrden') {
    return { 
      name: 'PedidoOrden',
      query: { ...route.query } // Copia segura
    };
  }
  return { name: 'home' };
};

const handleLoginError = (error) => {
  console.error('Login error:', error);
  
  const message = error.response?.status === 401 
    ? 'Usuario o contraseña incorrecta' 
    : 'Error en el servidor. Intente más tarde';
  show_alerta(message, 'error');
};


const isLoading = ref(false);

</script>

<template>
  <!-- <div class="container mt-5">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login" class="needs-validation">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" v-model="form.email" id="email" class="form-control" :class="{ 'is-invalid': errors.email }" />
        <div class="invalid-feedback" v-if="errors.email">
            {{ errors.email[0] }}
        </div>
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input type="password" v-model="form.password" id="password" class="form-control" :class="{ 'is-invalid': errors.password }" />
        <div class="invalid-feedback" v-if="errors.password">
            {{ errors.password[0] }}
        </div>
    </div>
      <button class="btn btn-primary w-100" type="submit">Entrar</button>
    </form>
    <div class="mt-3 text-center">
      <router-link to="/Registro">¿No tienes cuenta? Regístrate</router-link>
    </div>
  </div> -->

  
  <div class="container">
    <div class="login-container">
      <h1 class="welcome-text">Bienvenido</h1>
      <p class="signup-text">
        No tienes una cuenta ? <router-link to="/Registro"> Regístrate</router-link>
      </p>
            <form @submit.prevent="login" class="needs-validation">
                <!-- Input de email -->
                <div class="mb-4">
                    <input type="email" placeholder="Ingrese su correo electrónico" v-model="form.email" id="email" class="form-control" :class="{ 'is-invalid': errors.email }" />
                    <div class="invalid-feedback" v-if="errors.email">
                      {{ errors.email[0] }}
                    </div>
                </div>

                <!-- Campo de contraseña -->
                <div class="mb-3 position-relative">
                    <input :type="isPasswordVisible ? 'text' : 'password'" id="password" class="form-control" v-model="form.password" :class="{ 'is-invalid': errors.password }" placeholder="Ingresa tu contraseña" />
                    <span type="button" @click="togglePasswordVisibility" class="password-toggle material-icons position-absolute top-50 end-0 translate-middle-y" style="cursor: pointer;">
                        {{ isPasswordVisible ? 'visibility' : 'visibility_off' }}
                    </span>
                    <div class="invalid-feedback" v-if="errors.password">
                     {{ errors.password[0] }}
                    </div>
                </div>

                <!-- Enlace de recuperar contraseña -->
                <div class="text-end mb-4">
                  <router-link to="/OlvideContrasena" class="forgot-password">Olvide mi contraseña?</router-link>
                </div>

                <!-- Botón de iniciar sesión -->
                 <button type="submit" class="btn btn-primary w-100 signin-btn" :disabled="isLoading">
                  <span v-if="isLoading">Iniciando sesión...</span>
                  <span v-else>Iniciar sesión</span>
                </button>
            </form>
        </div>
    </div> 



</template>

<style scoped>
.container {
    min-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('/fondo.png') no-repeat left center;
}

.login-container {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background-color: rgb(255, 255, 255);
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.welcome-text {
    color: #dc8e35;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 0.5rem;
}

.signup-text {
    color: #6c757d;
    text-align: center;
    margin-bottom: 2rem;
}

.signup-text a {
    color: #2869a5;
    text-decoration: none;
    font-weight: 500;
}

.form-control {
    padding: 0.8rem 1rem;
    border: 1px solid #ced4da;
    border-radius: 8px;
    background-color: #f8f5f6;
}

.form-control:focus {
    box-shadow: none;
    border-color: #dc8e35;
    background-color: #ffffff;
}


.password-field {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #6c757d;
}

.forgot-password {
    color:  #2869a5;
    text-decoration: none;
    font-size: 0.9rem;
}

.signin-btn {
    background-color: #dc8e35;
    border: none;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 500;
    margin-top: 1.5rem;
    width: 100%;
    transition: all 0.3s ease;
}

.signin-btn:hover {
    background-color: #bb7d44e3;
    transform: translateY(-2px);
}

/* Mostrar imagen de fondo en pantallas grandes */
@media (min-width: 768px) and (max-width: 1235px) {
    .container {
        background: url('/public/fondo.png') no-repeat left center;
       
    }

    .login-container {
        margin-left: 1rem; 
    }
}

/* En pantallas más pequeñas (móviles y tablets), la imagen se elimina */
@media (max-width: 768px) {
    .container {
        background: none; /* Elimina el fondo cuando se reduce el tamaño */
    }

    .login-container {
        margin-top: 2rem; 
    }
}

/* Para dispositivos móviles más pequeños */
@media (max-width: 576px) {
    .login-container {
        margin: 1rem;
        padding: 1.5rem;
    }

    .signup-text {
        font-size: 0.9rem;
    }

    .welcome-text {
        font-size: 1.8rem;
    }
}

</style>