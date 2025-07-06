<template>
  <h3 class="text-center">Administración de Tallas</h3>
  <div class="mb-4">
    <button
      type="button"
      class="btn btn-primary d-flex align-items-center gap-2"
      @click="openAddCategoryModal"
    >
      <span class="material-icons">add</span>
      Añadir Nueva Talla
    </button>
  </div>
  
  <!-- Modal para agregar talla -->
  <div class="modal fade" id="addCategoryModal" tabindex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addCategoryModalLabel">Añadir Talla</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="categoryName" class="form-label">Nombre</label>
            <input type="text" id="categoryName" v-model="categoryName" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" @click="addCategory" class="btn btn-primary">Guardar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para actualizar talla -->
  <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editCategoryModalLabel">Actualizar Talla</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="editCategoryName" class="form-label">Nombre</label>
            <input type="text" id="editCategoryName" v-model="categoryName" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" @click="updateCategory" class="btn btn-primary">Actualizar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Lista de tallas -->
  <div class="card">
  <div class="card-body">
    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th class="text-center fw-bold" style="width: 80px">Nº</th>
            <th class="text-center fw-bold">Nombre</th>
            <th class="fw-bold" style="width: 150px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- Usamos `paginatedCategories` en lugar de `categories` -->
          <tr v-for="(category, index) in paginatedCategories" :key="category.id">
            <td class="text-center">{{ calculateIndex(index) }}</td>
            <td class="text-center">{{ category.nombre }}</td>
            <td>
              <div class="d-flex justify-content-start gap-2">
                <button @click="openEditModal(category)" class="btn btn-warning btn-sm" title="Editar">
                  <span class="material-icons">edit</span>
                </button>
                <button @click="deleteTallas(category.id)" class="btn btn-danger btn-sm" title="Eliminar">
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

<Pagination 
  :totalItems="categories.length" 
  :itemsPerPage="5" 
  :currentPage="currentPage"
  @update:currentPage="currentPage = $event"  
/>


</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Pagination from '@/components/admin/Pagination.vue';
import Tallas from '@/apis/Tallas';
import { show_alerta } from '@/apis/Api';
import Swal from 'sweetalert2';

const categories = ref([]);
const categoryName = ref("");
const isEditMode = ref(false);
let currentCategoryId = ref(null);

// Obtener todas las tallas al montar
const fetchTallas = async () => {
  try {
    const data = await Tallas.fetchTallas();
    categories.value = [...data];
    
  } catch (error) {
    console.error("Error al cargar las Tallas:", error);
  }
};

onMounted(() => {
  fetchTallas();
});

// Función para abrir el modal de agregar
const openAddCategoryModal = () => {
  categoryName.value = "";
  isEditMode.value = false;

  const modalElement = document.getElementById('addCategoryModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

// Función para abrir el modal de editar
const openEditModal = (category) => {
  categoryName.value = category.nombre;
  currentCategoryId.value = category.id;
  isEditMode.value = true;

  const modalElement = document.getElementById('editCategoryModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

// Añadir nueva talla
const addCategory = async () => {
  if (!categoryName.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = { nombre: categoryName.value };

    const response = await Tallas.createTallas(categoryData);
    show_alerta('Talla creada correctamente', 'success');

    if (response && response.data) {
      categories.value.push(response.data);
      categoryName.value = "";

      const modalElement = document.getElementById('addCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al crear la talla:", error);
    show_alerta('Error al crear la talla', 'error');
  }
};

// Actualizar talla
const updateCategory = async () => {
  if (!categoryName.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = { nombre: categoryName.value };

    const response = await Tallas.updateTallas(currentCategoryId.value, categoryData);
    show_alerta('Talla actualizada correctamente', 'success');

    if (response && response.data) {
      const index = categories.value.findIndex(category => category.id === currentCategoryId.value);
      categories.value[index] = response.data;

      categoryName.value = "";

      const modalElement = document.getElementById('editCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al actualizar la talla:", error);
    show_alerta('Error al actualizar la talla', 'error');
  }
};

// Eliminar talla
const deleteTallas = async (id) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro de eliminar esta talla?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      buttonsStyling: true,
    });

    if (result.isConfirmed) {
      const response = await Tallas.deleteTallas(id);
      if (response) {
        categories.value = categories.value.filter(category => category.id !== id);
        show_alerta('Talla eliminada correctamente', 'success');
      }
    } else {
      show_alerta('Eliminación cancelada', 'info');
    }
  } catch (error) {
    console.error("Error al eliminar la talla:", error);
    show_alerta('Error al eliminar la talla', 'error');
  }
};

const currentPage = ref(1);

const startIndex = computed(() => (currentPage.value - 1) * 5);
const endIndex = computed(() => Math.min(startIndex.value + 5, categories.value.length));

const paginatedCategories = computed(() => {
  return categories.value.slice(startIndex.value, endIndex.value);
});


const calculateIndex = (index) => {
  return startIndex.value + index + 1;  
};

</script>

<style scoped>
.color-preview-round {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-control-color {
  width: 100px;
  height: 100px;
  padding: 0;
  border: 2px solid #dee2e6;
  border-radius: 8px;
}

.form-control-color::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
  padding: 0;
}

.form-control-color::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 6px;
}

.color-cell {
  display: flex;
  align-items: center;
}

.table {
  margin-bottom: 0;
}

.table > :not(caption) > * > * {
  padding: 1rem 0.75rem;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
</style>