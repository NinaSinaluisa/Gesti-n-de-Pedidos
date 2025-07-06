import Api from '@/apis/Api';
import { getAuthHeaders } from '@/apis/utils';

const Colores = {
  async fetchColores() {
    try {
      const response = await Api.get('admin/colores', {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los Colores:', error);
      throw error;
    }
  },

  async createColores(categoryData) {
    try {
      const response = await Api.post(
        'admin/colores',
        categoryData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al crear el color:', error);
      throw error;
    }
  },

  async updateColores(categoryId, updatedData) {
    try {
      const response = await Api.put(
        `admin/colores/${categoryId}`,
        updatedData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar el color:', error);
      throw error;
    }
  },

  async deleteColores(categoryId) {
    try {
      const response = await Api.delete(
        `admin/colores/${categoryId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar el color:', error);
      throw error;
    }
  },

  async getColoresId(categoryId) {
    try {
      const response = await Api.get(
        `admin/colores/${categoryId}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener el color por ID:', error);
      throw error;
    }
  },
};

export default Colores;