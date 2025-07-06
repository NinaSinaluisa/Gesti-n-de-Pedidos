<template>
    <div>
      <h2>Agregar nueva categoría</h2>
      <form @submit.prevent="agregarCategoria">
        <div class="mb-3">
          <label for="categoria" class="form-label">Nombre de la Categoría</label>
          <input type="text" id="categoria" v-model="nombreCategoria" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary">Agregar</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const nombreCategoria = ref('')
  
  const agregarCategoria = () => {
    if (nombreCategoria.value.trim()) {
      console.log(`Categoría agregada: ${nombreCategoria.value}`)
      nombreCategoria.value = ''
    }
  }
  </script>
  
  <style scoped>
 
  </style>
  