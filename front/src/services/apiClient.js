import axios from 'axios';
import { authService } from './authService';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // .env에 설정된 Base URL 사용
});

apiClient.interceptors.request.use((config) => {
  const authHeader = authService.getAuthHeader();
  if (authHeader) {
    config.headers = { ...config.headers, ...authHeader };
  }
  return config;
});

export default apiClient;
