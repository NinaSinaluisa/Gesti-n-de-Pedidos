<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/authstore'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const showModal = ref(false)
const showDeleteModal = ref(false)
const isPasswordMode = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)
const deleteLoading = ref(false)

// Referencias para los modales
const modalRef = ref(null)
const deleteModalRef = ref(null)
let bootstrapModal = null
let bootstrapDeleteModal = null

onMounted(() => {
  // Inicializar modales de Bootstrap
  bootstrapModal = new bootstrap.Modal(modalRef.value, {
    keyboard: false,
    backdrop: 'static'
  })
  bootstrapDeleteModal = new bootstrap.Modal(deleteModalRef.value, {
    keyboard: false,
    backdrop: 'static'
  })
})

const formData = ref({
  nombre: userStore.user.nombre,
  apellido: userStore.user.apellido,
  email: userStore.user.email,
  celular: userStore.user.celular,
  password: '',
  password_confirmation: ''
})

const fullName = computed(() => {
  return `${userStore.user.nombre} ${userStore.user.apellido}`
})

const openModal = (passwordMode = false) => {
  isPasswordMode.value = passwordMode
  bootstrapModal.show()
}

const closeModal = () => {
  bootstrapModal.hide()
  resetForm()
}

const openDeleteModal = () => {
  bootstrapDeleteModal.show()
}

const closeDeleteModal = () => {
  bootstrapDeleteModal.hide()
}

const resetForm = () => {
  formData.value = {
    nombre: userStore.user.nombre,
    apellido: userStore.user.apellido,
    email: userStore.user.email,
    celular: userStore.user.celular,
    password: '',
    password_confirmation: ''
  }
  errorMessage.value = ''
  successMessage.value = ''
}

