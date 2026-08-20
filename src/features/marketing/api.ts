import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const marketingApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.marketing.list, { params });
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.marketing.detail(id));
  },

  create(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.marketing.list, payload);
  },

  update(id: string, payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.marketing.detail(id), payload);
  },
};
