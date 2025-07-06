import Api from '@/apis/Api';  
import { getAuthHeaders } from '@/apis/utils'; 

const Reporte = {
  async fetchReporte() {
    try {
      const response = await Api.get('admin/reportes/datos', { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al obtener el reporte:', error);
      }
      throw error;
    }
  },

  async fetchPedidos() {
    try {
      const response = await Api.get('admin/reportes/pedidos', { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al obtener los pedidos:', error);
      }
      throw error;
    }
  }
};

export default Reporte;
