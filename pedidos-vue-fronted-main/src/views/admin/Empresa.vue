
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { show_alerta } from '../../apis/Api';
import Empresa from '../../apis/Empresa';
import { IMAGE_BASE_URL } from '@/apis/Api.js';

const company = ref({});
const form = reactive({
  nombre: '',
  direccion: '',
  referencia: '',
  telefono: '',
  celular: '',
  email: '',
  descripcion: '',
  facebook: '',
  instagram: '',
  logo: ''
});
const logoFile = ref(null);
const logoPreview = ref(null);
const isCreating = ref(true);

const getFullImageUrl = (path) => {
  if (!path) return '/images/default-company.png';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${IMAGE_BASE_URL}/${path}`;
};

const fetchCompanyProfile = async () => {
  try {
    const response = await Empresa.fetchEmpresa();
    
    if (response && response.length > 0) {
      company.value = response[0]; 
      Object.assign(form, response[0]);
      isCreating.value = false;
    } else {
      isCreating.value = true;
    }
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    isCreating.value = true;
    if (error.response?.status !== 404) {
      show_alerta('Error al cargar la información de la empresa', 'error');
    }
  }
};


const prepareEdit = () => {
  if (!isCreating.value) {
    Object.assign(form, company.value);
  }
  logoFile.value = null;
  logoPreview.value = null;
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      show_alerta('El archivo es demasiado grande. Máximo 2MB permitidos.', 'error');
      return;
    }
    
    // Validar tipo de imagen
    if (!file.type.match('image.*')) {
      show_alerta('Por favor seleccione un archivo de imagen válido.', 'error');
      return;
    }
    
    logoFile.value = file;
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeLogo = () => {
  logoFile.value = null;
  logoPreview.value = null;
  form.logo = '';
  // Limpiar input file
  const fileInput = document.querySelector('.logo-upload input[type="file"]');
  if (fileInput) fileInput.value = '';
};

const saveCompany = async () => {
  try {
    const formData = new FormData();
    
    // Agregar campos al FormData
    Object.keys(form).forEach(key => {
      if (key !== 'logo' && form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    });
    
    // Manejar el logo
    if (logoFile.value) {
      formData.append('logo', logoFile.value);
    } else if (form.logo === '') {
      // Para eliminar el logo existente
      formData.append('remove_logo', 'true');
    }
    
    let response;
    if (isCreating.value) {
      response = await Empresa.createEmpresa(formData);
      show_alerta('Perfil de empresa creado con éxito', 'success');
    } else {
      response = await Empresa.updateImage(company.value.id, formData);
      show_alerta('Perfil actualizado con éxito', 'success');
    }
    
    // Actualizar los datos locales con la respuesta de la API
    company.value = response.data; // Asume que la respuesta viene en response.data
    Object.assign(form, response.data);
    isCreating.value = false;
    logoPreview.value = null;
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('companyModal'));
    if (modal) modal.hide();
  } catch (error) {
    console.error('Error al guardar:', error);
    show_alerta(error.response?.data?.message || 'Error al guardar el perfil', 'error');
  }
};

onMounted(fetchCompanyProfile);
</script>

<template>
  <div class="company-profile">
    <!-- Header con fondo y logo -->
    <div class="company-header">
      <div class="header-background"></div>
      <div class="container header-content">
        <div class="logo-container">
          <img :src="getFullImageUrl(company.logo)" alt="Logo de la empresa" class="company-logo">
        </div>
        <div class="company-info">
          <h1 class="company-name">{{ company.nombre }}</h1>
          <p class="company-description">{{ company.descripcion }}</p>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="container main-content">
      <div class="company-details">
        <!-- Sección de información -->
        <div class="info-section">
          <div class="info-card">
            <h2 class="section-title">
              <span class="material-icons">business</span>
              Información de Contacto
            </h2>
            
            <div class="contact-info">
              <div class="contact-item">
                <span class="material-icons">place</span>
                <div>
                  <h3>Dirección</h3>
                  <p>{{ company.direccion || 'No especificada' }}</p>
                </div>
              </div>
              
              <div class="contact-item">
                <span class="material-icons">call</span>
                <div>
                  <h3>Teléfono</h3>
                  <p>{{ company.telefono || 'No especificado' }}</p>
                </div>
              </div>
              
              <div class="contact-item">
                <span class="material-icons">smartphone</span>
                <div>
                  <h3>Celular</h3>
                  <p>{{ company.celular || 'No especificado' }}</p>
                </div>
              </div>
              
              <div class="contact-item">
                <span class="material-icons">email</span>
                <div>
                  <h3>Email</h3>
                  <p>{{ company.email || 'No especificado' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de redes sociales -->
        <div class="social-section">
          <div class="social-card">
            <h2 class="section-title">
              <span class="material-icons">share</span>
              Redes Sociales
            </h2>
            
            <div class="social-links">
              <a v-if="company.facebook" :href="company.facebook" target="_blank" class="social-btn facebook">
                <span class="material-icons">facebook</span>
                <span>Facebook</span>
              </a>
              
              <a v-if="company.instagram" :href="company.instagram" target="_blank" class="social-btn instagram">
                <span class="material-icons">photo_camera</span>
                <span>Instagram</span>
              </a>
              
              <div v-if="!company.facebook && !company.instagram" class="no-socials">
                <span class="material-icons">link_off</span>
                <p>No hay redes sociales registradas</p>
              </div>
            </div>
            
            <button 
              class="edit-btn "
              data-bs-toggle="modal" 
              data-bs-target="#companyModal"
              @click="prepareEdit"
            >
              <span class="material-icons">edit</span>
              Editar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
     <div class="modal fade" id="companyModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="material-icons">business</span>
            {{ isCreating ? 'Crear Perfil Empresarial' : 'Editar Perfil' }}
          </h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        
        
       <div class="modal-body">
          <form @submit.prevent="saveCompany">
              <div class="form-container">
                  <!-- Sección Izquierda -->
                  <div class="form-section">
                      <div class="form-group">
                          <label>Nombre de la Empresa *</label>
                          <input type="text" class="form-control" v-model="form.nombre" required placeholder="Ej: Mi Empresa S.A." />
                      </div>

                      <div class="form-group">
                          <label>Descripción</label>
                          <textarea class="form-control" v-model="form.descripcion" rows="3" placeholder="Breve descripción de su empresa"></textarea>
                      </div>

                      <div class="form-group">
                          <label>Dirección</label>
                          <input type="text" class="form-control" v-model="form.direccion" placeholder="Dirección completa" />
                      </div>
                  </div>

                  <!-- Sección Derecha -->
                  <div class="form-section" style="margin-top: -20px;">
                      <div class="form-group">
                          <label>Logo de la Empresa</label>
                          <div class="logo-upload-container">
                              <div class="logo-preview-wrapper" v-if="logoPreview || company.logo">
                                  <div class="logo-preview">
                                      <img :src="logoPreview || getFullImageUrl(company.logo)" alt="Vista previa del logo" />
                                  </div>
                              </div>

                              <label class="file-upload-btn">
                                  <input type="file" accept="image/*" @change="handleLogoUpload" />
                                  <span class="material-icons">cloud_upload</span>
                                  {{ logoPreview ? 'Cambiar imagen' : 'Seleccionar logo' }}
                              </label>
                              <small class="file-info">Formatos: JPG, PNG (Max. 2MB)</small>
                          </div>
                      </div>

                      <div class="phone-group">
                          <div class="form-group">
                              <label>Teléfono</label>
                              <input type="text" class="form-control" v-model="form.telefono" />
                          </div>
                          <div class="form-group">
                              <label>Celular</label>
                              <input type="text" class="form-control" v-model="form.celular" />
                          </div>
                      </div>
                  </div>
                  
              </div>

              <!-- Sección Inferior -->
              <div class="form-bottom-section">
                  <div class="form-group">
                      <label>Referencia *</label>
                      <div class="input-with-icon">
                          <span class="material-icons">map</span>
                          <input type="text" class="form-control" v-model="form.referencia" required placeholder="Indicaciones .." />
                      </div>
                  </div>
                  <div class="form-group">
                      <label>Email *</label>
                      <div class="input-with-icon">
                          <span class="material-icons">alternate_email</span>
                          <input type="email" class="form-control" v-model="form.email" required placeholder="contacto@empresa.com" />
                      </div>
                  </div>
                  
                  <div class="social-media-fields">
                      <div class="form-group">
                          <label>Facebook</label>
                          <div class="input-with-icon">
                              <span class="material-icons">facebook</span>
                              <input type="url" class="form-control" v-model="form.facebook" placeholder="https://facebook.com/tuempresa" />
                          </div>
                      </div>

                      <div class="form-group">
                          <label>Instagram</label>
                          <div class="input-with-icon">
                              <span class="material-icons">photo_camera</span>
                              <input type="url" class="form-control" v-model="form.instagram" placeholder="https://instagram.com/tuempresa" />
                          </div>
                      </div>
                  </div>
              </div>

              <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                      Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary">
                      <span class="material-icons">save</span>
                      {{ isCreating ? 'Crear Perfil' : 'Guardar Cambios' }}
                  </button>
              </div>
          </form>
      </div>


      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
/* Estilos generales */



.header-content {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin-bottom: 20px;
  
}

.logo-container {
  margin-right: 2rem;
}

.company-logo {
  width: 125px;
  height: 125px;
  object-fit: cover;
  border-radius: 50%;
  
 
}

.company-info {
  max-width: 600px;
}



.company-details {
  margin-top: 40px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

/* Tarjeta de información */
.info-card, .social-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  height: 100%;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #0c0c0c3f;
}

.contact-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.contact-item .material-icons {
  font-size: 1.8rem;
  color: #010f189a;
  margin-top: 0.2rem;
}

.contact-item h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #34495e;
}

.contact-item p {
  margin: 0;
  color: #7f8c8d;
}

/* Sección de redes sociales */
.social-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.social-btn.facebook {
  background-color: #f0f3f8;
  color: #3b5998;
  border: 1px solid #d8e0f0;
}

.social-btn.instagram {
  background-color: #f8f0f5;
  color: #e1306c;
  border: 1px solid #f0d8e8;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.social-btn .material-icons {
  font-size: 1.5rem;
}

.no-socials {
  text-align: center;
  padding: 1.5rem;
  color: #95a5a6;
}

.no-socials .material-icons {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

/* Botón de edición */
.edit-btn {
  width: 100%;
  padding: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #3b5998;
  color: white;
  border: none;
  border-radius: 8px;
  transition: all 0.3s;
}

.edit-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

/* Estilos del Modal - Versión Corregida */
.modal-content {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background-color: #2c3e50;
  color: white;
  padding: 1.5rem;
  border-bottom: none;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.modal-title .material-icons {
  font-size: 1.8rem;
}

.btn-close {
  filter: invert(1);
  opacity: 0.8;
  transition: opacity 0.2s;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Grupo especial para teléfono y celular */
.phone-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-control:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  outline: none;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

/* Estilos para la subida de logo */
.logo-upload-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.logo-preview-wrapper {
  display: flex;
  justify-content: center;
}

.logo-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px dashed #ddd;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f8f9fa;
}

.btn-remove-logo {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove-logo:hover {
  background-color: rgba(192, 57, 43, 0.9);
  transform: scale(1.1);
}

.btn-remove-logo .material-icons {
  font-size: 1.2rem;
}

.file-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.7rem 1.2rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-btn:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

.file-upload-btn .material-icons {
  font-size: 1.2rem;
}

.file-upload-btn input[type="file"] {
  display: none;
}

.file-info {
  display: block;
  color: #7f8c8d;
  font-size: 0.85rem;
  text-align: center;
}

/* Campos con iconos */
.input-with-icon {
  position: relative;
}

.input-with-icon .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  font-size: 1.2rem;
}

.input-with-icon .form-control {
  padding-left: 42px;
}

/* Sección inferior */
.form-bottom-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.social-media-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* Footer del modal */
.modal-footer {
  padding: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-footer .btn {
  padding: 0.7rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.modal-footer .btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.modal-footer .btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.modal-footer .btn-secondary {
  background-color: #f8f9fa;
  border-color: #ddd;
  color: #2c3e50;
}

.modal-footer .btn-secondary:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

/* Responsive */
@media (max-width: 992px) {
  .form-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .phone-group,
  .social-media-fields {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .modal-title {
    font-size: 1.3rem;
  }
  
  .modal-header {
    padding: 1.2rem;
  }
  
  .modal-body {
    padding: 1.2rem;
  }
  
  .modal-footer {
    padding: 1.2rem;
    padding-top: 1rem;
  }
}
</style>