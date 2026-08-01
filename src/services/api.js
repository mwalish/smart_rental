
import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: { 'Content-Type': 'application/json' }
});

// --- Request Interceptor ---
// Attach token ONLY to protected routes; NEVER to login/refresh/register
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const isPublicRoute = 
      config.url.includes("login") || 
      // config.url.includes("refresh/") || 
      config.url.includes("register/");

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization; // Ensure no invalid token leaks
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
// Auto-refresh expired access token; redirect to login on failure
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints
    if (error.response?.status !== 401 || originalRequest._retry ||
        originalRequest.url.includes("core/login/") ||
        originalRequest.url.includes("core/token/refresh/")) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint to get new access token
      const { data } = await api.post("core/token/refresh/", { refresh: refreshToken });
      localStorage.setItem("access_token", data.access);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
      processQueue(null, data.access);
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;