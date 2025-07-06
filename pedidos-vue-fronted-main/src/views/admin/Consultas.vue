<template>
  <div class="container-fluid py-4" style="background-color: #f8f9fa; min-height: 100vh;">
    <!-- Header con estadísticas -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-center align-items-center text-center mb-3" style="margin-top: -30px;">
            <h2 class="text-black mb-0">
                Gestión de Consultas
            </h2>
        </div>

        
        <!-- Estadísticas -->
        <div class="row">
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="mb-1">{{ totalConsultas }}</h4>
                    <p class="mb-0">Total</p>
                  </div>
                  <i class="material-icons" style="font-size: 2.5rem; opacity: 0.7;">inbox</i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="mb-1">{{ consultasNoLeidas }}</h4>
                    <p class="mb-0">No Leídas</p>
                  </div>
                  <i class="material-icons" style="font-size: 2.5rem; opacity: 0.7;">mail</i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="mb-1">{{ consultasLeidas }}</h4>
                    <p class="mb-0">Leídas</p>
                  </div>
                  <i class="material-icons" style="font-size: 2.5rem; opacity: 0.7;">mark_email_read</i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="mb-1">{{ consultasHoy }}</h4>
                    <p class="mb-0">Hoy</p>
                  </div>
                  <i class="material-icons" style="font-size: 2.5rem; opacity: 0.7;">today</i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text">
                      <i class="material-icons">search</i>
                    </span>
                  </div>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Buscar por nombre, email o mensaje..."
                    v-model="filtros.busqueda"
                    @input="filtrarConsultas"
                  >
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <select 
                  class="form-control" 
                  v-model="filtros.estado"
                  @change="filtrarConsultas"
                >
                  <option value="">Todos los estados</option>
                  <option value="leida">Leídas</option>
                  <option value="no_leida">No leídas</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <select 
                  class="form-control" 
                  v-model="filtros.orden"
                  @change="filtrarConsultas"
                >
                  <option value="desc">Más recientes</option>
                  <option value="asc">Más antiguos</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Cargando consultas...</p>
    </div>

    <!-- Lista de consultas -->
    <div v-else-if="consultasFiltradas.length > 0" class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="material-icons align-middle mr-2">list</i>
              Consultas ({{ consultasFiltradas.length }})
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="thead-light">
                  <tr>
                    <th width="5%">Estado</th>
                    <th width="20%">Nombre</th>
                    <th width="20%">Email</th>
                    <th width="15%">Teléfono</th>
                    <th width="25%">Mensaje</th>
                    <th width="10%">Fecha</th>
                    <th width="5%">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="consulta in consultasFiltradas" 
                    :key="consulta.id"
                    :class="{ 'table-warning': !consulta.leido }"
                  >
                    <td class="text-center">
  <span 
    :class="consulta.leido ? 'badge badge-success px-2 py-1 text-white' : 'badge badge-warning px-2 py-1 text-dark'"
    style="font-size: 0.75rem;"
  >
    <i class="material-icons mr-1" style="font-size: 12px;">
      {{ consulta.leido ? 'mark_email_read' : 'mail' }}
    </i>
    {{ consulta.leido ? 'Leída' : 'Nueva' }}
  </span>
