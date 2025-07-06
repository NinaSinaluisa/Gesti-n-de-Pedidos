
<script setup>
import User from '../apis/User';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { show_alerta } from '../apis/Api'; 

const router = useRouter();

const form = reactive({
  email: '', 
});

const errors = reactive({});

// Validación del formulario
const validateForm = () => {
  // Limpiar errores previos
  Object.keys(errors).forEach((key) => delete errors[key]);

  // Validar campo vacío
  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es requerido.';
    return false;
  }

  return true;
};

// Función para solicitar recuperación de contraseña
const RecuperarContrasena = async () => {
  try {
    // Validar antes de enviar
    if (!validateForm()) {
      return;
    }

    // Llamada a la API
    const response = await User.OlvideContrasena(form);

    // Comprobando respuesta
    if (response.data && response.data.message) {
      // Mostrar mensaje al usuario y redirigirlo
      show_alerta(
        'Hemos enviado un correo con las instrucciones para recuperar tu contraseña. Por favor, revisa tu bandeja de entrada o la carpeta de spam.',
        'success',
        ''
      );

      // Redirigir al usuario después de 3 segundos
      setTimeout(() => {
        router.push({ name: 'home' });
      }, 3000);
    } else {
      show_alerta('Error al procesar la solicitud.', 'error', '');
    }
  } catch (error) {
    if (error.response && error.response.data.errors) {
      Object.assign(errors, error.response.data.errors); // Mostrar errores de validación del servidor
    } else {
      show_alerta('Hubo un error inesperado. Intente nuevamente.', 'error', '');
      console.error('Error:', error);
    }
  }
};
</script>

<template>
 
  <div class="container">
    <div class="login-container">
      <h1 class="welcome-text">Recuperación de Contraseña</h1>
      
            <form @submit.prevent="RecuperarContrasena" class="needs-validation">
                <!-- Input de email -->
                <div class="mb-4">
                    <input type="email" placeholder="Ingrese su correo electrónico" v-model="form.email" id="email" class="form-control" :class="{ 'is-invalid': errors.email }" />
                    <div class="invalid-feedback" v-if="errors.email">
                      {{ errors.email[0] }}
                    </div>
                </div>

                <div class="text-end">
                  <router-link to="/" class="navbar-brand fw-bold fs px-2 d-flex align-items-center justify-content-end forgot-password">
                    <span class="material-icons me-2">first_page</span>
                    Regresar
                  </router-link>
                </div>

                <!-- Botón de iniciar sesión -->
                <button class="btn btn-primary w-100 signin-btn" @click="login">
                  
                  Recuperar Contraseña
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