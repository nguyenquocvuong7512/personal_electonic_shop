import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Hàm lấy URL ảnh đầy đủ từ storage Laravel hoặc URL tuyệt đối
export function getAssetUrl(path) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const backendRoot = API_BASE_URL.replace(/\/api\/?$/, "");
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  if (cleanPath.startsWith("storage/")) {
    return `${backendRoot}/${cleanPath}`;
  }
  return `${backendRoot}/storage/${cleanPath}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
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