<template>
  <div class="container mt-3">
    <h3 class="text-center">Administración de Productos</h3>

    <!-- Botón para añadir producto final -->
    <button
      type="button"
      class="btn btn-primary mb-3 d-flex align-items-center gap-2"
      @click="openAddProductModal"
    >
      <span class="material-icons">add</span>
      Añadir Nuevo Producto Final
    </button>

    <!-- Tabla de productos finales -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th class="fw-bold">Nº</th>
                <th class="fw-bold">Producto Base</th>
                <th class="fw-bold">Imagen</th>
                <th class="fw-bold">Precio Base</th>
                <th class="fw-bold">Peso (kg)</th> 
                <th class="fw-bold">Color</th>
                <th class="fw-bold">Tallas</th>
                <th class="fw-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(producto, index) in paginatedCategories" :key="producto.id">
                <td>{{ calculateIndex(index) }}</td>
                <td>{{ getProductoBaseName(producto.producto_id) }}</td>
                <td>
                  <img :src="getImageUrl(producto.imagen_url)" alt="Imagen del Producto" class="img-thumbnail" style="max-width: 100px;" />
                </td>
                <td>{{ producto.precio_base }}</td>
                <td>{{ producto.peso_kg }}</td> 
                <td>{{ getColorName(producto.color_id) }}</td>
                <td>
                  <span v-for="talla in producto.tallas" :key="talla.id" class="badge bg-primary me-1">
                    {{ talla.nombre }}
                  </span>
                </td>
                <td>
                  <div class="d-flex justify-content-start gap-2">
                    <!-- Botón para editar -->
                    <button
                      class="btn btn-warning btn-sm d-flex align-items-center"
                      @click="openEditModal(producto)"
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <!-- Botón para eliminar -->
                    <button
                      class="btn btn-danger btn-sm d-flex align-items-center"
                      @click="deleteProduct(producto.id)"
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

    <!-- Modal para añadir producto final -->
    <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addProductModalLabel">Añadir Producto Final</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="baseProductSelect" class="form-label">Producto Base</label>
              <select
                id="baseProductSelect"
                v-model="productData.producto_id"
                class="form-select"
                required
              >
                <option value="" disabled selected>Seleccione un producto base</option>
                <option
                  v-for="producto in baseProducts"
                  :key="producto.id"
                  :value="producto.id"
                >
                  {{ producto.nombre }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label for="productImage" class="form-label">Imagen</label>
              <input 
                type="file" 
                id="productImage" 
                @change="handleImageUpload" 
                class="form-control" 
                accept="image/*" 
                required 
              />
              <div v-if="productData.imagePreview" class="mt-2">
                <img :src="productData.imagePreview" alt="Preview" class="img-thumbnail" style="max-width: 200px;" />
              </div>
            </div>

            <div class="mb-3">
              <label for="productPrice" class="form-label">Precio Base</label>
              <input 
                type="number" 
                step="0.01" 
                id="productPrice" 
                v-model="productData.precio_base" 
                class="form-control" 
                required 
              />
            </div>
              <div class="mb-3">
                <label for="productWeight" class="form-label">Peso (kg)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  id="productWeight" 
                  v-model="productData.peso_kg" 
                  class="form-control" 
                  required 
                  min="0.01"
                />
              </div>
            <div class="mb-3">
              <label for="colorSelect" class="form-label">Color</label>
              <select
                id="colorSelect"
                v-model="productData.color_id"
                class="form-select"
                required
              >
                <option value="" disabled selected>Seleccione un color</option>
                <option
                  v-for="color in colors"
                  :key="color.id"
                  :value="color.id"
                >
                  {{ color.nombre }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Tallas</label>
              <div class="d-flex flex-wrap gap-2">
                <div v-for="talla in sizes" :key="talla.id" class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="'talla_' + talla.id"
                    :value="talla.id"
                    v-model="productData.tallas"
                  />
                  <label class="form-check-label" :for="'talla_' + talla.id">
                    {{ talla.nombre }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" @click="validateForm() && addProduct()" class="btn btn-primary">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para editar producto final -->
    <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editProductModalLabel">Editar Producto Final</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="editBaseProductSelect" class="form-label">Producto Base</label>
              <select
                id="editBaseProductSelect"
                v-model="editData.producto_id"
                class="form-select"
                required
              >
                <option value="" disabled>Seleccione un producto base</option>
                <option
                  v-for="producto in baseProducts"
                  :key="producto.id"
                  :value="producto.id"
                >
                  {{ producto.nombre }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label for="editProductImage" class="form-label">Imagen</label>
              <input 
                type="file" 
                id="editProductImage" 
                @change="handleEditImageUpload" 
                class="form-control" 
                accept="image/*"
              />
              <div v-if="editData.imagePreview" class="mt-2">
                <img :src="editData.imagePreview" alt="Preview" class="img-thumbnail" style="max-width: 200px;" />
              </div>
              <div v-else-if="editData.imagen_url" class="mt-2">
                <img :src="getImageUrl(editData.imagen_url)" alt="Current" class="img-thumbnail" style="max-width: 200px;" />
              </div>
            </div>

            <div class="mb-3">
              <label for="editProductPrice" class="form-label">Precio Base</label>
              <input 
                type="number" 
                step="0.01" 
                id="editProductPrice" 
                v-model="editData.precio_base" 
                class="form-control" 
                required 
              />
            </div>

            <div class="mb-3">
              <label for="editProductWeight" class="form-label">Peso (kg)</label>
              <input 
                type="number" 
                step="0.01" 
                id="editProductWeight" 
                v-model="editData.peso_kg" 
                class="form-control" 
                required 
                min="0.01"
              />
            </div>
            <div class="mb-3">
              <label for="editColorSelect" class="form-label">Color</label>
              <select
                id="editColorSelect"
                v-model="editData.color_id"
                class="form-select"
                required
              >
                <option value="" disabled>Seleccione un color</option>
                <option
                  v-for="color in colors"
                  :key="color.id"
                  :value="color.id"
                >
                  {{ color.nombre }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Tallas</label>
              <div class="d-flex flex-wrap gap-2">
                <div v-for="talla in sizes" :key="talla.id" class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="'edit_talla_' + talla.id"
                    :value="talla.id"
                    v-model="editData.tallas"
                  />
                  <label class="form-check-label" :for="'edit_talla_' + talla.id">
                    {{ talla.nombre }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" @click="updateProduct" class="btn btn-primary">Actualizar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <Pagination 
      :totalItems="products.length" 
      :itemsPerPage="15" 
      :currentPage="currentPage"
      @update:currentPage="currentPage = $event"  
    />
  </div>
</template>


<script setup>
import { ref, onMounted ,computed} from 'vue';
import Pagination from '@/components/admin/Pagination.vue';
import ProductoFinal from '@/apis/ProductosFinal';
import ProductoBase from '@/apis/ProductosBase';
import Tallas from '@/apis/Tallas';
import Colores from '@/apis/Colores';
import { show_alerta } from '@/apis/Api';
import Swal from 'sweetalert2';

const products = ref([]);
const baseProducts = ref([]);
const colors = ref([]);
const sizes = ref([]);

const productData = ref({
  producto_id: '',
  imagen_url: null,
  precio_base: '',
  peso_kg: '', 
  color_id: '',
  tallas: [], // Ahora es un array para múltiples tallas
  imagePreview: null
});

const validateForm = () => {
  if (!productData.value.producto_id) {
    show_alerta("Seleccione un producto base", "warning");
    return false;
  }
  if (!productData.value.precio_base) {
    show_alerta("Ingrese un precio base", "warning");
    return false;
  }
  if (!productData.value.peso_kg) {
  show_alerta("Ingrese el peso del producto", "warning");
  return false;
}
  if (!productData.value.color_id) {
    show_alerta("Seleccione un color", "warning");
    return false;
  }
  if (productData.value.tallas.length === 0) {
    show_alerta("Seleccione al menos una talla", "warning");
    return false;
  }
  if (!(productData.value.imagen_url instanceof File)) {
    show_alerta("Seleccione una imagen válida", "warning");
    return false;
  }
  return true;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  const maxSize = 2 * 1024 * 1024; // 2MB según tu backend

  if (!allowedTypes.includes(file.type)) {
    show_alerta('El archivo debe ser una imagen válida (jpeg, png, jpg, gif)', 'error');
    event.target.value = '';
    return;
  }

  if (file.size > maxSize) {
    show_alerta('La imagen no debe superar los 2MB', 'error');
    event.target.value = '';
    return;
  }

  productData.value.imagen_url = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    productData.value.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
};


const getImageUrl = (imagePath) => {
  if (!imagePath) return ''; // Si no hay imagen
  if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
    return imagePath; // Si es una URL, devuelve la URL
  }
  if (imagePath instanceof File) {
    // Si es un archivo, devolver un 'preview' temporal (solo si es una imagen cargada).
    const reader = new FileReader();
    reader.onload = (e) => {
      return e.target.result;  // Aquí puedes devolver la vista previa de la imagen
    };
    reader.readAsDataURL(imagePath); // Convertir el archivo en base64 para mostrarlo
  }
  // Si es otro tipo de valor (como una imagen sin url), manejarlo aquí
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/storage/${imagePath}`;
};


const getProductoBaseName = (id) => {
  const producto = baseProducts.value.find(p => p.id === id);
  return producto ? producto.nombre : '';
};

const getColorName = (id) => {
  const color = colors.value.find(c => c.id === id);
  return color ? color.nombre : '';
};

const fetchAllData = async () => {
  try {
    const [productsData, baseProductsData, colorsData, sizesData] = await Promise.all([
      ProductoFinal.fetchCategories(),
      ProductoBase.fetchCategories(),
      Colores.fetchColores(),
      Tallas.fetchTallas()
    ]);

    products.value = productsData;
    baseProducts.value = baseProductsData;
    colors.value = colorsData;
    sizes.value = sizesData;
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    show_alerta('Error al cargar los datos', 'error');
  }
};

const openAddProductModal = () => {
  productData.value = {
    producto_id: '',
    imagen_url: null,
    precio_base: '',
    peso_kg: '', 

    color_id: '',
    tallas: [],
    imagePreview: null
  };
  
  const modalElement = document.getElementById('addProductModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

const addProduct = async () => {
  if (!validateForm()) return;

  try {
    const formData = new FormData();
    
    formData.append('producto_id', String(productData.value.producto_id));
    formData.append('precio_base', String(productData.value.precio_base));
    formData.append('peso_kg', String(productData.value.peso_kg));
    formData.append('color_id', String(productData.value.color_id));
    
    // Agregar cada talla seleccionada al FormData
    productData.value.tallas.forEach((tallaId, index) => {
      formData.append(`tallas[${index}]`, tallaId);
    });
    
    if (productData.value.imagen_url instanceof File) {
      formData.append('imagen_url', productData.value.imagen_url);
    }

    const response = await ProductoFinal.createCategory(formData);
    
    if (response && response.data) {
      show_alerta('Producto creado correctamente', 'success');
      await fetchAllData();
      
      const modalElement = document.getElementById('addProductModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }

      productData.value = {
        producto_id: '',
        imagen_url: null,
        precio_base: '',
        peso_kg: '', 
        color_id: '',
        tallas: [],
        imagePreview: null
      };
    }
  } catch (error) {
    console.error("Error al crear el producto:", error);
    show_alerta(error.response?.data?.message || 'Error al crear el producto', 'error');
  }
};

// Agregar el ref para los datos de edición
const editData = ref({
  id: null,
  producto_id: '',
  imagen_url: null,
  precio_base: '',
  peso_kg: '', 
  color_id: '',
  tallas: [],
  imagePreview: null
});

// Función para abrir el modal de edición
const openEditModal = (producto) => {
  editData.value = {
    id: producto.id,
    producto_id: producto.producto_id,
    imagen_url: producto.imagen_url,
    precio_base: producto.precio_base,
    peso_kg: producto.peso_kg, // Asegurarse de incluir el peso
    color_id: producto.color_id,
    tallas: producto.tallas.map(t => t.id), // Extraer solo los IDs de las tallas
    imagePreview: null
  };
  
  const modalElement = document.getElementById('editProductModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

// Función para manejar la carga de imagen en edición
const handleEditImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    show_alerta('El archivo debe ser una imagen válida (jpeg, png, jpg, gif)', 'error');
    event.target.value = '';
    return;
  }

  if (file.size > maxSize) {
    show_alerta('La imagen no debe superar los 2MB', 'error');
    event.target.value = '';
    return;
  }

  editData.value.imagen_url = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    editData.value.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Función para validar el formulario de edición
const validateEditForm = () => {
  if (!editData.value.producto_id) {
    show_alerta("Seleccione un producto base", "warning");
    return false;
  }
  if (!editData.value.precio_base) {
    show_alerta("Ingrese un precio base", "warning");
    return false;
  }
  if (!editData.value.peso_kg) {
  show_alerta("Ingrese el peso del producto", "warning");
  return false;
}
  if (!editData.value.color_id) {
    show_alerta("Seleccione un color", "warning");
    return false;
  }
  if (editData.value.tallas.length === 0) {
    show_alerta("Seleccione al menos una talla", "warning");
    return false;
  }
  return true;
};


const updateProduct = async () => {
  if (!validateEditForm()) return;

  try {
    const formData = new FormData();
    
    // Añadir los campos al FormData solo si tienen valor
    if (editData.value.producto_id) {
      formData.append('producto_id', String(editData.value.producto_id));
    }
    
    if (editData.value.precio_base) {
      formData.append('precio_base', String(editData.value.precio_base));
    }
    if (editData.value.peso_kg) {
      formData.append('peso_kg', String(editData.value.peso_kg));
    }
    
    if (editData.value.color_id) {
      formData.append('color_id', String(editData.value.color_id));
    }
    
    // Añadir tallas seleccionadas
    if (editData.value.tallas && editData.value.tallas.length > 0) {
      editData.value.tallas.forEach((tallaId, index) => {
        formData.append(`tallas[${index}]`, String(tallaId));
      });
    }
    
    // Añadir imagen solo si se seleccionó una nueva
    if (editData.value.imagen_url instanceof File) {
      formData.append('imagen_url', editData.value.imagen_url);
    }

    // Asegurarse que ProductoFinal.updateCategory use POST
    const response = await ProductoFinal.updateCategory(editData.value.id, formData);
    
    if (response && response.data) {
      show_alerta('Producto actualizado correctamente', 'success');
      await fetchAllData();
      
      const modalElement = document.getElementById('editProductModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Limpiar el formulario después de actualizar
      editData.value = {
        id: null,
        producto_id: '',
        imagen_url: null,
        precio_base: '',
        peso_kg: '',
        color_id: '',
        tallas: [],
        imagePreview: null
      };
    }
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    show_alerta(
      error.response?.data?.message || 'Error al actualizar el producto', 
      'error'
    );
  }
};

const deleteProduct = async (id) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro de eliminar este producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      buttonsStyling: true,
    });

    if (result.isConfirmed) {
      const response = await ProductoFinal.deleteCategory(id);
      if (response) {
        await fetchAllData();
        show_alerta('Producto eliminado correctamente', 'success');
      }
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    show_alerta('Error al eliminar el producto', 'error');
  }
};

onMounted(async () => {
  await fetchAllData();
});

const currentPage = ref(1);

const startIndex = computed(() => (currentPage.value - 1) * 15);
const endIndex = computed(() => Math.min(startIndex.value + 15, products.value.length));

const paginatedCategories = computed(() => {
  return products.value.slice(startIndex.value, endIndex.value);
});


const calculateIndex = (index) => {
  return startIndex.value + index + 1;  
};
</script>

<style scoped>
.product-image {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}

/* Estilo para la preview de la imagen en el modal */
.image-preview {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
}



.btn-group {
  gap: 10px; /* Espaciado entre botones */
}
</style>