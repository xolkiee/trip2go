import axios from 'axios';

// MobilBackEnd.md dokümanındaki prensiplere göre yapılandırıldı
const api = axios.create({
  baseURL: 'https://api.yazmuh.com/v1',
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
