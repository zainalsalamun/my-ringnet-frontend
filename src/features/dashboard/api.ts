import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

const dashboardListBody = (columnVisibility: Record<string, boolean> = {}) => ({
  pageSize: 500,
  pageIndex: 0,
  sorting: [],
  columnFilters: [],
  globalFilter: "",
  columnVisibility,
  withDeleted: false,
});

export const dashboardApi = {
  getCustomerSummaryData() {
    return api.post(API_ENDPOINTS.customers.rawList, dashboardListBody({
      customer_id: true,
      name: true,
      status: true,
      package_name: true,
      created_at: true,
      updated_at: true,
    }));
  },

  getPartnerSummaryData() {
    return api.post(API_ENDPOINTS.partners.rawList, dashboardListBody({
      partner_id: true,
      name: true,
      status: true,
      package_name: true,
      created_at: true,
      updated_at: true,
    }));
  },

  getAdminSummaryData() {
    return api.post(API_ENDPOINTS.users.rawAdminList, dashboardListBody({
      admin_id: true,
      name: true,
      status: true,
      division: true,
    }));
  },

  getLocationSummaryData() {
    return api.post(API_ENDPOINTS.technical.locationPointList, dashboardListBody({
      maps_id: true,
      name: true,
      type: true,
      coordinate: true,
    }));
  },

  getInvoices() {
    return api.get(`${API_ENDPOINTS.finance.invoices}?limit=5000&sort=latest`);
  },

  getPayments() {
    return api.get(`${API_ENDPOINTS.finance.payments}?limit=5000&sort=latest`);
  },

  getSummaryFallback() {
    return api.get(API_ENDPOINTS.dashboard.summary);
  },
};

