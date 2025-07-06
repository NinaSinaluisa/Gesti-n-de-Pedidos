<template>
  <div class="container-fluid">
    <h3 class="admin-title text-center mb-4">
        Reporte de Ganancia
      </h3>
  </div>
  <div class="container-fluid mt-3" ref="reporteContainer">
    <!-- Filtros Mejorados -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-3">
            <label class="form-label">Fecha Inicio</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="fechaInicio"
              :max="fechaFin"
              @change="validarFechas"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">Fecha Fin</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="fechaFin"
              :min="fechaInicio"
              @change="validarFechas"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">Período</label>
            <select class="form-select" v-model="periodo" @change="aplicarFiltroPeriodo">
              <option value="personalizado">Personalizado</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end  " style="margin-bottom: -28px;">
            <button 
              class="btn btn-primary btn-sm me-2 " 
              @click="aplicarFiltros"
              :disabled="cargando"
            >
              <i class="material-icons">filter_alt</i> 
              {{ cargando ? 'Filtrando...' : 'Filtrar' }}
            </button>
            <button 
              class="btn btn-danger btn-sm ms-2 " 
              @click="exportarPDF"
              :disabled="cargando || enviosFiltrados.length === 0"
            >
              <i class="material-icons me-2">picture_as_pdf</i> Exportar PDF
            </button>
          </div>
        </div>
        
        <!-- Mensajes de estado -->
        <div v-if="errorFiltros" class="alert alert-danger mt-3 mb-0">
          {{ errorFiltros }}
        </div>
        <div v-if="mensajeExito" class="alert alert-success mt-3 mb-0">
          {{ mensajeExito }}
        </div>
      </div>
    </div>

    <!-- 3 Cards de Resumen -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title text-muted">Ventas Totales</h5>
                <h2 class="mb-0">${{ ventasTotales.toFixed(2) }}</h2>
                <span class="text-muted">{{ totalPedidos }} pedidos</span>
              </div>
              <div class="bg-primary bg-opacity-10 p-3 rounded">
                <i class="material-icons text-primary" style="font-size: 2rem;">shopping_cart</i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title text-muted">Ganancias Netas</h5>
                <h2 class="mb-0">${{ gananciasNetas.toFixed(2) }}</h2>
                <span class="text-muted">{{ porcentajeMargenNeto }}% margen</span>
              </div>
              <div class="bg-success bg-opacity-10 p-3 rounded">
                <i class="material-icons text-success" style="font-size: 2rem;">attach_money</i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title text-muted">Camisas Vendidas</h5>
                <h2 class="mb-0">{{ totalCamisasVendidas }}</h2>
                <span class="text-muted">{{ promedioCamisasPorPedido.toFixed(1) }} por pedido</span>
              </div>
              <div class="bg-info bg-opacity-10 p-3 rounded">
                <i class="material-icons text-info" style="font-size: 2rem;">checkroom</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productos más vendidos -->
    <div class="card mb-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="material-icons me-2">trending_up</i> Top 5 Productos Más Vendidos
        </h5>
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Talla</th>
              <th>Color</th>
              <th>Cantidad</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in productosMasVendidos" :key="'mas-'+index">
              <td>{{ index + 1 }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.talla }}</td>
              <td>
                <span class="" :style="{ backgroundColor: producto.color.toLowerCase() }"></span>
                {{ producto.color }}
              </td>
              <td>{{ producto.cantidad }}</td>
              <td>${{ producto.ganancia.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ganancias por día -->
    <div class="card">
      <div class="card-header bg-white">
        <h5 class="mb-0">
          <i class="material-icons me-2">calendar_today</i> Ganancias por día
        </h5>
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Pedidos</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ganancia, fecha) in gananciasPorDia" :key="fecha">
              <td>{{ formatFecha(fecha) }}</td>
              <td>{{ ganancia.pedidos }}</td>
              <td>${{ ganancia.ganancia.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import Swal from 'sweetalert2';
import 'jspdf-autotable'
import Reporte from '@/apis/Reportes'

// Datos y estado
const datosAPI = ref({ empresa: {}, envios: [] })
const cargando = ref(false)
const errorFiltros = ref('')
const mensajeExito = ref('')

// Filtros
const fechaInicio = ref('')
const fechaFin = ref('')
const periodo = ref('mensual')

// Inicializar fechas (últimos 30 días)
const inicializarFechas = () => {
  const today = new Date()
  const lastMonth = new Date()
  lastMonth.setDate(lastMonth.getDate() - 30)
  
  fechaInicio.value = formatDate(lastMonth)
  fechaFin.value = formatDate(today)
}

// Validación de fechas
const validarFechas = () => {
  if (fechaInicio.value && fechaFin.value) {
    const inicio = new Date(fechaInicio.value)
    const fin = new Date(fechaFin.value)
    
    if (inicio > fin) {
      errorFiltros.value = 'La fecha de inicio no puede ser mayor a la fecha fin'
      return false
    }
    
    // Cambiar a período personalizado si el usuario modifica las fechas
    periodo.value = 'personalizado'
  }
  
  errorFiltros.value = ''
  return true
}

// Aplicar filtro de período
const aplicarFiltroPeriodo = () => {
  const today = new Date()
  const newDate = new Date()
  
  switch(periodo.value) {
    case 'semanal':
      newDate.setDate(newDate.getDate() - 7)
      break
    case 'mensual':
      newDate.setMonth(newDate.getMonth() - 1)
      break
    case 'anual':
      newDate.setFullYear(newDate.getFullYear() - 1)
      break
    default:
      return
  }
  
  fechaInicio.value = formatDate(newDate)
  fechaFin.value = formatDate(today)
  errorFiltros.value = ''
}

// Aplicar filtros
const aplicarFiltros = async () => {
  if (!validarFechas()) return
  
  try {
    cargando.value = true
    errorFiltros.value = ''
    mensajeExito.value = ''
    
    // Llamada a la API con los filtros
    const response = await Reporte.fetchReporte({
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      periodo: periodo.value
    })
    
    datosAPI.value = {
      empresa: response.empresa || {},
      envios: response.envios || []
    }
    
    mensajeExito.value = `Filtros aplicados: ${enviosFiltrados.value.length} resultados encontrados`
    
  } catch (error) {
    errorFiltros.value = 'Error al aplicar filtros: ' + (error.message || 'Intente nuevamente')
    console.error('Error al filtrar:', error)
  } finally {
    cargando.value = false
  }
}

// Función para formatear fecha
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Computed properties
const enviosFiltrados = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) return datosAPI.value.envios
  
  return datosAPI.value.envios.filter(envio => {
    const fechaEnvio = new Date(envio.envio.created_at)
    const inicio = new Date(fechaInicio.value)
    const fin = new Date(fechaFin.value)
    fin.setHours(23, 59, 59, 999)
    return fechaEnvio >= inicio && fechaEnvio <= fin
  })
})

