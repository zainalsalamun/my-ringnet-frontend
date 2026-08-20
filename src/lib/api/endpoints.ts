export const API_ENDPOINTS = {
  auth: {
    login: "/admin/login",
    me: "/admin/me",
    logout: "/admin/logout",
  },

  users: {
    list: "/users",
    rawAdminList: "/admin/list",
    rawAdminCreate: "/admin/create",
    rawAdminUpdate: "/admin/update",
    rawAdminDetail: (id: string) => `/admin/read/${id}`,
    rawAdminDelete: (id: string) => `/admin/delete/${id}`,
    changeStatus: "/admin/change-status",
    adminList: "/admin/list",
    adminCreate: "/users",
    adminDetail: (id: string) => `/users/${id}`,
  },

  customers: {
    rawList: "/customer/list",
    rawCreate: "/customer/create",
    rawUpdate: "/customer/update",
    rawPartnerUpdate: "/customer-partner/update",
    rawRead: (id: string) => `/customer/read/${id}`,
    rawDelete: (id: string) => `/customer/delete/${id}`,
    list: "/customers",
    create: "/customers",
    detail: (id: string) => `/customers/${id}`,
    update: (id: string) => `/customers/${id}`,
    delete: (id: string) => `/customers/${id}`,
  },

  businessCustomers: {
    list: "/companies",
    create: "/companies",
    detail: (id: string) => `/companies/${id}`,
    update: (id: string) => `/companies/${id}`,
    delete: (id: string) => `/companies/${id}`,
  },

  partners: {
    rawList: "/partner/list",
    rawCreate: "/partner/create",
    rawUpdate: "/partner/update",
    list: "/partners",
    create: "/partners",
    detail: (id: string) => `/partners/${id}`,
    update: (id: string) => `/partners/${id}`,
    delete: (id: string) => `/partners/${id}`,
    availableCustomers: (id: string) => `/partners/${id}/available-customers`,
    customers: (id: string) => `/partners/${id}/customers`,
    customer: (id: string, customerId: string) => `/partners/${id}/customers/${customerId}`,
    registrationDecision: (id: string) => `/partners/${id}/registration-decision`,
  },

  pops: {
    rawList: "/location-point/list",
    rawCreate: "/location-point/create",
    rawReport: (id: string) => `/location-point/report/${id}`,
    rawUpdate: (id: string) => `/location-point/update/${id}`,
    rawDelete: (id: string) => `/location-point/delete/${id}`,
    list: "/pops",
    create: "/pops",
    detail: (id: string) => `/pops/${id}`,
    update: (id: string) => `/pops/${id}`,
    delete: (id: string) => `/pops/${id}`,
  },

  dashboard: {
    summary: "/dashboard/summary",
    notifications: "/dashboard/notifications",
    notificationRead: (id: string) => `/dashboard/notifications/${encodeURIComponent(id)}/read`,
    notificationsReadAll: "/dashboard/notifications/read-all",
  },

  technical: {
    locationPointList: "/location-point/list",
    mapMarkers: "/location-point/map-markers",
  },

  finance: {
    payments: "/finance",
    paymentDetail: (id: string) => `/finance/${id}`,
    invoices: "/internet-services",
    invoiceDetail: (id: string) => `/internet-services/${id}`,
  },

  products: {
    broadbandSelect: "/product/broadband/select",
    servicePackages: "/service-packages",
    servicePackageDetail: (id: string) => `/service-packages/${id}`,
  },

  marketing: {
    list: "/marketing",
    detail: (id: string) => `/marketing/${id}`,
  },

  settings: {
    list: "/settings",
    detail: (id: string) => `/settings/${id}`,
  },

  reports: {
    list: "/reports",
    detail: (id: string) => `/reports/${id}`,
  },

  paymentMethods: {
    list: "/payment-methods",
    detail: (id: string) => `/payment-methods/${id}`,
  },

  mitraPortal: {
    register: "/auth/register-mitra",
    pops: "/mitra-portal/pops",
    aiChat: "/mitra-portal/ai-chat",
    aiChatHistory: "/mitra-portal/ai-chat/history",
    summary: "/mitra-portal/summary",
    profile: "/mitra-portal/profile",
    profileSignature: "/mitra-portal/profile/signature",
    products: "/mitra-portal/products",
    customers: "/mitra-portal/customers",
    finance: "/mitra-portal/finance",
    invoices: "/mitra-portal/invoices",
    tickets: "/mitra-portal/tickets",
    contentDocuments: "/mitra-portal/content-documents",
    documents: "/mitra-portal/documents",
  },

  documents: {
    list: "/documents",
    detail: (id: string) => `/documents/${id}`,
    create: "/documents",
    update: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`,
    categories: "/document-categories",
    categoryDetail: (id: string) => `/document-categories/${id}`,
  },
} as const;
