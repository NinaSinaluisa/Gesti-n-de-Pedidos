<template>
  <div class="container py-5">
    <div class="row">
      <!-- Mini-galería: Slider Vertical -->
      <div class="col-md-2">
        <div class="vertical-slider-container">
          <button 
            class="nav-button prev d-flex align-items-center justify-content-center"
            @click="handleScroll('up')"
          >
            &#9650;
          </button>
          
          <div class="vertical-slider custom-scrollbar" ref="sliderRef">
            <img
              v-for="(variante, index) in productoSeleccionado?.variantes"
              :key="index"
              :src="`${IMAGE_BASE_URL}/${variante.imagen_url}`"
              alt="Miniatura"
              class="thumbnail"
              :class="{ 'selected-thumbnail': variante.imagen_url === varianteSeleccionada?.imagen_url }"
              @click="actualizarProductoSeleccionado(variante)"
            />
          </div>
          
          <button 
            class="nav-button next d-flex align-items-center justify-content-center"
            @click="handleScroll('down')"
          >
            &#9660;
          </button>
        </div>
      </div>

      <!-- Imagen principal -->
      <div class="col-md-6 main-image-container">
        <img
          v-if="selectedImage"
          :src="selectedImage"
          alt="Producto"
          class="main-image"
        />
        <p v-else>Cargando imagen...</p>
      </div>

      <!-- Detalles del producto -->
      <div class="col-md-4">
        <h2 v-if="productoSeleccionado">{{ productoSeleccionado.nombre }}</h2>
        <p v-if="productoSeleccionado">{{ productoSeleccionado.descripcion }}</p>
        <p v-if="varianteSeleccionada">
          <strong>${{ varianteSeleccionada.precio_base }}</strong>
        </p>

        <!-- Colores -->
        <div v-if="productoSeleccionado?.variantes?.length" class="mb-3">
          <span>Color: <strong>{{ varianteSeleccionada?.color || 'Seleccione un color' }}</strong></span>
          <div class="d-flex gap-2 mt-2">
            <div
              v-for="(variante, index) in productoSeleccionado.variantes"
              :key="index"
              class="color-box"
              :style="{ background: variante.color_codigo_hex }"
              :class="{ 'border border-dark': variante.color === varianteSeleccionada?.color }"
              @click="actualizarProductoSeleccionado(variante)"
            ></div>
          </div>
        </div>

        <!-- Tallas -->
        <div v-if="varianteSeleccionada?.tallas?.length" class="mb-3">
          <span>Tallas:</span>
          <div class="d-flex gap-2 mt-2">
            <button
              v-for="talla in varianteSeleccionada.tallas"
              :key="talla.id"
              class="btn btn-outline-secondary btn-sm"
              :class="{ active: tallaSeleccionada === talla.nombre }"
              @click="seleccionarTalla(talla.nombre)"
            >
              {{ talla.nombre }}
            </button>
          </div>
        </div>

        <!-- Campo de cantidad -->
        <div class="mb-3">
          <label for="cantidad" class="form-label">Cantidad:</label>
          <div class="input-group">
            <button 
              class="btn btn-outline-secondary" 
              @click="decrementarCantidad"
              :disabled="!tallaSeleccionada"
            >
              -
            </button>
            <input
              type="text"
              class="form-control text-center"
              id="cantidad"
              v-model="cantidadInput"
              @input="handleInput"
              @blur="handleBlur"
              @keypress="validarInput"
              :disabled="!tallaSeleccionada"
            >
            <button 
              class="btn btn-outline-secondary" 
              @click="incrementarCantidad"
              :disabled="!tallaSeleccionada"
            >
              +
            </button>
          </div>
          <small class="text-muted">Máximo 30 unidades</small>
        </div>

        <!-- Botones de acción -->
        <button 
          class="btn btn-success w-100 mb-2" 
          :disabled="!tallaSeleccionada"
          @click="añadirAlCarrito"
        >
          Añadir al carrito
        </button>
        <!-- <button 
          class="btn btn-outline-primary w-100"
          :disabled="!tallaSeleccionada"
          @click="realizarPedido"
        >
          Ver mi carrito
        </button> -->
      </div>
    </div>
  </div>

    

