import Api from '@/apis/Api';
import { getAuthHeaders } from '@/apis/Utils';    


const Empresa = {
  async fetchEmpresa() {
    try {
      const response = await Api.get('admin/empresa', {
        headers: getAuthHeaders(),
      });
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los datos:', error);
      throw error;
    }
  },

  async fetchEmpresaPublica() {
    try {
      const response = await Api.get('empresa-publico');
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al obtener los datos:', error);
      throw error;
    }
  },

  async createEmpresa(empresaData) {
    try {
      const response = await Api.post(
        'admin/empresa',
        empresaData,
        { headers: getAuthHeaders() } 
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al subir los datos:', error);
      throw error;
    }
  },

  async updateImage(empresaId, updatedData) {
    try {
      const response = await Api.post(
        `admin/empresa/${empresaId}/actualizar`,
        updatedData,
        { headers: getAuthHeaders() } 
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar los datos de la empresa:', error);
      throw error;
    }
  },

  async deleteImage(empresaId) {
    try {
      const response = await Api.delete(
        `admin/empresa/${empresaId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al eliminar los datos de la empresa:', error);
      throw error;
    }
  },
};

export default Empresa;