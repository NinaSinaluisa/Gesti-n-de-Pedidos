<template>
  <div>
    <h5>Customer Ratings</h5>
    <div v-for="(rating, index) in ratings" :key="index" class="d-flex align-items-center mb-3">
      <!-- Número de estrellas -->
      <div class="d-flex align-items-center me-3">
        <span v-for="n in 5 - index" :key="n" class="material-icons text-warning">
          star
        </span>
      </div>
      <!-- Barra de progreso -->
      <div class="flex-grow-1">
        <div class="progress">
          <div
            class="progress-bar bg-warning"
            role="progressbar"
            :style="{ width: `${rating}%` }"
            aria-valuenow="rating"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
      <!-- Porcentaje -->
      <span class="ms-3">{{ rating }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Porcentajes para cada nivel de calificación (5, 4, 3, 2, 1 estrellas)
const ratings = ref([80, 60, 40, 15, 5]); 
</script>

<style>
.text-warning {
  color: #FFC107 !important; /* Color amarillo */
}
.progress {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar.bg-warning {
  background-color: #FFC107;
}
</style>
