import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const valuationService = {
  getRules: () => api.get('/valuations/rules'),
  calculatePropertyValuation: (data: any) => api.post('/valuations/calculate', data),
  savePropertyValuation: (data: any) => api.post('/valuations', data),
  getHistory: (page = 1, limit = 10, type?: 'ALL' | 'PROPERTY' | 'LAND', startDate?: string, endDate?: string, search?: string) => {
    let url = `/valuations?page=${page}&limit=${limit}`;
    if (type && type !== 'ALL') url += `&type=${type}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return api.get(url);
  },
  getValuationById: (id: string) => api.get(`/valuations/${id}`),
  updatePropertyValuation: (id: string, data: any) => api.put(`/valuations/${id}`, data),
  deleteValuation: (id: string) => api.delete(`/valuations/${id}`),
  calculateStandaloneLandValuation: (data: any) => api.post('/valuations/land-calculate', data),
  saveStandaloneLandValuation: (data: any) => api.post('/valuations/land', data),
  updateStandaloneLandValuation: (id: string, data: any) => api.put(`/valuations/land/${id}`, data),
  getDashboardStats: () => api.get('/valuations/stats'),
};

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
};

export const userService = {
  getUsers: () => api.get('/users'),
  getMyInspectors: () => api.get('/users/my-inspectors'),
  changePassword: (data: any) => api.put('/users/password', data),
  resetUserPassword: (id: string, data: any) => api.put(`/users/${id}/password`, data),
  createUser: (data: any) => api.post('/users', data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const inspectionService = {
  createInspection: (data: any) => api.post('/inspections', data),
  getMyInspections: () => api.get('/inspections/my-inspections'),
  getTeamInspections: () => api.get('/inspections/team-inspections'),
  getInspectionById: (id: string) => api.get(`/inspections/${id}`),
  updateInspection: (id: string, data: any) => api.put(`/inspections/${id}`, data),
  deleteInspection: (id: string) => api.delete(`/inspections/${id}`),
  submitInspectionsBatch: (inspectionIds: string[]) => api.put('/inspections/batch-submit', { inspectionIds }),
  getDashboardStats: () => api.get('/inspections/my-stats'),
};
