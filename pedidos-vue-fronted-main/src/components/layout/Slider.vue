<template>
  <div class="asymmetric-carousel">
    <!-- Contenedor principal -->
    <div class="carousel-container">
      <!-- Slide izquierdo (imagen grande) -->
      <div class="main-slide">
        <img 
          :src="images[currentIndex]" 
          :alt="`Vista del local ${currentIndex + 1}`" 
          class="main-image"
          loading="lazy"
        />
        <div class="slide-number">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
      
      <!-- Slides derechos (2 imágenes pequeñas) -->
      <div class="side-slides">
        <div 
          v-for="(img, idx) in getSideImages()" 
          :key="idx" 
          class="side-slide"
          @click="goToSlide((currentIndex + idx + 1) % images.length)"
        >
          <img 
            :src="img" 
            :alt="`Vista del local ${((currentIndex + idx + 1) % images.length) + 1}`" 
            class="side-image"
            loading="lazy"
          />
          <div class="side-overlay">
            <span class="material-icons">zoom_in</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Controles de navegación -->
    <div class="navigation-controls">
      <button @click="prevSlide" class="nav-button prev">
        <svg viewBox="0 0 24 24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
        </svg>
      </button>
      
      <div class="dots-container">
        <button 
          v-for="(_, index) in images" 
          :key="index"
          @click="goToSlide(index)"
          :class="{ active: currentIndex === index }"
          class="dot"
          :aria-label="`Ir a vista ${index + 1}`"
        ></button>
      </div>
      
      <button @click="nextSlide" class="nav-button next">
        <svg viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </button>
    </div>
  </div>
</template>



<script>
import { ref, onMounted } from 'vue';
import Carrusel from '@/apis/Carrusel';
import { IMAGE_BASE_URL } from '@/apis/Api';

export default {
  setup() {
    const images = ref([]);
    const currentIndex = ref(0);

    const getFullImageUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      return `${IMAGE_BASE_URL}/${path}`;
    };

    const fetchImages = async () => {
      try {
        const response = await Carrusel.fetchImagesPublica();
        images.value = (response || []).map(img => getFullImageUrl(img.imagen));
      } catch (error) {
        console.error('Error al obtener imágenes del carrusel:', error);
      }
    };

    const nextSlide = () => {
      currentIndex.value = (currentIndex.value + 1) % images.value.length;
      resetAutoRotation();
    };

    const prevSlide = () => {
      currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
      resetAutoRotation();
    };

    const goToSlide = (index) => {
      currentIndex.value = index;
      resetAutoRotation();
    };

    const getSideImages = () => {
      const nextIndex = (currentIndex.value + 1) % images.value.length;
      const nextNextIndex = (currentIndex.value + 2) % images.value.length;
      return [images.value[nextIndex], images.value[nextNextIndex]];
    };

    let autoRotateInterval;
    const resetAutoRotation = () => {
      clearInterval(autoRotateInterval);
      autoRotateInterval = setInterval(nextSlide, 5000);
    };

    onMounted(() => {
      fetchImages();
      resetAutoRotation();
      return () => clearInterval(autoRotateInterval);
    });

    return {
      images,
      currentIndex,
      nextSlide,
      prevSlide,
      goToSlide,
      getSideImages
    };
  }
};
</script>

<style scoped>
/* Variables de diseño */
:root {
  --primary-color: #e63946; /* Rojo */
  --dark-color: #1a1a1a; /* Negro */
  --light-color: #ffffff; /* Blanco */
  --gray-color: #f5f5f5;
  --transition-speed: 0.4s;
}

.asymmetric-carousel {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  padding: 20px 0;
}

.carousel-container {
  display: flex;
  height: 400px; /* Misma altura que el anterior */
  gap: 15px;
  margin-bottom: 20px;
}

.main-slide {
  flex: 0 0 60%;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transform: skewY(-2deg);
  transition: all var(--transition-speed) ease;
}

.main-slide:hover {
  transform: skewY(-2deg) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slide-number {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: var(--primary-color);
  color: var(--light-color);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.side-slides {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.side-slide {
  position: relative;
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.side-slide:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.side-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.side-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
}

.side-slide:hover .side-overlay {
  opacity: 1;
}

.side-overlay span {
  color: var(--light-color);
  font-size: 2rem;
}

.navigation-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.nav-button {
  background-color: var(--dark-color);
  color: var(--light-color);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.nav-button:hover {
  background-color: var(--primary-color);
  transform: scale(1.1);
}

.nav-button svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.dots-container {
  display: flex;
  gap: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--gray-color);
  border: none;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.dot.active {
  background-color: var(--primary-color);
  transform: scale(1.2);
}

/* Efectos responsive */
@media (max-width: 992px) {
  .carousel-container {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .carousel-container {
    flex-direction: column;
    height: auto;
  }
  
  .main-slide {
    flex: 0 0 300px;
    transform: none;
  }
  
  .main-slide:hover {
    transform: scale(1.02);
  }
  
  .side-slides {
    flex-direction: row;
  }
  
  .side-slide {
    flex: 0 0 calc(50% - 7.5px);
  }
}

@media (max-width: 576px) {
  .carousel-container {
    gap: 10px;
  }
  
  .main-slide {
    flex: 0 0 250px;
  }
  
  .navigation-controls {
    gap: 15px;
  }
  
  .nav-button {
    width: 36px;
    height: 36px;
  }
  
  .dot {
    width: 10px;
    height: 10px;
  }
}
</style>