<template>
  <div class="container py-3 pedidos-page">
    <!-- Encabezado compacto -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="mb-0 page-title">
        <i class="material-icons mr-2">local_shipping</i>
        Mis Pedidos
      </h2>
      <div class="badge badge-primary bg-primary p-2">
        Total: {{ total }} pedidos
      </div>
    </div>

    <!-- Cards de resumen compactas -->
    <div class="row mb-3 g-2">
      <div class="col-md-4">
        <div class="summary-card compact p-3">
          <div class="d-flex align-items-center">
            <div class="icon-circle-sm bg-primary text-white me-3">
              <i class="material-icons">person</i>
            </div>
            <div>
              <div class="summary-label small">Cliente</div>
              <div class="summary-value">{{ usuario.nombre_completo }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="summary-card compact p-3">
          <div class="d-flex align-items-center">
            <div class="icon-circle-sm bg-warning text-white me-3">
              <i class="material-icons">email</i>
            </div>
            <div>
              <div class="summary-label small">Email</div>
              <div class="summary-value small">{{ usuario.email }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="summary-card compact p-3">
          <div class="d-flex align-items-center">
            <div class="icon-circle-sm bg-success text-white me-3">
              <i class="material-icons">shopping_bag</i>
            </div>
            <div>
              <div class="summary-label small">Total Pedidos</div>
              <div class="summary-value">{{ total }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de pedidos compacta -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0 align-middle">
            <thead class="small bg-light">
              <tr>
                <th class="py-2"># Pedido</th>
                <th class="py-2">Fecha</th>
                <th class="py-2">Entrega</th>
                <th class="py-2">Envío</th>
                <th class="py-2">Estado</th>
                <th class="py-2 text-end">Total</th>
                <th class="py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in data" :key="pedido.envio.id" class="small">
                <td class="fw-bold">#{{ pedido.orden.id }}</td>
                <td>{{ formatDate(pedido.envio.created_at) }}</td>
                <td>{{ pedido.orden.fecha_entrega || '-' }}</td>
                <td>
                  <span class="badge py-1" :class="`bg-${getEnvioColor(pedido.envio.tipo_envio)}`">
                    {{ pedido.envio.tipo_envio }}
                  </span>
                </td>
                <td>
                  <span class="badge py-1" :class="`bg-${getStatusColor(pedido.envio.estado_envio)}`">
                    {{ getStatusText(pedido.envio.estado_envio) }}
                  </span>
                </td>
                <td class="text-end fw-bold">${{ pedido.resumen.total }}</td>
                <td class="text-center">
                  <button 
                    @click="openModal(pedido)"
                    class="btn btn-sm btn-outline-primary py2 px-2 me-2"
                    title="Ver detalles"
                  >
                  
                    <i class="material-icons " style="font-size: 1rem;">visibility</i>
                  </button>

                  <button 
                    @click="downloadPdf(pedido.envio.id)"
                    class="btn btn-sm btn-danger py-1 px-2"
                    title="Descargar PDF"
                  >
                    <i class="material-icons" style="font-size: 1rem;">picture_as_pdf</i>
                  </button>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td colspan="7" class="text-center text-muted py-3 small">
                  No tienes pedidos registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de detalles compacto -->
    <div class="modal fade" id="pedidoModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white py-2">
            <h5 class="modal-title small">
              <i class="material-icons mr-3" >receipt_long</i>

              Detalles Pedido #{{ selectedPedido?.orden?.id }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3" v-if="selectedPedido">
            <!-- Encabezado compacto -->
            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <div class="p-2 border rounded small">
                  <div class="text-muted">Estado</div>
                  <span class="badge py-1" :class="`bg-${getStatusColor(selectedPedido.envio.estado_envio)}`">
                    {{ getStatusText(selectedPedido.envio.estado_envio) }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-2 border rounded small">
                  <div class="text-muted">Tipo de envío</div>
                  <span class="badge py-1" :class="`bg-${getEnvioColor(selectedPedido.envio.tipo_envio)}`">
                    {{ selectedPedido.envio.tipo_envio }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="p-2 border rounded small">
                  <div class="text-muted">Fecha solicitud</div>
                  <div class="fw-bold">{{ formatDate(selectedPedido.envio.created_at) }}</div>
                </div>
              </div>
            </div>

            <!-- Información principal -->
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <div class="p-2 border rounded small">
                  <h6 class="mb-2 small fw-bold"><i class="material-icons mr-1" style="font-size: 1rem;">location_on</i> Dirección</h6>
                  <div class="mb-1">{{ selectedPedido.ciudad_destino.nombre }}</div>
                  <div class="mb-1">{{ selectedPedido.envio.direccion }}</div>
                  <div class="mb-1"><span class="fw-bold">Referencia:</span> {{ selectedPedido.envio.referencia || 'Ninguna' }}</div>
                  <div><span class="fw-bold">Peso:</span> {{ selectedPedido.envio.peso_total }} kg</div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="p-2 border rounded small">
                  <h6 class="mb-2 small fw-bold"><i class="material-icons mr-1" style="font-size: 1rem;">receipt</i> Resumen</h6>
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span>Subtotal:</span>
                    <span>${{ selectedPedido.resumen.subtotal_sin_descuento }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span>Descuento:</span>
                    <span>${{ selectedPedido.resumen.descuento_total }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span>Subtotal c/desc:</span>
                    <span>${{ selectedPedido.resumen.subtotal_con_descuento }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-1 border-bottom">
                    <span>Envío:</span>
                    <span>${{ selectedPedido.resumen.envio }}</span>
                  </div>
                  <div class="d-flex justify-content-between py-1 fw-bold">
                    <span>Total:</span>
                    <span>${{ selectedPedido.resumen.total }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Productos -->
            <div class="border rounded p-2">
              <h6 class="mb-2 small fw-bold"><i class="material-icons mr-1" style="font-size: 1rem;">shopping_basket</i> Productos</h6>
              <div class="table-responsive">
                <table class="table table-sm small mb-0">
                  <thead>
                    <tr>
                      <th class="py-1">Producto</th>
                      <th class="py-1 text-end">Precio</th>
                      <th class="py-1 text-end">Descuento</th>
                      <th class="py-1 text-end">Precio Final</th>
                      <th class="py-1 text-center">Cant</th>
                      <th class="py-1 text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="producto in selectedPedido.productos" :key="producto.producto_id">
                      <td class="py-2">
                        <div class="d-flex align-items-center">
                          <img :src="producto.imagen" :alt="producto.nombre" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;">
                          <div>
                            <div class="fw-bold">{{ producto.nombre }}</div>
                            <div class="text-muted">
                              <span class="me-2">Talla: {{ producto.talla }}</span>
                              <span class="">Color:</span>
                              {{ producto.color }} 
                              <span class="d-inline-block rounded-circle me-1 mt-3 " :style="`margin-bottom: -1px; ; width: 10px; height: 10px; background-color: ${producto.codigo_hex};`"></span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="py-2 text-end">${{ producto.precio_real }}</td>
                      <td class="py-2 text-end">${{ producto.descuento_unitario}}</td>
                      <td class="py-2 text-end">${{ producto.precio_unitario }}</td>
                      
                      <td class="py-2 text-center">{{ producto.cantidad }}</td>
                      <td class="py-2 text-end fw-bold">${{ producto.subtotal }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-sm btn-secondary" @click="closeModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

const usuario = ref({});
const total = ref(0);
const data = ref([]);
const selectedPedido = ref(null);
const isLoading = ref(true);
const error = ref(null);
const modalRef = ref(null);

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

const fetchEnvios = async () => {
  try {
    isLoading.value = true;
    const response = await fetch('http://localhost:8000/api/mis-envios', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth')}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al obtener los envíos');

    const result = await response.json();
    if (result.success) {
      usuario.value = result.usuario;
      total.value = result.total;
      data.value = result.data;
    } else {
      throw new Error(result.message || 'Error en la respuesta del servidor');
    }
  } catch (err) {
    error.value = err.message;
    console.error('Error:', err);
  } finally {
    isLoading.value = false;
  }
};

const openModal = (pedido) => {
  selectedPedido.value = pedido;
  if (window.bootstrap) {
    const modal = new window.bootstrap.Modal(modalRef.value);
    modal.show();
  } else {
    window.$('#pedidoModal').modal('show');
  }
};

const closeModal = () => {
  if (window.bootstrap) {
    const modal = window.bootstrap.Modal.getInstance(modalRef.value);
    if (modal) modal.hide();
  } else {
    window.$('#pedidoModal').modal('hide');
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const getStatusText = (status) => {
  const statusMap = {
    'enviado': 'Enviado',
    'entregado': 'Entregado',
    'pendiente': 'Pendiente',
    'cancelado': 'Cancelado',
    'en_proceso': 'En proceso'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    'enviado': 'primary',
    'entregado': 'success',
    'pendiente': 'warning',
    'cancelado': 'danger',
    'en_proceso': 'primary'
  };
  return colorMap[status] || 'secondary';
};

const getEnvioColor = (tipo) => {
  const colorMap = {
    'nacional': 'primary',
    'retiro': 'secondary',
    'express': 'info'
  };
  return colorMap[tipo] || 'secondary';
};

onMounted(() => {
  fetchEnvios();
});
</script>

<style scoped>
.pedidos-page {
  font-size: 0.875rem;
}
.page-title {
  font-size: 1.25rem;
  color: #333;
}
.summary-card.compact {
  border-radius: 0.5rem;
  background: white;
  border: 1px solid #eee;
}
.icon-circle-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.summary-label {
  font-size: 0.75rem;
  color: #6c757d;
}
.summary-value {
  font-size: 0.9rem;
  font-weight: 500;
}
.table th {
  font-weight: 500;
  color: #495057;
  font-size: 0.75rem;
  text-transform: uppercase;
}
.table td {
  vertical-align: middle;
  padding: 0.5rem;
}
.badge {
  font-weight: 500;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}
.modal-title {
  font-size: 1rem;
}
.producto-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}
</style>