const handleSubmit = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const payload = { ...formData.value }
    
    if (!isPasswordMode.value) {
      delete payload.password
      delete payload.password_confirmation
    } else if (payload.password !== payload.password_confirmation) {
      errorMessage.value = 'Las contraseñas no coinciden'
      loading.value = false
      return
    }

    const token = localStorage.getItem("auth")
    const response = await axios.put(
      `http://localhost:8000/api/admin/usuarios/${userStore.user.id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    
    if (response.data.status) {
      successMessage.value = 'Perfil actualizado exitosamente'
      userStore.$patch({
        user: {
          ...userStore.user,
          nombre: response.data.data.nombre,
          apellido: response.data.data.apellido,
          email: response.data.data.email,
          celular: response.data.data.celular
        }
      })
      setTimeout(() => {
        closeModal()
      }, 1500)
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.errors?.[0] || 'Error al actualizar el perfil'
  } finally {
    loading.value = false
  }
}

const handleDeleteAccount = async () => {
  try {
    deleteLoading.value = true
    const token = localStorage.getItem("auth")
    
    await axios.delete(
      `http://localhost:8000/api/admin/usuarios/${userStore.user.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    // Limpiar datos de sesión
    localStorage.removeItem("auth")
    userStore.$reset()
    
    // Redirigir al login
    router.push('/login')
  } catch (error) {
    errorMessage.value = 'Error al eliminar la cuenta. Por favor, intente nuevamente.'
  } finally {
    deleteLoading.value = false
    closeDeleteModal()
  }
}
</script>
<template>
    <div class="profile-container">
      <!-- Panel Principal -->
      <div class="row g-0">
        <!-- Sidebar con Información Principal -->
        <div class="col-md-4 profile-sidebar">
          <div class="text-center p-4">
            <div class="profile-avatar mb-3">
              <span class="initials">{{ userStore.user.nombre[0].toUpperCase()}}{{ userStore.user.apellido[0].toUpperCase() }}</span>
            </div>
            <h2 class="profile-name">{{ fullName.toUpperCase() }}</h2>
            <p class="profile-role">
              <i class="material-icons">badge</i>
              Cliente
            </p>
            <div class="profile-actions mt-4">
              <button @click="openModal(false)" class="btn btn-outline-light btn-lg mb-2 w-100">
                <i class="material-icons">edit</i>
                Editar Perfil
              </button>
              <button @click="openModal(true)" class="btn btn-light btn-lg mb-2 w-100">
                <i class="material-icons">lock</i>
                Cambiar Contraseña
              </button>
             
            </div>
          </div>
        </div>
  
        <!-- Contenido Principal -->
        <div class="col-md-8 profile-content">
          <div class="p-4">
            <h3 class="content-title mb-4">Información Personal</h3>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-icon">
                  <i class="material-icons">email</i>
                </div>
                <div class="info-content">
                  <label>Correo Electrónico</label>
                  <p>{{ userStore.user.email }}</p>
                </div>
              </div>
  
              <div class="info-item">
                <div class="info-icon">
                  <i class="material-icons">phone</i>
                </div>
                <div class="info-content">
                  <label>Teléfono</label>
                  <p>{{ userStore.user.celular }}</p>
                </div>
              </div>
  
              <div class="info-item">
                <div class="info-icon">
                  <i class="material-icons">calendar_today</i>
                </div>
                <div class="info-content">
                  <label>Fecha de Registro</label>
                  <p>{{ new Date(userStore.user.created_at).toLocaleDateString() }}</p>
                </div>
              </div>
  
              <div class="info-item">
                <div class="info-icon">
                  <i class="material-icons">verified_user</i>
                </div>
                <div class="info-content">
                  <label>Estado</label>
                  <p>Activo</p>
                </div>
              </div>
            </div>
          </div>
          <button @click="openDeleteModal" class="btn btn-danger btn-lg w-100">
                <i class="material-icons ">delete_forever</i>
                Eliminar Cuenta
              </button>
        </div>
        
      </div>
  
      <!-- Modal de Edición -->
      <div class="modal fade" ref="modalRef" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">
                {{ isPasswordMode ? 'Cambiar Contraseña' : 'Editar Perfil' }}
              </h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            
            <div class="modal-body">
              <form @submit.prevent="handleSubmit">
                <template v-if="!isPasswordMode">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Nombre</label>
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light">
                          <i class="material-icons">person</i>
                        </span>
                        <input type="text" v-model="formData.nombre" class="form-control border-0 bg-light" />
                      </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Apellido</label>
                      <div class="input-group">
                        <span class="input-group-text border-0 bg-light">
                          <i class="material-icons">person</i>
                        </span>
                        <input type="text" v-model="formData.apellido" class="form-control border-0 bg-light" />
                      </div>
                    </div>
                  </div>
  
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light">
                        <i class="material-icons">email</i>
                      </span>
                      <input type="email" v-model="formData.email" class="form-control border-0 bg-light" />
                    </div>
                  </div>
  
                  <div class="mb-3">
                    <label class="form-label">Celular</label>
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light">
                        <i class="material-icons">phone</i>
                      </span>
                      <input type="tel" v-model="formData.celular" maxlength="10" class="form-control border-0 bg-light" />
                    </div>
                  </div>
                </template>
  
                <template v-else>
                  <div class="mb-4">
                    <label class="form-label">Nueva Contraseña</label>
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light">
                        <i class="material-icons">lock</i>
                      </span>
                      <input type="password" v-model="formData.password" class="form-control border-0 bg-light" />
                    </div>
                  </div>
  
                  <div class="mb-4">
                    <label class="form-label">Confirmar Contraseña</label>
                    <div class="input-group">
                      <span class="input-group-text border-0 bg-light">
                        <i class="material-icons">lock_clock</i>
                      </span>
                      <input type="password" v-model="formData.password_confirmation" class="form-control border-0 bg-light" />
                    </div>
                  </div>
                </template>
  
                <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center">
                  <i class="material-icons me-2">error</i>
                  {{ errorMessage }}
                </div>
                
                <div v-if="successMessage" class="alert alert-success d-flex align-items-center">
                  <i class="material-icons me-2">check_circle</i>
                  {{ successMessage }}
                </div>
  
                <div class="modal-footer border-0 px-0 pt-4">
                  <button type="button" class="btn btn-light px-4" @click="closeModal">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary px-4" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de Confirmación de Eliminación -->
      <div class="modal fade" ref="deleteModalRef" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <h5 class="modal-title text-danger">
                <i class="material-icons align-middle me-2">warning</i>
                Eliminar Cuenta
              </h5>
              <button type="button" class="btn-close" @click="closeDeleteModal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todo el acceso a tus datos.</p>
            </div>
            <div class="modal-footer border-0">
              <button type="button" class="btn btn-secondary" @click="closeDeleteModal">
                Cancelar
              </button>
              <button 
                type="button" 
                class="btn btn-danger" 
                @click="handleDeleteAccount"
                :disabled="deleteLoading"
              >
                <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2"></span>
                Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .profile-container {
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 0 40px rgba(0,0,0,0.1);
    overflow: hidden;
    margin: 2rem auto;
    max-width: 1200px;
  }
  
  .profile-sidebar {
    background: linear-gradient(135deg, #4268F6, #2E4BB0);
    color: white;
    min-height: 100%;
    padding: 2rem;
  }
  
  .profile-avatar {
    width: 120px;
    height: 120px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
  
  .initials {
    font-size: 2.5rem;
    font-weight: 600;
  }
  
  .profile-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem;
  }
  
  .profile-role {
    font-size: 1rem;
    opacity: 0.9;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .profile-content {
    background: #f8f9fa;
    padding: 2rem;
  }
  
  .content-title {
    color: #2c3e50;
    font-weight: 600;
    font-size: 1.25rem;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .info-item {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  .info-icon {
    background: #e3f2fd;
    color: #4268F6;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .info-content label {
    color: #6c757d;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    display: block;
  }
  
  .info-content p {
    color: #2c3e50;
    font-weight: 500;
    margin: 0;
  }
  
  .modal-content {
    border: none;
    border-radius: 15px;
  }
  
  .input-group-text {
    color: #6c757d;
  }
  
  .form-control:focus {
    box-shadow: none;
    border-color: #4268F6;
  }
  
  .btn-primary {
    background: #4268F6;
    border: none;
  }
  
  .btn-primary:hover {
    background: #2E4BB0;
  }
  
  .btn-danger {
    background: #dc3545;
    border: none;
    transition: all 0.3s ease;
  }
  
  .btn-danger:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
  
  .text-danger {
    color: #dc3545 !important;
  }
  
  @media (max-width: 768px) {
    .profile-sidebar {
      border-radius: 15px 15px 0 0;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>