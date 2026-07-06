import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.0.2.2:4000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('auth_token');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  },
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; phone: string; password: string; restaurantName: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const tablesApi = {
  list: (outletId: string) => api.get(`/tables?outletId=${outletId}`),
  updateStatus: (id: string, status: string) => api.patch(`/tables/${id}/status`, { status }),
};

export const ordersApi = {
  list: (outletId: string, params?: any) => api.get(`/orders?outletId=${outletId}`, { params }),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  addPayment: (id: string, data: any) => api.post(`/orders/${id}/payment`, data),
};

export const menuApi = {
  list: (outletId: string) => api.get(`/menu?outletId=${outletId}`),
  categories: (outletId: string) => api.get(`/menu/categories?outletId=${outletId}`),
};
