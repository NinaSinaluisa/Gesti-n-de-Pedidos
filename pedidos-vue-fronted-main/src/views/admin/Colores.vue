<template>
  <h3 class="text-center">Administración de Colores</h3>
  <div class="mb-4">
    <button
      type="button"
      class="btn btn-primary d-flex align-items-center gap-2"
      @click="openAddCategoryModal"
    >
      <span class="material-icons">add</span>
      Añadir Nuevo Color
    </button>
  </div>
  
  <!-- Modal para agregar color -->
  <div class="modal fade" id="addCategoryModal" tabindex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addCategoryModalLabel">Añadir Color Nuevo</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="categoryName" class="form-label">Nombre del Color</label>
            <input type="text" id="categoryName" v-model="categoryName" class="form-control" placeholder="Ej: Azul Marino" />
          </div>
          <div class="mb-3">
            <label for="colorPicker" class="form-label">Seleccionar Color</label>
            <div class="color-picker-container">
              <input 
                type="color" 
                id="colorPicker" 
                v-model="colorHex" 
                class="form-control form-control-color" 
                title="Elegir color"
              />
             
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" @click="addCategory" class="btn btn-primary">Guardar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para actualizar color -->
  <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editCategoryModalLabel">Actualizar Color</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="editCategoryName" class="form-label">Nombre del Color</label>
            <input type="text" id="editCategoryName" v-model="categoryName" class="form-control" placeholder="Ej: Azul Marino" />
          </div>
          <div class="mb-3">
            <label for="editColorPicker" class="form-label">Seleccionar Color</label>
            <div class="color-picker-container">
              <input 
                type="color" 
                id="editColorPicker" 
                v-model="colorHex" 
                class="form-control form-control-color" 
                title="Elegir color"
              />
            
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" @click="updateColores" class="btn btn-primary">Actualizar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Lista de colores -->
  <div class="card">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th class="text-center fw-bold" style="width: 80px">Nº</th>
              <th class="fw-bold">Color</th>
              <th class="fw-bold">Nombre</th>
              <th class="text-center fw-bold" style="width: 150px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            
            <tr v-for="(category, index) in paginatedCategories" :key="category.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="color-cell">
                  <div class="color-preview-round" :style="{ backgroundColor: category.codigo_hex }"></div>
                </div>
              </td>
              <td>{{ category.nombre }}</td>
              <td>
                <div class="d-flex justify-content-center gap-2">
                  <button @click="openEditModal(category)" class="btn btn-warning btn-sm" title="Editar">
                    <span class="material-icons">edit</span>
                  </button>
                  <button @click="deleteColores(category.id)" class="btn btn-danger btn-sm" title="Eliminar">
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

import Colores from '@/apis/Colores';
import { show_alerta } from '@/apis/Api';
import Swal from 'sweetalert2';

const categories = ref([]);
const categoryName = ref("");
const colorHex = ref("#000000");
const isEditMode = ref(false);
let currentCategoryId = ref(null);

// Obtener todos los colores al montar
const fetchColores = async () => {
  try {
    const data = await Colores.fetchColores();
    categories.value = [...data];
  } catch (error) {
    console.error("Error al cargar los colores:", error);
  }
};

onMounted(() => {
  fetchColores();
});

// Función para abrir el modal de agregar
const openAddCategoryModal = () => {
  categoryName.value = "";
  colorHex.value = "#000000";
  isEditMode.value = false;

  const modalElement = document.getElementById('addCategoryModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

// Función para abrir el modal de editar
const openEditModal = (category) => {
  categoryName.value = category.nombre;
  colorHex.value = category.codigo_hex;
  currentCategoryId.value = category.id;
  isEditMode.value = true;

  const modalElement = document.getElementById('editCategoryModal');
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
};

// Añadir nuevo color
const addCategory = async () => {
  if (!categoryName.value || !colorHex.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = { 
      nombre: categoryName.value,
      codigo_hex: colorHex.value
    };

    const response = await Colores.createColores(categoryData);
    show_alerta('Color creado correctamente', 'success');

    if (response && response.data) {
      categories.value.push(response.data);
      categoryName.value = "";
      colorHex.value = "#000000";

      const modalElement = document.getElementById('addCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al crear el color:", error);
    show_alerta('Error al crear el color', 'error');
  }
};

// Actualizar color
const updateColores = async () => {
  if (!categoryName.value || !colorHex.value) {
    show_alerta("Por favor completa todos los campos", "warning");
    return;
  }

  try {
    const categoryData = { 
      nombre: categoryName.value,
      codigo_hex: colorHex.value
    };

    const response = await Colores.updateColores(currentCategoryId.value, categoryData);
    show_alerta('Color actualizado correctamente', 'success');

    if (response && response.data) {
      const index = categories.value.findIndex(category => category.id === currentCategoryId.value);
      categories.value[index] = response.data;

      categoryName.value = "";
      colorHex.value = "#000000";

      const modalElement = document.getElementById('editCategoryModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } catch (error) {
    console.error("Error al actualizar el color:", error);
    show_alerta('Error al actualizar el color', 'error');
  }
};

// Eliminar color
const deleteColores = async (id) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro de eliminar este color?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      buttonsStyling: true,
    });

    if (result.isConfirmed) {
      const response = await Colores.deleteColores(id);
      if (response) {
        categories.value = categories.value.filter(category => category.id !== id);
        show_alerta('Color eliminado correctamente', 'success');
      }
    } else {
      show_alerta('Eliminación cancelada', 'info');
    }
  } catch (error) {
    console.error("Error al eliminar el color:", error);
    show_alerta('Error al eliminar el color', 'error');
  }
};

const currentPage = ref(1);

const startIndex = computed(() => (currentPage.value - 1) * 5);
const endIndex = computed(() => Math.min(startIndex.value + 5, categories.value.length));

const paginatedCategories = computed(() => {
  return categories.value.slice(startIndex.value, endIndex.value);
});

// Calcular el índice real para la numeración de filas
const calculateIndex = (index) => {
  return startIndex.value + index + 1;  
};

</script>

<style scoped>
.color-picker-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}



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