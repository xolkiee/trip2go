import axios from 'axios';
import { Platform } from 'react-native';

// Gerçek Cihaz (Expo Go) testi için Bilgisayarın Ağ IP'si kullanılıyor:
const API_BASE_URL = 'http://192.168.1.11:5000/api';

// Interceptor vb. eklenebilir
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Token ekleme (Daha sonra login ekranı yapıldığında secure storage eklenecek)
api.interceptors.request.use(async (config) => {
  // Örnek: const token = await SecureStore.getItemAsync('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
