import Api from '@/apis/Api';
import { getAuthHeaders } from '@/apis/utils';

const ProductoBase = {
  async fetchCategories() {
    try {
      const response = await Api.get('admin/productos', {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los productos base:', error);
      throw error;
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await Api.post(
        'admin/productos',
        categoryData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al crear los productos base :', error);
      throw error;
    }
  },

  async updateCategory(categoryId, updatedData) {
    try {
      const response = await Api.put(
        `admin/productos/${categoryId}`,
        updatedData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar los productos base:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId) {
    try {
      const response = await Api.delete(
        `admin/productos/${categoryId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar los productos base:', error);
      throw error;
    }
  },

  async getCategoryById(categoryId) {
    try {
      const response = await Api.get(
        `admin/productos/${categoryId}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener el productos por ID:', error);
      throw error;
    }
  },
};

export default ProductoBase;