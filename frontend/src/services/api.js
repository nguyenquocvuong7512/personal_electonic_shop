import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      // Chỉ xóa thông tin đăng nhập khi máy chủ trả về 401.
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");

        window.dispatchEvent(new Event("authChange"));
      }
    }

    // Giữ nguyên lỗi để trang tạo/sửa sản phẩm xử lý trong catch.
    return Promise.reject(error);
  }
);


export default api;