import PublicApi from '@/apis/Api';
import { getAuthHeaders } from '@/apis/Utils';

const Orden = {
  async create(ordenData) {
    try {
      const response = await PublicApi.post(
        'orden',
        ordenData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al crear la orden:', error);
        console.log('Datos enviados:', ordenData); // Para debug
      }
      throw new Error(error.response?.data?.message || 'Error al crear la orden');
    }
  },
};

export default Orden;