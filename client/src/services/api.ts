import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const valuationService = {
  getRules: () => api.get('/valuations/rules'),
  calculatePropertyValuation: (data: any) => api.post('/valuations/calculate', data),
  savePropertyValuation: (data: any) => api.post('/valuations', data),
  getHistory: (page = 1, limit = 10) => api.get(`/valuations?page=${page}&limit=${limit}`),
  getValuationById: (id: string) => api.get(`/valuations/${id}`),
  deleteValuation: (id: string) => api.delete(`/valuations/${id}`),
  calculateStandaloneLandValuation: (data: any) => api.post('/valuations/land-calculate', data),
};

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
};
