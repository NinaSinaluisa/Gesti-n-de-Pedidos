import Api from '@/apis/Api'
import Csrf from '../apis/Csrf';

function getToken() {
  const token = localStorage.getItem('auth');
  if (!token) throw new Error('Token de autenticación no disponible');
  return token;
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

const User = {
  async register(form) {
    await Csrf.getCookie();
    return Api.post('/auth/register', form);
  },

  async login(form) {
    await Csrf.getCookie();
    return Api.post('/auth/login', form);
  },

  async OlvideContrasena(form) {
    await Csrf.getCookie();
    return Api.post('/auth/forgot-password', form);
  },

  async RestablecerContrasena(form) {
    await Csrf.getCookie();
    return Api.post('/auth/reset-password', form);
  },

  async logout() {
    await Csrf.getCookie();
    const response = await Api.get('/auth/logout', { headers: authHeaders() });
    localStorage.removeItem('auth');
    return response;
  },

  async fetchUsuarios() {
    const response = await Api.get('/admin/usuarios', { headers: authHeaders() });
    return response.data.users;
  },

  async updateUsuario(userId, updatedData) {
    const response = await Api.put(
      `/admin/usuarios/${userId}`,
      updatedData,
      { headers: authHeaders({ 'Content-Type': 'application/json' }) }
    );
    return response.data;
  },

  async deleteUsuario(userId) {
    const response = await Api.delete(`/admin/usuarios/${userId}`, { headers: authHeaders() });
    return response.data;
  },

  async getUsuarioById(userId) {
    const response = await Api.get(`/admin/usuarios/${userId}`, { headers: authHeaders() });
    return response.data;
  },

  async UsuarioActual() {
    const response = await Api.get('/user', { headers: authHeaders() });
    return response.data;
  },

  getProfile() {
    return Api.get('/user', { headers: authHeaders() });
  }
}

export default User;