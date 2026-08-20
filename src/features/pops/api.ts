import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const popsApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.pops.list, { params });
  },

  rawList(body: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.pops.rawList, body);
  },

  create(payload: Record<string, unknown> | FormData) {
    return api.post(API_ENDPOINTS.pops.create, payload);
  },

  rawCreate(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.pops.rawCreate, payload);
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.pops.detail(id));
  },

  rawReport(id: string) {
    return api.get(API_ENDPOINTS.pops.rawReport(id));
  },

  update(id: string, payload: Record<string, unknown> | FormData) {
    return api.put(API_ENDPOINTS.pops.update(id), payload);
  },

  rawUpdate(id: string, payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.pops.rawUpdate(id), payload);
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.pops.delete(id));
  },

  rawRemove(id: string) {
    return api.delete(API_ENDPOINTS.pops.rawDelete(id));
  },
};
