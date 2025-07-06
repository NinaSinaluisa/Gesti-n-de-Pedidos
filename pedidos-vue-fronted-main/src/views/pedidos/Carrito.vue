<template>
  <div class="container py-4">
    <div class="row g-4">
      <!-- Panel principal -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm mb-4">
          <!-- Sección de fecha de entrega -->
          <div class="row mb-2 p-3">
            <div class="col-auto">
              <button @click="obtenerFechaEntrega" class="btn btn-primary" :disabled="productosCarrito.length === 0">
                Calcular Fecha de Entrega
              </button>
            </div>
            <div class="col-auto mt-1">
              <span v-if="fechaEntrega"><strong>{{ fechaEntrega }}</strong></span>
              <span v-else class="text-muted"></span>
            </div>
          </div>

          <!-- Feedback dinámico -->
          <div v-if="mensajeFeedback" class="alert alert-info mx-3">
            {{ mensajeFeedback }}
          </div>

          <div class="card-header bg-white border-bottom-0 py-3">
            <div class="d-flex align-items-center">
              <input type="checkbox" class="form-check-input me-2" v-model="todoSeleccionado" @change="seleccionarTodo" />
              <span class="text-secondary">{{ productosSeleccionados }}/{{ productosCarrito.length }} artículos seleccionados</span>
              <div class="ms-auto">
                <button class="btn btn-link text-secondary" @click="eliminarSeleccionados">
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          <div class="card-body p-0">
            <div v-if="productosCarrito.length === 0" class="text-center py-4">
              El carrito está vacío
            </div>
            <div v-else v-for="(producto, index) in productosCarrito" :key="index" class="producto-item px-3 py-3 border-bottom">
              <div class="d-flex align-items-center">
                <input type="checkbox" class="form-check-input me-3 mt-2" v-model="producto.seleccionado" />

                <img :src="`${IMAGE_BASE_URL}/${producto.detalleProducto?.imagen_url}`" :alt="producto.detalleProducto?.producto?.nombre" class="producto-imagen me-3 rounded" style="width: 60px; height: 60px; object-fit: cover;" />

                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-2 text-truncate" style="max-width: 250px;">
                        {{ producto.detalleProducto?.producto?.nombre }}
                      </h6>

                      <div class="producto-detalles mb-2 text-secondary">
                        <span class="me-2">Color: {{ producto.detalleProducto?.color?.nombre }}</span>
                        <span class="me-2">Talla: {{ producto.talla?.nombre }}</span>
                         <span class="me-2">Peso: {{ (producto.detalleProducto?.peso_kg * producto.cantidad).toFixed(2) }} kg</span>
                      </div>
                    </div>

                    <button class="btn-close" @click="eliminarProducto(producto)"></button>
                  </div>

                  <div class="precio text-primary fw-bold mb-2">
                    <span v-if="aplicaDescuentoPorMayor" class="text-decoration-line-through text-muted me-2">
                      ${{ (producto.detalleProducto?.precio_base * producto.cantidad).toFixed(2) }}
                    </span>
                    ${{ calcularPrecioConDescuento(producto).toFixed(2) }}
                  </div>

                  <div class="d-flex align-items-center justify-content-end">
                    <button class="btn btn-outline-secondary btn-sm" @click="decrementarCantidad(producto)">
                      −
                    </button>
                    <input type="number" v-model="producto.cantidad" class="form-control form-control-sm text-center mx-2" style="width: 60px;" @change="actualizarCantidad(producto)" />
                    <button class="btn btn-outline-secondary btn-sm" @click="incrementarCantidad(producto)">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel lateral con cálculos actualizados -->
      <div class="col-lg-4">
        <div class="d-flex flex-column">
          <!-- Detalles del precio -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="mb-3">Detalles del precio</h6>

              <!-- Subtotal original -->
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal ({{ cantidadTotalProductos }} artículos)</span>
                <span>${{ subtotalSinDescuento.toFixed(2) }}</span>
              </div>

              <template v-if="discountData?.descuento_aplicado">
                <div v-for="descuento in Object.values(descuentosAplicados)" :key="descuento.id" class="d-flex justify-content-between mb-2 text-success">
                  <span>
                    {{ descuento.nombre }} (-{{ formatearValorDescuento(descuento.tipo, descuento.valor) }})
                  </span>
                  <span>-${{ descuento.total.toFixed(2) }}</span>
                </div>
              </template>
              <div class="d-flex justify-content-between mb-2 text-muted small">
                <span>Peso total: </span>
                <span>{{ pesoTotalCarrito.toFixed(2) }} kg</span>
              </div>
               <hr class="my-3" />
              

              <!-- Total con descuento aplicado -->
              <div class="d-flex justify-content-between fw-bold">
                <span>Importe total</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>

              <div
                v-if="hayProductosConDescuento && 
                !aplicaDescuentoPorMayor && 
                cantidadTotalProductos > 0 && 
                cantidadMinimaDescuento > cantidadTotalProductos"
                class="text-muted small mt-2"
              >
                Agrega {{ cantidadMinimaDescuento - cantidadTotalProductos }} productos más para obtener descuento
              </div>

              <!-- Selección de tipo de envío (solo si hay fecha) -->
              <div v-if="fechaEntrega" class="mb-3 mt-2">
                <h6 class="mb-2">Método de envío</h6>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="radio" id="envioNacional" v-model="tipoEnvio" value="Envío Nacional" />
                  <label class="form-check-label" for="envioNacional">
                    Envío Nacional 
                    <span class="text-muted small">(Costo según ciudad)</span>
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="retiroTienda" v-model="tipoEnvio" value="Retiro tienda Física" />
                  <label class="form-check-label" for="retiroTienda">
                    Retiro en tienda física (Gratis)
                  </label>
                </div>
              </div>
              <div v-else class="alert alert-info small mt-2">
                Calcule la fecha de entrega primero para seleccionar envío
              </div>

              <hr class="my-3" />

              <!-- Total con envío -->
              <div class="d-flex justify-content-between fw-bold mb-3">
                  <span>Total a pagar</span>
                  <div class="text-end">
                    <div>${{ total.toFixed(2) }}</div>
                    <small class="text-muted fw-normal">
                      {{ 
                        tipoEnvio === 'Retiro tienda Física' 
                          ? 'Precio final' 
                          : 'Subtotal (envío varía por ciudad)' 
                      }}
                    </small>
                  </div>
                </div>
              <!-- Botón de proceder al pago -->
              <button class="btn btn-primary w-100" @click="procederAlPago" :disabled="!puedeProcederAlPago">
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted , watch} from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/authstore'
import { useOrderStore } from '@/stores/orderStore'
import { IMAGE_BASE_URL } from "@/apis/Api"
import Empresa from '@/apis/Empresa.js';
import { PublicApi } from "@/apis/Api";
import Swal from "sweetalert2"; 
import axios from 'axios'

