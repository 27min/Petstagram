import { API_BASE_URL } from '../config/apiConfig';

const AUTH_TOKEN_KEY = 'access_token';

export const authService = {
  // 로그인 처리
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      const token = data.accessToken;

      console.log(AUTH_TOKEN_KEY);
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // API 요청용 헤더 생성
  getAuthHeader: () => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // 인증 여부 확인
  isAuthenticated: () => {
    return !!authService.getToken();
  }
};