import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const financeApi = {
  payments(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.finance.payments, { params });
  },

  paymentDetail(id: string) {
    return api.get(API_ENDPOINTS.finance.paymentDetail(id));
  },

  createPayment(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.finance.payments, payload);
  },

  updatePayment(id: string, payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.finance.paymentDetail(id), payload);
  },

  removePayment(id: string) {
    return api.delete(API_ENDPOINTS.finance.paymentDetail(id));
  },

  invoices(params?: URLSearchParams | Record<string, string | number | boolean>) {
    return api.get(API_ENDPOINTS.finance.invoices, { params });
  },

  invoiceDetail(id: string) {
    return api.get(API_ENDPOINTS.finance.invoiceDetail(id));
  },

  createInvoice(payload: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.finance.invoices, payload);
  },

  updateInvoice(id: string, payload: Record<string, unknown>) {
    return api.put(API_ENDPOINTS.finance.invoiceDetail(id), payload);
  },
};
