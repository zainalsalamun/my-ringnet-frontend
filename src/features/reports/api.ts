import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const reportsApi = {
  async list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    try {
      const res = await api.get(API_ENDPOINTS.reports.list, { params });
      if (Array.isArray(res.data?.data)) return res;
      return { data: { data: [] } };
    } catch {
      return { data: { data: [] } };
    }
  },

  async detail(id: string) {
    return api.get(API_ENDPOINTS.reports.detail(id)).catch(() => ({ data: { data: null } }));
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