const ventasTotales = computed(() => {
  return enviosFiltrados.value.reduce((total, envio) => {
    return total + parseFloat(envio.orden.monto_total || 0)
  }, 0)
})

const gananciasBrutas = computed(() => {
  const costoTotal = enviosFiltrados.value.reduce((total, envio) => {
    const costoEnvio = envio.productos.reduce((sum, producto) => {
      return sum + (parseFloat(producto.precio_unitario || 0) * 0.6 * parseInt(producto.cantidad || 0))
    }, 0)
    return total + costoEnvio
  }, 0)
  return ventasTotales.value - costoTotal
})

const gananciasNetas = computed(() => {
  return gananciasBrutas.value - (ventasTotales.value * 0.1)
})

const totalCamisasVendidas = computed(() => {
  return enviosFiltrados.value.reduce((total, envio) => {
    return total + envio.productos.reduce((sum, producto) => sum + parseInt(producto.cantidad || 0), 0)
  }, 0)
})

const totalPedidos = computed(() => enviosFiltrados.value.length)

const promedioCamisasPorPedido = computed(() => {
  return totalPedidos.value > 0 ? totalCamisasVendidas.value / totalPedidos.value : 0
})

const porcentajeMargenNeto = computed(() => {
  return ventasTotales.value > 0 ? ((gananciasNetas.value / ventasTotales.value) * 100).toFixed(1) : 0
})

