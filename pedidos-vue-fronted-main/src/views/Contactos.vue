<template>
  <div class="contact-container">
    <!-- Encabezado -->
    <div class="contact-header">
      <h1>¿Tienes preguntas o necesitas ayuda?</h1>
      <p>Contáctanos directamente, nuestro equipo está listo para asistirte.</p>
    </div>

    <!-- Contenido principal -->
    <div class="contact-content">
      <!-- Columna izquierda - Información -->
      <div class="contact-info">
        <div class="info-card">
          <h2><span class="material-icons">info</span> Información de contacto</h2>
          
          <div class="contact-item">
            <div class="contact-icon location">
              <span class="material-icons">place</span>
            </div>
            <div class="contact-text">
              <h3>Dirección</h3>
              <p>{{ empresa.direccion || 'Av. 9 de Octubre 25, Riobamba, Ecuador' }}</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon phone">
              <span class="material-icons">call</span>
            </div>
            <div class="contact-text">
              <h3>Teléfono</h3>
              <p>{{ empresa.telefono || '+593 3 234 5678' }}</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon whatsapp">
              <span class="material-icons">chat</span>
            </div>
            <div class="contact-text">
              <h3>WhatsApp</h3>
              <p>{{ empresa.celular || '+593 98 765 4321' }}</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon email">
              <span class="material-icons">email</span>
            </div>
            <div class="contact-text">
              <h3>Correo electrónico</h3>
              <p>{{ empresa.email || 'contacto@empresa.com' }}</p>
            </div>
          </div>
        </div>

        <div class="business-hours">
          <h3><span class="material-icons">schedule</span> Horario de atención</h3>
          <p>Lunes a Viernes: 8:30 AM - 5:30 PM</p>
          <p>Sábados: 9:00 AM - 1:00 PM</p>
        </div>
      </div>

      <!-- Columna derecha - Formulario -->
      <div class="contact-form">
        <div class="form-card">
          <h2><span class="material-icons">send</span> Envíanos un mensaje</h2>
          
           <form @submit.prevent="validateAndSend">
    <div class="form-group">
      <span class="material-icons form-icon">person</span>
      <input 
        type="text" 
        v-model="form.nombre_completo" 
        @input="validateName"
        :class="{ 'invalid': errors.nombre_completo }"
        required
      >
      <label>Nombre completo</label>
      <span class="error-message" v-if="errors.nombre_completo">{{ errors.nombre_completo }}</span>
    </div>
    
    <div class="form-group">
      <span class="material-icons form-icon">alternate_email</span>
      <input 
        type="email" 
        v-model="form.correo_electronico" 
        @input="validateEmail"
        :class="{ 'invalid': errors.correo_electronico }"
        required
      >
      <label>Correo electrónico</label>
      <span class="error-message" v-if="errors.correo_electronico">{{ errors.correo_electronico }}</span>
    </div>
    
    <div class="form-group">
      <span class="material-icons form-icon">phone</span>
      <input 
        type="tel" 
        v-model="form.telefono" 
        @input="validatePhone"
        :class="{ 'invalid': errors.telefono }"
        required
        maxlength="10"
      >
      <label>Teléfono / Celular</label>
      <span class="error-message" v-if="errors.telefono">{{ errors.telefono }}</span>
    </div>
    
    <div class="form-group">
      <span class="material-icons form-icon">notes</span>
      <textarea 
        v-model="form.mensaje" 
        @input="validateMessage"
        :class="{ 'invalid': errors.mensaje }"
        required
      ></textarea>
      <label>Tu mensaje</label>
      <span class="error-message" v-if="errors.mensaje">{{ errors.mensaje }}</span>
    </div>
    
    <button type="submit" class="submit-btn" :disabled="loading">
      <span v-if="!loading" class="material-icons">arrow_forward</span>
      <span v-else class="material-icons rotating">autorenew</span>
      {{ loading ? 'Enviando...' : 'Enviar mensaje' }}
    </button>
  </form>
  

        </div>
      </div>
    </div>

    <!-- Mapa -->
    <div class="map-section">
      <div class="map-container">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15952.347911915978!2d-78.6396509248127!3d-1.687983721829089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d3a9c9328fa937%3A0xa0a8dc4d5fe1914b!2sAv.%209%20de%20Octubre%2025%2C%20Riobamba%2C%20Ecuador!5e0!3m2!1sen!2sus!4v1737668623067!5m2!1sen!2sus" 
          class="custom-map"
          allowfullscreen="" 
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { show_alerta } from '@/apis/Api.js';
import Empresa from '@/apis/Empresa.js';

const empresa = ref({});
const loading = ref(false);
const formValid = ref(false);

const form = reactive({
  nombre_completo: '',
  correo_electronico: '',
  telefono: '',
  mensaje: ''
});

const errors = reactive({
  nombre_completo: '',
  correo_electronico: '',
  telefono: '',
  mensaje: ''
});

