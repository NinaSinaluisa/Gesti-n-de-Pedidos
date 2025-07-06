<template>
  <div class="container">
    <div class="login-container">
      <h1 class="welcome-text">Recuperación de Contraseña</h1>
      <form @submit.prevent="RestablecerContrasena" class="needs-validation">
        <div class="mb-3 position-relative">
          <div class="input-container">
            <input 
              :type="isPasswordVisible ? 'text' : 'password'" 
              placeholder="Ingrese su contraseña" 
              v-model="form.password" 
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
            />
            <span class="input-icon material-icons">lock</span>
            <span type="button" 
              @click="togglePasswordVisibility('password')" 
              class="password-toggle material-icons position-absolute top-50 end-0 translate-middle-y" 
              :class="{'text-primary': isPasswordVisible}"
            >
              {{ isPasswordVisible ? 'visibility' : 'visibility_off' }}
            </span>
          </div>
         
        </div>

        <div class="mb-3 position-relative">
          <div class="input-container">
            <input 
              :type="isPasswordConfirmVisible ? 'text' : 'password'" 
              placeholder="Confirme su contraseña" 
              v-model="form.password_confirmation" 
              class="form-control" 
              :class="{ 'is-invalid': errors.password_confirmation }"
            />
            <span class="input-icon material-icons">lock</span>
            <span type="button" 
              @click="togglePasswordVisibility('password_confirmation')" 
              class="password-toggle material-icons position-absolute top-50 end-0 translate-middle-y" 
              :class="{'text-primary': isPasswordConfirmVisible}"
            >
              {{ isPasswordConfirmVisible ? 'visibility' : 'visibility_off' }}
            </span>
          </div>
          <div class="feedback" v-if="errors.password_confirmation">{{ errors.password_confirmation[0] }}</div>
        </div>
        <div class="feedback" v-if="errors.password">{{ errors.password[0] }}</div>

        <div class="text-end">
          <router-link to="/" class="navbar-brand fw-bold fs px-2 d-flex align-items-center justify-content-end forgot-password">
            <span class="material-icons me-2">first_page</span>
            Regresar
          </router-link>
        </div>

        <button class="btn btn-primary w-100 signin-btn">
          Restablecer Contraseña
        </button>
      </form>
      
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import User from '../apis/User'; 
import { show_alerta } from '../apis/Api'; 

const router = useRouter();
const form = reactive({
  password: '',
  password_confirmation: '',
});
const isPasswordVisible = ref(false);
const isPasswordConfirmVisible = ref(false);
const errors = reactive({});

const togglePasswordVisibility = (field) => {
    if (field === 'password') {
        isPasswordVisible.value = !isPasswordVisible.value;
    } else if (field === 'password_confirmation') {
        isPasswordConfirmVisible.value = !isPasswordConfirmVisible.value;
    }
};

const validateForm = () => {
  Object.keys(errors).forEach((key) => delete errors[key]);

  if (form.password !== form.password_confirmation) {
    errors.password = ['Las contraseñas no coinciden'];
    return false;
  }
  if (!form.password.trim()) {
    errors.password = ['La contraseña es requerida'];
    return false;
  }
  if (form.password.length < 8) {
    errors.password = ['La contraseña debe tener al menos 8 caracteres'];
    return false;
  }
  return true;
};

const RestablecerContrasena = async () => {
  if (!validateForm()) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    show_alerta('Token no encontrado. Vuelve a intentarlo.', 'error', '');
    return;
  }

  try {
    const response = await User.RestablecerContrasena({
      password: form.password,
      password_confirmation: form.password_confirmation,
      token: token,
    });

    if (response.data.message) {
      show_alerta(response.data.message, 'success', '');
      setTimeout(() => router.push({ name: 'home' }), 3000);
    } else {
      show_alerta('Error al procesar la solicitud.', 'error', '');
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      // Mostrar el mensaje de error específico desde el backend
      show_alerta(error.response.data.message, 'error', '');
    } else {
      // Mensaje genérico si no se obtiene uno del servidor
      show_alerta('Hubo un error inesperado. Intente nuevamente.', 'error', '');
    }
  }
};

</script>



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
    max-width: 500px;
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



.form-control {
    padding: 0.8rem 1rem;
    padding-left: 2.5rem; /* Espacio para evitar superposición del ícono */
    border: 1px solid #ced4da;
    border-radius: 8px;
    background-color: #f8f5f6;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Suaviza las transiciones */
}
.form-control:focus {
    border-color: #dc8e35; /* Color del borde en foco */
    background-color: #ffffff; /* Color de fondo al hacer foco */
    box-shadow: 0 0 0 0.25rem rgba(220, 142, 53, 0.25); /* Sombra sutil al enfocar */
}
.input-icon {
    position: absolute;
    left: 1rem; /* Separación desde el borde izquierdo */
    top: 50%;
    transform: translateY(-50%); /* Ajusta el ícono verticalmente */
    color: #6c757d;
    pointer-events: none; /* Desactiva interacciones con el ícono */
}
.form-control:focus + .input-icon {
    top: 50%;
    transform: translateY(-50%); /* Mantén el ícono centrado */
}
.password-field {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 2rem;
    margin-right: 05px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #6c757d;
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

.feedback {
    color: #e74c3c; /* Rojo claro para visibilidad */
    font-size: 0.875rem;
    margin-top: 0.25rem;
}
/* Mostrar imagen de fondo en pantallas grandes */
@media (min-width: 1051px) and (max-width: 1235px) {
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