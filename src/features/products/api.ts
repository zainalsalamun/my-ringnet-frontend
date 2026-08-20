import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const productsApi = {
  broadbandSelect(query = "") {
    return api.post(API_ENDPOINTS.products.broadbandSelect, { query });
  },

  servicePackages(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.products.servicePackages, { params });
  },

  servicePackageDetail(id: string) {
    return api.get(API_ENDPOINTS.products.servicePackageDetail(id));
  },

  createServicePackage(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.products.servicePackages, payload);
  },

  updateServicePackage(id: string, payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.products.servicePackageDetail(id), payload);
  },

  removeServicePackage(id: string) {
    return api.delete(API_ENDPOINTS.products.servicePackageDetail(id));
  },
};
