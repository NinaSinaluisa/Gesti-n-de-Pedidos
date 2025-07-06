<script setup>
import { ref, onMounted, computed } from 'vue';
import User from '../../apis/User';
import { IMAGE_BASE_URL } from '@/apis/Api';
import Pagination from '@/components/admin/Pagination.vue';
import Swal from 'sweetalert2';


const orders = ref([]);
const users = ref([]);
const selectedOrder = ref(null);
const showModal = ref(false);
const editForm = ref({
  estado: '',
  estado_pago: ''
});

const estadoOptions = ['Pagado', 'Entregando', 'Atrasado'];
const estadoPagoOptions = ['pendiente', 'completado'];

const getTallas = (tallas) => tallas.map(talla => talla.nombre).join(', ');
const getColorName = (color) => (color && color.nombre) || 'Sin color';

const fetchOrders = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/public/ordenes');
    const data = await response.json();
    orders.value = data.ordenes || [];
    console.log('Órdenes cargadas:', orders.value); // Para debugging
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

const fetchUsers = async () => {
  try {
    users.value = await User.fetchUsuarios();
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId);
  return user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado';
};

const openModal = (order) => {
  console.log('Orden seleccionada:', order); // Para debugging
  selectedOrder.value = order;
  editForm.value = {
    estado: order.estado,
    estado_pago: order.estado_pago
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedOrder.value = null;
};



const updateOrder = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/public/ordenes/${selectedOrder.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    });
    
    if (response.ok) {
      // Mostrar alerta de éxito
      Swal.fire({
        title: '¡Éxito!',
        text: 'La orden se actualizó correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      
      await fetchOrders(); // Actualizar la lista de órdenes
      closeModal(); // Cerrar el modal
    } else {
      // Mostrar alerta de error en caso de que la respuesta no sea OK
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar la orden.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  } catch (error) {
    // Mostrar alerta de error en caso de error al realizar la solicitud
    console.error('Error updating order:', error);
    Swal.fire({
      title: 'Error',
      text: 'Hubo un problema al realizar la solicitud.',
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
};


const getStatusClass = (status) => {
  const classes = {
  Pagado: 'bg-success',
  Entregando: 'bg-primary',
  Atrasado: 'bg-danger',
    
  };
  return `badge ${classes[status] || 'bg-secondary'} text-white`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';

  // Crear un objeto de fecha a partir de la cadena de fecha
  let date = new Date(dateString);

  // Sumar un día
  date.setDate(date.getDate() + 1);

  // Formatear la fecha con el ajuste de zona horaria adecuado
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Guayaquil',  // Zona horaria explícita
  }).format(date);
};


const getTallaName = (talla_id, detalleProducto) => {
  const talla = detalleProducto.tallas.find(t => t.id === talla_id);
  return talla ? talla.nombre : 'N/A';
};

onMounted(() => {
  fetchOrders();
  fetchUsers();
});

const currentPage = ref(1);

const startIndex = computed(() => (currentPage.value - 1) * 15);
const endIndex = computed(() => Math.min(startIndex.value + 15, orders.value.length));



// const calculateIndex = (index) => {
//   return startIndex.value + index + 1;  
// };

const searchQuery = ref('');
const sortBy = ref('id');
const sortOrder = ref('asc');

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Filtrado por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => {
      const userName = getUserName(order.usuario_id).toLowerCase();
      return userName.includes(query) || order.id.toString().includes(query);
    });
  }

  // Ordenamiento
  if (sortBy.value) {
    filtered = filtered.sort((a, b) => {
      let valueA, valueB;
      if (sortBy.value === 'id') {
        valueA = a.id;
        valueB = b.id;
      } else if (sortBy.value === 'monto_total') {
        valueA = parseFloat(a.monto_total); // Convertir a número
        valueB = parseFloat(b.monto_total); // Convertir a número
      } else if (sortBy.value === 'fecha_entrega') {
        valueA = new Date(a.fecha_entrega);
        valueB = new Date(b.fecha_entrega);
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

const paginatedCategories = computed(() => {
  return filteredOrders.value.slice(startIndex.value, endIndex.value);
});


const addOneDay = (dateString) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1); 
  return date;
};

// Función para verificar si la fecha de entrega es hoy
const isDeliveryToday = (deliveryDate) => {
  const today = new Date();
  const delivery = addOneDay(deliveryDate); 

  const isToday =
    today.getFullYear() === delivery.getFullYear() &&
    today.getMonth() === delivery.getMonth() &&
    today.getDate() === delivery.getDate();

  return isToday;
};

// Computed property para deshabilitar el botón de actualización
const isUpdateDisabled = computed(() => {
  if (!selectedOrder.value) {
    console.log('No hay orden seleccionada. Botón deshabilitado.');
    return true; // Si no hay orden seleccionada, deshabilitar
  }

  const isEntregado = selectedOrder.value.estado === 'Entregado';
  const isEntregando = selectedOrder.value.estado === 'Entregando'; 
  
  // Deshabilitar si el estado es "Entregado" o "Entregando"
  if (isEntregado || isEntregando) {
    return true;
  }

  // Si no es "Entregado" ni "Entregando", habilitar solo si la fecha de entrega es hoy
  const isToday = isDeliveryToday(selectedOrder.value.fecha_entrega);
 
  if (!isToday) {
    console.log('La fecha de entrega no es hoy. Botón deshabilitado.');
  } else {
    console.log('La fecha de entrega es hoy. Botón habilitado.');
  }

  return !isToday;
});

// Computed property para deshabilitar los inputs de Estado y Estado de pago
const areInputsDisabled = computed(() => {
  if (!selectedOrder.value) return true; // Si no hay orden seleccionada, deshabilitar

  const isEntregado = selectedOrder.value.estado === 'Entregado';
  const isEntregando = selectedOrder.value.estado === 'Entregando';

  // Deshabilitar inputs si el estado es "Entregado" o "Entregando"
  return isEntregado || isEntregando;
});

const totalSubtotales = computed(() => {
  if (!selectedOrder.value?.detalles_con_tallas_y_colores) return 0;
  
  return selectedOrder.value.detalles_con_tallas_y_colores.reduce(
    (total, item) => total + parseFloat(item.subtotal), 0
  ).toFixed(2);
});

</script>

<template>
  <div class="container-fluid position-relative">
      <div class="container-fluid position-relative">
          <h2 class="mb-4">Gestión de Órdenes</h2>

          <!-- Filtros y ordenamiento -->
          <div class="row mb-3">
              <div class="col-md-6">
                  <input type="text" class="form-control" placeholder="Buscar por cliente o ID..." v-model="searchQuery" />
              </div>
              <div class="col-md-3">
                  <select class="form-control" v-model="sortBy">
                      <option value="id">Ordenar por ID</option>
                      <option value="monto_total">Ordenar por Monto</option>
                      <option value="fecha_entrega">Ordenar por Fecha de Entrega</option>
                  </select>
              </div>
              <div class="col-md-3">
                  <select class="form-control" v-model="sortOrder">
                      <option value="asc">Ascendente</option>
                      <option value="desc">Descendente</option>
                  </select>
              </div>
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
                              <!-- Cambiado de "ID" a "Nº" -->
                              <th class="fw-bold">Cliente</th>
                              <th class="fw-bold">Monto Total</th>
                              <th class="fw-bold">Fecha Entrega</th>
                              <th class="fw-bold">Estado</th>
                              <th class="fw-bold">Estado Pago</th>
                              <th class="fw-bold">Fecha Creación</th>
                              <th class="fw-bold">Acciones</th>
                          </tr>
                      </thead>
                      <tbody>
                          <!-- Mensaje cuando no hay resultados -->
                          <tr v-if="paginatedCategories.length === 0">
                              <td colspan="8" class="text-center text-muted py-4">
                                  No se encontraron órdenes que coincidan con la búsqueda.
                              </td>
                          </tr>

                          <!-- Filas de órdenes -->
                          <tr v-for="(order, index) in paginatedCategories" :key="order.id">
                              <!-- Numeración secuencial -->
                              <td class="text-center">{{ startIndex + index + 1 }}</td>
                              <td class="text-center">{{ getUserName(order.usuario_id) }}</td>
                              <td class="text-center">${{ order.monto_total }}</td>
                              <td class="text-center">{{ formatDate(order.fecha_entrega) }}</td>
                              <td class="text-center">
                                  <span :class="getStatusClass(order.estado)">{{ order.estado }}</span>
                              </td>
                              <td class="text-center">
                                  <span :class="getStatusClass(order.estado_pago)">{{ order.estado_pago }}</span>
                              </td>
                              <!-- <td class="text-center">{{ formatDate(order.created_at) }}</td> -->
                              <td class="text-center">{{ formatDate(new Date(order.created_at).setDate(new Date(order.created_at).getDate() - 1)) }}</td>

                              <td>
                                  <div class="d-flex justify-content-start gap-2">
                                      <button class="btn btn-primary btn-sm" @click="openModal(order)">
                                          <i class="material-icons">visibility</i>
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
      <div v-if="showModal" class="modal-overlay">
          <div class="modal-container">
              <div class="modal-content">
                  <div class="modal-header">
                      <h4 class="modal-title">Detalle de la Orden #{{ selectedOrder?.id }}</h4>
                      <button type="button" class="btn-close" @click="closeModal"></button>
                  </div>

                  <div class="modal-body">
                      <!-- Order Summary -->
                      <div class="order-summary mb-4">
                          <h5>Información General</h5>
                          <div class="info-grid">
                            <p><strong>Cliente:</strong> {{ getUserName(selectedOrder?.usuario_id) }}</p>
                            <div class="total-with-shipping">
                                <p><strong>Monto Total:</strong> ${{ selectedOrder?.monto_total }}</p>
                                <p class="shipping-note text-muted small">Precio final con envío</p>
                            </div>
                            <p><strong>Fecha de Entrega:</strong> {{ formatDate(selectedOrder?.fecha_entrega) }}</p>
                            <p><strong>Fecha de Creación:</strong> {{ formatDate(new Date(selectedOrder?.created_at).setDate(new Date(selectedOrder?.created_at).getDate() - 1)) }}</p>
                        </div>
                      </div>

                      <!-- Order Items -->
                      <div class="order-items mb-4">
                          <h5>Productos</h5>
                          <div v-if="selectedOrder?.detalles_con_tallas_y_colores" class="table-responsive">
                              <table class="table table-bordered">
                                  <thead>
                                      <tr>
                                          <th>Imagen</th>
                                          <th>Color</th>
                                          <th>Talla</th>
                                          <th>Cantidad</th>
                                          <th>Precio Unit.</th>
                                          <th>Desc.</th>
                                          <th>P Final.</th>
                                          <th>Subtotal</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      <tr v-for="detalle in selectedOrder.detalles_con_tallas_y_colores" :key="detalle.id">
                                          <td>
                                              <img :src="`${IMAGE_BASE_URL}/${detalle.detalle_producto.imagen_url}`" alt="Producto" class="product-thumbnail" />
                                          </td>
                                          <td>{{ getColorName(detalle.detalle_producto.color) }}</td>
                                          <td>{{ getTallaName(detalle.talla_id, detalle.detalle_producto) }}</td>
                                          <td>{{ detalle.cantidad }}</td>
                                          <td>${{ detalle.precio_base }}</td>
                                          <td>${{ detalle.descuento_unitario }}</td>
                                          <td>${{ detalle.precio_unitario }}</td>
                                          <td>${{ detalle.subtotal }}</td>
                                      </tr>
                                       <tr class="total-row">
                                          <td colspan="7" class="text-end fw-bold">Total Productos:</td>
                                          <td class="fw-bold">${{ totalSubtotales }}</td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      <!-- Update Form -->
                      <form @submit.prevent="updateOrder" class="update-form">
                          <div class="form-group mb-3">
                            <label for="estado">Estado</label>
                            <select
                              v-model="editForm.estado"
                              id="estado"
                              class="form-control"
                              :disabled="areInputsDisabled" 
                            >
                              <option v-for="option in estadoOptions" :key="option" :value="option">
                                {{ option }}
                              </option>
                            </select>
                          </div>
                          <div class="form-group mb-3">
                            <label for="estado_pago">Estado Pago</label>
                            <select
                              v-model="editForm.estado_pago"
                              id="estado_pago"
                              class="form-control"
                              :disabled="areInputsDisabled"
                            >
                              <option v-for="option in estadoPagoOptions" :key="option" :value="option">
                                {{ option }}
                              </option>
                            </select>
                          </div>
                          <div class="modal-footer">
                            <button
                              type="submit"
                              class="btn btn-success"
                              :disabled="isUpdateDisabled"
                            >
                              Actualizar
                            </button>
                            <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
                          </div>
                          <div v-if="isUpdateDisabled" class="text-muted mt-2">
                            <small>
                              {{
                                editForm.estado === 'Entregado' || editForm.estado === 'Entregando'
                                  ? 'La orden ya fue entregada o está en proceso de entrega. Ya no se puede modificar.'
                                  : 'El botón de actualización estará disponible el día de la entrega.'
                              }}
                            </small>
                          </div>
                        </form>
                  </div>
              </div>
          </div>
      </div>
  </div>
  <Pagination :totalItems="orders.length" :itemsPerPage="15" :currentPage="currentPage" @update:currentPage="currentPage = $event" />
</template>


<style scoped>

.total-row {
    background-color: #f8f9fa;
    border-top: 2px solid #dee2e6;
}

.total-row td {
    padding-top: 12px;
    padding-bottom: 12px;
}

.shipping-note {
    color: #555555;
    font-size: 0.9em;
    margin: -0.8em 0 1em 0; /* Ajusta según necesidad */
    padding-left: 0.5em; /* Para alinear con el grid */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-content {
  overflow-y: auto;
  max-height: calc(90vh - 2rem);
  padding: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.update-form {
  margin-top: 1rem;
}

.badge {
  padding: 0.5em 1em;
}

table {
  margin-bottom: 0;
}

.table-responsive {
  margin-bottom: 1rem;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  padding: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 0.7;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-sm .material-icons {
  font-size: 28px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
</style>