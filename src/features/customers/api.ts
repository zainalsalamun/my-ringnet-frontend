import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { AxiosRequestConfig } from "axios";

export const customersApi = {
  list(params?: URLSearchParams | Record<string, string | number | boolean>, config?: AxiosRequestConfig) {
    return api.get(API_ENDPOINTS.customers.list, { ...config, params });
  },

  rawList(body: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.customers.rawList, body);
  },

  rawCreate(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.customers.rawCreate, payload);
  },

  rawRead(id: string) {
    return api.get(API_ENDPOINTS.customers.rawRead(id));
  },

  rawUpdate(payload: Record<string, unknown>) {
    return api.patch(API_ENDPOINTS.customers.rawUpdate, payload);
  },

  rawPartnerUpdate(payload: Record<string, unknown>) {
    return api.patch(API_ENDPOINTS.customers.rawPartnerUpdate, payload);
  },

  rawDelete(id: string) {
    return api.delete(API_ENDPOINTS.customers.rawDelete(id));
  },

  create(payload: Record<string, unknown> | FormData) {
    return api.post(API_ENDPOINTS.customers.create, payload);
  },

  detail(id: string) {
    return api.get(API_ENDPOINTS.customers.detail(id));
  },

  update(id: string, payload: Record<string, unknown> | FormData) {
    return api.patch(API_ENDPOINTS.customers.update(id), payload);
  },

  remove(id: string) {
    return api.delete(API_ENDPOINTS.customers.delete(id));
  },

  // Official Partner / POP API v1 endpoints (/p-api/v1/customers/...)
  partnerList(body: Record<string, unknown> = { pageSize: 15, pageIndex: 0 }) {
    return api.post(API_ENDPOINTS.partnerApi.customersList, body);
  },

  partnerListStatus() {
    return api.get(API_ENDPOINTS.partnerApi.customersListStatus);
  },

  partnerRead(customerId: string) {
    return api.get(API_ENDPOINTS.partnerApi.customerRead(customerId));
  },

  partnerCreate(payload: FormData | Record<string, unknown>) {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    return api.post(API_ENDPOINTS.partnerApi.customerCreate, payload, { headers });
  },

  partnerUpdate(payload: FormData | Record<string, unknown>) {
    const headers = payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
    return api.patch(API_ENDPOINTS.partnerApi.customerUpdate, payload, { headers });
  },

  partnerDelete(customerId: string) {
    return api.delete(API_ENDPOINTS.partnerApi.customerDelete(customerId));
  },

  partnerChangeStatus(id: string, status?: boolean) {
    return api.patch(API_ENDPOINTS.partnerApi.customerChangeStatus, { id, status });
  },
};
