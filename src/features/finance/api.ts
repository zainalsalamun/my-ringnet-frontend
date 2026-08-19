/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface PaymentItem {
  id: string;
  customerName?: string;
  invoiceNo?: string;
  referenceNo?: string;
  amount?: number;
  status?: string;
  method?: string;
  paidAt?: string;
  [key: string]: any;
}

export const financeApi = {
  async getList(limit = 5000): Promise<PaymentItem[]> {
    const res = await api.get(`/finance?limit=${limit}&sort=latest`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getPayments(limit = 5000): Promise<PaymentItem[]> {
    return this.getList(limit);
  },

  async getDetail(id: string) {
    const res = await api.get(`/finance/${id}`);
    return res.data?.data;
  },

  async createPayment(payload: any) {
    return api.post("/finance", payload);
  },

  async updatePayment(id: string, payload: any) {
    return api.put(`/finance/${id}`, payload);
  },

  async deletePayment(id: string) {
    return api.delete(`/finance/${id}`);
  },

  async findPaymentByInvoice(invoiceNo: string) {
    const res = await api.get(`/finance?limit=1&search=${encodeURIComponent(invoiceNo)}`);
    const data = res.data?.data;
    return Array.isArray(data) ? data[0] : null;
  },

  async getPaymentMethods(limit = 100) {
    const res = await api.get(`/payment-methods?limit=${limit}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getPaymentMethodDetail(id: string) {
    const res = await api.get(`/payment-methods/${id}`);
    return res.data?.data;
  },

  async createPaymentMethod(payload: any) {
    return api.post("/payment-methods", payload);
  },

  async updatePaymentMethod(id: string, payload: any) {
    return api.put(`/payment-methods/${id}`, payload);
  },

  async deletePaymentMethod(id: string) {
    return api.delete(`/payment-methods/${id}`);
  },

  async getReports(limit = 100) {
    const res = await api.get(`/reports?limit=${limit}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getReportDetail(id: string) {
    const res = await api.get(`/reports/${id}`);
    return res.data?.data;
  },

  async createReport(payload: any) {
    return api.post("/reports", payload);
  },

  async updateReport(id: string, payload: any) {
    return api.put(`/reports/${id}`, payload);
  },

  async deleteReport(id: string) {
    return api.delete(`/reports/${id}`);
  },

  async getCompanySettings(id = "company-profile") {
    const res = await api.get(`/settings/${id}`);
    return res.data?.data;
  },

  async saveCompanySettings(payload: any, id?: string) {
    if (id) {
      return api.put(`/settings/${id}`, payload);
    }
    return api.post("/settings", payload);
  },

  async updateCompanySettings(payload: any, id?: string) {
    return this.saveCompanySettings(payload, id);
  },

  async getServicePackages(limit = 100) {
    const res = await api.get(`/service-packages?limit=${limit}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getServicePackageDetail(id: string) {
    const res = await api.get(`/service-packages/${id}`);
    return res.data?.data;
  },

  async createServicePackage(payload: any) {
    return api.post("/service-packages", payload);
  },

  async updateServicePackage(id: string, payload: any) {
    return api.put(`/service-packages/${id}`, payload);
  },

  async deleteServicePackage(id: string) {
    return api.delete(`/service-packages/${id}`);
  },

  async getFinanceSummary() {
    const [paymentRes, invoiceRes, partnerRes] = await Promise.all([
      api.get("/finance?limit=5000"),
      api.get("/internet-services?limit=5000"),
      api.get("/partners?limit=5000"),
    ]);

    return {
      payments: Array.isArray(paymentRes.data?.data) ? paymentRes.data.data : [],
      invoices: Array.isArray(invoiceRes.data?.data) ? invoiceRes.data.data : [],
      partners: Array.isArray(partnerRes.data?.data) ? partnerRes.data.data : [],
    };
  },
};
