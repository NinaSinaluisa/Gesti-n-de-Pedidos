<template>
  <h3 class="text-center">Administración de Categorías</h3>
  <div class="mb-4">
    <button
      type="button"
      class="btn btn-primary d-flex align-items-center gap-2"
      @click="openAddCategoryModal"
    >
      <span class="material-icons">add</span>
      Añadir Nueva Categoría
    </button>
  </div>
  
  <!-- Modal para agregar categoría -->
  <div class="modal fade" id="addCategoryModal" tabindex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addCategoryModalLabel">Añadir Categoría</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="categoryName" class="form-label fw-semibold">Nombre</label>
            <input 
              type="text" 
              id="categoryName" 
              v-model="categoryName" 
              class="form-control" 
              placeholder="Ingrese el nombre de la categoría"
            />
          </div>
          <div class="mb-3">
            <label for="categoryDescription" class="form-label fw-semibold">Descripción</label>
            <input 
              type="text" 
              id="categoryDescription" 
              v-model="categoryDescription" 
              class="form-control" 
              placeholder="Ingrese la descripción"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" @click="addCategory" class="btn btn-primary">Guardar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para actualizar categoría -->
  <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editCategoryModalLabel">Actualizar Categoría</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="editCategoryName" class="form-label fw-semibold">Nombre</label>
            <input 
              type="text" 
              id="editCategoryName" 
              v-model="categoryName" 
              class="form-control" 
              placeholder="Ingrese el nombre de la categoría"
            />
          </div>
          <div class="mb-3">
            <label for="editCategoryDescription" class="form-label fw-semibold">Descripción</label>
            <input 
              type="text" 
              id="editCategoryDescription" 
              v-model="categoryDescription" 
              class="form-control" 
              placeholder="Ingrese la descripción"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" @click="updateCategory" class="btn btn-primary">Actualizar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Lista de categorías -->
  <div class="card">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width: 80px">Nº</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th class="text-center" style="width: 150px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(category, index) in paginatedCategories" :key="category.id">
              <td class="text-center">{{ calculateIndex(index) }}</td>
              <td class="fw-medium">{{ category.nombre }}</td>
              <td>{{ category.descripcion }}</td>
              <td>
                <div class="d-flex justify-content-center gap-2">
                  <button 
                    @click="openEditModal(category)" 
                    class="btn btn-warning btn-sm" 
                    title="Editar"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                  <button 
                    @click="deleteCategory(category.id)" 
                    class="btn btn-danger btn-sm" 
                    title="Eliminar"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      
    </div>
  </div>
  <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted">
          Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ totalItems }} registros
        </div>
        <div class="pagination-container">
          <button 
            class="btn btn-outline-primary btn-sm me-2" 
            @click="previousPage"
            :disabled="currentPage === 1"
          >
            <span class="material-icons">chevron_left</span>
          </button>
          <div class="btn-group">
            <button 
              v-for="page in displayedPages" 
              :key="page"
              @click="goToPage(page)"
              class="btn btn-sm"
              :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
            >
              {{ page }}
            </button>
          </div>
          <button 
            class="btn btn-outline-primary btn-sm ms-2" 
            @click="nextPage"
            :disabled="currentPage === totalPages"
          >
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import Producto from '@/apis/Productos';
import { show_alerta } from '@/apis/Api';
import Swal from 'sweetalert2';

const categories = ref([]);
const categoryName = ref("");
const categoryDescription = ref("");
const isEditMode = ref(false);
let currentCategoryId = ref(null);

// const fetchCategories = async () => {
//   try {
//     const data = await Producto.fetchCategories();
//     categories.value = [...data];
//   } catch (error) {
//     console.error("Error al cargar las categorías:", error);
//   }
// };

const fetchCategories = async () => {
  try {
    const data = await Producto.fetchCategories();
    categories.value = [...data];
    currentPage.value = 1; // Resetear a la primera página
  } catch (error) {
    console.error("Error al cargar las categorías:", error);
  }
};

onMounted(() => {
  fetchCategories();
});

const openAddCategoryModal = () => {
  categoryName.value = "";  
  categoryDescription.value = "";
  isEditMode.value = false;

  const modalElement = document.getElementById('addCategoryModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

const openEditModal = (category) => {
  categoryName.value = category.nombre;
  categoryDescription.value = category.descripcion;
  currentCategoryId.value = category.id;
  isEditMode.value = true;

  const modalElement = document.getElementById('editCategoryModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

const addCategory = async () => {
  if (!categoryName.value || !categoryDescription.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = {
      nombre: categoryName.value,
      descripcion: categoryDescription.value,
    };

    const response = await Producto.createCategory(categoryData);
    show_alerta('Categoría creada correctamente', 'success');

    if (response && response.data) {
      categories.value.push(response.data);
      categoryName.value = "";
      categoryDescription.value = "";

      const modalElement = document.getElementById('addCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al crear la categoría:", error);
    show_alerta('Error al crear la categoría', 'error');
  }
};

const updateCategory = async () => {
  if (!categoryName.value || !categoryDescription.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = {
      nombre: categoryName.value,
      descripcion: categoryDescription.value,
    };

    const response = await Producto.updateCategory(currentCategoryId.value, categoryData);
    show_alerta('Categoría actualizada correctamente', 'success');

    if (response && response.data) {
      const index = categories.value.findIndex(category => category.id === currentCategoryId.value);
      categories.value[index] = response.data;

      categoryName.value = "";
      categoryDescription.value = "";

      const modalElement = document.getElementById('editCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al actualizar la categoría:", error);
    show_alerta('Error al actualizar la categoría', 'error');
  }
};

const deleteCategory = async (id) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro de eliminar esta categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      buttonsStyling: true,
    });

    if (result.isConfirmed) {
      const response = await Producto.deleteCategory(id);
      if (response) {
        categories.value = categories.value.filter(category => category.id !== id);
        show_alerta('Categoría eliminada correctamente', 'success');
      }
    } else {
      show_alerta('Eliminación cancelada', 'info');
    }
  } catch (error) {
    console.error("Error al eliminar la categoría:", error);
    show_alerta('Error al eliminar la categoría', 'error');
  }
};

// Paginación
const itemsPerPage = 5; // Número de items por página
const currentPage = ref(1);

// Computed properties para la paginación
const totalItems = computed(() => categories.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value));

const paginatedCategories = computed(() => {
  return categories.value.slice(startIndex.value, endIndex.value);
});

// Calcular el índice real considerando la paginación
const calculateIndex = (index) => {
  return startIndex.value + index + 1;
};

// Computed property para mostrar los números de página
const displayedPages = computed(() => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages.value; i++) {
    if (i === 1 || i === totalPages.value || 
        (i >= currentPage.value - delta && i <= currentPage.value + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

// Métodos de navegación
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page;
  }
};

</script>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.table {
  margin-bottom: 0;
}

.table > :not(caption) > * > * {
  padding: 1rem 0.75rem;
}

.btn-sm .material-icons {
  font-size: 18px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.form-control {
  border-radius: 6px;
  border-color: #dee2e6;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.modal-content {
  border-radius: 8px;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

.pagination-container {
  display: flex;
  align-items: center;
}

.pagination-container .btn-group {
  margin: 0 4px;
}

.pagination-container .btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pagination-container .btn .material-icons {
  font-size: 20px;
}

.pagination-container .btn-outline-primary:hover {
  background-color: #f8f9fa;
}

.pagination-container .btn-primary {
  font-weight: 600;
}
</style>