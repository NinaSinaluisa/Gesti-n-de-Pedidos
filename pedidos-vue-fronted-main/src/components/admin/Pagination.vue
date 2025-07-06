<template>
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
  import { computed } from "vue";
  
  const props = defineProps({
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      default: 5
    },
    currentPage: {
      type: Number,
      required: true
    }
  });
  
  // Emitir un evento cada vez que cambie la página
  const emit = defineEmits(["update:currentPage"]);
  
  const startIndex = computed(() => (props.currentPage - 1) * props.itemsPerPage);
  const endIndex = computed(() => Math.min(startIndex.value + props.itemsPerPage, props.totalItems));
  
  const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));
  
  const displayedPages = computed(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;
  
    for (let i = 1; i <= totalPages.value; i++) {
      if (i === 1 || i === totalPages.value || 
          (i >= props.currentPage - delta && i <= props.currentPage + delta)) {
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
    if (props.currentPage > 1) {
      emit("update:currentPage", props.currentPage - 1);
    }
  };
  
  const nextPage = () => {
    if (props.currentPage < totalPages.value) {
      emit("update:currentPage", props.currentPage + 1);
    }
  };
  
  const goToPage = (page) => {
    if (typeof page === 'number') {
      emit("update:currentPage", page);
    }
  };
  </script>
  
<style scoped>
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
  