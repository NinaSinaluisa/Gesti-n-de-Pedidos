<script setup>
import User from '../apis/User';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {show_alerta} from '../apis/Api';
const router = useRouter();
const form = reactive({
  nombre: '',
  apellido: '',
  celular: '',
  email: '',
  password: '',
  password_confirmation: '',
  esadmin: false, // Valor predeterminado
});


const isPasswordVisible = ref(false);          // Control para Contraseña
const isPasswordConfirmVisible = ref(false);   // Control para Confirmar Contraseña

// Alternar visibilidad de la contraseña
const togglePasswordVisibility = (field) => {
    if (field === 'password') {
        isPasswordVisible.value = !isPasswordVisible.value;
    } else if (field === 'password_confirmation') {
        isPasswordConfirmVisible.value = !isPasswordConfirmVisible.value;
    }
};

const validateCelular = () => {
  // Solo permitir números
  form.celular = form.celular.replace(/\D/g, '');
  // Limitar a 10 dígitos
  if (form.celular.length > 10) {
    form.celular = form.celular.slice(0, 10);
  }
// Validar si el celular tiene 10 dígitos y comienza con 0
if (form.celular && !/^0\d{9}$/.test(form.celular)) {
    errors.celular = ['El celular debe tener 10 dígitos y empezar con 0'];
  } else {
    delete errors.celular; // Eliminar error si el celular es válido
  }
};
const errors = reactive({});


// Función para validar el formulario
const validateForm = () => {
  // Limpiar errores previos
  Object.keys(errors).forEach(key => delete errors[key]);
  
  if (!form.nombre.trim()) {
    errors.nombre = ['El nombre es requerido'];
    return false;
  }

  if (!form.apellido.trim()) {
    errors.apellido = ['El apellido es requerido'];
    return false;
  }

  

  if (!/^0\d{9}$/.test(form.celular)) {
    errors.celular = ['El celular debe tener 10 dígitos y empezar con 0'];
    return false;
}

  // Validar que las contraseñas coincidan
  if (form.password !== form.password_confirmation) {
    errors.password = ['Las contraseñas no coinciden'];
    return false;
  }

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

const register = async () => {
  try {
    // Validar antes de enviar
    if (!validateForm()) {
      return;
    }

    
    const response = await User.register(form);
    
    if (response.data) {
      // Opcional: guardar el token si lo devuelve la API
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Actualizar el estado de autenticación en el store
        
      }
      // Mostrar mensaje de éxito
      show_alerta('Usuario registrado con éxito', 'success', '');
      router.push({ name: 'Login' });
    }
  } catch (error) {
    if (error.response && error.response.data.errors) {
      Object.assign(errors, error.response.data.errors);
    } else {
      // Manejar otros tipos de errores
      show_alerta('Error al registrar el usuario', 'error', '');
      console.error('Error:', error);
    }
  }
};
</script>

<template>
  <!-- <form @submit.prevent="register" class="needs-validation">
    <div class="mb-3">
        <label for="name" class="form-label">Nombre</label>
        <input type="text" v-model="form.nombre" id="name" class="form-control" :class="{ 'is-invalid': errors.nombre }" />
        <div class="invalid-feedback" v-if="errors.nombre">
            {{ errors.nombre[0] }}
        </div>
    </div>
    <div class="mb-3">
        <label for="apellido" class="form-label">Apellido</label>
        <input type="text" v-model="form.apellido" id="apellido" class="form-control" :class="{ 'is-invalid': errors.apellido }" />
        <div class="invalid-feedback" v-if="errors.apellido">
            {{ errors.apellido[0] }}
        </div>
    </div>
    <div class="mb-3">
        <label for="Celular" class="form-label">Celular</label>
        <input type="text" v-model="form.celular" id="celular" class="form-control" :class="{ 'is-invalid': errors.celular }" />
        <div class="invalid-feedback" v-if="errors.celular">
            {{ errors.celular[0] }}
        </div>
    </div>
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

    <div class="mb-3">
        <label for="password_confirmation" class="form-label">Confirmar Contraseña</label>
        <input type="password" v-model="form.password_confirmation" id="password_confirmation" class="form-control" :class="{ 'is-invalid': errors.password_confirmation }" />
        <div class="invalid-feedback" v-if="errors.password_confirmation">
            {{ errors.password_confirmation[0] }}
        </div>
    </div>

    <button type="submit" class="btn btn-success w-100">
        Crear Cuenta
    </button>
</form> -->

