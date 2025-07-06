<template>
    <footer class="simple-black-footer">
        <div class="footer-content">
          <div class="copyright">
            &copy; {{ new Date().getFullYear() }} New Blessings. Todos los derechos reservados.
          </div>
          <div class="made-with">
            Diseñado con <i class="material-icons">favorite</i> por New Blessings
          </div>
        </div>
      </footer>
</template>



<style scoped>
.simple-black-footer {
  background-color: #212327;
  color: #ffffff;
  padding: 20px 0;
  font-family: 'Roboto', sans-serif;
  width: 100%;
  /* No necesita position: fixed ni absolute */
  margin-top: auto; /* Esto ayuda a empujar el footer hacia abajo */
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.copyright, .made-with {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.made-with i {
  color: #E53935;
  font-size: 0.9rem;
  vertical-align: middle;
  margin: 0 3px;
}

@media (max-width: 480px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 5px;
  }
  
  .copyright, .made-with {
    font-size: 0.8rem;
  }
}
</style>