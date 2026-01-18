import axios from 'axios';

// Generar ID único de pestaña al cargar el módulo
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const TOKEN_KEY = `auth_token_${TAB_ID}`;

console.log(`[API] Pestaña inicializada con ID: ${TAB_ID}`);

// Funciones para manejar el token en sessionStorage con ID único de pestaña
export const setAuthToken = (token) => {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    console.log(`[${TAB_ID}] ✅ Token guardado`);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    console.log(`[${TAB_ID}] ❌ Token eliminado`);
  }
};

export const getAuthToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Interceptor para agregar token al header
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log(`[${TAB_ID}] ❌ ${error.response.status} - Limpiando sesión`);
      setAuthToken(null);
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
