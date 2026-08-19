/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface CustomerItem {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  area: string;
  city: string;
  address: string;
  packageName: string;
  packagePrice: number | null;
  customerType: string;
  status: "active" | "nonactive";
  lastActivity: string | null;
  [key: string]: any;
}

export const customerApi = {
  async getList(): Promise<CustomerItem[]> {
    try {
      const res = await api.post("/customer/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {
          customer_id: true,
          name: true,
          area: true,
          type: true,
          address: true,
          phone: true,
          status: true,
          package_name: true,
          created_at: true,
          updated_at: true,
        },
        withDeleted: false,
      });

      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      return raw.map((item: any) => ({
        id: item.id || item.customer_id,
        customerCode: item.customer_id || item.customerCode || String(item.id || "").slice(0, 8),
        name: item.name || item.username || "-",
        phone: item.phone || "-",
        area: item.area || "-",
        city: item.city || item.address || "-",
        address: item.address || "-",
        packageName: item.package_name || item.packageName || item.product || item.product_name || "-",
        packagePrice: item.package_price || item.price || item.monthly_fee || null,
        customerType: item.type || item.customerType || "home",
        status: item.status === false ? "nonactive" : (item.status === true || item.status === "active" ? "active" : item.status || "active"),
        lastActivity: item.updated_at || item.created_at || item.createdAt || null,
      }));
    } catch {
      const res = await api.get("/customers?limit=5000");
      const raw = res.data?.data || [];
      return raw.map((item: any) => ({
        id: item.id || item.customer_id,
        customerCode: item.customer_id || item.customerCode || String(item.id || "").slice(0, 8),
        name: item.name || item.username || "-",
        phone: item.phone || "-",
        area: item.area || "-",
        city: item.city || item.address || "-",
        address: item.address || "-",
        packageName: item.package_name || item.packageName || item.product || item.product_name || "-",
        packagePrice: item.package_price || item.price || item.monthly_fee || null,
        customerType: item.type || item.customerType || "home",
        status: item.status === false ? "nonactive" : (item.status === true || item.status === "active" ? "active" : item.status || "active"),
        lastActivity: item.updated_at || item.created_at || item.createdAt || null,
      }));
    }
  },

  async getDetail(id: string) {
    try {
      const res = await api.get(`/customer/read/${id}`);
      return res.data?.data;
    } catch {
      const res = await api.get(`/customers/${id}`);
      return res.data?.data;
    }
  },

  async toggleStatus(id: string, nextActive: boolean | string) {
    const isBool = typeof nextActive === "boolean";
    const nextStatus = isBool ? (nextActive ? "active" : "nonactive") : (nextActive === "active" ? "active" : "nonactive");
    try {
      return await api.patch("/customer/update", { selectedCustomerId: id, status: isBool ? nextActive : nextActive === "active" });
    } catch {
      return await api.patch(`/customers/${id}`, { status: nextStatus });
    }
  },

  async delete(id: string) {
    try {
      return await api.delete(`/customer/delete/${id}`);
    } catch {
      return await api.delete(`/customers/${id}`);
    }
  },

  async create(payload: any) {
    try {
      return await api.post("/customer/create", payload);
    } catch {
      return await api.post("/customers", payload);
    }
  },

  async update(id: string, payload: any) {
    try {
      return await api.patch("/customer/update", { ...payload, selectedCustomerId: id });
    } catch {
      return await api.put(`/customers/${id}`, payload);
    }
  },

  async updateCustomerPartner(payload: any) {
    return api.patch("/customer-partner/update", payload);
  },

  async getBroadbandProducts() {
    try {
      const res = await api.post("/product/broadband/select", { query: "" });
      return res.data?.data?.list || res.data?.data || [];
    } catch {
      const res = await api.get("/service-packages?limit=100");
      return res.data?.data || [];
    }
  },

  async searchCustomers(params: { search?: string; type?: string; limit?: number }, signal?: AbortSignal) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.type) query.append("type", params.type);
    if (params.limit) query.append("limit", String(params.limit));
    const res = await api.get(`/customers?${query.toString()}`, { signal });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },
};
