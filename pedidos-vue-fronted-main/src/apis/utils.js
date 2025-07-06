
export function getAuthHeaders() {
  const token = localStorage.getItem('auth');
  if (!token) throw new Error('Token de autenticación no disponible');
  return { Authorization: `Bearer ${token}` };
}