const router = useRouter()
const cartStore = useCartStore()
const todoSeleccionado = ref(false)
const productosData = ref([])
const discountData = ref(null)
const descuentosActivos = ref([])

const userStore = useUserStore();
const orderStore = useOrderStore()


const empresa = ref(null);

const fetchEmpresaData = async () => {
  try {
    const response = await Empresa.fetchEmpresaPublica();
    if (response?.data?.length > 0) {
      empresa.value = response.data[0];
    } else if (response?.length > 0) {
      empresa.value = response[0];
    }
    
    if (!empresa.value.direccion) empresa.value.direccion = 'Dirección no especificada';
    if (!empresa.value.referencia) empresa.value.referencia = 'Referencia no especificada';
    
  } catch (error) {
    console.error('Error al cargar datos:', error);
    empresa.value = {
      direccion: 'Dirección no especificada',
      referencia: 'Referencia no especificada'
    };
  }
};
// Formatea la fecha, por ejemplo:
const formattedDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Fetch productos data from API
const fetchProductosData = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/admin/detalle/all')
        productosData.value = response.data.data
    } catch (error) {
        console.error('Error fetching products:', error)
    }
}

// Combine cart items with API data
const productosCarrito = computed(() => {
    return cartStore.cartItems.map(cartItem => {
        const detalleProducto = productosData.value.find(p => p.id === cartItem.detalles_productos_id)
        const talla = detalleProducto?.tallas.find(t => t.id === cartItem.talla_id)
        
        return {
            ...cartItem,
            detalleProducto,
            talla,
            seleccionado: false
        }
    })
})



