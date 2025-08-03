import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9999", // 백엔드 서버 주소
  timeout: 5000, // 요청 타임아웃 (ms 단위)
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
