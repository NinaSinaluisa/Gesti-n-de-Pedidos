<template>
  <div class="container py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
              <h4>Solicitando un nuevo pedido</h4>
              <small class="text-muted">{{ currentDate}}</small>
          </div>
      </div>

      <div class="row">
          <!-- Cart Column -->
          <div class="col-md-8">
              <div class="card mb-4">
                  <div class="card-header d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">Producto Solicitado</h5>
                      <i class="material-icons">more_vert</i>
                  </div>
                  <div class="card-body">
                      <!-- Product Item -->
                      <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
                          <img v-if="imagenUrl" :src="imagenUrl" alt="Product" class="rounded me-3" style="width: 80px; height: 80px; object-fit: cover;" />
                          <div class="flex-grow-1">
                              <h6 class="mb-0">{{ nombre }}</h6>
                              <p class="text-muted small mb-0">
                                  {{ descripcion }}<br />
                                  Talla: {{ talla }}<br />
                                  Color: {{ color }}
                              </p>
                          </div>
                          <div class="text-end" style="min-width: 100px;">
                              <div>Precio </div>
                              <strong>${{ precio }}</strong>
                          </div>
                      </div>
                  </div>
              </div>

            <!-- Resumen del pedido -->
            <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Resumen del Pedido</h5>
      </div>
      <div class="card-body">
        <!-- Entrada para número de prendas -->
        <div class="mb-3">
          <label for="prendas" class="form-label">Cantidad de Prendas</label>
          <input
            id="prendas"
            type="number"
            v-model.number="prendas"
            @input="validarPrendas"
            class="form-control"
            placeholder="Ingrese el número de prendas"
            :max="30"
            :min="1"
          />
        </div>

        <!-- Mensaje de descuento -->
        <div
          v-if="hayDescuentosAplicables && !aplicaDescuentoPorMayor && cantidadMinimaDescuento > prendas"
          class="text-muted small mt-2"
        >
          Agrega {{ cantidadMinimaDescuento - prendas }} productos más para obtener descuento.
        </div>

        <!-- Fecha de entrega -->
        <div class="d-flex justify-content-between mb-2">
          <span>Fecha de Entrega</span>
          <span><strong>{{ fechaEntrega }}</strong></span>
        </div>

        <!-- Feedback dinámico -->
        <div v-if="mensajeFeedback" class="alert alert-info mt-2">
          {{ mensajeFeedback }}
        </div>

        <!-- Precio con descuento -->
        <div class="d-flex justify-content-between">
          <span>Precio</span>
          <div>
            <span v-if="aplicaDescuentoPorMayor" class="text-decoration-line-through text-muted me-2">
              ${{ precioTotal.toFixed(2) }}
            </span>
            <strong>${{ precioConDescuento.toFixed(2) }}</strong>
          </div>
        </div>

        <hr />
        <div class="d-flex justify-content-between">
          <strong>Total </strong>
          <strong>${{ precioConDescuento.toFixed(2) }}</strong>
        </div>
      </div>
    </div>
          </div>
      

          <!-- Cliente -->
          <div class="col-md-4">
              <div class="card mb-4" v-if="user">
                  <div class="card-header">
                      <h5 class="mb-0">Cliente</h5>
                  </div>
                  <div class="card-body">
                      <div class="d-flex align-items-center mb-3">
                          <div>
                              <h6 class="mb-0">{{ user.nombre }} {{ user.apellido }}</h6>
                              <small class="text-muted">Cuenta creada: {{ formattedDate(user.created_at) }}</small>
                          </div>
                      </div>
                      <div class="mb-3">
                          <div class="d-flex align-items-center mb-2">
                              <i class="material-icons me-2 text-muted">email</i>
                              <span>{{ user.email }}</span>
                          </div>
                          <div class="d-flex align-items-center mb-2">
                              <i class="material-icons me-2 text-muted">phone</i>
                              <span>{{ user.celular }}</span>
                          </div>
                      </div>
                      <hr />
                      <div class="mb-3">
                          <h6>Dirección del Local New Blessings
                          </h6>
                          <p class="mb-0">
                              123 Calle Principal<br />
                              Chimborazo, Riobamba 170504<br />
                              Ecuador
                          </p>
                      </div>
                      <hr />
                  </div>
              </div>

              <div>
              <!-- Botón para enviar correo / crear orden -->
              <!-- <button @click="createOrder" class="btn btn-dark w-100">Enviar Mi Pedido</button> -->
              <div>
                  <div class="mt-2" ref="paypalButtonContainer"></div>
                  <p v-if="loading">Cargando PayPal...</p>
                  <p v-if="error">{{ error }}</p>
              </div>

            </div>
          </div>
      </div>
  </div>

 

