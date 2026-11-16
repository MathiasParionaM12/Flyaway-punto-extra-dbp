import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// Instancia de axios que usan todos los servicios.
const api = axios.create({ baseURL: API_URL });

// Antes de cada request: si hay token lo mandamos en el header Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Los endpoints protegidos responden 403 cuando no hay token o es inválido.
// En ese caso limpiamos el token y avisamos al AuthContext para mandar al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('session-expired'));
    }
    return Promise.reject(error);
  },
);

export default api;
