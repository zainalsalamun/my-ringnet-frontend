import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const mitraPortalApi = {
  register(payload: FormData) {
    return api.post(API_ENDPOINTS.mitraPortal.register, payload);
  },

  pops() {
    return api.get(API_ENDPOINTS.mitraPortal.pops);
  },

  summary() {
    return api.get(API_ENDPOINTS.mitraPortal.summary);
  },

  contentDocuments(category: string) {
    return api.get(API_ENDPOINTS.mitraPortal.contentDocuments, { params: { category } });
  },

  documentList(params: Record<string, string>) {
    return api.get(API_ENDPOINTS.documents.list, { params });
  },

  createDocument(payload: FormData, admin = false) {
    return api.post(admin ? API_ENDPOINTS.documents.create : API_ENDPOINTS.mitraPortal.documents, payload);
  },

  removeDocument(id: string, admin = false) {
    return api.delete(`${admin ? API_ENDPOINTS.documents.create : API_ENDPOINTS.mitraPortal.documents}/${id}`);
  },

  profile() {
    return api.get(API_ENDPOINTS.mitraPortal.profile);
  },

  updateProfile(payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.mitraPortal.profile, payload);
  },

  updateProfileSignature(payload: FormData) {
    return api.put(API_ENDPOINTS.mitraPortal.profileSignature, payload);
  },

  products() {
    return api.get(API_ENDPOINTS.mitraPortal.products);
  },

  customers() {
    return api.get(API_ENDPOINTS.mitraPortal.customers);
  },

  finance() {
    return api.get(API_ENDPOINTS.mitraPortal.finance);
  },

  invoices() {
    return api.get(API_ENDPOINTS.mitraPortal.invoices);
  },

  tickets() {
    return api.get(API_ENDPOINTS.mitraPortal.tickets);
  },

  createTicket(payload: FormData) {
    return api.post(API_ENDPOINTS.mitraPortal.tickets, payload);
  },

  aiChatHistory() {
    return api.get(API_ENDPOINTS.mitraPortal.aiChatHistory);
  },

  sendAiChat(payload: {
    conversationId: string | null;
    division: string;
    subject: string;
    message: string;
  }) {
    return api.post(API_ENDPOINTS.mitraPortal.aiChat, payload);
  },
};
