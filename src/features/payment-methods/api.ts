import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const paymentMethodsApi = {
  async list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    try {
      const res = await api.get(API_ENDPOINTS.paymentMethods.list, { params });
      if (Array.isArray(res.data?.data)) return res;
      return { data: { data: [] } };
    } catch {
      return { data: { data: [] } };
    }
  },

  async detail(id: string) {
    return api.get(API_ENDPOINTS.paymentMethods.detail(id)).catch(() => ({ data: { data: null } }));
  },

  create(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.paymentMethods.list, payload);
  },

  update(id: string, payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.paymentMethods.detail(id), payload);
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.paymentMethods.detail(id));
  },
};
