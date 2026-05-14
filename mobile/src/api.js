import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

const getBaseUrl = () => {
  // Se estivermos em desenvolvimento, tenta pegar o IP da máquina que roda o Expo
  const debuggerHost = Constants.expoConfig?.hostUri;
  
  if (__DEV__ && debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8000`;
  }

  // Fallback para Android Emulator ou Localhost
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
    return 'http://localhost:8000';
  }

  // Para produção na nuvem:
  return 'https://psicore-backend.onrender.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
