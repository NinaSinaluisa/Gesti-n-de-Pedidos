<template>
  <div class="carrusel-admin-container">
    <div class="header-section">
      <h3 class="admin-title">
        <span class="material-icons">photo_library</span>
        Administración del Carrusel
      </h3>
      <button
        type="button"
        class="btn btn-primary btn-add-image"
        @click="openAddModal"
      >
        <span class="material-icons">add_photo_alternate</span>
        Agregar Imagen
      </button>
    </div>

    <!-- Modal para agregar/editar imagen -->
    <div class="modal fade" :id="currentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Editar Imagen' : 'Agregar Imagen' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Seleccionar Imagen</label>
              <input 
                type="file" 
                class="form-control" 
                accept="image/*"
                @change="handleFileChange"
                ref="fileInput"
              >
              <div class="form-text">Formatos soportados: JPG, PNG, WEBP (Máx. 2MB)</div>
            </div>
            <div v-if="previewImage" class="image-preview-container">
              <img :src="previewImage" class="img-preview" alt="Vista previa">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="isEditMode ? updateImage() : uploadImage()"
              :disabled="!selectedFile"
            >
              <span v-if="isUploading" class="spinner-border spinner-border-sm" role="status"></span>
              {{ isUploading ? 'Procesando...' : (isEditMode ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Galería de imágenes -->
    <div class="gallery-section">
      <div v-if="!images || images.length === 0" class="empty-gallery">
        <div class="empty-content">
          <span class="material-icons">photo_library</span>
          <p>No hay imágenes en el carrusel</p>
          <button class="btn btn-primary" @click="openAddModal">
            <span class="material-icons">add</span>
            Agregar primera imagen
          </button>
        </div>
      </div>

      <div v-else class="gallery-grid">
        <div 
          v-for="(image, index) in paginatedImages" 
          :key="image.id"
          class="gallery-item"
        >
          <div class="card">
            <div class="image-wrapper">
              <img 
                :src="getFullImageUrl(image.url)" 
                class="gallery-image"
                :alt="`Imagen del carrusel ${index + 1}`"
                @click="openEditModal(image)"
              >
              <div class="image-overlay">
                <button 
                  class="btn btn-sm btn-outline-light view-btn"
                  @click="openEditModal(image)"
                >
                  <span class="material-icons">edit</span>
                </button>
                <button 
                  class="btn btn-sm btn-danger"
                  @click.stop="deleteImage(image.id)"
                >
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
           
          </div>
        </div>
      </div>
    </div>

    <Pagination 
      v-if="images.length > itemsPerPage"
      :totalItems="images.length" 
      :itemsPerPage="itemsPerPage"
      :currentPage="currentPage"
      @update:currentPage="currentPage = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Carrusel from '@/apis/Carrusel'; 
import Swal from 'sweetalert2';
import { IMAGE_BASE_URL } from '@/apis/Api.js'; 

const images = ref([]);
const currentPage = ref(1);
const itemsPerPage = 9; // Mostrar 9 imágenes por página (3x3 grid)
const selectedFile = ref(null);
const previewImage = ref(null);
const isUploading = ref(false);
const isEditMode = ref(false);
const currentImageId = ref(null);
const currentModal = ref('addImageModal');
const fileInput = ref(null);

const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${IMAGE_BASE_URL}/${path}`;
};

// Obtener imágenes al montar el componente
onMounted(async () => {
  await fetchImages();
});

// Obtener todas las imágenes
const fetchImages = async () => {
  try {
    const response = await Carrusel.fetchImages();
    images.value = (response || []).map(img => ({
      id: img.id,
      url: img.imagen
    }));
  } catch (error) {
    showAlert('Error al cargar las imágenes', 'error');
    console.error('Error en fetchImages:', error);
  }
};

// Manejar selección de archivo
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validaciones
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    showAlert('Formato de imagen no válido. Use JPG, PNG o WEBP', 'error');
    resetFileInput();
    return;
  }

  if (file.size > maxSize) {
    showAlert('La imagen no debe superar los 2MB', 'error');
    resetFileInput();
    return;
  }

  selectedFile.value = file;
  previewImage.value = URL.createObjectURL(file);
};

const resetFileInput = () => {
  selectedFile.value = null;
  previewImage.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

// Abrir modal para agregar imagen
const openAddModal = () => {
  isEditMode.value = false;
  currentModal.value = 'addImageModal';
  resetFileInput();
  const modal = new bootstrap.Modal(document.getElementById(currentModal.value));
  modal.show();
};

// Abrir modal para editar imagen
const openEditModal = (image) => {
  isEditMode.value = true;
  currentImageId.value = image.id;
  currentModal.value = 'editImageModal';
  previewImage.value = getFullImageUrl(image.url);
  const modal = new bootstrap.Modal(document.getElementById(currentModal.value));
  modal.show();
};

// Subir nueva imagen
const uploadImage = async () => {
  if (!validateImage()) return;

  isUploading.value = true;

  try {
    const formData = new FormData();
    formData.append('imagen', selectedFile.value);

    await Carrusel.createImage(formData);
    await fetchImages();
    showAlert('Imagen agregada correctamente', 'success');
    closeModal();
  } catch (error) {
    showAlert('Error al subir la imagen', 'error');
    console.error('Error al subir imagen:', error);
  } finally {
    isUploading.value = false;
  }
};

// Actualizar imagen existente
const updateImage = async () => {
  if (!validateImage()) return;

  isUploading.value = true;

  try {
    const formData = new FormData();
    if (selectedFile.value) {
      formData.append('imagen', selectedFile.value);
    }

    await Carrusel.updateImage(currentImageId.value, formData);
    await fetchImages();
    showAlert('Imagen actualizada correctamente', 'success');
    closeModal();
  } catch (error) {
    showAlert('Error al actualizar la imagen', 'error');
    console.error('Error al actualizar imagen:', error);
  } finally {
    isUploading.value = false;
  }
};

const validateImage = () => {
  if (!selectedFile.value && !isEditMode.value) {
    showAlert('Debe seleccionar una imagen', 'error');
    return false;
  }
  return true;
};

const closeModal = () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById(currentModal.value));
  if (modal) modal.hide();
  resetFileInput();
};

// Eliminar imagen
const deleteImage = async (id) => {
  try {
    const result = await Swal.fire({
      title: '¿Eliminar esta imagen?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      await Carrusel.deleteImage(id);
      await fetchImages();
      showAlert('Imagen eliminada correctamente', 'success');
    }
  } catch (error) {
    showAlert('Error al eliminar la imagen', 'error');
    console.error('Error al eliminar imagen:', error);
  }
};

// Mostrar alertas
const showAlert = (message, type) => {
  Swal.fire({
    text: message,
    icon: type,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  });
};

const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return images.value.slice(start, end);
});
</script>

<style scoped>
.carrusel-admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.admin-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.btn-add-image {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-weight: 500;
  border-radius: 8px;
}

/* Galería */
.gallery-section {
  margin-top: 20px;
}

.empty-gallery {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
}

.empty-content {
  max-width: 400px;
}

.empty-content .material-icons {
  font-size: 60px;
  color: #dee2e6;
  margin-bottom: 15px;
}

.empty-content p {
  color: #6c757d;
  margin-bottom: 20px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.gallery-item {
  transition: transform 0.2s;
}

.gallery-item:hover {
  transform: translateY(-5px);
}

.card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-wrapper {
  position: relative;
  padding-top: 100%; /* Aspect ratio 1:1 */
  overflow: hidden;
}

.gallery-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Cambiado a contain para ver toda la imagen */
  background-color: #f5f5f5;
  cursor: pointer;
  transition: transform 0.3s;
}

.gallery-image:hover {
  transform: scale(1.03);
}

.image-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.view-btn {
  background-color: rgba(0, 0, 0, 0.5);
}

.card-footer {
  background: white;
  border-top: 1px solid #eee;
  padding: 10px 15px;
}

/* Modal */
.modal-content {
  border-radius: 12px;
}

.modal-header {
  border-bottom: 1px solid #eee;
  padding: 15px 20px;
}

.modal-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-footer {
  border-top: 1px solid #eee;
  padding: 15px 20px;
}

.image-preview-container {
  margin-top: 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.img-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 576px) {
  .admin-title {
    font-size: 1.5rem;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>