const mensajeFeedback = ref("");
const fechaEntrega = ref("");
const cantidadPrendas = ref(0);
const cuposActuales = ref({
  cupo_6: 0,
  cupo_15: 0,
  cupo_30: 0
});



onMounted(async () => {
    await Promise.all([
        fetchEmpresaData(), 
        fetchProductosData(),
        fetchDescuentos()
    ])
})


// Obtener la cantidad mínima más baja entre los descuentos activos
const cantidadMinimaDescuento = computed(() => {
    if (!descuentosActivos.value.length) return 0;

    // Filtra los descuentos activos y obtén la cantidad máxima
    const cantidadesMinimas = descuentosActivos.value
        .filter(descuento => descuento.activo)
        .map(descuento => descuento.cantidad_minima);

    // Si no hay descuentos activos, retorna 0
    if (cantidadesMinimas.length === 0) return 0;

    // Retorna la cantidad máxima
    return Math.max(...cantidadesMinimas);
});

const fetchDescuentos = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/descuentos')
        descuentosActivos.value = response.data.data
    } catch (error) {
        console.error('Error obteniendo descuentos:', error)
    }
}
const fetchDiscountData = async () => {
    try {
        const productos = productosCarrito.value.map(item => ({
            id: item.detalles_productos_id,
            cantidad: item.cantidad
        }))

        const response = await axios.post('http://localhost:8000/api/aplicar-descuento', {
            productos
        })
        discountData.value = response.data
    } catch (error) {
        console.error('Error fetching discount:', error)
    }
}
const cantidadTotalProductos = computed(() => {
    return discountData.value?.cantidad_total || 0
})

const aplicaDescuentoPorMayor = computed(() => {
    return discountData.value?.descuento_aplicado || false
})

const calcularPrecioConDescuento = (producto) => {
    if (!discountData.value) return producto.detalleProducto?.precio_base * producto.cantidad
    
    const productoDescuento = discountData.value.productos.find(
        p => p.producto_id === producto.detalles_productos_id
    )
    
    return productoDescuento?.precio_final || (producto.detalleProducto?.precio_base * producto.cantidad)
}

const subtotalSinDescuento = computed(() => {
    return productosCarrito.value.reduce((total, producto) => {
        return total + (producto.detalleProducto?.precio_base * producto.cantidad)
    }, 0)
})

const descuentoTotal = computed(() => {
    return discountData.value?.descuento_total || 0
})

const total = computed(() => {
    return subtotalSinDescuento.value - descuentoTotal.value
})

const productosSeleccionados = computed(() => {
    return productosCarrito.value.filter(p => p.seleccionado).length
})

const seleccionarTodo = () => {
    productosCarrito.value.forEach(producto => {
        producto.seleccionado = todoSeleccionado.value
    })
}

const incrementarCantidad = (producto) => {
    if (producto.cantidad < 100) {
        cartStore.updateQuantity(
            producto.detalles_productos_id,
            producto.talla_id,
            producto.cantidad + 1
        )
    }
}

const decrementarCantidad = (producto) => {
    if (producto.cantidad > 1) {
        cartStore.updateQuantity(
            producto.detalles_productos_id,
            producto.talla_id,
            producto.cantidad - 1
        )
    }
}

const actualizarCantidad = (producto) => {
    let cantidad = parseInt(producto.cantidad)
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1
    if (cantidad > 100) cantidad = 100

    cartStore.updateQuantity(
        producto.detalles_productos_id,
        producto.talla_id,
        cantidad
    )
}

const eliminarProducto = (producto) => {
    cartStore.removeFromCart(producto.detalles_productos_id, producto.talla_id)
}

const eliminarSeleccionados = () => {
    productosCarrito.value
        .filter(producto => producto.seleccionado)
        .forEach(producto => {
            cartStore.removeFromCart(producto.detalles_productos_id, producto.talla_id)
        })
}

