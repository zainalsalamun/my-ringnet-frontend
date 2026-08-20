import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const paymentMethodsApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.paymentMethods.list, { params });
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.paymentMethods.detail(id));
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
