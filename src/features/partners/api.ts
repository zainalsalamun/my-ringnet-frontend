/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface PartnerItem {
  id: string;
  partnerCode: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  city: string;
  partnerType: string;
  status: string;
  [key: string]: any;
}

export const partnerApi = {
  async getList(): Promise<PartnerItem[]> {
    const res = await api.get("/partners?limit=5000");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getListForSelect(): Promise<any[]> {
    try {
      const res = await api.post("/partner/list", {
        pageSize: 100,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      return res.data?.data?.data || res.data?.data || res.data?.rows || [];
    } catch {
      return this.getList();
    }
  },

  async getDetail(id: string) {
    const res = await api.get(`/partners/${id}`);
    return res.data?.data;
  },

  async getAvailableCustomers(partnerId: string, search: string = "", limit: number = 50) {
    const res = await api.get(`/partners/${partnerId}/available-customers`, {
      params: { search, limit },
    });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async assignCustomers(partnerId: string, customerIds: string[]) {
    const res = await api.post(`/partners/${partnerId}/customers`, { customerIds });
    return res.data?.data;
  },

  async removeCustomer(partnerId: string, customerId: string) {
    const res = await api.delete(`/partners/${partnerId}/customers/${customerId}`);
    return res.data?.data;
  },

  async updateRegistrationStatus(partnerId: string, payload: { status: string; reviewNotes?: string }) {
    const res = await api.patch(`/partners/${partnerId}/registration-status`, payload);
    return res.data?.data;
  },

  async decideRegistration(partnerId: string, payload: { decision: "approved" | "rejected"; notes?: string }) {
    const res = await api.put(`/partners/${partnerId}/registration-decision`, payload);
    return res.data;
  },

  async create(payload: any) {
    try {
      return await api.post("/partner/create", payload);
    } catch {
      return await api.post("/partners", payload);
    }
  },

  async update(id: string, payload: any) {
    try {
      return await api.patch("/partner/update", { ...payload, selectedCustomerId: id });
    } catch {
      return await api.put(`/partners/${id}`, payload);
    }
  },

  async delete(id: string) {
    return api.delete(`/partners/${id}`);
  },
};
