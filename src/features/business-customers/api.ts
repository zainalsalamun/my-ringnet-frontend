import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const businessCustomersApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.businessCustomers.list, { params });
  },

  create(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.businessCustomers.create, payload);
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.businessCustomers.detail(id));
  },

  update(id: string, payload: Record<string, unknown>) {
    return api.patch(API_ENDPOINTS.businessCustomers.update(id), payload);
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.businessCustomers.delete(id));
  },
};

