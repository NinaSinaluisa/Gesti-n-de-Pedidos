<template>
  <div class="container-fluid py-4">
    <!-- Título principal -->
    <h2 class="text-dark mb-4">
      <span class="material-icons align-middle me-2">local_shipping</span>
      Configuración de Envíos
    </h2>

    <!-- Sección de Configuración -->
    <div class="row mb-4">
      <!-- Precio por Kg -->
      <div class="col-md-6">
        <div class="card shadow-sm h-100 ">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <span class="material-icons align-middle me-2">scale</span>
              Precio por Kilogramo
            </h5>
          </div>
          <div class="card-body">
            <div v-if="loadingConfig" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
            
            <div v-else class="d-flex flex-column h-100">
              <div class="flex-grow-1 d-flex align-items-center justify-content-center">
                <div class="text-center">
                  <p class="mb-2 text-muted">Precio actual por kilogramo</p>
                  <h3 class="text-primary">${{ configuracion.precio_por_kg }}</h3>
                </div>
              </div>
              
              <div class="text-end mt-3">
                <button 
                  @click="mostrarEditarPrecio = true" 
                  class="btn btn-outline-primary"
                >
                  <span class="material-icons align-middle me-1">edit</span>
                  Editar Precio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestión de Ciudades -->
      <div class="col-md-6 mt-4 mt-md-0">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <span class="material-icons align-middle me-2">location_city</span>
              Gestión de Ciudades
            </h5>
          </div>
          <div class="card-body">
            <div class="d-flex flex-column h-100">
              <div class="flex-grow-1 d-flex align-items-center justify-content-center">
                <div class="text-center">
                  <p class="mb-2 text-muted">Total de ciudades registradas</p>
                  <h3 class="text-primary">{{ ciudades.length }}</h3>
                </div>
              </div>
              
              <div class="text-end mt-3">
                <button 
                  @click="openModal()" 
                  class="btn btn-primary"
                >
                  <span class="material-icons align-middle me-1">add</span>
                  Agregar Ciudad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Ciudades -->
    <div class="card shadow-sm">
      <div class="card-header bg-light">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="mb-0">
              <span class="material-icons align-middle me-2">list</span>
              Listado de Ciudades
            </h5>
          </div>
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <span class="material-icons">search</span>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Buscar ciudad..."
                v-model="searchTerm"
              >
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-center fw-bold" style="width: 80px">Nº</th>
                <th class="fw-bold">Ciudad</th>
                <th class="fw-bold text-center">Precio de Envío</th>
                <th class="fw-bold" style="width: 150px">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </td>
              </tr>
              
              <tr v-else-if="filteredCiudades.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">
                  <span class="material-icons d-block mb-2" style="font-size: 48px;">location_off</span>
                  No se encontraron ciudades
                </td>
              </tr>
              
              <tr v-for="(ciudad, index) in paginatedCiudades" :key="ciudad.id">
                <td class="text-center">{{ calculateIndex(index) }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <span class="material-icons text-primary">location_city</span>
                    </div>
                    <h6 class="mb-0">{{ ciudad.nombre }}</h6>
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge bg-success fs-6 px-3 py-2">
                    ${{ formatPrice(ciudad.precio_envio) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-start gap-2">
                    <button
                      @click="openModal(ciudad)"
                      class="btn btn-warning btn-sm"
                      title="Editar"
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button
                      @click="confirmDelete(ciudad)"
                      class="btn btn-danger btn-sm"
                      title="Eliminar"
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="card-footer bg-light">
          <Pagination 
            :totalItems="filteredCiudades.length" 
            :itemsPerPage="itemsPerPage"
            :currentPage="currentPage"
            @update:currentPage="currentPage = $event"
          />
        </div>
      </div>
    </div>

    <!-- Modal Editar Precio -->
    <div v-if="mostrarEditarPrecio" class="modal-backdrop fade show"></div>
    <div v-if="mostrarEditarPrecio" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <span class="material-icons align-middle me-2">edit</span>
              Editar Precio por Kg
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="mostrarEditarPrecio = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nuevo Precio</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model="nuevoPrecio" 
                  step="0.01"
                  min="0"
                >
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="mostrarEditarPrecio = false">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="actualizarPrecio"
              :disabled="guardando"
            >
              <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ciudades -->
    <div v-if="showCiudadModal" class="modal-backdrop fade show"></div>
    <div v-if="showCiudadModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <span class="material-icons align-middle me-2">
                {{ isEditing ? 'edit' : 'add' }}
              </span>
              {{ isEditing ? 'Editar Ciudad' : 'Nueva Ciudad' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="submitForm">
            <div class="modal-body">
              <div class="mb-3">
                <label for="nombre" class="form-label">
                  <span class="material-icons align-middle me-1">location_on</span>
                  Ciudad
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="nombre"
                  v-model="form.nombre"
                  required
                  list="ciudadesList"
                  :class="{ 'is-invalid': errors.nombre }"
                  placeholder="Seleccione o ingrese una ciudad"
                >
              <datalist id="ciudadesList">
                <option v-for="ciudad in listaCiudadesPredefinidas" :key="ciudad" :value="ciudad"></option>
              </datalist>

                <div v-if="errors.nombre" class="invalid-feedback">
                  {{ errors.nombre }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="precio_envio" class="form-label">
                  <span class="material-icons align-middle me-1">attach_money</span>
                  Precio de Envío
                </label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input
                    type="number"
                    class="form-control"
                    id="precio_envio"
                    v-model="form.precio_envio"
                    required
                    min="0"
                    step="0.01"
                    :class="{ 'is-invalid': errors.precio_envio }"
                    placeholder="0.00"
                  >
                  <div v-if="errors.precio_envio" class="invalid-feedback">
                    {{ errors.precio_envio }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="closeModal"
                :disabled="submitting"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="submitting"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ConfiguracionPrecio from '@/apis/ConfiguracionPrecio';
import Ciudades from '@/apis/Ciudades';
import Swal from 'sweetalert2';
import Pagination from '@/components/admin/Pagination.vue';
// Configuración de precio
const configuracion = ref({ precio_por_kg: 0 });
const loadingConfig = ref(true);
const mostrarEditarPrecio = ref(false);
const nuevoPrecio = ref(0);
const guardando = ref(false);

// Gestión de ciudades
const ciudades = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

// Modal de ciudades
const showCiudadModal = ref(false);
const isEditing = ref(false);
const currentCiudad = ref(null);
const submitting = ref(false);
const form = ref({
  nombre: '',
  precio_envio: ''
});
const errors = ref({});

// Lista de ciudades predefinidas para el datalist
const listaCiudadesPredefinidas = ref([
  'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala',
  'Durán', 'Manta', 'Portoviejo', 'Loja', 'Ambato',
  'Esmeraldas', 'Riobamba', 'Quevedo', 'Milagro', 'Ibarra',
  'Latacunga', 'Babahoyo', 'Tulcán', 'Santa Elena', 'Nueva Loja'
]);


// Computed
const filteredCiudades = computed(() => {
  if (!searchTerm.value) return ciudades.value;
  
  return ciudades.value.filter(ciudad =>
    ciudad.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const paginatedCiudades = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCiudades.value.slice(start, end);
});

const calculateIndex = (index) => {
  return (currentPage.value - 1) * itemsPerPage + index + 1;
};

// Métodos
const obtenerConfiguracion = async () => {
  try {
    loadingConfig.value = true;
    const data = await ConfiguracionPrecio.fetchConfigPrecio();
    configuracion.value = data;
    nuevoPrecio.value = data.precio_por_kg;
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo obtener la configuración',
    });
  } finally {
    loadingConfig.value = false;
  }
};

const actualizarPrecio = async () => {
  try {
    guardando.value = true;
    await ConfiguracionPrecio.updateConfigPrecio({
      precio_por_kg: nuevoPrecio.value
    });
    configuracion.value.precio_por_kg = nuevoPrecio.value;
    mostrarEditarPrecio.value = false;
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Precio actualizado correctamente',
      timer: 2000
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo actualizar el precio',
    });
  } finally {
    guardando.value = false;
  }
};

const fetchCiudades = async () => {
  try {
    loading.value = true;
    const response = await Ciudades.fetchCiudades();
    ciudades.value = response;
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar las ciudades',
    });
  } finally {
    loading.value = false;
  }
};

const openModal = (ciudad = null) => {
  isEditing.value = !!ciudad;
  currentCiudad.value = ciudad;
  
  if (ciudad) {
    form.value = {
      nombre: ciudad.nombre,
      precio_envio: ciudad.precio_envio
    };
  } else {
    form.value = {
      nombre: '',
      precio_envio: ''
    };
  }
  
  errors.value = {};
  showCiudadModal.value = true;
};

const closeModal = () => {
  showCiudadModal.value = false;
};

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!form.value.nombre.trim()) {
    errors.value.nombre = 'El nombre de la ciudad es requerido';
    isValid = false;
  }

  if (!form.value.precio_envio || form.value.precio_envio < 0) {
    errors.value.precio_envio = 'El precio debe ser mayor o igual a 0';
    isValid = false;
  }

  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) return;
  
  submitting.value = true;
  
  try {
    if (isEditing.value) {
      await Ciudades.updateCiudades(currentCiudad.value.id, form.value);
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'La ciudad ha sido actualizada correctamente',
        timer: 2000
      });
    } else {
      await Ciudades.createCiudades(form.value);
      Swal.fire({
        icon: 'success',
        title: '¡Creado!',
        text: 'La ciudad ha sido creada correctamente',
        timer: 2000
      });
    }
    
    await fetchCiudades();
    closeModal();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: isEditing.value 
        ? 'No se pudo actualizar la ciudad' 
        : 'No se pudo crear la ciudad',
    });
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (ciudad) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: '¿Estás seguro?',
    text: `Se eliminará la ciudad "${ciudad.nombre}" permanentemente`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });
  
  if (result.isConfirmed) {
    try {
      await Ciudades.deleteCiudades(ciudad.id);
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'La ciudad ha sido eliminada correctamente',
        timer: 2000
      });
      await fetchCiudades();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la ciudad',
      });
    }
  }
};

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// Inicialización
onMounted(() => {
  obtenerConfiguracion();
  fetchCiudades();
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
}

.modal.show {
  display: block;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 0.5rem;
  pointer-events: none;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  outline: 0;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: none;
}

.card-header {
  border-radius: 8px 8px 0 0 !important;
}

.table > :not(caption) > * > * {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.btn-sm .material-icons {
  font-size: 18px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.badge {
  font-weight: 500;
}

@media (min-width: 576px) {
  .modal-dialog {
    max-width: 500px;
    margin: 1.75rem auto;
  }
}
</style>