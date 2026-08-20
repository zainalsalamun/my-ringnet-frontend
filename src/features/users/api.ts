import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const usersApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.users.list, { params });
  },

  listAdmins(body: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.users.rawAdminList, body);
  },

  createAdmin(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.users.adminCreate, payload);
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.users.adminDetail(id));
  },

  rawDetail(id: string) {
    return api.get(API_ENDPOINTS.users.rawAdminDetail(id));
  },

  update(id: string, payload: Record<string, unknown>) {
    return api.patch(API_ENDPOINTS.users.adminDetail(id), payload);
  },

  rawUpdate(payload: Record<string, unknown>) {
    return api.patch(API_ENDPOINTS.users.rawAdminUpdate, payload);
  },

  rawCreate(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.users.rawAdminCreate, payload);
  },

  rawDelete(id: string) {
    return api.delete(API_ENDPOINTS.users.rawAdminDelete(id));
  },

  changeStatus(id: string) {
    return api.patch(API_ENDPOINTS.users.changeStatus, { id });
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.users.adminDetail(id));
  },
};
