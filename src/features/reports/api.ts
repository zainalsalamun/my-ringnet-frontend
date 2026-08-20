import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const reportsApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.reports.list, { params });
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.reports.detail(id));
  },

  create(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.reports.list, payload);
  },

  update(id: string, payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.reports.detail(id), payload);
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.reports.detail(id));
  },
};
