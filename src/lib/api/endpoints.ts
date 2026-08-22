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

  partnerApi: {
    // 1. Customers (Residential)
    customersList: "/p-api/v1/customers/list",
    customersListStatus: "/p-api/v1/customers/list-status",
    customerRead: (id: string) => `/p-api/v1/customers/read/${id}`,
    customerCreate: "/p-api/v1/customers/create",
    customerUpdate: "/p-api/v1/customers/update",
    customerDelete: (id: string) => `/p-api/v1/customers/delete/${id}`,
    customerChangeStatus: "/p-api/v1/customers/change-status",

    // 2. Business Customers (Corporate)
    businessList: "/p-api/v1/business/list",
    businessListStatus: "/p-api/v1/business/list-status",
    businessRead: (id: string) => `/p-api/v1/business/read/${id}`,
    businessCreate: "/p-api/v1/business/create",
    businessUpdate: "/p-api/v1/business/update",
    businessDelete: (id: string) => `/p-api/v1/business/delete/${id}`,
    businessChangeStatus: "/p-api/v1/business/change-status",

    // 3. POP & Partner Profile (Legal & Data POP)
    profile: "/p-api/v1/partners/profile",
    partnerRead: (id: string) => `/p-api/v1/partners/read/${id}`,
    documents: "/p-api/v1/partners/documents",
    documentFile: (filename: string) => `/p-api/v1/partners/documents/${encodeURIComponent(filename)}`,

    // 4 & 5. Network Devices (Aktif & Pasif)
    networkDevicesList: "/p-api/v1/network-devices/list",
    networkDevicesStats: "/p-api/v1/network-devices/stats",
    networkDeviceRead: (id: string) => `/p-api/v1/network-devices/read/${id}`,
    networkDeviceCreate: "/p-api/v1/network-devices/create",
    networkDeviceUpdate: (id: string) => `/p-api/v1/network-devices/update/${id}`,
    networkDeviceDelete: (id: string) => `/p-api/v1/network-devices/delete/${id}`,

    // 6. Map & Infrastructure
    mapMarkers: (types?: string) => `/p-api/v1/map/markers${types ? `?types=${encodeURIComponent(types)}` : ""}`,
    mapMarkerTypes: "/p-api/v1/map/marker-types",
    mapNodeRead: (id: string) => `/p-api/v1/map/nodes/read/${id}`,
    mapNodeReport: (id: string) => `/p-api/v1/map/nodes/report/${id}`,
    mapCablesList: (params?: string) => `/p-api/v1/map/cables/list${params ? `?${params}` : ""}`,
    mapCableCoreCapacities: "/p-api/v1/map/cables/core-capacities",
    mapCableRead: (id: string) => `/p-api/v1/map/cables/read/${id}`,
    mapSplicesByCable: (id: string) => `/p-api/v1/map/cables/splices/by-cable/${id}`,
    mapSplicesByNode: (id: string) => `/p-api/v1/map/cables/splices/by-node/${id}`,
    mapNodeTopology: (id: string) => `/p-api/v1/map/cables/node-topology/${id}`,

    // 7. RADIUS
    radiusUsersList: "/p-api/v1/radius/users/list",
    radiusUsersListStatus: "/p-api/v1/radius/users/list-status",
    radiusUserRead: (id: string) => `/p-api/v1/radius/users/read/${id}`,
    radiusUserCreate: "/p-api/v1/radius/users/create",
    radiusUserUpdate: (id: string) => `/p-api/v1/radius/users/update/${id}`,
    radiusUserDelete: (id: string) => `/p-api/v1/radius/users/delete/${id}`,
    radiusUserChangeStatus: "/p-api/v1/radius/users/change-status",
    radiusSessionsList: "/p-api/v1/radius/sessions/list",
    radiusSessionDisconnect: "/p-api/v1/radius/sessions/disconnect",
    radiusLogsList: (id: string) => `/p-api/v1/radius/logs/list/${id}`,
    radiusProfilesList: "/p-api/v1/radius/profiles/list",
    radiusProfilesSelect: "/p-api/v1/radius/profiles/select",
    radiusProfileRead: (id: string) => `/p-api/v1/radius/profiles/read/${id}`,
    radiusProfileCreate: "/p-api/v1/radius/profiles/create",
    radiusProfileUpdate: "/p-api/v1/radius/profiles/update",
    radiusProfileUpdateBatch: "/p-api/v1/radius/profiles/update-batch",
    radiusProfileDelete: (id: string) => `/p-api/v1/radius/profiles/delete/${id}`,

    // 8. Products (Broadband)
    productsBroadbandList: "/p-api/v1/products/broadband/list",
    productsBroadbandRead: (id: string) => `/p-api/v1/products/broadband/read/${id}`,
    productsBroadbandCreate: "/p-api/v1/products/broadband/create",
    productsBroadbandUpdate: (id: string) => `/p-api/v1/products/broadband/update/${id}`,
    productsBroadbandDelete: (id: string) => `/p-api/v1/products/broadband/delete/${id}`,
  },
} as const;
