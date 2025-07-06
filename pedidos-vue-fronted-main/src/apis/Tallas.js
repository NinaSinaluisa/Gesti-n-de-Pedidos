import Api from '@/apis/Api';  
 
import { getAuthHeaders } from '@/apis/utils';    

const Tallas = {
  async fetchTallas() {
    try {
      const response = await Api.get('admin/tallas', { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener las Tallas:', error);
      throw error;
    }
  },

  async createTallas(categoryData) {
    try {
      const response = await Api.post(
        'admin/tallas',
        categoryData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al crear la categoría:', error);
      throw error;
    }
  },

  async updateTallas(categoryId, updatedData) {
    try {
      const response = await Api.put(
        `admin/tallas/${categoryId}`,
        updatedData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar la categoría:', error);
      throw error;
    }
  },

  async deleteTallas(categoryId) {
    try {
      const response = await Api.delete(`admin/tallas/${categoryId}`, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar la talla:', error);
      throw error;
    }
  },

  async getTallasId(categoryId) {
    try {
      const response = await Api.get(`admin/tallas/${categoryId}`, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener la categoría por ID:', error);
      throw error;
    }
  },
};

export default Tallas;