/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface DocumentItem {
  id: string;
  name: string;
  documentNo?: string;
  description?: string;
  filePath?: string;
  category?: any;
  categorySlug?: string;
  popId?: string;
  partnerId?: string;
  createdAt?: string;
  expiredDate?: string;
  [key: string]: any;
}

export const documentApi = {
  async getDocuments(categorySlug?: string, popId?: string): Promise<DocumentItem[]> {
    const params = new URLSearchParams();
    if (categorySlug) params.append("categorySlug", categorySlug);
    if (popId) params.append("popId", popId);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`/documents${query}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getDocumentDetail(id: string) {
    const res = await api.get(`/documents/${id}`);
    return res.data?.data;
  },

  async getCategories() {
    const res = await api.get("/document-categories");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async createCategory(name: string) {
    return api.post("/document-categories", { name });
  },

  async updateCategory(id: string, name: string) {
    return api.put(`/document-categories/${id}`, { name });
  },

  async deleteCategory(id: string) {
    return api.delete(`/document-categories/${id}`);
  },

  async uploadDocument(formData: FormData) {
    return api.post("/documents", formData);
  },

  async updateDocument(id: string, formData: FormData) {
    return api.put(`/documents/${id}`, formData);
  },

  async deleteDocument(id: string) {
    return api.delete(`/documents/${id}`);
  },
};