const descuentosAplicados = computed(() => {
    if (!discountData.value?.productos || !descuentosActivos.value) return []
    
    console.log('=== Debug Descuentos ===');
    console.log('Descuentos Activos:', descuentosActivos.value.filter(d => d.activo));
    console.log('Datos del Descuento (API):', discountData.value);
    
    // Obtener todos los descuentos activos que aplican a cada producto
    const descuentosPorProducto = discountData.value.productos
        .filter(p => p.descuento > 0)
        .flatMap(producto => {
            console.log('Procesando producto:', producto);
            
            // Encontrar todos los descuentos activos que aplican a este producto
            const descuentosParaProducto = descuentosActivos.value.filter(descuento => {
                const aplica = descuento.activo && 
                    (descuento.aplica_todos_productos || 
                     descuento.detalles_productos.some(dp => dp.id === producto.producto_id));
                
                console.log('Descuento', descuento.nombre, 'aplica al producto?', aplica);
                return aplica;
            });

            console.log('Descuentos encontrados para el producto:', descuentosParaProducto);

            return descuentosParaProducto.map(descuento => {
                const descuentoInfo = {
                    id: descuento.id,
                    nombre: descuento.nombre,
                    tipo: descuento.tipo,
                    valor: descuento.valor,
                    descuento: producto.descuento / descuentosParaProducto.length,
                    producto_id: producto.producto_id
                };
                console.log('Creando entrada de descuento:', descuentoInfo);
                return descuentoInfo;
            });
        });

    console.log('Descuentos por producto (sin agrupar):', descuentosPorProducto);

    // Agrupar los descuentos por ID y sumar sus totales
    const descuentosAgrupados = descuentosPorProducto.reduce((acc, curr) => {
        if (!acc[curr.id]) {
            acc[curr.id] = {
                ...curr,
                total: curr.descuento
            }
        } else {
            acc[curr.id].total += curr.descuento
        }
        return acc;
    }, {});

    console.log('Descuentos agrupados (resultado final):', descuentosAgrupados);
    return descuentosAgrupados;
})

const formatearValorDescuento = (tipo, valor) => {
    if (tipo === 'porcentaje') {
        return `${parseFloat(valor).toFixed(2)}%`
    } else {
        return `$${parseFloat(valor).toFixed(2)}`
    }
}

watch(
    () => productosCarrito.value,
    () => {
        if (productosCarrito.value.length > 0) {
            fetchDiscountData()
        } else {
            discountData.value = null
        }
    },
    { deep: true }
)


const hayProductosConDescuento = computed(() => {
  return productosCarrito.value.some(producto => {
    return descuentosActivos.value.some(descuento => {
      return descuento.activo && 
             (descuento.aplica_todos_productos || 
              descuento.detalles_productos.some(dp => dp.id === producto.detalles_productos_id));
    });
  });
});


// Estados para tipo de envío
const tipoEnvio = ref(null)
const precioEnvio = ref(0.00)

// Obtener fecha de entrega
const obtenerFechaEntrega = async () => {
  mensajeFeedback.value = ""
  fechaEntrega.value = ""

  try {
    const totalProductos = cantidadTotalProductos.value

    const response = await PublicApi.post("calcular-fecha-entrega", {
      cantidad: totalProductos,
    })

    if (response.data.status === "success") {
      const fechaEntregaOriginal = new Date(response.data.fecha_entrega)
      const fechaEntregaAjustada = new Date(fechaEntregaOriginal)
      fechaEntregaAjustada.setDate(fechaEntregaAjustada.getDate() + 1)

      fechaEntrega.value = fechaEntregaAjustada.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      cantidadPrendas.value = response.data.cantidad_prendas
      cuposActuales.value = response.data.cupos_actuales

      let mensajeDetallado = response.data.mensaje + `. La fecha de entrega será el ${fechaEntrega.value}.`
      mensajeDetallado += "\nNota: Los días hábiles no incluyen fines de semana ni festivos."
      mensajeFeedback.value = mensajeDetallado
    } else {
      mensajeFeedback.value = response.data.mensaje || "No se pudo calcular la fecha de entrega."
    }
  } catch (error) {
    console.error("Error al obtener la fecha de entrega:", error)
    mensajeFeedback.value =
      error.response?.data?.message ||
      "Hubo un error al consultar la fecha."
  }
}

