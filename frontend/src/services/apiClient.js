import axios from "axios";
import Cookies from "js-cookie";
import getCSRFToken from "./csrf"; // Import hàm lấy CSRF token
const apiClient = axios.create({
  baseURL: "http://26.178.178.33:8000/api/v1", // Thay bằng URL backend của bạn
  timeout: 10000, // Thời gian chờ
  withCredentials: true, // Sử dụng cookie cho CORS
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": getCSRFToken(), // Thêm CSRF token vào header
  },
});

// Interceptor để thêm Authorization token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access"); // Lấy token từ cookie "access"

    if (token && token !== "" && token !== "undefined") {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Giữ track tình trạng refresh token để tránh gửi nhiều request refresh token cùng lúc
let isRefreshing = false;
let refreshSubscribers = [];

// Hàm để gọi lại request ban đầu khi refresh token thành công
const retryRequest = (error, newToken) => {
  error.config.headers["Authorization"] = `Bearer ${newToken}`;
  return axios(error.config); // Retry the failed request with the new token
};

// Giải quyết việc refresh token
const refreshToken = async () => {
  try {
    const response = await apiClient.post("/auth/refresh-token/");
    const newToken = response.data.access; // Giả sử token mới trả về có trong trường `access`

    // Gửi lại các request đã bị lỗi trước đó
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = []; // Reset the subscribers after retrying the requests
    return newToken;
  } catch (error) {
    // Nếu refresh token thất bại, có thể xóa cookie và điều hướng người dùng đến trang đăng nhập
    console.error("Refresh token failed", error);
    return Promise.reject(error);
  }
};

// Interceptor để xử lý lỗi từ response
apiClient.interceptors.response.use(
  (response) => response, // Nếu không có lỗi, trả về response như bình thường
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi Unauthorized (401) và chưa thử refresh token lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Gửi request refresh token
          const newToken = await refreshToken();

          // Retry request ban đầu với token mới
          return retryRequest(error, newToken);
        } catch (err) {
          // Nếu không thể refresh token, có thể điều hướng tới trang đăng nhập
          return Promise.reject(err);
        } finally {
          isRefreshing = false; // Reset isRefreshing sau khi hoàn thành
        }
      } else {
        // Nếu đang refresh token, đợi đến khi token được refresh xong
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(axios(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error); // Trả về lỗi nếu không phải lỗi 401 hoặc không có token
  }
);

export default apiClient;