// Validaciones
const validateName = () => {
  if (!form.nombre_completo.trim()) {
    errors.nombre_completo = 'El nombre es obligatorio';
    return false;
  }
  if (form.nombre_completo.length < 3) {
    errors.nombre_completo = 'Mínimo 3 caracteres';
    return false;
  }
  errors.nombre_completo = '';
  return true;
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.correo_electronico.trim()) {
    errors.correo_electronico = 'El correo es obligatorio';
    return false;
  }
  if (!emailRegex.test(form.correo_electronico)) {
    errors.correo_electronico = 'Correo electrónico inválido';
    return false;
  }
  errors.correo_electronico = '';
  return true;
};

const validatePhone = () => {
  // Solo permite números
  form.telefono = form.telefono.replace(/\D/g, '');
  
  if (!form.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
    return false;
  }
  if (form.telefono.length < 7) {
    errors.telefono = 'Mínimo 7 dígitos';
    return false;
  }
  if (form.telefono.length > 15) {
    errors.telefono = 'Máximo 15 dígitos';
    return false;
  }
  errors.telefono = '';
  return true;
};

const validateMessage = () => {
  if (!form.mensaje.trim()) {
    errors.mensaje = 'El mensaje es obligatorio';
    return false;
  }
  if (form.mensaje.length < 10) {
    errors.mensaje = 'Mínimo 10 caracteres';
    return false;
  }
  errors.mensaje = '';
  return true;
};

const validateForm = () => {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  const isMessageValid = validateMessage();
  
  return isNameValid && isEmailValid && isPhoneValid && isMessageValid;
};

const validateAndSend = async () => {
  if (!validateForm()) {
    show_alerta('Por favor complete todos los campos correctamente', 'error');
    return;
  }
  
  await sendMessage();
};

const fetchEmpresaData = async () => {
  try {
    const response = await Empresa.fetchEmpresaPublica();
    if (response && response.length > 0) {
      empresa.value = response[0];
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
    show_alerta('Error al cargar información', 'error');
  }
};

const sendMessage = async () => {
  if (loading.value) return;
  
  loading.value = true;
  
  try {
    const response = await fetch('http://localhost:8000/api/consultas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const data = await response.json();
    
    show_alerta('Mensaje enviado con éxito', 'success');
    
    // Resetear formulario
    form.nombre_completo = '';
    form.correo_electronico = '';
    form.telefono = '';
    form.mensaje = '';
    
  } catch (error) {
    console.error('Error al enviar:', error);
    show_alerta('Error al enviar mensaje. Por favor intente nuevamente.', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchEmpresaData);
</script>
<style scoped>
/* Estilos base */
.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Roboto', sans-serif;
  color: #333;
}

/* Encabezado */
.contact-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.contact-header h1 {
  font-size: 2.2rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #222;
}

.contact-header p {
  font-size: 1.1rem;
  color: #555;
  max-width: 700px;
  margin: 0 auto;
}

/* Layout principal */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

/* Sección de información */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card, .business-hours {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.info-card h2, .business-hours h3 {
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.business-hours h3 {
  margin-bottom: 1rem;
}

.business-hours p {
  margin-bottom: 0.5rem;
  color: #555;
  padding-left: 1.8rem;
}

/* Elementos de contacto */
.contact-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.contact-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.contact-icon.location { background: #e53935; }
.contact-icon.phone { background: #4caf50; }
.contact-icon.whatsapp { background: #4caf50; }
.contact-icon.email { background: #fb8c00; }

.contact-icon .material-icons {
  font-size: 1.5rem;
}

.contact-text h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: #444;
}

.contact-text p {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
}

/* Formulario */
.form-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.form-card h2 {
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

.form-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  z-index: 1;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem 0 0.8rem 2rem;
  border: none;
  border-bottom: 1px solid #ddd;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.3s;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
  padding-left: 2rem;
}

.form-group label {
  position: absolute;
  top: 0.8rem;
  left: 2rem;
  pointer-events: none;
  transition: all 0.3s;
  font-size: 0.9rem;
  color: #999;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-bottom-color: #1e88e5;
}


.form-group input:not(:placeholder-shown) ~ label,
.form-group input:focus ~ label,
.form-group textarea:not(:placeholder-shown) ~ label,
.form-group textarea:focus ~ label {
  transform: translate(-2rem, -22px);
  font-size: 0.75rem;
  color: #666; 
}


.form-group input:focus ~ label,
.form-group textarea:focus ~ label {
  color: #1e88e5; 
}
.submit-btn {
  background: #1e88e5;
  color: white;
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.submit-btn:hover {
  background: #1565c0;
  transform: translateY(-2px);
}

.submit-btn .material-icons {
  font-size: 1.2rem;
}

/* Mapa */
.map-section {
  margin-top: 2rem;
}

.map-container {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.custom-map {
  width: 100%;
  height: 100%;
  border: none;
  filter: grayscale(30%) contrast(110%) brightness(95%);
}

/* Responsive */
@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .contact-header h1 {
    font-size: 1.8rem;
  }
  
  .info-card, .business-hours, .form-card {
    padding: 1.25rem;
  }
  
  .map-container {
    height: 300px;
  }
}
</style>