</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router"; 
import { useUserStore } from '@/stores/authstore';
import { IMAGE_BASE_URL } from "@/apis/Api";
import { PublicApi } from "@/apis/Api";
import { useCartStore } from '@/stores/cartStore';


const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

const productos = ref([]);
const productoSeleccionado = ref(null);
const varianteSeleccionada = ref(null);
const selectedImage = ref("");
const sliderRef = ref(null);
const tallaSeleccionada = ref(null);
const cantidad = ref(1);
const cantidadInput = ref('1');
const categoriaId = ref(route.params.id);

const handleScroll = (direction) => {
  if (!sliderRef.value) return;
  const scrollAmount = 100;
  const currentScroll = sliderRef.value.scrollTop;
  
  sliderRef.value.scrollTo({
    top: currentScroll + (direction === 'up' ? -scrollAmount : scrollAmount),
    behavior: 'smooth'
  });
};

const fetchProductos = async () => {
  try {
    const response = await PublicApi.get('/variante-productos');
    if (response.data && Array.isArray(response.data.data)) {
      const categoriaSeleccionada = response.data.data.find(categoria => 
        categoria.categoria_id === parseInt(categoriaId.value)
      );

      if (categoriaSeleccionada) {
        productos.value = categoriaSeleccionada.productos;
        if (productos.value.length > 0) {
          seleccionarProducto(productos.value[0]);
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener los productos:", error);
  }
};

const seleccionarProducto = (producto) => {
  productoSeleccionado.value = producto;
  if (producto.variantes && producto.variantes.length > 0) {
    varianteSeleccionada.value = producto.variantes[0];
    selectedImage.value = `${IMAGE_BASE_URL}/${producto.variantes[0].imagen_url}`;
    tallaSeleccionada.value = null; // Resetear la talla seleccionada
    cantidad.value = 1; // Resetear la cantidad
  }
};

const actualizarProductoSeleccionado = (variante) => {
  varianteSeleccionada.value = variante;
  selectedImage.value = `${IMAGE_BASE_URL}/${variante.imagen_url}`;
  tallaSeleccionada.value = null; // Resetear la talla al cambiar de variante
  cantidad.value = 1; // Resetear la cantidad
};

const seleccionarTalla = (talla) => {
  tallaSeleccionada.value = talla;
};



// const añadirAlCarrito = () => {
//   if (!tallaSeleccionada.value) {
//     alert('Por favor seleccione una talla');
//     return;
//   }
//   // lógica para añadir al carrito
// };

// const realizarPedido = () => {
//   if (!tallaSeleccionada.value) {
//     alert('Por favor seleccione una talla');
//     return;
//   }
//   //  lógica para realizar el pedido
// };
const validarInput = (event) => {
  // Permitir solo números y la tecla de borrar
  if (!/^\d+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Delete') {
    event.preventDefault();
  }
  
  // Impedir que el valor supere 30 mientras se escribe
  let value = event.target.value + event.key;  // Simula el valor con la tecla presionada
  if (parseInt(value) > 30) {
    event.preventDefault(); // Evita el ingreso si el valor sería mayor que 100
  }
};

// Manejar cambios en el input
const handleInput = (event) => {
  // Reemplaza cualquier carácter que no sea un dígito
  cantidadInput.value = event.target.value.replace(/[^\d]/g, '');

  // Controla que el número no sea mayor que 30
  if (parseInt(cantidadInput.value) > 30) {
    cantidadInput.value = '30';  // Si es mayor a 30, lo establece a 100
  }
};

// Validar al perder el foco
const handleBlur = () => {
  let value = parseInt(cantidadInput.value);
  
  if (isNaN(value) || value < 1) {
    value = 1;
  } else if (value > 30) {
    value = 30; // Limita a 100 si es mayor
  }
  
  cantidad.value = value;
  cantidadInput.value = value.toString();
};

const incrementarCantidad = () => {
  if (cantidad.value < 30) {
    cantidad.value++;
    cantidadInput.value = cantidad.value.toString();
  }
};

const decrementarCantidad = () => {
  if (cantidad.value > 1) {
    cantidad.value--;
    cantidadInput.value = cantidad.value.toString();
  }
};



onMounted(() => {
  fetchProductos();
});

// ----------------------------------------------------------
import Swal from "sweetalert2"; 

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

const añadirAlCarrito = () => {
            if (!userStore.authenticated) {
                Swal.fire({
                icon: 'info',
                title: 'Acción requerida',
                text: 'Por favor inicia sesión para añadir productos al carrito',
                confirmButtonText: 'Ir a Login',
                showCancelButton: true,
                cancelButtonText: 'Cancelar'
              }).then((result) => {
                if (result.isConfirmed) {
                  router.push('/login'); // Redirige al login si confirma
                }
              });
              return;
            }

            if (!tallaSeleccionada.value) {
            Toast.fire({
              icon: "warning",
              title: "Por favor seleccione una talla"
            });
            return;
          }

  // Encontrar el ID de la talla seleccionada
  const tallaId = varianteSeleccionada.value.tallas.find(
    t => t.nombre === tallaSeleccionada.value
  )?.id;

  if (!tallaId) {
    alert('Error al identificar la talla seleccionada');
    return;
  }

  try {
    cartStore.addToCart(
      varianteSeleccionada.value.id, // detalles_productos_id
      cantidad.value,                 // cantidad
      tallaId                        // talla_id
    );

    Toast.fire({
      icon: "success",
      title: "Producto añadido al carrito exitosamente"
    });
        
    // Resetear selecciones
    tallaSeleccionada.value = null;
    cantidad.value = 1;
    cantidadInput.value = '1';
  } catch (error) {
    console.error('Error al añadir al carrito:', error);
    if (!tallaSeleccionada.value) {
    Toast.fire({
      icon: "warning",
      title: "Por favor seleccione una talla"
    });
    return;
  }
  }
};

// const realizarPedido = async () => {
//   if (!userStore.authenticated) {
//     alert('Por favor inicie sesión para realizar un pedido');
//     router.push('/login');
//     return;
//   }

//   if (!tallaSeleccionada.value) {
//     alert('Por favor seleccione una talla');
//     return;
//   }

//   // Encontrar el ID de la talla seleccionada
//   const tallaId = varianteSeleccionada.value.tallas.find(
//     t => t.nombre === tallaSeleccionada.value
//   )?.id;

//   if (!tallaId) {
//     alert('Error al identificar la talla seleccionada');
//     return;
//   }

//   try {
//     // Primero añadimos el producto al carrito
//     cartStore.addToCart(
//       varianteSeleccionada.value.id,
//       cantidad.value,
//       tallaId
//     );

//     // Luego creamos la orden inmediatamente
//     await cartStore.createOrder();

//     alert('¡Pedido realizado con éxito!');
//     router.push('/Pedidos'); // O la ruta donde muestres las órdenes del usuario
//   } catch (error) {
//     console.error('Error al realizar el pedido:', error);
//     alert('Error al realizar el pedido');
//   }
// };

// const realizarPedido = () => {
//   if (productoSeleccionado.value && varianteSeleccionada.value) {
//     // Verificar si el usuario está autenticado
//     if (!userStore.authenticated) {
//       // Guardar los detalles del producto en la URL del login
//       router.replace({
//         path: '/Login',
//         query: {
//           redirect: '/DetalleProducto/' + categoriaId.value,
//           returnTo: 'PedidoOrden',
//           producto_id: productoSeleccionado.value.producto_id,
//           variante_id: varianteSeleccionada.value.id,
//           nombre: productoSeleccionado.value.nombre,
//           descripcion: productoSeleccionado.value.descripcion,
//           precio: varianteSeleccionada.value.precio_base,
//           talla: varianteSeleccionada.value.talla,
//           color: varianteSeleccionada.value.color || 'Default Color',
//           imagen_url: encodeURIComponent(`${IMAGE_BASE_URL}/${varianteSeleccionada.value.imagen_url}`)
//         }
//       });
//     } else {
//       // Si está autenticado, proceder directamente a la página de pedido
//       router.replace({
//         name: 'PedidoOrden',
//         query: {
//           producto_id: productoSeleccionado.value.producto_id,
//           variante_id: varianteSeleccionada.value.id,
//           nombre: productoSeleccionado.value.nombre,
//           descripcion: productoSeleccionado.value.descripcion,
//           precio: varianteSeleccionada.value.precio_base,
//           talla: varianteSeleccionada.value.talla,
//           color: varianteSeleccionada.value.color || 'Default Color',
//           imagen_url: `${IMAGE_BASE_URL}/${varianteSeleccionada.value.imagen_url}`
//         }
//       });
//     }
//   }
// };

const realizarPedido = () => {
  // Verificación directa del estado actual (no async)
  if (!userStore.authenticated || !userStore.user) {
    router.push('/login');  // Redirige al login directamente
    
    Swal.fire({
      icon: 'warning',
      title: 'Sesión requerida',
      text: 'Debes iniciar sesión para acceder al carrito',
    });
    return;
  }
  // Verificar que se haya seleccionado una talla
  if (!tallaSeleccionada.value) {
    alert('Por favor seleccione una talla');
    return;
  }

  // Encontrar el ID de la talla seleccionada
  const tallaId = varianteSeleccionada.value.tallas.find(
    t => t.nombre === tallaSeleccionada.value
  )?.id;

  if (!tallaId) {
    alert('Error al identificar la talla seleccionada');
    return;
  }

  // Redirigir a PedidoOrden con todos los datos necesarios
  router.push({
    name: 'PedidoOrden',
    query: {
      producto_id: productoSeleccionado.value.producto_id,
      variante_id: varianteSeleccionada.value.id,
      talla_id: tallaId,
      cantidad: cantidad.value,
      nombre: productoSeleccionado.value.nombre,
      descripcion: productoSeleccionado.value.descripcion,
      precio: varianteSeleccionada.value.precio_base,
      talla: tallaSeleccionada.value,
      color: varianteSeleccionada.value.color || 'Default Color',
      imagen_url: `${IMAGE_BASE_URL}/${varianteSeleccionada.value.imagen_url}`
    }
  });
};

</script>

<style scoped>
.vertical-slider-container {
  position: relative;
  height: 506px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vertical-slider {
  height: 420px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 43px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vertical-slider::-webkit-scrollbar {
  display: none;
}

.nav-button {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 25px;
  border: none;
  background: #000;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  z-index: 2;
}

.nav-button.prev {
  top: 0;
}

.nav-button.next {
  bottom: 0;
}

.thumbnail {
  width: 70px;
  height: 90px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.thumbnail:hover {
  transform: scale(1.1);
}

.selected-thumbnail {
  border: 2px solid #007bff;
}

.main-image-container {
  height: 506px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.color-box {
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.color-box.selected {
  border: 5px solid black; /* Borde distintivo para el seleccionado */
}

/* Estilos móviles */
@media (max-width: 767px) {
  .vertical-slider-container {
    height: 120px;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .vertical-slider {
    height: 90px;
    margin: 0 43px;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .nav-button {
    top: 50% !important;
    bottom: auto !important;
    transform: translateY(-50%) !important;
  }

  .nav-button.prev {
    left: 10px;
    transform: translateY(-50%) rotate(90deg) !important;
  }

  .nav-button.next {
    right: 10px;
    left: auto;
    transform: translateY(-50%) rotate(90deg) !important;
  }

  .main-image-container {
    height: 350px;
  }
}
</style>