</td>
                    <td>
                      <strong>{{ consulta.nombre_completo }}</strong>
                    </td>
                    <td>
                      <a :href="'mailto:' + consulta.correo_electronico" class="text-primary">
                        {{ consulta.correo_electronico }}
                      </a>
                    </td>
                    <td>
                      <a :href="'tel:' + consulta.telefono" class="text-success">
                        {{ consulta.telefono }}
                      </a>
                    </td>
                    <td>
                      <span 
                        :title="consulta.mensaje"
                        style="cursor: help;"
                      >
                        {{ truncarTexto(consulta.mensaje, 50) }}
                      </span>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ formatearFecha(consulta.created_at) }}
                      </small>
                    </td>
                    <td>
                      <div class="d-flex gap-1 justify-content-center">
                        <button 
                          class="btn btn-outline-primary btn-sm"
                          @click="verDetalles(consulta)"
                          title="Ver detalles"
                        >
                          <i class="material-icons" style="font-size: 16px;">visibility</i>
                        </button>
                        <button 
                          v-if="!consulta.leido"
                          class="btn btn-outline-success btn-sm ml-1"
                          @click="marcarComoLeida(consulta.id)"
                          title="Marcar como leída"
                        >
                          <i class="material-icons" style="font-size: 16px;">mark_email_read</i>
                        </button>
                        <button 
                          class="btn btn-outline-danger btn-sm ml-1"
                          @click="confirmarEliminar(consulta)"
                          title="Eliminar"
                        >
                          <i class="material-icons" style="font-size: 16px;">delete</i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else class="text-center py-5">
      <div class="card shadow-sm">
        <div class="card-body py-5">
          <i class="material-icons text-muted mb-3" style="font-size: 4rem;">inbox</i>
          <h4 class="text-muted">No hay consultas</h4>
          <p class="text-muted">
            {{ filtros.busqueda || filtros.estado ? 'No se encontraron consultas con los filtros aplicados.' : 'No se han recibido consultas aún.' }}
          </p>
          <button 
            v-if="filtros.busqueda || filtros.estado"
            class="btn btn-primary"
            @click="limpiarFiltros"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div 
      class="modal fade" 
      id="modalDetalles" 
      tabindex="-1" 
      role="dialog"
      ref="modalDetalles"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="material-icons align-middle mr-2">contact_support</i>
              Detalles de la Consulta
            </h5>
            <button type="button" class="close  btn btn-danger" @click="cerrarModal">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body" v-if="consultaSeleccionada">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="font-weight-bold text-muted">Nombre Completo:</label>
                <p class="mb-0">{{ consultaSeleccionada.nombre_completo }}</p>
              </div>
             
              <div class="col-md-6 mb-3">
                <label class="font-weight-bold text-muted">Correo Electrónico:</label>
                <p class="mb-0">
                  <a :href="'mailto:' + consultaSeleccionada.correo_electronico" class="text-primary">
                    {{ consultaSeleccionada.correo_electronico }}
                  </a>
                </p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="font-weight-bold text-muted">Teléfono:</label>
                <p class="mb-0">
                  <a :href="'tel:' + consultaSeleccionada.telefono" class="text-success">
                    {{ consultaSeleccionada.telefono }}
                  </a>
                </p>
              </div>
              <div class="col-12 mb-3">
                <label class="font-weight-bold text-muted">Mensaje:</label>
                <div class="card bg-light">
                  <div class="card-body">
                    <p class="mb-0">{{ consultaSeleccionada.mensaje }}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="font-weight-bold text-muted">Fecha de Creación:</label>
                <p class="mb-0">{{ formatearFecha(consultaSeleccionada.created_at) }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="font-weight-bold text-muted">Última Actualización:</label>
                <p class="mb-0">{{ formatearFecha(consultaSeleccionada.updated_at) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button 
              v-if="consultaSeleccionada && !consultaSeleccionada.leido"
              type="button" 
              class="btn btn-success"
              @click="marcarComoLeida(consultaSeleccionada.id)"
            >
              <i class="material-icons mr-1" style="font-size: 18px;">mark_email_read</i>
              Marcar como Leída
            </button>
            <button 
              type="button" 
              class="btn btn-danger"
              @click="confirmarEliminar(consultaSeleccionada)"
            >
              <i class="material-icons mr-1" style="font-size: 18px;">delete</i>
              Eliminar
            </button>
            <button type="button" class="btn btn-secondary" @click="cerrarModal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from "sweetalert2"; 


// Estado reactivo
const consultas = ref([])
const consultaSeleccionada = ref(null)
const loading = ref(false)
const filtros = ref({
  busqueda: '',
  estado: '',
  orden: 'desc'
})

// URL base de la API
const API_BASE = 'http://localhost:8000/api/consultas'

// Referencias para el modal
const modalDetalles = ref(null)

// Computed properties
const totalConsultas = computed(() => consultas.value.length)
const consultasNoLeidas = computed(() => consultas.value.filter(c => !c.leido).length)
const consultasLeidas = computed(() => consultas.value.filter(c => c.leido).length)
const consultasHoy = computed(() => {
  const hoy = new Date().toDateString()
  return consultas.value.filter(c => new Date(c.created_at).toDateString() === hoy).length
})

const consultasFiltradas = computed(() => {
  let resultado = [...consultas.value]

  // Filtro por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(consulta =>
      consulta.nombre_completo.toLowerCase().includes(busqueda) ||
      consulta.correo_electronico.toLowerCase().includes(busqueda) ||
      consulta.mensaje.toLowerCase().includes(busqueda)
    )
  }

  // Filtro por estado
  if (filtros.value.estado) {
    resultado = resultado.filter(consulta => {
      if (filtros.value.estado === 'leida') return consulta.leido
      if (filtros.value.estado === 'no_leida') return !consulta.leido
      return true
    })
  }

  // Ordenamiento
  resultado.sort((a, b) => {
    const fechaA = new Date(a.created_at)
    const fechaB = new Date(b.created_at)
    return filtros.value.orden === 'desc' ? fechaB - fechaA : fechaA - fechaB
  })

  return resultado
})

// Métodos
const cargarConsultas = async () => {
  loading.value = true
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) throw new Error('Error al cargar consultas')
    consultas.value = await response.json()
  } catch (error) {
    console.error('Error:', error)
    mostrarError('Error al cargar las consultas')
  } finally {
    loading.value = false
  }
}

