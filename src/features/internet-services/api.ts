/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface InvoiceItem {
  id: string;
  noFaktur?: string;
  noInvoice?: string;
  invoiceType?: string;
  customer?: any;
  customerName?: string;
  amount?: number;
  grandTotal?: number;
  invoiceName?: string;
  serviceType?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const internetServicesApi = {
  async getList(): Promise<InvoiceItem[]> {
    const res = await api.get("/internet-services?limit=5000&sort=latest");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getDetail(id: string) {
    const res = await api.get(`/internet-services/${id}`);
    return res.data?.data;
  },

  async searchInvoices({ search, limit = 1 }: { search: string; limit?: number }): Promise<InvoiceItem[]> {
    const res = await api.get(`/internet-services?limit=${limit}&search=${encodeURIComponent(search)}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getSettings(search = "company_") {
    try {
      const res = await api.get(`/settings?limit=100&search=${encodeURIComponent(search)}`);
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  async getPaymentByInvoice(invoiceKey: string) {
    try {
      const res = await api.get(`/finance?limit=1&search=${encodeURIComponent(invoiceKey)}`);
      return Array.isArray(res.data?.data) ? res.data.data[0] || null : null;
    } catch {
      return null;
    }
  },

  async delete(id: string) {
    return api.delete(`/internet-services/${id}`);
  },

  async update(id: string, data: any) {
    return api.put(`/internet-services/${id}`, data);
  },

  async create(data: any) {
    return api.post("/internet-services", data);
  },
};
