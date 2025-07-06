<script setup>
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import Pagination from '@/components/admin/Pagination.vue';

const envios = ref([]);
const selectedEnvio = ref(null);
const showModal = ref(false);
const editForm = ref({
  estado_envio: '',
});

const estadoEnvioOptions = ['pendiente', 'enviado', 'entregado'];

const fetchEnvios = async () => {
  try {
    const token = localStorage.getItem('auth'); // Asegúrate de que el token esté guardado así

    const response = await fetch('http://localhost:8000/api/admin/envios', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    envios.value = data.data || [];
    console.log('Envíos cargados:', envios.value);
    
  } catch (error) {
    console.error('Error fetching envios:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar la lista de envíos',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
};


const openModal = (envio) => {
  selectedEnvio.value = envio;
  editForm.value = {
    estado_envio: envio.estado_envio
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedEnvio.value = null;
};

const updateEnvio = async () => {
  try {
     const token = localStorage.getItem('auth');
    const response = await fetch(`http://localhost:8000/api/admin/envios/${selectedEnvio.value.id}`, {
      method: 'PUT',
      headers: {
         'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    });
    
    if (response.ok) {
      Swal.fire({
        title: '¡Éxito!',
        text: 'El estado del envío se actualizó correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      
      await fetchEnvios();
      closeModal();
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el envío.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  } catch (error) {
    console.error('Error updating envio:', error);
    Swal.fire({
      title: 'Error',
      text: 'Hubo un problema al realizar la solicitud.',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
};

// Función para descargar PDF del envío
const downloadPdf = async (envioId) => {
  try {
    const token = localStorage.getItem('auth');
    // Mostrar carga mientras se genera el PDF
    Swal.fire({
      title: 'Generando PDF',
      html: 'Por favor espere mientras se genera el documento...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Hacer la solicitud al endpoint del PDF
    const response = await fetch(`http://localhost:8000/api/admin/envios/${envioId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error('Error al generar el PDF');
    }

    // Obtener el blob del PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Crear un enlace temporal para descargar el PDF
    const a = document.createElement('a');
    a.href = url;
    a.download = `envio_${envioId}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Cerrar el loading
    Swal.close();
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo generar el PDF del envío',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
};

const getStatusClass = (status) => {
  const classes = {
    pendiente: 'bg-secondary',
    enviado: 'bg-primary',
    entregado: 'bg-success',
  };
  return `badge ${classes[status] || 'bg-warning'} text-white`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guayaquil',
  }).format(date);
};

const formatEstado = (estado) => {
  const estados = {
    pendiente: 'Pendiente',
    enviado: 'Enviado',
    entregado: 'Entregado',
   
  };
  return estados[estado] || estado;
};

onMounted(() => {
  fetchEnvios();
});

// Paginación y filtrado
const currentPage = ref(1);
const searchQuery = ref('');
const sortBy = ref('id');
const sortOrder = ref('desc');

const startIndex = computed(() => (currentPage.value - 1) * 15);
const endIndex = computed(() => Math.min(startIndex.value + 15, envios.value.length));

const filteredEnvios = computed(() => {
  let filtered = envios.value;

  // Filtrado por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(envio => {
      const userName = envio.usuario.nombre.toLowerCase();
      const ciudad = envio.ciudad_destino.toLowerCase();
      return userName.includes(query) || 
             ciudad.includes(query) ||
             envio.orden_id.toString().includes(query);
    });
  }

  // Ordenamiento
  if (sortBy.value) {
    filtered = filtered.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy.value === 'id') {
        valueA = a.id;
        valueB = b.id;
      } else if (sortBy.value === 'fecha') {
        valueA = new Date(a.fecha_creacion);
        valueB = new Date(b.fecha_creacion);
      } else if (sortBy.value === 'orden') {
        valueA = a.orden_id;
        valueB = b.orden_id;
      }

      if (sortOrder.value === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }

  return filtered;
});

const paginatedEnvios = computed(() => {
  return filteredEnvios.value.slice(startIndex.value, endIndex.value);
});
</script>

<template>
  <div class="container-fluid position-relative">
    <div class="container-fluid position-relative">
      <h2 class="mb-4">Gestión de Envíos</h2>

      <!-- Filtros y ordenamiento -->
      <div class="row mb-3">
        <div class="col-md-6">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar por cliente, ciudad o ID..." 
            v-model="searchQuery" 
          />
        </div>
        <div class="col-md-3">
          <select class="form-control" v-model="sortBy">
            <option value="id">Ordenar por ID</option>
            <option value="orden">Ordenar por Nº Orden</option>
            <option value="fecha">Ordenar por Fecha</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-control" v-model="sortOrder">
            <option value="desc">Más reciente primero</option>
            <option value="asc">Más antiguo primero</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th class="fw-bold">Nº</th>
                  <th class="fw-bold">Orden ID</th>
                  <th class="fw-bold">Cliente</th>
                  <th class="fw-bold">Tipo de Envío</th>
                  <th class="fw-bold">Ciudad Destino</th>
                  <th class="fw-bold">Costo Envío</th>
                  <th class="fw-bold">Estado</th>
                  <th class="fw-bold">Fecha Creación</th>
                  <th class="fw-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <!-- Mensaje cuando no hay resultados -->
                <tr v-if="paginatedEnvios.length === 0">
                  <td colspan="9" class="text-center text-muted py-4">
                    No se encontraron envíos que coincidan con la búsqueda.
                  </td>
                </tr>

                <!-- Filas de envíos -->
                <tr v-for="(envio, index) in paginatedEnvios" :key="envio.id">
                  <td class="text-center">{{ startIndex + index + 1 }}</td>
                  <td class="text-center">#{{ envio.orden_id }}</td>
                  <td>
                    <div class="d-flex flex-column">
                      <span>{{ envio.usuario.nombre }}</span>
                      <small class="text-muted">{{ envio.usuario.email }}</small>
                    </div>
                  </td>
                  <td class="text-center">{{ envio.tipo_envio }}</td>
                  <td class="text-center">{{ envio.ciudad_destino }}</td>
                  <td class="text-center">${{ envio.costo_envio }}</td>
                  <td class="text-center">
                    <span :class="getStatusClass(envio.estado_envio)">
                      {{ formatEstado(envio.estado_envio) }}
                    </span>
                  </td>
                  <td class="text-center">{{ formatDate(envio.fecha_creacion) }}</td>
                  <td>
                    <div class="d-flex justify-content-start gap-2">
                      <button 
                        class="btn btn-warning btn-sm" 
                        @click="openModal(envio)"
                        title="Editar estado"
                      >
                        <i class="material-icons">edit</i>
                      </button>
                      <button 
                        class="btn btn-danger btn-sm" 
                        @click="downloadPdf(envio.id)"
                        title="Descargar PDF"
                      >
                        <i class="material-icons">picture_as_pdf</i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay text-dark">
        <div class="modal-container">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title px-2">Detalle del Envío #{{ selectedEnvio?.id }}</h4>
            </div>

            <div class="modal-body px-4 py-4 ">
              <!-- Order Summary -->
              <div class="order-summary mb-4">
                <h5>Información General</h5>
                <div class="info-grid">
                  <p><strong>Orden ID:</strong> #{{ selectedEnvio?.orden_id }}</p>
                  <p><strong>Cliente:</strong> {{ selectedEnvio?.usuario.nombre }} ({{ selectedEnvio?.usuario.email }})</p>
                  <p><strong>Tipo de Envío:</strong> {{ selectedEnvio?.tipo_envio }}</p>
                  <p><strong>Ciudad Destino:</strong> {{ selectedEnvio?.ciudad_destino }}</p>
                  <p><strong>Costo Envío:</strong> ${{ selectedEnvio?.costo_envio }}</p>
                  <p><strong>Fecha Creación:</strong> {{ formatDate(selectedEnvio?.fecha_creacion) }}</p>
                </div>
              </div>

              <!-- Update Form -->
              <form @submit.prevent="updateEnvio" class="update-form">
                <div class="form-group mb-3">
                  <label for="estado_envio">Estado del Envío</label>
                  <select
                    v-model="editForm.estado_envio"
                    id="estado_envio"
                    class="form-control"
                  >
                    <option 
                      v-for="option in estadoEnvioOptions" 
                      :key="option" 
                      :value="option"
                    >
                      {{ formatEstado(option) }}
                    </option>
                  </select>
                </div>
                
                <div class="modal-footer">
                  <button
                    type="submit"
                    class="btn btn-success me-2"
                  >
                    Actualizar
                  </button>
                  <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Pagination 
      :totalItems="envios.length" 
      :itemsPerPage="15" 
      :currentPage="currentPage" 
      @update:currentPage="currentPage = $event" 
    />
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  max-width: 800px;
  width: 90%;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 500;
  border-radius: 0.25rem;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    width: 95%;
  }
}
</style>