// Computed para verificar si puede proceder al pago
const puedeProcederAlPago = computed(() => {
  return (
    productosCarrito.value.length > 0 &&
    fechaEntrega.value &&
    tipoEnvio.value
  )
})

// Computed para calcular el total con envío
const totalConEnvio = computed(() => {
  const subtotal = total.value
  if (tipoEnvio.value === 'Retiro tienda Física') {
    return subtotal
  }
  return subtotal + precioEnvio.value
})

// Función para proceder al pago
const procederAlPago = () => {
  if (!puedeProcederAlPago.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'Por favor complete todos los pasos antes de proceder al pago',
      confirmButtonText: 'Entendido'
    })
    return
  }

 // Actualizar dirección si es retiro en tienda
  if (tipoEnvio.value === 'Retiro tienda Física') {
    orderStore.actualizarDireccion({
      direccionCompleta: empresa.value.direccion || '',
      referencia: empresa.value.referencia || ''
    })
  }

const pedidoData = {
    productos: productosCarrito.value.map(p => ({
      id: p.detalles_productos_id,
      nombre: p.detalleProducto?.producto?.nombre,
      imagenUrl: `${IMAGE_BASE_URL}/${p.detalleProducto?.imagen_url}`,
      color: p.detalleProducto?.color?.nombre,
      talla: p.talla?.nombre,
      talla_id:p.talla?.id,
      cantidad: p.cantidad,
      peso: p.detalleProducto?.peso_kg || 0.5,
      precioUnitario: parseFloat(p.detalleProducto?.precio_base),
      precioConDescuento: calcularPrecioConDescuento(p),
      precioFinal: calcularPrecioConDescuento(p),
      descuentoAplicado: aplicaDescuentoPorMayor.value
    })),
    descuentos: Object.values(descuentosAplicados.value || {}),
    envio: {
      tipo: tipoEnvio.value,
      precio: precioEnvio.value,
      fechaEntrega: fechaEntrega.value
    },
    cuposActuales: cuposActuales.value
  }

 orderStore.inicializarDesdeCarrito(pedidoData)
 
  
  if (userStore.user) {
    orderStore.actualizarCliente({
      id: userStore.user.id,
      nombre: userStore.user.nombre || '',
      email: userStore.user.email || '',
      telefono: userStore.user.celular || ''
    })
  }
  // Codificar los datos para pasarlos por URL
  const pedidoEncoded = encodeURIComponent(JSON.stringify(pedidoData))

  // Redirigir a la página de pago con los parámetros
  router.push({
    path: '/finalizar-pago',
    query: { pedido: pedidoEncoded }
  })
}

const pesoTotalCarrito = computed(() => {
  return productosCarrito.value.reduce((total, producto) => {
    return total + (producto.detalleProducto?.peso_kg || 0) * producto.cantidad;
  }, 0);
});
watch(
  () => productosCarrito.value,
  () => {
    fechaEntrega.value = ""
    mensajeFeedback.value = ""
    tipoEnvio.value = null
    
  },
  { deep: true }
)


</script>

<style scoped>
/* Borde más oscuro para las tarjetas */
.card {
  border-radius: 8px;
  border: 1px solid #ddd; /* Borde gris más visible */
}

/* Ajustar color de la card para separar visualmente */
.card-body {
  background-color: #f9f9f9;
}

.producto-imagen {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.producto-item {
  border-bottom: 1px solid #ddd;
}

.producto-item:last-child {
  border-bottom: none;
}

.producto-detalles {
  font-size: 0.875rem;
  color: #666;
}

/* Ajustar el control de cantidad alineado a la derecha junto a la X */
.cantidad-control {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.cantidad-control input {
  text-align: center;
  width: 50px;
  height: 32px;
  font-size: 0.875rem;
}

.precio {
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
}

.d-flex.justify-content-end {
  padding-top: 8px;
  width: 100%;
}

.btn-outline-secondary {
  border-color: #ddd; /* Color visible */
}

.disabled {
  pointer-events: none; /* Desactiva clics y eventos */
  opacity: 0.5; /* Apariencia deshabilitada */
}
</style>

