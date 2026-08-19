/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export const mitraPortalService = {
  async getSummary() {
    const res = await api.get("/mitra-portal/summary");
    return res.data?.data;
  },

  async getProfile() {
    const res = await api.get("/mitra-portal/profile");
    return res.data?.data;
  },

  async updateProfile(data: any) {
    const res = await api.put("/mitra-portal/profile", data);
    return res.data?.data;
  },

  async uploadSignature(file: File) {
    const body = new FormData();
    body.append("file", file);
    const res = await api.put("/mitra-portal/profile/signature", body);
    return res.data?.data;
  },

  async getProducts() {
    const res = await api.get("/mitra-portal/products");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getCustomers() {
    const res = await api.get("/mitra-portal/customers");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getFinance() {
    const res = await api.get("/mitra-portal/finance");
    return res.data?.data;
  },

  async getInvoices() {
    const res = await api.get("/mitra-portal/invoices");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getTickets() {
    const res = await api.get("/mitra-portal/tickets");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async createTicket(formData: FormData) {
    return api.post("/mitra-portal/tickets", formData);
  },

  async getContentDocuments(category: string) {
    const res = await api.get(`/mitra-portal/content-documents?category=${category}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async uploadDocument(formData: FormData) {
    return api.post("/mitra-portal/documents", formData);
  },

  async deleteDocument(id: string) {
    return api.delete(`/mitra-portal/documents/${id}`);
  },

  async getPops() {
    const res = await api.get("/mitra-portal/pops");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getAiChatHistory() {
    const res = await api.get("/mitra-portal/ai-chat/history");
    return res.data?.data;
  },

  async sendAiChat(payload: { conversationId?: string | null; division?: string; subject?: string; message: string }) {
    const res = await api.post("/mitra-portal/ai-chat", payload);
    return res.data?.data;
  },

  async registerMitra(payload: any) {
    const res = await api.post("/auth/register-mitra", payload);
    return res.data?.data;
  },
};
