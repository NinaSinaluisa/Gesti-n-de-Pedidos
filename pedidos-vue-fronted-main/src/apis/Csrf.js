import axios from 'axios';

export default {
  async getCookie() {
    try {
      // Hacer la petición directamente con axios en lugar de usar la instancia Api
      await axios.get('http://localhost:8000/api/csrf-cookie', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      
    } catch (error) {
      console.error('Error getting CSRF cookie:', error);
      throw error;
    }
  }
};