</template>

  
  <script setup>
  import { useRoute } from "vue-router"; 
  import { ref, computed } from "vue";
  import {  onMounted } from 'vue';
  import Swal from "sweetalert2"; 
  import User from '@/apis/User';
import { PublicApi } from "@/apis/Api";
import { useRouter } from "vue-router";
import axios from "axios";


// Obtener los query params de la URL
const route = useRoute();
const queryParams = route.query;


 const productoId = queryParams.producto_id;  
  const varianteId = queryParams.variante_id;
  const nombre = queryParams.nombre;
  const descripcion = queryParams.descripcion;
  const precio = queryParams.precio;
  const talla_id = queryParams.talla_id;  
  const talla = queryParams.talla;
  const color = queryParams.color || 'No Color';
  // const imagenUrl = queryParams.imagen_url || '';
  const imagenUrl = computed(() => decodeURIComponent(route.query.imagen_url));


const user = ref(null);
const prendas = ref(1); // Por defecto, una prenda
const precioBasePorPrenda = precio; // Precio base por unidad
const mensajeFeedback = ref("");
const fechaEntrega = ref(""); // Fecha de entrega calculada
const ordenCreada = ref(false);
const currentDate = ref('');
const router = useRouter();

const cantidadPrendas = ref(0);
const cuposActuales = ref({
  cupo_6: 0,
  cupo_15: 0,
  cupo_30: 0
});

const formattedDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const loadUser = async () => {
  try {
    const response = await User.UsuarioActual();
    if (response) {
      user.value = response;
    }
  } catch (error) {
    console.error('Error al cargar el usuario:', error);
  }
};
onMounted(() => {
  loadUser();
  fetchDescuentos();
  const now = new Date();

  const options = {
    day: 'numeric',
    month: 'long', 
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  const formatted = now.toLocaleDateString('es-ES', options);
  const [datePart, timePart] = formatted.split(', ');
  currentDate.value = `${datePart} at ${timePart}`;
});


// Computed para el precio total
const precioTotal = computed(() => prendas.value * precioBasePorPrenda);




const validarPrendas = () => {
  let numPrendas = parseInt(prendas.value);

  if (prendas.value === "") {
    mensajeFeedback.value = ""; // Limpiar mensaje de feedback
    fechaEntrega.value = "";   // Limpiar fecha de entrega
    return; // Sale de la función sin hacer más validaciones
  }
  // Validar que sea un número entero válido
  if (isNaN(numPrendas)) {
    mensajeFeedback.value = "Introduce un número válido de prendas entre 1 y 30.";
    return;
  }

  // Ajustar el valor dentro del rango 1-30
  if (numPrendas < 1) {
    prendas.value = "1";
  } else if (numPrendas > 30) {
    prendas.value = "30";
  }

  // Llamamos a la API para obtener la fecha de entrega con el valor ajustado
  obtenerFechaEntrega();
};



// const obtenerFechaEntrega = async () => {
//   // Limpiamos el mensaje de feedback antes de hacer la solicitud
//   mensajeFeedback.value = "";

//   try {
//     // Realiza la solicitud al servidor con la cantidad de prendas
//     const response = await PublicApi.post("calcular-fecha-entrega", {
//       cantidad: prendas.value, // Enviar el número de prendas al servidor
//     });

//     if (response.status === 200) {
//       // Convertir la fecha ISO a un objeto Date
//       const fechaEntregaOriginal = new Date(response.data.fecha_entrega);

//       // Sumar un día a la fecha recibida
//       const fechaEntregaAjustada = new Date(fechaEntregaOriginal);
//       fechaEntregaAjustada.setDate(fechaEntregaAjustada.getDate() + 1); // Agregar un día

//       // Formatear la fecha ajustada
//       fechaEntrega.value = fechaEntregaAjustada.toLocaleDateString("es-ES", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       });

//       // Determinar el mensaje de feedback en función de la cantidad de prendas
//       let mensaje = "";
//       if (prendas.value <= 6) {
//         mensaje =
//           "El pedido incluye hasta 6 prendas, por lo tanto, la fecha de entrega es en 3 días.";
//       } else if (prendas.value <= 15) {
//         mensaje =
//           "El pedido incluye entre 7 y 15 prendas, por lo tanto, la fecha de entrega es en 6 días.";
//       } else if (prendas.value <= 30) {
//         mensaje =
//           "El pedido incluye entre 16 y 30 prendas, por lo tanto, la fecha de entrega es en 12 días.";
//       }

//       // Mostrar el mensaje de feedback
//       mensajeFeedback.value = mensaje;
//     } else {
//       mensajeFeedback.value = "No se pudo obtener la fecha de entrega.";
//     }
//   } catch (error) {
//     console.error("Error al obtener la fecha de entrega:", error);
//     mensajeFeedback.value =
//       error.response?.data?.message ||
//       "Hubo un error al consultar la fecha.";
//   }
// };






// Crear una nueva orden

const obtenerFechaEntrega = async () => {
  mensajeFeedback.value = "";
  fechaEntrega.value = "";

  try {
    const response = await PublicApi.post("calcular-fecha-entrega", {
      cantidad: prendas.value,
    });

    if (response.data.status === "success") {
      // Convertir la fecha ISO a un objeto Date y sumar un día
      const fechaEntregaOriginal = new Date(response.data.fecha_entrega);
      const fechaEntregaAjustada = new Date(fechaEntregaOriginal);
      fechaEntregaAjustada.setDate(fechaEntregaAjustada.getDate() + 1);

      // Formatear la fecha ajustada
      fechaEntrega.value = fechaEntregaAjustada.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Actualizar los valores de las refs
      cantidadPrendas.value = response.data.cantidad_prendas;
      cuposActuales.value = response.data.cupos_actuales;

      // Usar el mensaje de la API y agregarle información adicional
      let mensajeDetallado = response.data.mensaje + `. La fecha de entrega será el ${fechaEntrega.value}.`;

      // Agregar nota sobre días hábiles
      mensajeDetallado += "\nNota: Los días hábiles no incluyen fines de semana ni festivos.";

      mensajeFeedback.value = mensajeDetallado;

    } else {
      mensajeFeedback.value = response.data.mensaje || "No se pudo calcular la fecha de entrega.";
    }
  } catch (error) {
    console.error("Error al obtener la fecha de entrega:", error);
    mensajeFeedback.value =
      error.response?.data?.message ||
       "Hubo un error al consultar la fecha.";
  }
};

// const createOrder = async () => {
//   // Validaciones
//   if (!user.value || !user.value.id) {
//     Swal.fire({
//       icon: "error",
//       title: "Error",
//       text: "Por favor, inicie sesión para realizar el pedido.",
//     });
//     return;
//   }

//   if (!prendas.value || prendas.value <= 0) {
//     Swal.fire({
//       icon: "warning",
//       title: "Advertencia",
//       text: "La cantidad de productos debe ser mayor que 0.",
//     });
//     return;
//   }

//   const ordenData = {
//   usuario_id: user.value.id, // ID del usuario
//   productos: [
//     {
//       detalles_productos_id: varianteId, // Identificador de la variante o producto
//       cantidad: prendas.value,           // Cantidad del producto
//       talla_id: parseInt(talla_id),              // ID de la talla
//     },
//   ],
// };
// console.log(JSON.stringify(ordenData, null, 2));
//   try {
//     // Enviar la solicitud a la API
//     const response = await PublicApi.post("orden", ordenData);

//     if (response.status === 200) {
//       // Mostrar mensaje con SweetAlert
//       await Swal.fire({
//         icon: "success",
//         title: "¡Éxito!",
//         text: "¡La orden se ha creado exitosamente!",
//         confirmButtonText: "Aceptar",
//       });

//       // Redirigir al Home después del mensaje
//       router.push('/Pedidos')
//     } else {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Hubo un problema al crear la orden.",
//       });
//     }
//   } catch (error) {
//     console.error("Error al crear la orden:", error);

//     Swal.fire({
//       icon: "error",
//       title: "Error",
//       text: "Hubo un problema al realizar el pedido. Inténtelo de nuevo más tarde.",
//     });
//   }
// };
  
import { loadScript } from '@paypal/paypal-js';
const paypalButtonContainer = ref(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    // Cargar el SDK de PayPal
    const paypal = await loadScript({
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX,
      currency: 'USD',
    });

    // Renderizar el botón de PayPal
    paypal.Buttons({
      createOrder: async (data, actions) => {
        // Validaciones antes de crear la orden
        if (!user.value || !user.value.id) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, inicie sesión para realizar el pedido.",
          });
          return;
        }

        if (!prendas.value || prendas.value <= 0) {
          Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: "La cantidad de productos debe ser mayor que 0.",
          });
          return;
        }

        // Crear la orden en tu backend
        const ordenData = {
          usuario_id: user.value.id,
          productos: [
            {
              detalles_productos_id: varianteId,
              cantidad: prendas.value,
              talla_id: parseInt(talla_id),
            },
          ],
        };

        try {
          const response = await PublicApi.post("orden", ordenData);
          if (response.status === 200) {
            // Crear la orden de PayPal con el total del carrito
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: precioConDescuento.value.toFixed(2), // Usar el total del carrito
                    currency_code: 'USD',
                  },
                },
              ],
            });
          } else {
            throw new Error("Error al crear la orden en el backend");
          }
        } catch (err) {
          console.error("Error al crear la orden:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al crear la orden. Inténtelo de nuevo más tarde.",
          });
          throw err; // Propagar el error para que PayPal lo maneje
        }
      },
      onApprove: async (data, actions) => {
        try {
          // Capturar la orden de PayPal
          const details = await actions.order.capture();

          // Mostrar mensaje de éxito con SweetAlert2
          await Swal.fire({
            icon: 'success',
            title: 'Pago exitoso',
            text: `Gracias por tu compra, ${details.payer.name.given_name}.`,
            confirmButtonText: 'Aceptar',
          });

          // Redirigir al usuario después del pago exitoso
          router.push('/Pedidos');
        } catch (err) {
          console.error('Error al procesar el pago:', err);
          await Swal.fire({
            icon: 'error',
            title: 'Error al procesar el pago',
            text: 'Hubo un problema al procesar tu pago. Intenta nuevamente.',
            confirmButtonText: 'Aceptar',
          });
        }
      },
      onCancel: (data) => {
        Swal.fire({
          icon: 'warning',
          title: 'Pago cancelado',
          text: 'El pago fue cancelado por el usuario.',
          confirmButtonText: 'Aceptar',
        });
      },
      onError: (err) => {
        error.value = 'Error: ' + err.message;
        Swal.fire({
          icon: 'error',
          title: 'Error en el pago',
          text: 'Hubo un problema al procesar tu pago. Intenta nuevamente.',
          confirmButtonText: 'Aceptar',
        });
      },
    }).render(paypalButtonContainer.value); // Renderizar en el contenedor

    // Indicar que el SDK se cargó correctamente
    loading.value = false;
  } catch (err) {
    // Manejar errores al cargar el SDK
    error.value = 'Error al cargar PayPal: ' + err.message;
    loading.value = false;
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar PayPal',
      text: 'No se pudo cargar el SDK de PayPal. Intenta recargar la página.',
      confirmButtonText: 'Aceptar',
    });
  }
});

