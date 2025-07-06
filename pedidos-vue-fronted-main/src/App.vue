<script setup>
import { RouterLink, RouterView } from 'vue-router'
import NavegacionVue from './components/Navegacion.vue'
import Footer from '@/components/layout/Footeer.vue';
import { useRoute } from 'vue-router'

const route = useRoute()
const isAdminRoute = () => route.path.startsWith('/admin')
</script>

<template>
  <div class="app-container">
    <NavegacionVue v-if="!isAdminRoute()"/>
    <main class="main-content">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style>
/* Estilos globales */
html, body {
  height: 100%;
  margin: 0;
  background-color: white !important;
  color: black !important;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>