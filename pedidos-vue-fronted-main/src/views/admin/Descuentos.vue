<template>
  <div class="container mt-3">
    <div class="admin-container">
      <h3 class="text-center">Administración de Descuentos</h3>

      <!-- Botón para añadir descuento -->
      <button
        type="button"
        class="btn btn-primary mb-3 d-flex align-items-center gap-2"
        data-bs-toggle="modal"
        data-bs-target="#descuentoModal"
        @click="clearForm"
      >
        <span class="material-icons">add</span>
        Añadir Descuento
      </button>

      <!-- Tabla de descuentos -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th class="fw-bold">Nº</th>
                  <th class="fw-bold">Nombre</th>
                  <th class="fw-bold">Tipo</th>
                  <th class="fw-bold">Valor</th>
                  <th class="fw-bold">Aplica desde</th>
                  <th class="fw-bold">Estado</th>
                  <th class="fw-bold">Fecha Inicio</th>
                  <th class="fw-bold">Fecha Fin</th>
                  <th class="fw-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(descuento, index) in paginatedDescuentos" :key="descuento.id">
                  <td>{{ calculateIndex(index) }}</td>
                  <td>{{ descuento.nombre }}</td>
                  <td>{{ descuento.tipo }}</td>
                  
                  <td>{{ formatValue(descuento.valor, descuento.tipo) }}</td>
                  <td>{{ descuento.cantidad_minima }} unidades</td>
                  <td>
                    <span :class="getStatusClass(descuento.activo)">
                      {{ descuento.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>{{ formatDate(descuento.fecha_inicio, 'Sin fecha definida') }}</td>
                  <td>{{ formatDate(descuento.fecha_fin, 'Sin fecha definida') }}</td>
                  <td>
                    <div class="d-flex justify-content-start gap-2">
                      <!-- Botón para editar -->
                      <button
                        class="btn btn-warning btn-sm d-flex align-items-center"
                        data-bs-toggle="modal"
                        data-bs-target="#descuentoModal"
                        @click="editDescuento(descuento)"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                      <!-- Botón para eliminar -->
                      <button
                        class="btn btn-danger btn-sm d-flex align-items-center"
                        @click="deleteDescuento(descuento.id)"
                      >
                        <span class="material-icons">delete</span>
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

    <!-- Modal para añadir o editar descuento -->
    <div class="modal fade" id="descuentoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ currentEditId ? 'Editar Descuento' : 'Registrar Nuevo Descuento' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="registerOrUpdate">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input
                    type="text"
                    v-model="form.nombre"
                    id="nombre"
                    class="form-control"
                    :class="{ 'is-invalid': errors.nombre }"
                  />
                  <div class="invalid-feedback" v-if="errors.nombre">
                    {{ errors.nombre[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="descripcion" class="form-label">Descripción</label>
                  <input
                    type="text"
                    v-model="form.descripcion"
                    id="descripcion"
                    class="form-control"
                    :class="{ 'is-invalid': errors.descripcion }"
                  />
                  <div class="invalid-feedback" v-if="errors.descripcion">
                    {{ errors.descripcion[0] }}
                  </div>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="tipo" class="form-label">Tipo</label>
                  <select
                    v-model="form.tipo"
                    id="tipo"
                    class="form-control"
                    :class="{ 'is-invalid': errors.tipo }"
                  >
                    <option value="porcentaje">Porcentaje</option>
                    <option value="monto_fijo">Monto Fijo</option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.tipo">
                    {{ errors.tipo[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="valor" class="form-label">Valor</label>
                  <input
                    type="number"
                    v-model="form.valor"
                    id="valor"
                    class="form-control"
                    :class="{ 'is-invalid': errors.valor }"
                  />
                  <div class="invalid-feedback" v-if="errors.valor">
                    {{ errors.valor[0] }}
                  </div>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="cantidad_minima" class="form-label">Cantidad Mínima</label>
                  <input
                    type="number"
                    v-model="form.cantidad_minima"
                    id="cantidad_minima"
                    class="form-control"
                    :class="{ 'is-invalid': errors.cantidad_minima }"
                  />
                  <div class="invalid-feedback" v-if="errors.cantidad_minima">
                    {{ errors.cantidad_minima[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="activo" class="form-label">Estado</label>
                  <select
                    v-model="form.activo"
                    id="activo"
                    class="form-control"
                    :class="{ 'is-invalid': errors.activo }"
                  >
                    <option :value="true">Activo</option>
                    <option :value="false">Inactivo</option>
                  </select>
                  <div class="invalid-feedback" v-if="errors.activo">
                    {{ errors.activo[0] }}
                  </div>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="fecha_inicio" class="form-label">Fecha Inicio</label>
                  <input
                    type="date"
                    v-model="form.fecha_inicio"
                    id="fecha_inicio"
                    class="form-control"
                    :class="{ 'is-invalid': errors.fecha_inicio }"
                  />
                  <div class="invalid-feedback" v-if="errors.fecha_inicio">
                    {{ errors.fecha_inicio[0] }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="fecha_fin" class="form-label">Fecha Fin</label>
                  <input
                    type="date"
                    v-model="form.fecha_fin"
                    id="fecha_fin"
                    class="form-control"
                    :class="{ 'is-invalid': errors.fecha_fin }"
                  />
                  <div class="invalid-feedback" v-if="errors.fecha_fin">
                    {{ errors.fecha_fin[0] }}
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Aplica a Todos los Productos</label>
                <select
                  v-model="form.aplica_todos_productos"
                  class="form-control"
                  :class="{ 'is-invalid': errors.aplica_todos_productos }"
                >
                  <option :value="true">Sí</option>
                  <option :value="false">No</option>
                </select>
                <div class="invalid-feedback" v-if="errors.aplica_todos_productos">
                  {{ errors.aplica_todos_productos[0] }}
                </div>
              </div>
              <div v-if="!form.aplica_todos_productos" class="mb-3">
                <label class="form-label">Seleccionar Productos</label>
                <div class="row" style="max-height: 400px; overflow-y: auto;">
                  <div v-for="producto in allProductos" :key="producto.id" class="col-md-4 mb-3">
                    <div class="card">
                      <img :src="`${IMAGE_BASE_URL}/${producto.imagen_url}`" class="card-img-top" alt="Producto">
                      <div class="card-body">
                        <h5 class="card-title">{{ producto.producto?.nombre || 'Nombre no disponible' }}</h5>
                        <p class="card-text">Color: <span :style="{ backgroundColor: producto.color?.codigo_hex || '#ccc' }" class="color-box"></span></p>
                        <input type="checkbox" :value="producto.id" v-model="form.detalles_productos">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-100">
                {{ currentEditId ? 'Actualizar' : 'Registrar' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Paginación -->
  <Pagination 
    :totalItems="descuentos.length" 
    :itemsPerPage="5" 
    :currentPage="currentPage"
    @update:currentPage="currentPage = $event"  
  />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { IMAGE_BASE_URL } from "@/apis/Api";

import axios from 'axios';
import Swal from 'sweetalert2';
import Pagination from '@/components/admin/Pagination.vue';

const descuentos = ref([]);
const allProductos = ref([]);
const currentEditId = ref(null);
const currentPage = ref(1);

const form = reactive({
  nombre: '',
  descripcion: '',
  tipo: 'porcentaje',
  valor: 0,
  activo: true,
  cantidad_minima: 0,
  aplica_todos_productos: true,
  fecha_inicio: '',
  fecha_fin: '',
  detalles_productos: [],
});

const errors = reactive({});

// Cargar descuentos desde API
const fetchDescuentos = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/descuentos');
    if (response.data.status === 'success') {
      descuentos.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al obtener descuentos:', error);
    Swal.fire('Error', 'No se pudieron cargar los descuentos', 'error');
  }
};

// Cargar todos los productos desde API
const fetchAllProductos = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/admin/detalle/all');
    if (response.data.status) {
      allProductos.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al obtener productos:', error);
    Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
  }
};

// Limpiar el formulario
const clearForm = () => {
  Object.assign(form, {
    nombre: '',
    descripcion: '',
    tipo: 'porcentaje',
    valor: 0,
    activo: false,
    cantidad_minima: 0,
    aplica_todos_productos: true,
    fecha_inicio: '',
    fecha_fin: '',
    detalles_productos: [],
  });
  currentEditId.value = null;
  Object.keys(errors).forEach(key => delete errors[key]);
};

// Cerrar el modal
const closeModal = () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById('descuentoModal'));
  if (modal) {
    modal.hide();
  }
};

// Registrar o actualizar descuento
const registerOrUpdate = async () => {
  try {
    if (currentEditId.value) {
      await axios.put(`http://localhost:8000/api/descuentos/${currentEditId.value}`, form);
      Swal.fire('Actualizado', 'El descuento ha sido actualizado', 'success');
    } else {
      await axios.post('http://localhost:8000/api/descuentos', form);
      Swal.fire('Registrado', 'El descuento ha sido registrado', 'success');
    }
    closeModal();
    await fetchDescuentos();
    clearForm();
  } catch (error) {
    console.error(error);
    if (error.response?.data?.errors) {
      Object.assign(errors, error.response.data.errors);
    } else {
      Swal.fire('Error', 'Hubo un problema al procesar la solicitud', 'error');
    }
  }
};

// Eliminar descuento
const deleteDescuento = async (id) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede revertir',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:8000/api/descuentos/${id}`);
      descuentos.value = descuentos.value.filter((descuento) => descuento.id !== id);
      Swal.fire('Eliminado', 'El descuento ha sido eliminado', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo eliminar el descuento', 'error');
    }
  }
};

// Editar descuento
const editDescuento = (descuento) => {
  clearForm();
  Object.assign(form, {
    ...descuento,
    detalles_productos: descuento.detalles_productos.map(p => p.id),
  });
  currentEditId.value = descuento.id;
};

// Paginación
const startIndex = computed(() => (currentPage.value - 1) * 5);
const endIndex = computed(() => Math.min(startIndex.value + 5, descuentos.value.length));
const paginatedDescuentos = computed(() => descuentos.value.slice(startIndex.value, endIndex.value));

// Calcular el índice real para la numeración de filas
const calculateIndex = (index) => startIndex.value + index + 1;

// Formatear valor según tipo
const formatValue = (valor, tipo) => {
  const numericValue = parseFloat(valor);
  return tipo === 'porcentaje' ? `${numericValue}%` : `$${numericValue.toFixed(2)}`;
};

// Formatear fecha con texto alternativo
const formatDate = (date, defaultText = 'Sin fecha definida') => {
  if (!date) return defaultText;
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Obtener clase de estado
const getStatusClass = (activo) => activo ? 'badge bg-success' : 'badge bg-danger';

// Cargar datos al montar el componente
onMounted(() => {
  fetchDescuentos();
  fetchAllProductos();
});
</script>

<style scoped>
.badge {
  padding: 0.5em 1em;
  border-radius: 0.25em;
}

.color-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.card-img-top {
  height: 150px;
  object-fit: cover;
}
</style>
