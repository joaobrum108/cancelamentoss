import axios from 'axios';
import { useCustomToast } from '../composables/useCustomToast';

const { warning } = useCustomToast();

function createApiInstance(baseURL) {
  const DEFAULT_TIMEOUT = 120000; 
  const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || DEFAULT_TIMEOUT;
  const instance = axios.create({
    baseURL,
    timeout: TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
    );
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          warning('A requisição demorou muito tempo e foi cancelada. Por favor, tente novamente.');
        }
        return Promise.reject(error);   
      }
    );
  return instance;
}

const api_cancelamentos = createApiInstance(import.meta.env.VITE_API_URL);

export {
  api_cancelamentos
};