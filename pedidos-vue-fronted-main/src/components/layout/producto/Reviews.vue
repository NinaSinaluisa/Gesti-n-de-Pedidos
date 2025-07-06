<template>
  <div>
    <h5>Customer Reviews</h5>
    <div v-for="review in reviews" :key="review.id" class="review-box mb-3">
      <p><strong>{{ review.name }}</strong></p>
      <p class="text-muted">{{ review.comment }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const reviews = ref([
  { id: 1, name: "John Doe", comment: "Amazing quality and fit! I loved it." },
  { id: 2, name: "Jane Smith", comment: "Good value for the price, recommended." },
]);
</script>

<style>
.review-box {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
