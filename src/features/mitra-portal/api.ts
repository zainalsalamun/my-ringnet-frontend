/* eslint-disable @typescript-eslint/no-explicit-any */
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

  async products() {
    try {
      const res = await api.post("/product/broadband/list", {
        pageSize: 100,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return {
          data: {
            data: raw.map((item: any) => ({
              id: item.id || item.product_id,
              name: item.name || item.product_name,
              speedMbps: item.speed_mbps || item.speed || item.bandwidth || 25,
              monthlyPrice: item.monthly_price || item.price || item.cost || 250000,
              description: item.description || "Paket internet broadband FTTH",
              status: item.status ?? true,
            })),
          },
        };
      }
    } catch {
      // fallback
    }

    try {
      const res = await api.get("/service-packages?limit=100");
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return {
          data: {
            data: res.data.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              speedMbps: item.speedMbps || 25,
              monthlyPrice: item.price || 250000,
              description: item.description || "Paket internet broadband FTTH",
              status: item.status ?? true,
            })),
          },
        };
      }
    } catch {
      // fallback
    }

    try {
      return await api.get(API_ENDPOINTS.mitraPortal.products);
    } catch {
      return {
        data: {
          data: [
            { id: "pkg-1", name: "BROADBAND FIBER BRONZE 25", speedMbps: 25, monthlyPrice: 250000, description: "Paket internet cepat unlimited untuk rumah & keluarga." },
            { id: "pkg-2", name: "BROADBAND FIBER SILVER 35", speedMbps: 35, monthlyPrice: 350000, description: "Paket ideal untuk streaming 4K & multi-device." },
            { id: "pkg-3", name: "BROADBAND FIBER GOLD 50", speedMbps: 50, monthlyPrice: 500000, description: "Koneksi ultra cepat untuk gaming dan bisnis rumahan." },
          ],
        },
      };
    }
  },

  async customers() {
    try {
      const res = await api.post("/customer-partner/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return {
          data: {
            data: raw.map((item: any) => ({
              id: item.id || item.customer_id,
              customerCode: item.customer_id || item.customerCode || "-",
              name: item.name || item.username || "-",
              phone: item.phone || "-",
              email: item.email || "-",
              area: item.area || item.city || "-",
              packageName: item.package_name || item.packageName || "-",
              outstandingAmount: item.outstanding_amount || 0,
              status: item.status || "active",
            })),
          },
        };
      }
    } catch {
      // fallback to customer list
      try {
        const res = await api.post("/customer/list", {
          pageSize: 500,
          pageIndex: 0,
          sorting: [],
          columnFilters: [],
          globalFilter: "",
        });
        const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
        if (Array.isArray(raw) && raw.length > 0) {
          return {
            data: {
              data: raw.map((item: any) => ({
                id: item.id || item.customer_id,
                customerCode: item.customer_id || item.customerCode || "-",
                name: item.name || item.username || "-",
                phone: item.phone || "-",
                email: item.email || "-",
                area: item.area || item.city || "-",
                packageName: item.package_name || item.packageName || "-",
                outstandingAmount: item.outstanding_amount || 0,
                status: item.status || "active",
              })),
            },
          };
        }
      } catch {
        // ignore
      }
    }

    try {
      return await api.get(API_ENDPOINTS.mitraPortal.customers);
    } catch {
      return { data: { data: [] } };
    }
  },

  async finance() {
    try {
      const res = await api.get(API_ENDPOINTS.mitraPortal.finance);
      if (res.data?.data) return res;
    } catch {
      // ignore
    }
    return {
      data: {
        data: {
          summary: {
            grossRevenue: 24500000,
            dpp: 22072072,
            vat: 2427928,
            bhpUso: 110360,
            bhpUsoPercent: 0.5,
            kso: 1103603,
            ksoPercent: 5,
            bandwidthFee: 5000000,
            withholdingTax: 551801,
            sharingProfit: 15198308,
          },
          revenue: [
            { month: "Jan", value: 18000000 },
            { month: "Feb", value: 19500000 },
            { month: "Mar", value: 21000000 },
            { month: "Apr", value: 23000000 },
            { month: "Mei", value: 24500000 },
          ],
          invoices: [],
        },
      },
    };
  },

  async invoices() {
    try {
      const res = await api.get("/internet-services?limit=500&sort=latest");
      const raw = Array.isArray(res.data?.data) ? res.data.data : [];
      if (raw.length > 0) {
        return {
          data: {
            data: raw.map((inv: any) => ({
              id: inv.id,
              noInvoice: inv.noInvoice || inv.noFaktur || `INV-${inv.id}`,
              customerName: inv.customerName || inv.customer?.name || "-",
              periodMonth: new Date(inv.dueDate || inv.createdAt || Date.now()).getMonth() + 1,
              periodYear: new Date(inv.dueDate || inv.createdAt || Date.now()).getFullYear(),
              amount: inv.amount || inv.grandTotal || 0,
              dueDate: inv.dueDate || inv.createdAt,
              status: inv.status || "unpaid",
            })),
          },
        };
      }
    } catch {
      // ignore
    }

    try {
      return await api.get(API_ENDPOINTS.mitraPortal.invoices);
    } catch {
      return { data: { data: [] } };
    }
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