// Variables para manejar descuentos
const descuentosActivos = ref([]);

// Obtener descuentos activos desde la API
const fetchDescuentos = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/descuentos');
    descuentosActivos.value = response.data.data;
  } catch (error) {
    console.error('Error obteniendo descuentos:', error);
  }
};

// Verificar si el producto actual es elegible para algún descuento
const hayDescuentosAplicables = computed(() => {
  return descuentosActivos.value.some(
    (descuento) =>
      descuento.activo && // Solo descuentos activos
      (descuento.aplica_todos_productos || // Aplica a todos los productos
        descuento.detalles_productos.some(
          (dp) => dp.id === parseInt(varianteId) // O aplica al producto actual
        ))
  );
});

// Obtener la cantidad mínima máxima de los descuentos activos aplicables
const cantidadMinimaDescuento = computed(() => {
  if (!descuentosActivos.value.length) return 0;

  // Filtra los descuentos activos que aplican al producto actual
  const descuentosAplicables = descuentosActivos.value.filter(
    (descuento) =>
      descuento.activo &&
      (descuento.aplica_todos_productos ||
        descuento.detalles_productos.some((dp) => dp.id === parseInt(varianteId)))
  );

  // Si no hay descuentos aplicables, retorna 0
  if (descuentosAplicables.length === 0) return 0;

  // Retorna la cantidad mínima máxima
  return Math.max(...descuentosAplicables.map((d) => d.cantidad_minima));
});

// Verificar si se aplica el descuento por mayor
const aplicaDescuentoPorMayor = computed(() => {
  return hayDescuentosAplicables.value && prendas.value >= cantidadMinimaDescuento.value;
});

// Calcular el precio con descuento
const precioConDescuento = computed(() => {
  if (!aplicaDescuentoPorMayor.value) return precioTotal.value;

  // Encuentra el descuento aplicable
  const descuentoAplicable = descuentosActivos.value.find(
    (descuento) =>
      descuento.activo &&
      (descuento.aplica_todos_productos ||
        descuento.detalles_productos.some((dp) => dp.id === parseInt(varianteId)))
  );

  if (!descuentoAplicable) return precioTotal.value;

  // Aplicar el descuento
  if (descuentoAplicable.tipo === "porcentaje") {
    const descuento = (precioTotal.value * parseFloat(descuentoAplicable.valor)) / 100;
    return precioTotal.value - descuento;
  } else if (descuentoAplicable.tipo === "monto_fijo") {
    return precioTotal.value - parseFloat(descuentoAplicable.valor);
  }

  return precioTotal.value;
});


  </script>
  
  <style scoped>
  .card {
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .card-header {
    background-color: white;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  
  .badge {
    padding: 8px 12px;
    border-radius: 20px;
  }
  
  .material-icons {
    font-size: 20px;
    color: #666;
  }
  
  .btn-light {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
  }
  
  .btn-light:hover {
    background-color: #e9ecef;
  }
  </style>