// Productos más vendidos
const productosMasVendidos = computed(() => {
  const productos = {}
  
  enviosFiltrados.value.forEach(envio => {
    envio.productos.forEach(producto => {
      const key = `${producto.nombre}-${producto.talla}-${producto.color}`
      if (!productos[key]) {
        productos[key] = {
          nombre: producto.nombre,
          talla: producto.talla,
          color: producto.color,
          cantidad: 0,
          ganancia: 0
        }
      }
      productos[key].cantidad += parseInt(producto.cantidad)
      productos[key].ganancia += parseFloat(producto.precio_unitario) * 0.4 * parseInt(producto.cantidad)
    })
  })
  
  return Object.values(productos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
})

// Ganancias por día
const gananciasPorDia = computed(() => {
  const ganancias = {}
  
  enviosFiltrados.value.forEach(envio => {
    const fecha = envio.envio.created_at.split('T')[0]
    if (!ganancias[fecha]) {
      ganancias[fecha] = {
        pedidos: 0,
        ganancia: 0
      }
    }
    
    ganancias[fecha].pedidos++
    
    // Calcular ganancia para este día
    const gananciaDia = envio.productos.reduce((sum, producto) => {
      return sum + (parseFloat(producto.precio_unitario || 0) * 0.4 * parseInt(producto.cantidad || 0))
    }, 0)
    
    ganancias[fecha].ganancia += gananciaDia
  })
  
  return ganancias
})

// Exportar a PDF
const exportarPDF = async () => {
  try {
    // Validación inicial
    if (!datosAPI.value || !productosMasVendidos.value.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'No hay datos',
        text: 'No hay información suficiente para generar el reporte',
        confirmButtonColor: '#4a6cf7'
      });
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  // Configuración
  const margin = 15
  const pageWidth = doc.internal.pageSize.getWidth()
  const primaryColor = '#4a6cf7' // Color corporativo

  // Encabezado con información de la empresa
  doc.setFontSize(16)
  doc.setTextColor(40)
  doc.setFont('helvetica', 'bold')
  doc.text(datosAPI.value.empresa.nombre || 'Empresa', margin, 15)
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.setFont('helvetica', 'normal')
  doc.text(datosAPI.value.empresa.direccion || '', margin, 20)
  doc.text(`Teléfono: ${datosAPI.value.empresa.telefono || ''} | Email: ${datosAPI.value.empresa.email || ''}`, margin, 25)
  
  // Título del reporte
  doc.setFontSize(14)
  doc.setTextColor(40)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE DE GANANCIAS', pageWidth / 2, 35, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Período: ${fechaInicio.value} al ${fechaFin.value} | Generado: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' })
  
  // Línea divisoria
  doc.setDrawColor(200)
  doc.setLineWidth(0.5)
  doc.line(margin, 45, pageWidth - margin, 45)
  
  // 3 Cards de Resumen
  doc.setFontSize(12)
  doc.setTextColor(40)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen General', margin, 55)
  
  doc.autoTable({
    startY: 60,
    head: [['Concepto', 'Valor', 'Detalle']],
    body: [
      ['Ventas Totales', `$${ventasTotales.value.toFixed(2)}`, `${totalPedidos.value} pedidos`],
      ['Ganancias Netas', `$${gananciasNetas.value.toFixed(2)}`, `${porcentajeMargenNeto.value}% margen`],
      ['Camisas Vendidas', totalCamisasVendidas.value, `${promedioCamisasPorPedido.value.toFixed(1)} por pedido`]
    ],
    margin: { left: margin },
    styles: { fontSize: 10 },
    headStyles: { 
      fillColor: primaryColor, 
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' }
    }
  })
  
  // Productos más vendidos
  doc.setFontSize(12)
  doc.setTextColor(40)
  doc.setFont('helvetica', 'bold')
  doc.text('Productos Más Vendidos', margin, doc.lastAutoTable.finalY + 15)
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['#', 'Producto', 'Talla', 'Color', 'Cantidad', 'Ganancia']],
    body: productosMasVendidos.value.map((p, index) => [
      index + 1,
      p.nombre,
      p.talla,
      p.color,
      p.cantidad,
      `$${p.ganancia.toFixed(2)}`
    ]),
    margin: { left: margin },
    styles: { fontSize: 9 },
    headStyles: { 
      fillColor: primaryColor, 
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: { 
      0: { cellWidth: 10 },
      3: { cellWidth: 25 }
    }
  })
  
  // Ganancias por día
  doc.setFontSize(12)
  doc.setTextColor(40)
  doc.setFont('helvetica', 'bold')
  doc.text('Ganancias por Día', margin, doc.lastAutoTable.finalY + 15)
  
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Fecha', 'Pedidos', 'Ganancia']],
    body: Object.entries(gananciasPorDia.value).map(([fecha, g]) => [
      formatFecha(fecha),
      g.pedidos,
      `$${g.ganancia.toFixed(2)}`
    ]),
    margin: { left: margin },
    styles: { fontSize: 9 },
    headStyles: { 
      fillColor: primaryColor, 
      textColor: 255,
      fontStyle: 'bold'
    }
  })
  
  // Footer con firma
  const footerY = doc.internal.pageSize.getHeight() - 30
  doc.setFontSize(10)
  doc.setTextColor(100)
  
  // Línea para firma
  doc.line(margin, footerY, pageWidth - margin, footerY)
  doc.text('Firma del Gerente', margin, footerY + 10)
  
  // Información de contacto
  doc.text(datosAPI.value.empresa.descripcion || '', margin, footerY + 20)
  
  // Guardar PDF
const fileName = `reporte-ganancias-${formatDate(new Date())}.pdf`;
    doc.save(fileName);
    
    await Swal.fire({
      title: '¡Reporte generado!',
      text: `El archivo "${fileName}" se ha descargado correctamente.`,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#4a6cf7', // Usando tu color corporativo
      timer: 4000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    });

  } catch (error) {
    console.error('Error al generar PDF:', error);
    await Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al generar el reporte',
      icon: 'error',
      confirmButtonColor: '#4a6cf7'
    });
  }
};

// Formateador de fecha para mostrar
const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Inicialización
onMounted(() => {
  inicializarFechas()
  cargarDatos()
})

const cargarDatos = async () => {
  try {
    cargando.value = true
    const response = await Reporte.fetchReporte()
    datosAPI.value = {
      empresa: response.empresa || {},
      envios: response.envios || []
    }
  } catch (err) {
    errorFiltros.value = 'Error al cargar datos: ' + (err.message || 'Intente nuevamente')
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-weight: 600;
}

.table {
  font-size: 0.875rem;
}

.table thead th {
  border-bottom-width: 1px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.material-icons {
  vertical-align: middle;
}

.color-indicator {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
  border: 1px solid #ddd;
}
</style>