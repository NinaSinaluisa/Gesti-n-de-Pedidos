<template>
    <div class="card">
      <div class="card-header">
        <h5 class="card-title">{{ titulo }}</h5>
      </div>
      <div class="card-body">
        <p class="h3 font-weight-bold">{{ valor }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    titulo: String,
    valor: String
  })
  </script>
  
  <style scoped>
 
  </style>
  