const marcarComoLeida = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/${id}/leida`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) throw new Error('Error al marcar como leída')
    
    // Actualizar en el estado local
    const index = consultas.value.findIndex(c => c.id === id)
    if (index !== -1) {
      consultas.value[index].leido = true
    }
    
    // Si hay una consulta seleccionada, actualizarla también
    if (consultaSeleccionada.value && consultaSeleccionada.value.id === id) {
      consultaSeleccionada.value.leido = true
    }
    
    mostrarExito('Consulta marcada como leída')
  } catch (error) {
    console.error('Error:', error)
    mostrarError('Error al marcar la consulta como leída')
  }
}

const eliminarConsulta = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Error al eliminar consulta')
    
    // Remover del estado local
    consultas.value = consultas.value.filter(c => c.id !== id)
    
    // Cerrar modal si está abierto
    cerrarModal()
    
    mostrarExito('Consulta eliminada correctamente')
  } catch (error) {
    console.error('Error:', error)
    mostrarError('Error al eliminar la consulta')
  }
}

const verDetalles = (consulta) => {
  consultaSeleccionada.value = consulta
  mostrarModal()
}

const mostrarModal = () => {
  if (window.jQuery) {
    window.jQuery('#modalDetalles').modal('show')
  } else {
    // Fallback para mostrar modal sin jQuery
    const modal = document.getElementById('modalDetalles')
    if (modal) {
      modal.style.display = 'block'
      modal.classList.add('show')
      document.body.classList.add('modal-open')
    }
  }
}

const cerrarModal = () => {
  if (window.jQuery) {
    window.jQuery('#modalDetalles').modal('hide')
  } else {
    // Fallback para cerrar modal sin jQuery
    const modal = document.getElementById('modalDetalles')
    if (modal) {
      modal.style.display = 'none'
      modal.classList.remove('show')
      document.body.classList.remove('modal-open')
    }
  }
}

const confirmarEliminar = (consulta) => {
  if (Swal) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la consulta de ${consulta.nombre_completo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarConsulta(consulta.id)
      }
    })
  } else {
    if (confirm(`¿Estás seguro de eliminar la consulta de ${consulta.nombre_completo}?`)) {
      eliminarConsulta(consulta.id)
    }
  }
}

const filtrarConsultas = () => {
  // Los computed properties se actualizan automáticamente
}

const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    estado: '',
    orden: 'desc'
  }
}

const truncarTexto = (texto, limite) => {
  if (texto.length <= limite) return texto
  return texto.substring(0, limite) + '...'
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const mostrarExito = (mensaje) => {
  if (Swal) {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: mensaje,
      timer: 2000,
      showConfirmButton: false
    })
  } else {
    alert(mensaje)
  }
}

const mostrarError = (mensaje) => {
  if (Swal) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    })
  } else {
    alert(mensaje)
  }
}

// Lifecycle
onMounted(() => {
  cargarConsultas()
})
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.075);
}

.card {
  border: none;
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
}

.d-flex.gap-1 {
  gap: 0.25rem;
}

.badge {
  display: inline-flex;
  align-items: center;
}

.text-white {
  color: white !important;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
.badge-success {
  background-color: #28a745 !important;
}

.badge-warning {
  background-color: #ffc107 !important;
}

/* Asegurar contraste en los badges */
.badge-success, 
.badge-success .material-icons {
  color: white !important;
}

.badge-warning, 
.badge-warning .material-icons {
  color: #212529 !important;
}

/* Resto de tus estilos existentes... */
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.075);
}



.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
}

.d-flex.gap-1 {
  gap: 0.25rem;
}

.badge {
  display: inline-flex;
  align-items: center;
}

.text-white {
  color: white !important;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.material-icons {
  vertical-align: middle;
}

.table td {
  vertical-align: middle;
}

.bg-primary {
  background: linear-gradient(45deg, #007bff, #0056b3) !important;
}

.bg-success {
  background: linear-gradient(45deg, #28a745, #1e7e34) !important;
}

.bg-warning {
  background: linear-gradient(45deg, #ffc107, #e0a800) !important;
}

.bg-info {
  background: linear-gradient(45deg, #17a2b8, #138496) !important;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
  }
  
  .material-icons {
    font-size: 16px;
  }
}


@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
  }
  
  .material-icons {
    font-size: 16px;
  }
}
</style>
