import Api from '@/apis/Api';
import { getAuthHeaders } from '@/apis/utils';

const Producto = {
  async fetchCategories() {
    try {
      const response = await Api.get('admin/categorias', {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener las categorías:', error);
      throw error;
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await Api.post(
        'admin/categorias',
        categoryData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al crear la categoría:', error);
      throw error;
    }
  },

  async updateCategory(categoryId, updatedData) {
    try {
      const response = await Api.put(
        `admin/categorias/${categoryId}`,
        updatedData,
        { headers: getAuthHeaders({ 'Content-Type': 'application/json' }) }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar la categoría:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId) {
    try {
      const response = await Api.delete(
        `admin/categorias/${categoryId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar la categoría:', error);
      throw error;
    }
  },

  async getCategoryById(categoryId) {
    try {
      const response = await Api.get(
        `admin/categorias/${categoryId}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener la categoría por ID:', error);
      throw error;
    }
  },

  async fetchCategoriesPublica() {
    try {
      const response = await Api.get('public/categorias');
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener las categorías públicas:', error);
      throw error;
    }
  },
};

export default Producto;