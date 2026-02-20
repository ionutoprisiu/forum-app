import api from './api';

const userService = {
  getAll: () => api.get('/users').then(r => r.data),
  getById: (id) => api.get(`/users/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/users/${id}`),
  banUser: (id) => api.put(`/users/${id}/ban`).then(r => r.data),
  unbanUser: (id) => api.put(`/moderator/unban/${id}`).then(r => r.data)
};

export default userService;
