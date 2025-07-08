import axios from "axios";


const url = import.meta.env.VITE_APP_BASE_URL;

// API Configuration
const API_BASE_URL = url;
const REQUEST_TIMEOUT = 5000000; // 10 seconds
const MAX_RETRIES = 3;

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management utilities
const tokenManager = {
  getToken: () => {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  },

  setToken: (token, remember = false) => {
    if (remember) {
      localStorage.setItem("authToken", token);
      sessionStorage.removeItem("authToken");
    } else {
      sessionStorage.setItem("authToken", token);
      localStorage.removeItem("authToken");
    }
  },

  removeToken: () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
  },

  isTokenExpired: (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();

    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`API Request to ${response.config.url} took ${duration}ms`);

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Remove expired token
      tokenManager.removeToken();

      // Redirect to login page
      window.location.href = "/";

      return Promise.reject(error);
    }

    // Handle network errors with retry logic
    if (!error.response && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Exponential backoff delay
      const delay = Math.pow(2, originalRequest._retryCount) * 1000;

      console.log(
        `Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}) after ${delay}ms`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    // Log error details
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

// API Error class for better error handling
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

// Generic API request handler
const handleAPIRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message,
      status: response.status,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    const errorStatus = error.response?.status || 500;
    const errorData = error.response?.data;

    throw new APIError(errorMessage, errorStatus, errorData);
  }
};

export { api, tokenManager, handleAPIRequest };
export default api;
