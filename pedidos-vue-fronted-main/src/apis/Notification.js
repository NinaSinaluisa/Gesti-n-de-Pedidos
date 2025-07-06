import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin/notificaciones';

const Notification = {
  async getNotifications() {
    const token = localStorage.getItem('auth');
    return axios.get(API_URL, {
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async markAsRead(notifiable_id) {
    const token = localStorage.getItem('auth');
    return axios.patch(`${API_URL}/${notifiable_id}/leida`, {}, { 
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async deleteNotification(id) {
    const token = localStorage.getItem('auth');
    return axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default Notification;
