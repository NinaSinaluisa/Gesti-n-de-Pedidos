<template>
  <div class="container-fluid">
    <h3 class="admin-title text-center mb-4">
      Reporte de Pedidos
    </h3>
  </div>
  <div class="container-fluid py-4">
    <!-- Header del Reporte -->
    <div class="row mb-4 justify-content-end">
      <div class="col-auto">
        <div class="border-0 p-2">
          <div class="d-flex gap-2 align-items-center">
            <button class="btn btn-light btn-sm" @click="cargarReporte" :disabled="loading">
              <i class="material-icons me-1">refresh</i>
              Actualizar
            </button>
            <button class="btn btn-danger btn-sm" @click="exportarPDF" :disabled="loading || !reporteData">
              <i class="material-icons me-1">picture_as_pdf</i>
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Filtros unificados -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Fecha desde</label>
                <input type="date" class="form-control" v-model="filtros.fechaInicio" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Fecha hasta</label>
                <input type="date" class="form-control" v-model="filtros.fechaFin" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Cliente</label>
                <input type="text" class="form-control" v-model="filtros.cliente" placeholder="Buscar cliente..." />
              </div>
              <div class="col-md-3">
                <label class="form-label">Estado</label>
                <select class="form-select" v-model="filtros.estado">
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3 fs-5 text-primary">Cargando datos del reporte...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center">
      <i class="material-icons me-2">error</i>
      <div>{{ error }}</div>
      <button @click="cargarReporte" class="btn btn-sm btn-outline-danger ms-auto">
        <i class="material-icons me-1">refresh</i>
        Reintentar
      </button>
    </div>

    <!-- Contenido del Reporte -->
    <div v-else-if="reporteData">
      <!-- Resumen Estadístico -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body text-center py-3">
              <h6 class="card-title mb-1 text-muted">Total Pedidos</h6>
              <h3 class="mb-0">{{ reporteData.total_pedidos }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body text-center py-3">
              <h6 class="card-title mb-1 text-muted">Total Ventas</h6>
              <h3 class="mb-0">${{ formatearNumero(reporteData.resumen_general.total_ventas) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body text-center py-3">
              <h6 class="card-title mb-1 text-muted">Pendientes</h6>
              <h3 class="mb-0">{{ reporteData.resumen_general.pedidos_pendientes }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body text-center py-3">
              <h6 class="card-title mb-1 text-muted">Entregados</h6>
              <h3 class="mb-0">{{ reporteData.resumen_general.pedidos_completados }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm bg-white px-0 py-3">
            <!-- Encabezado -->
            <div class="d-flex align-items-center justify-content-between mt-3 mb-0 px-3">
              <h5 class="mb-0 fw-semibold">
                <i class="material-icons" style="margin-top: -2px;">list_alt</i>
                Detalle de Pedidos ({{ pedidosFiltrados.length }})
              </h5>
            </div>

            <!-- Tabla -->
            <div class="mt-3 px-3">
              <div class="table-container">
                <table class="users-table">
                  <thead>
                    <tr>
                      <th class="text-center">ID</th>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Fecha Entrega</th>
                      <th class="text-center">Productos</th>
                      <th class="text-center">Total</th>
                      <th class="text-center">Estado</th>
                      <th class="text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <template v-for="pedido in pedidosFiltrados" :key="pedido.id_pedido">
                      <tr>
                        <td class="text-center fw-bold">#{{ pedido.id_pedido }}</td>
                        <td>
                          <div class="user-info">
                            <div class="user-name">{{ pedido.cliente.nombre_completo }}</div>
                            <div class="user-email">{{ pedido.direccion_entrega.ciudad }}</div>
                          </div>
                        </td>
                        <td>
                          <div class="contact-info">
                            <div>{{ pedido.cliente.telefono }}</div>
                            <div class="phone">{{ pedido.cliente.email }}</div>
                          </div>
                        </td>
                        <td class="text-center">
                          <span class="date-badge">
                            {{ formatearFechaCorta(pedido.estado_pedido.fecha_entrega_estimada) }}
                          </span>
                        </td>
                        <td class="text-center">
                          {{ pedido.detalle_productos.length }} items
                        </td>
                        <td class="text-center fw-bold">${{ formatearNumero(pedido.resumen_pedido.total) }}</td>
                        <td class="text-center">
                          <span class="user-type" :class="getEstadoBadgeClass(pedido.estado_pedido.estado_envio)">
                            {{ pedido.estado_pedido.estado_envio }}
                          </span>
                        </td>
                        <td class="text-center">
                          <button class="expand-button" @click="toggleDetallePedido(pedido.id_pedido)">
                            <i class="material-icons">
                              {{ pedidoExpandido === pedido.id_pedido ? 'expand_less' : 'expand_more' }}
                            </i>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="pedidoExpandido === pedido.id_pedido" :key="'detalle-' + pedido.id_pedido">
                        <td colspan="8" class="expanded-details">
                          <div class="details-content">
                            <div class="details-section">
                              <h6 class="section-title">
                                <i class="material-icons me-2">shopping_bag</i>
                                Productos
                              </h6>
                              <table class="details-table">
                                <thead>
                                  <tr>
                                    <th>Producto</th>
                                    <th class="text-center">Cantidad</th>
                                    <th class="text-center">Talla</th>
                                    <th class="text-center">Color</th>
                                    <th class="text-end">Precio</th>
                                    <th class="text-end">Desc</th>
                                    <th class="text-end">P. Final</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(producto, index) in pedido.detalle_productos" :key="index">
                                    <td>{{ producto.producto }}</td>
                                    <td class="text-center">{{ producto.cantidad }}</td>
                                    <td class="text-center">{{ producto.talla }}</td>
                                    <td class="text-center">{{ producto.color }}</td>
                                    <td class="text-end">${{ formatearNumero(producto.precio_real) }}</td>
                                     <td class="text-end">${{ formatearNumero(producto.descuento_unitario) }}</td>
                                    <td class="text-end">${{ formatearNumero(producto.precio_unitario) }}</td>
                                   
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div class="details-section">
                              <h6 class="section-title">
                                <i class="material-icons me-2">local_shipping</i>
                                Información de Envío
                              </h6>
                              <div class="shipping-info">
                                <p><strong>Dirección:</strong> {{ pedido.direccion_entrega.direccion }}</p>
                                <p><strong>Referencia:</strong> {{ pedido.direccion_entrega.referencia }}</p>
                                <p><strong>Tipo de envío:</strong> {{ pedido.tipo_entrega }}</p>
                                <div class="price-summary">
                                  <!-- Subtotal sin descuentos (suma de precios reales) -->
                                  <div class="price-row">
                                    <span>Subtotal:</span>
                                    <span>${{ formatearNumero(pedido.resumen_pedido.subtotal_sin_descuento) }}</span>
                                  </div>
                                  
                                  <!-- Descuento total -->
                                  <div v-if="pedido.resumen_pedido.descuento_total > 0" class="price-row discount-row">
                                    <span style="color: #dc3545;">Descuento:</span>
                                    <span style="color: #dc3545;">-${{ formatearNumero(pedido.resumen_pedido.descuento_total) }}</span>
                                  </div>
                                  
                                  <!-- Subtotal con descuento aplicado -->
                                  <div class="price-row">
                                    <span>Subtotal con descuento:</span>
                                    <span>${{ formatearNumero(pedido.resumen_pedido.subtotal) }}</span>
                                  </div>
                                  
                                  <!-- Costo de envío -->
                                  <div class="price-row">
                                    <span>Envío:</span>
                                    <span v-if="pedido.resumen_pedido.costo_envio > 0">
                                      ${{ formatearNumero(pedido.resumen_pedido.costo_envio) }}
                                    </span>
                                    <span v-else>GRATIS</span>
                                  </div>
                                  
                                  <!-- Total final -->
                                  <div class="price-row total">
                                    <span>Total:</span>
                                    <span class="fw-bold">${{ formatearNumero(pedido.resumen_pedido.total) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Pie de página -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center text-muted">
              <small>
                <i class="material-icons me-1">schedule</i>
                Reporte generado el {{ formatearFecha(reporteData.fecha_generacion) }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Reporte from '@/apis/Reportes';
import Swal from 'sweetalert2';

// Estados reactivos
const reporteData = ref(null);
const loading = ref(false);
const error = ref(null);
const pedidosExpandidos = ref([]);
const filtros = ref({
  fechaInicio: '',
  fechaFin: '',
  cliente: '',
  estado: ''
});

// Cargar datos al montar el componente
onMounted(() => {
  cargarReporte();
  
  // Establecer fechas por defecto (últimos 30 días)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  filtros.value.fechaInicio = startDate.toISOString().split('T')[0];
  filtros.value.fechaFin = endDate.toISOString().split('T')[0];
});

// Métodos
const cargarReporte = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await Reporte.fetchPedidos();
    reporteData.value = response.data || response;
  } catch (err) {
    console.error('Error al cargar reporte:', err);
    error.value = 'Error al cargar el reporte: ' + (err.message || 'Intente nuevamente');
  } finally {
    loading.value = false;
  }
};


const exportarPDF = async () => {
  if (!reporteData.value || pedidosFiltrados.value.length === 0) {
  await Swal.fire({
    icon: 'warning',
    title: 'Datos insuficientes',
    text: 'No hay pedidos que coincidan con los filtros aplicados para generar el reporte.',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#3085d6',
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  });
  return;
}
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuración general
doc.setFont('helvetica');
const pageWidth = doc.internal.pageSize.getWidth();
const margin = 15;
let yPos = 15;

// Título del reporte
doc.setFontSize(20);
doc.setTextColor(40, 53, 147);
doc.text('REPORTE DE PEDIDOS', pageWidth / 2, yPos, { align: 'center' });
yPos += 10;

// Información del período
doc.setFontSize(12);
doc.setTextColor(80, 80, 80);
doc.text(`Del ${filtros.value.fechaInicio} al ${filtros.value.fechaFin}`, pageWidth / 2, yPos, { align: 'center' });
yPos += 7;
doc.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
yPos += 15;

// Resumen estadístico
doc.setFontSize(14);
doc.setTextColor(30, 30, 30);
doc.text('RESUMEN ESTADÍSTICO', margin, yPos);
yPos += 10;

doc.setFontSize(12);
doc.text(`• Total pedidos: ${pedidosFiltrados.value.length}`, margin, yPos);
yPos += 7;
doc.text(`• Total ventas: $${formatearNumero(reporteData.value.resumen_general.total_ventas)}`, margin, yPos);
yPos += 7;
doc.text(`• Pedidos pendientes: ${reporteData.value.resumen_general.pedidos_pendientes}`, margin, yPos);
yPos += 7;
doc.text(`• Pedidos entregados: ${reporteData.value.resumen_general.pedidos_completados}`, margin, yPos);
yPos += 15;

// Tabla de pedidos
doc.autoTable({
  startY: yPos,
  head: [['ID', 'Cliente', 'Contacto', 'Fecha Entrega', 'Total', 'Estado']],
  body: pedidosFiltrados.value.map(pedido => [
    pedido.id_pedido,
    pedido.cliente.nombre_completo,
    `${pedido.cliente.telefono}\n${pedido.cliente.email}`,
    formatearFechaCorta(pedido.estado_pedido.fecha_entrega_estimada),
    `$${formatearNumero(pedido.resumen_pedido.total)}`,
    pedido.estado_pedido.estado_envio
  ]),
  margin: { left: margin, right: margin },
  headStyles: {
    fillColor: [40, 53, 147],
    textColor: 255,
    fontSize: 10,
    halign: 'center'
  },
  bodyStyles: {
    fontSize: 9,
    cellPadding: 3
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245]
  },
  columnStyles: {
    0: { cellWidth: 15, halign: 'center' },
    1: { cellWidth: 40 },
    2: { cellWidth: 30 },
    3: { cellWidth: 25, halign: 'center' },
    4: { cellWidth: 20, halign: 'right' },
    5: { cellWidth: 25, halign: 'center' }
  }
});

// Detalle de productos por pedido
yPos = doc.lastAutoTable.finalY + 10;

pedidosFiltrados.value.forEach(pedido => {
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Encabezado del pedido
  doc.setFontSize(14);
  doc.setTextColor(40, 53, 147);
  doc.text(`PEDIDO #${pedido.id_pedido} - ${pedido.cliente.nombre_completo}`, margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Teléfono: ${pedido.cliente.telefono} | Email: ${pedido.cliente.email}`, margin, yPos);
  yPos += 6;
  doc.text(`Dirección: ${pedido.direccion_entrega.direccion}, ${pedido.direccion_entrega.ciudad}`, margin, yPos);
  yPos += 6;
  doc.text(`Referencia: ${pedido.direccion_entrega.referencia} | Tipo: ${pedido.tipo_entrega}`, margin, yPos);
  yPos += 10;

  // Tabla de productos (con descuentos)
  doc.autoTable({
    startY: yPos,
    head: [['Producto', 'Cant', 'Talla', 'Color', 'P. Unitario', 'Desc.', 'P. Final', 'Subtotal']],
    body: pedido.detalle_productos.map(producto => [
      producto.producto,
      producto.cantidad,
      producto.talla,
      producto.color,
      `$${formatearNumero(producto.precio_real)}`,
      producto.descuento_unitario > 0 ? `-$${formatearNumero(producto.descuento_unitario)}` : '$0.00',
      `$${formatearNumero(producto.precio_unitario)}`,
      `$${formatearNumero(producto.subtotal)}`
    ]),
    margin: { left: margin },
    headStyles: {
      fillColor: [70, 130, 180],
      textColor: 255,
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 15, halign: 'right', textColor: [220, 53, 69] },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 20, halign: 'right' }
    }
  });

  // Resumen del pedido con descuentos
  yPos = doc.lastAutoTable.finalY + 5;
  doc.setFontSize(10);
  
  // Subtotal sin descuento
  doc.text('Subtotal:', margin + 70, yPos, { align: 'right' });
  doc.text(`$${formatearNumero(pedido.resumen_pedido.subtotal_sin_descuento)}`, margin + 100, yPos, { align: 'right' });
  yPos += 5;
  
  // Descuento (si aplica)
  if (pedido.resumen_pedido.descuento_total > 0) {
    doc.setTextColor(220, 53, 69);
    doc.text('Descuento:', margin + 70, yPos, { align: 'right' });
    doc.text(`-$${formatearNumero(pedido.resumen_pedido.descuento_total)}`, margin + 100, yPos, { align: 'right' });
    yPos += 5;
    doc.setTextColor(80, 80, 80);
    
    // Subtotal con descuento
    doc.text('Subtotal con descuento:', margin + 70, yPos, { align: 'right' });
    doc.text(`$${formatearNumero(pedido.resumen_pedido.subtotal)}`, margin + 100, yPos, { align: 'right' });
    yPos += 5;
  }
  
  // Envío
  doc.text('Envío:', margin + 70, yPos, { align: 'right' });
  doc.text(pedido.resumen_pedido.costo_envio > 0 ? 
    `$${formatearNumero(pedido.resumen_pedido.costo_envio)}` : 'GRATIS', 
    margin + 100, yPos, { align: 'right' });
  yPos += 5;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', margin + 70, yPos, { align: 'right' });
  doc.text(`$${formatearNumero(pedido.resumen_pedido.total)}`, margin + 100, yPos, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  yPos += 15;

  // Línea divisoria
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
});

// Guardar el PDF
doc.save(`reporte-pedidos-${filtros.value.fechaInicio}-${filtros.value.fechaFin}.pdf`);

  const { value: accept } = await Swal.fire({
  title: '¡Reporte generado con éxito!',
  text: `El archivo "reporte-pedidos-${filtros.value.fechaInicio}-${filtros.value.fechaFin}.pdf" se ha descargado correctamente.`,
  icon: 'success',
  confirmButtonText: 'Aceptar',
  confirmButtonColor: '#3085d6',
  allowOutsideClick: false,
  showCloseButton: true,
  timer: 5000,
  timerProgressBar: true
});
};

// Propiedades computadas
const pedidosFiltrados = computed(() => {
  if (!reporteData.value?.pedidos) return [];
  
  return reporteData.value.pedidos.filter(pedido => {
    // Filtro por fechas
    const fechaPedido = pedido.fecha_pedido.split(' ')[0];
    const cumpleFecha = (!filtros.value.fechaInicio || fechaPedido >= filtros.value.fechaInicio) && 
                       (!filtros.value.fechaFin || fechaPedido <= filtros.value.fechaFin);
    
    // Filtro por cliente
    const cumpleCliente = !filtros.value.cliente || 
      pedido.cliente.nombre_completo.toLowerCase().includes(filtros.value.cliente.toLowerCase());
    
    // Filtro por estado
    const cumpleEstado = !filtros.value.estado || 
      pedido.estado_pedido.estado_envio === filtros.value.estado;
    
    return cumpleFecha && cumpleCliente && cumpleEstado;
  });
});

// Computed para detalles expandidos

// Funciones de utilidad
const formatearNumero = (numero) => {
  return parseFloat(numero).toFixed(2);
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatearFechaCorta = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getEstadoBadgeClass = (estado) => {
  const clases = {
    'pendiente': 'bg-warning text-dark',
    'enviado': 'bg-primary text-white',
    'entregado': 'bg-success text-white'
  };
  return clases[estado] || 'bg-secondary text-white';
};

// Estado para controlar el pedido expandido
const pedidoExpandido = ref(null);

// Función para alternar la visualización del detalle
const toggleDetallePedido = (idPedido) => {
  if (pedidoExpandido.value === idPedido) {
    // Si ya está expandido, lo cerramos
    pedidoExpandido.value = null;
  } else {
    // Si no está expandido, lo abrimos y cerramos cualquier otro
    pedidoExpandido.value = idPedido;
  }
};

// Computed para filtrar solo el pedido expandido
const pedidosFiltradosExpandido = computed(() => {
  return pedidosFiltrados.value.filter(pedido => 
    pedidoExpandido.value === pedido.id_pedido
  );
});


</script>

<style scoped>

.discount-row {
  color: #dc3545 !important;
  font-weight: 500;
}

.price-row.discount-row span {
  color: #dc3545 !important;
}

.card {
  border-radius: 0.5rem;
}


.badge {
  font-size: 0.8rem;
  padding: 0.35em 0.65em;
  font-weight: 500;
}

.material-icons {
  vertical-align: middle;
}



.card-header {
  background-color: #f8f9fa !important;
}

.btn-outline-primary {
  border-color: #0d6efd;
  color: #0d6efd;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
}

/* Estilos consistentes con la tabla de usuarios */
.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background-color: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.users-table th {
  padding: 1rem;
  font-weight: 600;
  color: #4a5568;
  text-align: left;
}

.users-table th.text-center {
  text-align: center;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.users-table td.text-center {
  text-align: center;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover {
  background-color: #f8fafc;
}

/* Estilos específicos para pedidos */
.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.8125rem;
  color: #718096;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.phone {
  font-size: 0.8125rem;
  color: #718096;
  margin-top: 0.25rem;
}

.date-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  background-color: #f7fafc;
  color: #4a5568;
  font-size: 0.8125rem;
}

.user-type {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.expand-button {
  background: none;
  border: none;
  color: #4299e1;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.expand-button:hover {
  background-color: #ebf8ff;
}

/* Detalle expandido */
.expanded-details {
  background-color: #f8fafc;
  padding: 0 !important;
}

.details-content {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.details-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1rem;
  color: #2b6cb0;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.details-table th {
  background-color: #f7fafc;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
}

.details-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #edf2f7;
}

.shipping-info {
  font-size: 0.875rem;
}

.shipping-info p {
  margin-bottom: 0.75rem;
}

.price-summary {
  margin-top: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-row.total {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  font-size: 1rem;
}

.expand-button {
  transition: transform 0.2s ease;
}

.expand-button.rotated {
  transform: rotate(180deg);
}

/* Responsive */
@media (max-width: 992px) {
  .details-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .users-table {
    display: block;
    overflow-x: auto;
  }
  
  .users-table th, 
  .users-table td {
    white-space: nowrap;
  }
}
</style>