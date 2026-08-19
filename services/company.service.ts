/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface CompanyItem {
  id: string;
  companyCode: string;
  name: string;
  email: string;
  phone: string;
  picName: string;
  area: string;
  city: string;
  address: string;
  packageName: string;
  packagePrice: number | null;
  businessType: string;
  status: "active" | "nonactive";
  lastActivity: string | null;
  [key: string]: any;
}

export const companyService = {
  async getList(): Promise<CompanyItem[]> {
    const res = await api.get("/companies?limit=5000");
    const raw = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.data || res.data?.rows || [];
    return raw.map((item: any) => ({
      id: item.id || item.partner_id || item.customer_id,
      companyCode: item.companyCode || item.partnerCode || item.partner_id || item.customer_id || String(item.id || "").slice(0, 8),
      name: item.name || item.company_name || item.username || "-",
      email: item.email || "-",
      phone: item.phone || item.pic_phone || "-",
      picName: item.pic_name || item.picName || item.contact_person || "-",
      area: item.area || "-",
      city: item.city || item.regency || "-",
      address: item.address || "-",
      packageName: item.package_name || item.packageName || item.product || item.product_name || "-",
      packagePrice: item.package_price || item.price || item.monthly_fee || null,
      businessType: item.partner_type || item.partnerType || item.type || "Bisnis/Enterprise",
      status: item.status === false ? "nonactive" : (item.status === true || item.status === "active" ? "active" : item.status || "active"),
      lastActivity: item.updated_at || item.created_at || item.createdAt || null,
    }));
  },

  async getDetail(id: string) {
    const res = await api.get(`/companies/${id}`);
    return res.data?.data;
  },

  async toggleStatus(id: string, nextActive: boolean) {
    return api.patch(`/companies/${id}`, { status: nextActive ? "active" : "nonactive" });
  },

  async delete(id: string) {
    return api.delete(`/companies/${id}`);
  },

  async create(payload: any) {
    try {
      return await api.post("/partner/create", payload);
    } catch {
      return await api.post("/companies", payload);
    }
  },

  async update(id: string, payload: any) {
    try {
      return await api.patch("/partner/update", { ...payload, selectedCustomerId: id });
    } catch {
      return await api.put(`/companies/${id}`, payload);
    }
  },
};
