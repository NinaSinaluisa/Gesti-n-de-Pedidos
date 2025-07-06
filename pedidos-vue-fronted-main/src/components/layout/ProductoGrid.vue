<template>
  <div class="catalog-container">
    <!-- Encabezado minimalista -->
    <div class="catalog-header text-center mb-5">
      <h2 class="title">NUESTRAS CAMISAS</h2>
      <p class="subtitle">Elige tu favorita y realiza tu pedido</p>
    </div>

    <!-- Grid de productos optimizado -->
    <div class="product-grid">
      <div 
        v-for="category in categoriesWithImages" 
        :key="category.id"
        class="product-card"
      >
        <!-- Contenedor de imagen cuadrada -->
        <div class="image-container">
          <img
            :src="category.imagenUrl"
            :alt="'Camisa ' + category.nombre"
            class="product-image"
            loading="lazy"
          >
        </div>

        <!-- Información del producto -->
        <div class="product-info">
          <h3 class="product-name">{{ formatName(category.nombre) }}</h3>
          
          <div class="price-section">
            <span class="price">${{ category.precio_base }}</span>
            <span class="price-label">Precio unitario</span>
          </div>

          <!-- Selector de tallas -->
         <div class="size-selector" v-if="category.tallas && category.tallas.length">
          <span class="size-label">Tallas:</span>
          <div class="size-options">
            <span 
              v-for="talla in category.tallas" 
              :key="talla.id"
              class="size-option"
            >
              {{ talla.nombre.toUpperCase() }}
            </span>
          </div>
        </div>
          <!-- Botón de acción principal -->
          <router-link 
            :to="{ name: 'DetalleProducto', params: { id: category.id } }"
            custom
            v-slot="{ navigate, href }"
          >
            <button class="order-button" @click="navigate" :href="href">
              <span class="material-icons">shopping_cart</span>
              REALIZAR PEDIDO
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import Producto from "@/apis/Productos";
import { PublicApi } from "@/apis/Api";
import { IMAGE_BASE_URL } from "@/apis/Api";

const categories = ref([]);
const productosConImagenes = ref([]);

function formatName(name) {
  return name.split(' ').map(word =>
    word.length > 3
      ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      : word
  ).join(' ');
}
// Obtener las categorías
const fetchCategories = async () => {
  try {
    const data = await Producto.fetchCategoriesPublica();
    categories.value = data; // Asignar categorías obtenidas
  } catch (error) {
    console.error("Error al obtener categorías públicas:", error);
  }
};

// Obtener productos con imágenes
const fetchProductosConImagenes = async () => {
  try {
    const response = await PublicApi.get('/variante-productos');
    productosConImagenes.value = response.data.data; // Asignar datos obtenidos
  } catch (error) {
    console.error("Error al obtener productos con imágenes:", error);
  }
};

const categoriesWithImages = computed(() =>
  categories.value
    .map((category) => {
      const productos = productosConImagenes.value.find(
        (producto) => producto.categoria_id === category.id
      )?.productos;

      const primeraVariante = productos?.flatMap((producto) =>
        producto.variantes
      ).find((variante) => variante.imagen_url);

      if (primeraVariante) {
        const imagenUrl = `${IMAGE_BASE_URL}/${primeraVariante.imagen_url}`;
        console.log(`Imagen para la categoría "${category.nombre}": ${imagenUrl}`);
        
        // Extraer las tallas disponibles de la primera variante
        const tallasDisponibles = primeraVariante.tallas.map(talla => ({
          id: talla.id,
          nombre: talla.nombre
        }));

        return {
          id: category.id,
          nombre: category.nombre,
          imagenUrl,
          precio_base: primeraVariante.precio_base,
          tallas: tallasDisponibles // Añadir las tallas al objeto de categoría
        };
      }

      console.log(`No hay imagen para la categoría "${category.nombre}"`);
      return null;
    })
    .filter(Boolean) // Eliminar categorías sin imagen
);
onMounted(async () => {
  await fetchCategories(); // Obtener categorías
  await fetchProductosConImagenes(); // Obtener imágenes
});
</script>

<style scoped>
/* Variables de color modernas */
:root {
  --primary: #2C3E50; /* Azul oscuro profesional */
  --secondary: #3498DB; /* Azul brillante */
  --accent: #E74C3C; /* Rojo solo para elementos importantes */
  --light: #FFFFFF;
  --light-gray: #ECF0F1;
  --text: #333333;
  --text-light: #7F8C8D;
}

.catalog-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.catalog-header {
  padding: 0 15px;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 1.5px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.subtitle {
  font-size: 1.1rem;
  color: var(--text-light);
  font-weight: 400;
}

/* Grid de productos optimizado para más elementos */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 10px;
}

/* Tarjeta de producto cuadrada */
.product-card {
  background: var(--light);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

/* Contenedor de imagen cuadrada */
.image-container {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

/* Información del producto */
.product-info {
  padding: 18px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 12px;
  text-align: center;
  line-height: 1.3;
  flex-grow: 1;
}

.price-section {
  margin: 10px 0 15px;
  text-align: center;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary);
  display: block;
  line-height: 1;
}

.price-label {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Botón de pedido atractivo */
.order-button {
  background: var(--secondary);
  color: var(--light);
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
}

.order-button:hover {
  background: var(--primary);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.order-button .material-icons {
  font-size: 1.2rem;
}

/* Estilos para el selector de tallas */
.size-selector {
  margin: 10px 0;
  display: flex;
  align-items: flex-start; /* Alinea al inicio por si hay múltiples líneas */
  gap: 8px;
  font-size: 0.9rem;
  width: 100%;
}

.size-label {
  white-space: nowrap; /* Evita que "Tallas:" se parta en dos líneas */
  color: #666;
  padding-top: 2px; /* Alinea verticalmente con la primera línea de tallas */
}

.size-options {
  display: flex;
  flex-wrap: wrap; /* Esto permite el salto de línea */
  gap: 6px;
  flex: 1; /* Ocupa todo el espacio restante */
}

.size-option {
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #333;
  white-space: nowrap;
}
/* Responsive para más productos por fila */
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }
  
  .product-name {
    font-size: 1rem;
  }
  
  .price {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .order-button {
    padding: 10px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .product-info {
    padding: 12px;
  }
}
</style>