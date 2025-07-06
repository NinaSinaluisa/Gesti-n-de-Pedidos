<template>
  <div class="container d-flex justify-content-center align-items-center  mt-2">
    <div class="row w-100">
      <!-- Columna para la imagen, ocupa 6 columnas -->
      <div class="col-md-6 d-flex justify-content-center">
        <img src="/404.png" alt="Página no encontrada" class="img-fluid error-image mt-5" />
      </div>

      <!-- Columna para la información adicional, ocupa 6 columnas -->
      <div class="col-md-6 d-flex flex-column ">
        <h1 class="display-4 text-danger mb-4 text-center ">¡Acceso Denegado!</h1>
        <p class="lead mb-4">Parece que intentaste acceder a una ruta protegida o a una página que no existe. No tienes permiso para ver esta página.</p>
        
        <!-- Alerta sobre la protección de rutas -->
        <div class="alert alert-warning mb-4">
          <h5 class="alert-heading text-center text-dark fw-bold">Ruta protegida</h5>
          <p>Esta página solo es accesible por administradores. Si crees que esto es un error, por favor contacta al soporte.</p>
        </div>

        <!-- Mensaje informativo -->
        <p class="mb-4">Verifica que tienes los permisos necesarios o intenta una de estas opciones:</p>
        <ul class="list-unstyled">
          <li><i class="material-icons">home</i> <router-link to="/" class="text-decoration-none text-dark">Regresar al inicio</router-link></li>
          <li><i class="material-icons">search</i> <router-link to="/" class="text-decoration-none text-dark">Buscar contenido público</router-link></li>
          <li><i class="material-icons">help</i> <router-link to="/" class="text-decoration-none text-dark">Solicitar ayuda</router-link></li>
        </ul>

        <!-- Botón para regresar al inicio -->
        <router-link to="/" class="btn btn-danger btn-lg">Volver a la página principal</router-link>
      </div>
    </div>
  </div>
</template>



<style scoped>
.error-image {
  max-width: 70%;
  height: auto;
}

h1 {
  font-size: 3rem;
  font-weight: 600;
  color: #dc3545;
}

p {
  font-size: 1.25rem;
  color: #495057;
}

button {
  font-size: 1.25rem;
  padding: 12px 30px;
  margin-top: 20px;
}

.list-unstyled {
  text-align: left;
  font-size: 1.1rem;
  color: #6c757d;
}

.list-unstyled li {
  margin-bottom: 10px;
}

.alert-warning {
  background-color: #fff3cd;
}

.material-icons {
  color: #4d5a6d;
}
i{
  font-size: 1.5rem;
  margin-right: 10px;
  
}
</style>