<!-- ------------------------------------------------------------------------- -->


    
<div class="container mt-3">
    <div class="login-container">
        <h1 class="welcome-text">Bienvenido </h1>
        

        <form @submit.prevent="register" class="needs-validation">
            <!-- Fila para Nombre y Apellido -->
            <div class="mb-3 row">
                <div class="col-12 col-md-6">
                    <div class="input-container">
                        <input type="text" placeholder="Ingrese su nombre" v-model="form.nombre" id="name" class="form-control" :class="{ 'is-invalid': errors.nombre }" />
                        <span class="input-icon material-icons ">person</span>
                    </div>
                    <div class="feedback" v-if="errors.nombre">
                        {{ errors.nombre[0] }}
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="input-container">
                        <input type="text" placeholder="Ingrese su apellido" v-model="form.apellido" id="apellido" class="form-control" :class="{ 'is-invalid': errors.apellido }" />
                        <span class="input-icon material-icons">person_outline</span>
                    </div>
                    <div class="feedback" v-if="errors.apellido">
                        {{ errors.apellido[0] }}
                    </div>
                </div>
            </div> 

            <!-- Fila para Celular -->
             <div class="mb-3">
                <div class="input-container">
                    <input type="text" placeholder="Ingrese su celular"  @input="validateCelular" v-model="form.celular" id="celular" class="form-control" :class="{ 'is-invalid': errors.celular }" />
                    <span class="input-icon material-icons">phone</span>
                </div>
                <div class="feedback" v-if="errors.celular">
                    {{ errors.celular[0] }}
                </div>
            </div>

            <!-- Fila para Correo Electrónico -->
            <div class="mb-3">
                <div class="input-container">
                    <input type="email" placeholder="Ingrese su correo electrónico" v-model="form.email" id="email" class="form-control" :class="{ 'is-invalid': errors.email }" />
                    <span class="input-icon material-icons">email</span>
                </div>
                <div class="feedback" v-if="errors.email">
                    {{ errors.email[0] }}
                </div>
            </div>

            <!-- Fila para Contraseña -->
            <div class="mb-3 position-relative">
                <div class="input-container">
                    <input :type="isPasswordVisible ? 'text' : 'password'" placeholder="Ingrese su contraseña" v-model="form.password" id="password" class="form-control" :class="{ 'is-invalid': errors.password }" />
                    <span class="input-icon material-icons">lock</span>
                    <span type="button" @click="togglePasswordVisibility('password')" class="password-toggle material-icons position-absolute top-50 end-0 translate-middle-y" :class="{'text-primary': isPasswordVisible}">
                        {{ isPasswordVisible ? 'visibility' : 'visibility_off' }}
                    </span>
                </div>
                <div class="feedback" v-if="errors.password">
                    {{ errors.password[0] }}
                </div>
            </div>

            <!-- Fila para Confirmar Contraseña -->
            <div class="mb-3 position-relative">
                <div class="input-container">
                    <input :type="isPasswordConfirmVisible ? 'text' : 'password'" placeholder="Confirme su contraseña" v-model="form.password_confirmation" id="password_confirmation" class="form-control" :class="{ 'is-invalid': errors.password_confirmation }" />
                    <span class="input-icon material-icons">lock</span>
                    <span type="button" @click="togglePasswordVisibility('password_confirmation')" class="password-toggle material-icons position-absolute top-50 end-0 translate-middle-y" :class="{'text-primary': isPasswordConfirmVisible}">
                        {{ isPasswordConfirmVisible ? 'visibility' : 'visibility_off' }}
                    </span>
                </div>
                <div class="feedback" v-if="errors.password_confirmation">
                    {{ errors.password_confirmation[0] }}
                </div>
            </div>

            <!-- Enlace de recuperar contraseña -->
            <div class="text-end">
              <router-link to="/" class="navbar-brand fw-bold fs px-2 d-flex align-items-center justify-content-end forgot-password">
                <span class="material-icons me-2">first_page</span>
                Regresar
              </router-link>
            </div>


            <!-- Botón de inicio sesión -->
            <button class="btn btn-primary w-100 fw-bold signin-btn" @submit.prevent="register">
                Registrarme 
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
    max-width: 600px;
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
    color:  #eb8511c7;
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
/* Estilos comunes para el contenedor de input */
.input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.input-container input {
    border-radius: 6px;
    border: 1px solid #ccc;  /* Borde del input solo */
    padding-left: 30px;  /* espacio para el icono */
}

.input-container .input-icon {
    position: absolute;
    left: 10px;  /* posiciona el ícono dentro del input */
    font-size: 18px;
    color: #555;
}

/* Mostrar los iconos de las contraseñas */
.password-toggle {
    cursor: pointer;
    transition: color 0.3s;
}

.password-toggle.text-primary {
    color: #007bff;  /* Cambio de color al hacer click */
}

/* Apoyo para inputs con error */
.is-invalid {
    border-color: #dc3545 !important;
    background-color: #f8d7da;
}

.feedback {
    color: #dc3545;
    font-size: 0.875rem;
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