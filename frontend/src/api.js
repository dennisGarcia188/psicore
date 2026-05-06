import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // URL base do FastAPI
});

// Adiciona o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trata erros de autenticação (Token expirado ou inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Apenas redirecionar se não for a rota de login ou register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
