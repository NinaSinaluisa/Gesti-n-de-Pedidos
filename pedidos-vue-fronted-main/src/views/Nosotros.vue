<template>
    <div class="sobre-nosotros">
      <section class="container py-5">
        <!-- Encabezado de sección con título -->
        <header class="text-center mb-5">
          <h2 class="titulo">Sobre New Blessing</h2>
          <p class="subtitulo">Camisas que celebran la cultura indígena, diseñadas con amor y respeto</p>
        </header>
  
        <!-- Descripción de la tienda con una estructura clara -->
        <div class="contenido d-flex flex-column flex-md-row justify-content-between">
          <!-- Descripción al lado izquierdo -->
          <div class="descripcion mb-4 mb-md-0 col-md-6">
            <p>
              <strong>New Blessing</strong> es una tienda única que combina tradición y moda en cada prenda. Cada camisa está diseñada con el corazón de nuestras raíces, celebrando las culturas indígenas que nos inspiran. 
              Buscamos rendir homenaje a las tradiciones ancestrales a través de cada hilo y detalle, ofreciendo productos que no solo visten, sino que cuentan una historia.
            </p>
            <p>
              Cada uno de nuestros diseños tiene como base las enseñanzas y símbolos propios de cada comunidad indígena, mientras que nuestros procesos de fabricación priorizan el respeto por el medio ambiente y la autenticidad.
            </p>
          </div>
  
          <!-- Imagen representativa en la derecha -->
          <div class="imagen-container col-md-5 d-flex justify-content-center align-items-center">
            <img :src="imageUrl" alt="Imagen representativa de camisas indígenas" class="imagen">
          </div>
        </div>
  
        <!-- Servicios o Beneficios -->
        <div class="row mt-5">
          <div class="col-md-4 mb-4" v-for="(service, index) in services" :key="index">
            <div class="service-card">
              <i :class="'material-icons'">{{ service.icon }}</i>
              <h5>{{ service.title }}</h5>
              <p>{{ service.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // URL de imagen representativa (puedes cambiarla o cargarla desde la carpeta del proyecto)
  const imageUrl = "https://i.pinimg.com/736x/46/d9/c6/46d9c65e7070c4d2632a0f8b76d8a3cb.jpg";
  
  // Servicios disponibles
  const services = ref([
    {
      icon: "shopping_bag",
      title: "Diseños Únicos",
      description: "Camisas inspiradas en la cultura indígena, con diseños exclusivos llenos de historia."
    },
    {
      icon: "nature_people",
      title: "Respeto a la Naturaleza",
      description: "Trabajo ético con los artesanos, cuidando nuestras raíces y el respeto por la tierra."
    },
    {
      icon: "local_shipping",
      title: "Envíos Globales",
      description: "Recibe tus pedidos de manera rápida y segura, en cualquier parte del mundo."
    }
  ]);
  </script>
  
  <style scoped>
  /* Contenedor principal */
  .sobre-nosotros {
    font-family: 'Helvetica Neue', sans-serif;
  }
  
  /* Titulo principal */
  .titulo {
    font-size: 2.4rem;
    font-weight: bold;
    color: #dbc024;
  }
  
  .subtitulo {
    font-size: 1.1rem;
    color: #1d1d1b;
    font-style: italic;
  }
  
  /* Sección de la imagen y descripción */
  .contenido {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    text-align: center;
  }
  
  .descripcion {
    font-size: 1.15rem;
    color: #333;
    line-height: 1.8;
  }
  
  .imagen-container {
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .imagen {
    width: 100%;
    height: auto;
    max-height: 350px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  /* Estilo para las tarjetas de servicio */
  .service-card {
    background-color: #ffffff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .service-card i {
    font-size: 3rem;
    color: #fd2407;
  }
  
  .service-card h5 {
    font-size: 1.3rem;
    font-weight: bold;
    margin-top: 10px;
    color: #a286a8;
  }
  
  .service-card p {
    font-size: 1rem;
    color: #555;
    margin-top: 10px;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .contenido {
      flex-direction: column;
      text-align: left;
    }
  
    .descripcion {
      margin-bottom: 20px;
    }
  
    .imagen-container {
      width: 100%;
    }
  }
  </style>
  