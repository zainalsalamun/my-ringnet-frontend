import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { AxiosRequestConfig } from "axios";

export const authApi = {
  login(payload: { username: string; password: string; remember?: boolean }) {
    return api.post(API_ENDPOINTS.auth.login, payload);
  },

  me(config?: AxiosRequestConfig) {
    return api.get(API_ENDPOINTS.auth.me, config);
  },

  logout() {
    return api.get(API_ENDPOINTS.auth.logout);
  },
};
