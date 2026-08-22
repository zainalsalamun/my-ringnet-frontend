export const ROUTES = {
  home: "/",
  login: "/login",
  mitraRegister: "/register-mitra",

  dashboard: "/dashboard",

  users: {
    root: "/users",
    customer: "/users/pelanggan",
    customerCreate: "/users/pelanggan/create",
    customerNew: "/users/pelanggan/new",
    business: "/users/bisnis",
    businessNew: "/users/bisnis/new",
    partner: "/users/mitra",
    partnerCreate: "/users/mitra/create",
    customerPartner: "/users/pelanggan-mitra",
    registration: "/users/pendaftaran",
    unsubscribed: "/users/berhenti-berlangganan",
    blacklist: "/users/blacklist",
    passive: "/users/pasif",
    admin: "/users/admin",
    adminCreate: "/users/admin/create",
    employee: "/users/employee",
    privilege: "/users/privilege",
    pop: "/users/pop",
    popNew: "/users/pop/new",
  },

  finance: {
    root: "/keuangan",
    invoices: "/internet-services",
    revenueReport: "/keuangan/laporan-pendapatan",
  },

  technical: {
    root: "/mitra/data-teknis",
    infrastructure: "/mitra/infrastruktur",
    router: "/mitra/router",
    switch: "/mitra/switch",
    olt: "/mitra/olt",
    otb: "/mitra/otb",
    odc: "/mitra/odc",
    odp: "/mitra/odp",
    cable: "/mitra/kabel",
  },

  legal: {
    root: "/dokumen/legalitas",
    partnerLegal: "/dokumen/legalitas-mitra",
    pop: "/users/pop",
  },

  radius: {
    root: "/radius",
    nasRouter: "/radius/nas-router",
    profileGroup: "/radius/grup-profil",
    authentication: "/radius/autentikasi",
    userSession: "/radius/sesi-pengguna",
    history: "/radius/riwayat",
  },

  operations: {
    root: "/mitra/tiket-customer",
    products: "/mitra/produk",
    operationalProducts: "/mitra/operasional/produk",
  },

  settings: {
    root: "/pengaturan",
    companyProfile: "/pengaturan/profil-perusahaan",
    servicePackages: "/pengaturan/paket-layanan",
    paymentMethods: "/pengaturan/metode-pembayaran",
    documentCategories: "/pengaturan/kategori-dokumen",
  },
} as const;

export type AppRoutes = typeof ROUTES;

