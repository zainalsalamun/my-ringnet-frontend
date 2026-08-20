import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const documentsApi = {
  categories() {
    return api.get(API_ENDPOINTS.documents.categories);
  },

  createCategory(payload: { name: string }) {
    return api.post(API_ENDPOINTS.documents.categories, payload);
  },

  updateCategory(id: string, payload: { name: string }) {
    return api.put(API_ENDPOINTS.documents.categoryDetail(id), payload);
  },

  removeCategory(id: string) {
    return api.delete(API_ENDPOINTS.documents.categoryDetail(id));
  },

  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.documents.list, { params });
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.documents.detail(id));
  },

  create(payload: Record<string, unknown> | FormData) {
    return api.post(API_ENDPOINTS.documents.create, payload);
  },

  update(id: string, payload: Record<string, unknown> | FormData) {
    return api.put(API_ENDPOINTS.documents.update(id), payload);
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.documents.delete(id));
  },
};
