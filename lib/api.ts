import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ringnet_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("ringnet_token");
        localStorage.removeItem("ringnet_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export type ApiList<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta?: { total?: number; page?: number | string; limit?: number | string };
};

export type ApiSingle<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default api;
