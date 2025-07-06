import Api from '@/apis/Api';
import { getAuthHeaders } from '@/apis/utils';

const Ciudades = {
  async fetchCiudades() {
    try {
      const response = await Api.get('admin/ciudades-envio', {
        headers: getAuthHeaders(),
      });
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los datos:', error);
      throw error;
    }
  },

  async fetchCiudadesPublica() {
    try {
      const response = await Api.get('ciudades-publico');
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los datos:', error);
      throw error;
    }
  },

  async createCiudades(ciudadesData) {
    try {
      const response = await Api.post(
        'admin/ciudades-envio',
        ciudadesData,
        { headers: getAuthHeaders() } 
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al subir los datos:', error);
      throw error;
    }
  },

  async updateCiudades(ciudadesId, updatedData) {
    try {
      const response = await Api.put(
        `admin/ciudades-envio/${ciudadesId}`,
        updatedData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar los datos de la ciudades:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteCiudades(ciudadesId) {
    try {
      const response = await Api.delete(
        `admin/ciudades-envio/${ciudadesId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar los datos de la ciudades:', error);
      throw error;
    }
  },
};

export default Ciudades;