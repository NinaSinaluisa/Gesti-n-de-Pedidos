import Api from '@/apis/Api';
import { getAuthHeaders } from '@/apis/utils';

const ConfiguracionPrecio = {
  async fetchConfigPrecio() {
    try {
      const response = await Api.get('admin/configuracion-envio', {
        headers: getAuthHeaders(),
      });
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los datos:', error);
      throw error;
    }
  },

  async fetchConfigPrecioPublica() {
    try {
      const response = await Api.get('configuracion-envio-publico');
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los datos:', error);
      throw error;
    }
  },

  async createConfigPrecio(configuracion_envioData) {
    try {
      const response = await Api.post(
        'admin/configuracion-envio',
        configuracion_envioData,
        { headers: getAuthHeaders() } 
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al subir los datos:', error);
      throw error;
    }
  },

  async updateConfigPrecio(updatedData) {
    try {
      if (!updatedData.precio_por_kg) {
        throw new Error('El campo precio_por_kg es requerido');
      }
      const response = await Api.put(
        'admin/configuracion-envio',
        { precio_por_kg: updatedData.precio_por_kg },
        {
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar la configuración:', error);
      throw error;
    }
  },

  async deleteConfigPrecio(configuracion_envioId) {
    try {
      const response = await Api.delete(
        `admin/configuracion-envio/${configuracion_envioId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar los datos de la configuracion-envio:', error);
      throw error;
    }
  },
};

export default ConfiguracionPrecio;