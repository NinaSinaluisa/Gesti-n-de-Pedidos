import axios from 'axios';
import Swal from 'sweetalert2';
import { nextTick } from '@vue/runtime-core';

// Configuración base desde variables de entorno
const BASE_CONFIG = {
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

// Configuración de API principal
const Api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  ...BASE_CONFIG
});

// Configuración para imágenes públicas
export const ImagesApi = axios.create({
  baseURL: import.meta.env.VITE_IMAGE_BASE_URL,
  ...BASE_CONFIG,
  withCredentials: false
});

// Configuración para rutas públicas
export const PublicApi = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  ...BASE_CONFIG,
  withCredentials: false
});

// URL base para imágenes 
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

/**
 * Muestra una alerta usando SweetAlert2
 * @param {string} msj - Mensaje a mostrar
 * @param {string} icon - Icono de la alerta (success, error, warning, etc.)
 * @param {Ref} focus - Referencia Vue para enfocar después de cerrar (opcional)
 */
export function show_alerta(msj, icon, focus = '') {
  if (focus) {
    nextTick(() => focus.value?.focus());
  }
  
  Swal.fire({
    title: msj,
    icon: icon,
    buttonsStyling: true
  });
}

export default Api;