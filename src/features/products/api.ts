/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const productsApi = {
  broadbandSelect(query = "") {
    return api.post(API_ENDPOINTS.products.broadbandSelect, { query });
  },

  async servicePackages(params?: URLSearchParams | Record<string, string | number | boolean>) {
    try {
      const res = await api.post("/product/broadband/list", {
        pageSize: 100,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      if (Array.isArray(raw)) {
        return {
          data: {
            data: raw.map((item: any) => ({
              id: item.id || item.product_id,
              name: item.name || item.product_name,
              speedMbps: item.speed_mbps || item.speed || item.bandwidth || 0,
              monthlyPrice: item.monthly_price || item.price || item.cost || 0,
              description: item.description || "Paket internet broadband FTTH",
              status: item.status === false ? "nonactive" : "active",
            })),
          },
        };
      }
    } catch {
      // fallback to service-packages
    }

    try {
      const res = await api.get(API_ENDPOINTS.products.servicePackages, { params });
      if (Array.isArray(res.data?.data)) return res;
    } catch {
      // ignore
    }

    return { data: { data: [] } };
  },

  servicePackageDetail(id: string) {
    return api.get(API_ENDPOINTS.products.servicePackageDetail(id)).catch(() => ({ data: { data: null } }));
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
