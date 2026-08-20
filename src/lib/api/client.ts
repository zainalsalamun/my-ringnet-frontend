import axios from "axios";
import { toAppApiError } from "./errors";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  return process.env.NEXT_PUBLIC_API || "https://dev-srv.dekadata.net/api/v1";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
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
    const appError = toAppApiError(error);

    if (appError.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("ringnet_token");
      localStorage.removeItem("ringnet_user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
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

