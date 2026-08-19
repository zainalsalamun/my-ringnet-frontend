/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface LeadItem {
  id: string;
  customerName?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  partner?: any;
  partnerName?: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

export const leadService = {
  async getList(): Promise<LeadItem[]> {
    const res = await api.get("/marketing?limit=5000");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getDetail(id: string) {
    const res = await api.get(`/marketing/${id}`);
    return res.data?.data;
  },

  async create(payload: any) {
    return api.post("/marketing", payload);
  },

  async update(id: string, payload: any) {
    return api.put(`/marketing/${id}`, payload);
  },

  async delete(id: string) {
    return api.delete(`/marketing/${id}`);
  },
};
