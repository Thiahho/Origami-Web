import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? 'https://origamiimportados.com' : '',
  withCredentials: true,
  timeout: 30000,
});

export default api;

export const productoApi = {
  getAll: () => api.get('/api/Producto'),
  getPaged: (page = 1, pageSize = 20, soloActivos = false) =>
    api.get('/api/Producto/paged', { params: { page, pageSize, soloActivos } }),
  getById: (id) => api.get(`/api/Producto/${id}`),
  getVariantes: (productoId) => api.get(`/api/Producto/${productoId}/variantes`),
  getAlmacenamientos: (productoId) => api.get(`/api/Producto/${productoId}/Almacenamiento-Opciones`),
  getColores: (productoId, almacenamiento) =>
    api.get(`/api/Producto/${productoId}/Color-Opciones`, { params: { almacenamiento } }),
  create: (data) => api.post('/api/Producto', data),
  update: (id, data) => api.put(`/api/Producto/${id}`, data),
  delete: (id) => api.delete(`/api/Producto/${id}`),
};

export const adminApi = {
  verify: () => api.get('/api/Admin/verify'),
  login: (data) => api.post('/api/Admin/login', data),
  logout: () => api.post('/api/Admin/logout'),
};
