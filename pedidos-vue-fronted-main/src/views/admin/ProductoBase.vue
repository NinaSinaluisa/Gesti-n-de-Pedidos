<template>
  <div class="container mt-3">
    <h3 class="text-center">Administración de Productos</h3>

    <!-- Botón para añadir producto base -->
    <button
      type="button"
      class="btn btn-primary mb-3 d-flex align-items-center gap-2"
      @click="openAddCategoryModal"
    >
      <span class="material-icons">add</span>
      Añadir Nuevo Producto Base
    </button>

    <!-- Tabla de productos base -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th class="fw-bold">Nº</th>
                <th class="fw-bold">Nombre</th>
                <th class="fw-bold">Descripción</th>
                <th class="fw-bold">Categoría</th>
                <th class="fw-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(producto, index) in categories" :key="producto.id">
                <td>{{ index + 1 }}</td>
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.descripcion }}</td>
                <td>{{ producto.categoria.nombre }}</td>
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
                      @click="deleteCategory(producto.id)"
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

    <!-- Modal para añadir producto base -->
    <div class="modal fade" id="addCategoryModal" tabindex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addCategoryModalLabel">Añadir Producto Base</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="categoryName" class="form-label">Nombre</label>
              <input type="text" id="categoryName" v-model="categoryName" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="categoryDescription" class="form-label">Descripción</label>
              <input type="text" id="categoryDescription" v-model="categoryDescription" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="categorySelect" class="form-label">Categoría</label>
              <select 
                id="categorySelect" 
                v-model="selectedCategory" 
                class="form-select"
                required
              >
                <option value="" disabled selected>Seleccione una categoría</option>
                <option 
                  v-for="categoria in allCategories" 
                  :key="categoria.id" 
                  :value="categoria.id"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" @click="addCategory" class="btn btn-primary">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para editar producto base -->
    <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editCategoryModalLabel">Actualizar Producto Base</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="editCategoryName" class="form-label">Nombre</label>
              <input type="text" id="editCategoryName" v-model="categoryName" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="editCategoryDescription" class="form-label">Descripción</label>
              <input type="text" id="editCategoryDescription" v-model="categoryDescription" class="form-control" />
            </div>
            <div class="mb-3">
              <label for="editCategorySelect" class="form-label">Categoría</label>
              <select 
                id="editCategorySelect" 
                v-model="selectedCategory" 
                class="form-select"
                required
              >
                <option value="" disabled>Seleccione una categoría</option>
                <option 
                  v-for="categoria in allCategories" 
                  :key="categoria.id" 
                  :value="categoria.id"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" @click="updateCategory" class="btn btn-primary">Actualizar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductoBase from '@/apis/ProductosBase';
import Producto from '@/apis/Productos';
import { show_alerta } from '@/apis/Api';
import Swal from 'sweetalert2';

const categories = ref([]);
const categoryName = ref("");
const categoryDescription = ref("");
const selectedCategory = ref(null);
const allCategories = ref([]);
const currentCategoryId = ref(null);

// Cargar productos base y categorías
const fetchCategories = async () => {
  try {
    const data = await ProductoBase.fetchCategories();
    categories.value = [...data];
  } catch (error) {
    console.error("Error al cargar los productos base:", error);
  }
};

const fetchAllCategories = async () => {
  try {
    const response = await Producto.fetchCategories();
    allCategories.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Error al cargar todas las categorías:", error);
    show_alerta('Error al cargar las categorías', 'error');
  }
};

// Abrir modal para añadir producto base
const openAddCategoryModal = async () => {
  try {
    await fetchAllCategories();
    categoryName.value = "";
    categoryDescription.value = "";
    selectedCategory.value = null;
    const modalElement = document.getElementById('addCategoryModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  } catch (error) {
    console.error("Error al abrir el modal:", error);
    show_alerta('Error al cargar las categorías', 'error');
  }
};

// Abrir modal para editar producto base
const openEditModal = async (producto) => {
  try {
    await fetchAllCategories();
    categoryName.value = producto.nombre;
    categoryDescription.value = producto.descripcion;
    selectedCategory.value = producto.categoria?.id;
    currentCategoryId.value = producto.id;
    const modalElement = document.getElementById('editCategoryModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  } catch (error) {
    console.error("Error al abrir el modal de edición:", error);
    show_alerta('Error al cargar las categorías', 'error');
  }
};

// Añadir producto base
const addCategory = async () => {
  if (!categoryName.value || !categoryDescription.value || !selectedCategory.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = {
      nombre: categoryName.value,
      descripcion: categoryDescription.value,
      categoria_id: selectedCategory.value,
    };

    const response = await ProductoBase.createCategory(categoryData);
    show_alerta('Producto base creado correctamente', 'success');

    if (response && response.data) {
      categories.value.push(response.data);
      categoryName.value = "";
      categoryDescription.value = "";
      selectedCategory.value = null;
      const modalElement = document.getElementById('addCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al crear el producto base:", error);
    show_alerta('Error al crear el producto base', 'error');
  }
};

// Actualizar producto base
const updateCategory = async () => {
  if (!categoryName.value || !categoryDescription.value || !selectedCategory.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = {
      nombre: categoryName.value,
      descripcion: categoryDescription.value,
      categoria_id: selectedCategory.value,
    };

    const response = await ProductoBase.updateCategory(currentCategoryId.value, categoryData);
    show_alerta('Producto base actualizado correctamente', 'success');

    if (response && response.data) {
      const index = categories.value.findIndex(category => category.id === currentCategoryId.value);
      categories.value[index] = response.data;
      categoryName.value = "";
      categoryDescription.value = "";
      selectedCategory.value = null;
      const modalElement = document.getElementById('editCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al actualizar el producto base:", error);
    show_alerta('Error al actualizar el producto base', 'error');
  }
};

// Eliminar producto base
const deleteCategory = async (id) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro de eliminar este producto base?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      const response = await ProductoBase.deleteCategory(id);
      if (response) {
        categories.value = categories.value.filter(category => category.id !== id);
        show_alerta('Producto base eliminado correctamente', 'success');
      }
    } else {
      show_alerta('Eliminación cancelada', 'info');
    }
  } catch (error) {
    console.error("Error al eliminar el producto base:", error);
    show_alerta('Error al eliminar el producto base', 'error');
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchAllCategories()]);
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