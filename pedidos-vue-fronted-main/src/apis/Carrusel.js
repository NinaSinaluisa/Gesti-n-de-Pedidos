import Api from '@/apis/Api';
import { getAuthHeaders } from '@/apis/utils';

const Carrusel = {
  async fetchImages() {
    try {
      const response = await Api.get('admin/carrusel', { headers: getAuthHeaders() });
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener imágenes del carrusel:', error);
      throw error;
    }
  },

  async fetchImagesPublica() {
    try {
      const response = await Api.get('carrusel-publico');
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener imágenes del carrusel:', error);
      throw error;
    }
  },

  async createImage(imageData) {
    try {
      const response = await Api.post(
        'admin/carrusel',
        imageData,
        { headers: getAuthHeaders() } 
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al subir imagen al carrusel:', error);
      throw error;
    }
  },

  async updateImage(imageId, updatedData) {
    try {
      const response = await Api.post(
        `admin/carrusel/${imageId}/actualizar`,
        updatedData,
        { headers: getAuthHeaders() } 
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar imagen del carrusel:', error);
      throw error;
    }
  },

  async deleteImage(imageId) {
    try {
      const response = await Api.delete(
        `admin/carrusel/${imageId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar imagen del carrusel:', error);
      throw error;
    }
  },
};

export default Carrusel;