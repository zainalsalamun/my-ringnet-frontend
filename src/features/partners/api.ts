import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const partnersApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.partners.list, { params });
  },

  rawList(body: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.partners.rawList, body);
  },

  rawCreate(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.partners.rawCreate, payload);
  },

  rawUpdate(payload: Record<string, unknown>) {
    return api.patch(API_ENDPOINTS.partners.rawUpdate, payload);
  },

  create(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.partners.create, payload);
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.partners.detail(id));
  },

  update(id: string, payload: Record<string, unknown>) {
    return api.patch(API_ENDPOINTS.partners.update(id), payload);
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.partners.delete(id));
  },

  availableCustomers(id: string, params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.partners.availableCustomers(id), { params });
  },

  attachCustomers(id: string, customerIds: string[]) {
    return api.post(API_ENDPOINTS.partners.customers(id), { customerIds });
  },

  detachCustomer(id: string, customerId: string) {
    return api.delete(API_ENDPOINTS.partners.customer(id, customerId));
  },

  registrationDecision(id: string, payload: { decision: "approved" | "rejected"; notes: string }) {
    return api.put(API_ENDPOINTS.partners.registrationDecision(id), payload);
  },
};
