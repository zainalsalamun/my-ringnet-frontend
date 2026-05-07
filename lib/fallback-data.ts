export const users = [
  { id: "00000000-0000-4000-8000-000000000099", name: "Super Admin", email: "superadmin@ringnet.com", role: "super_admin", status: "active", createdAt: "2026-04-01" },
  { id: "00000000-0000-4000-8000-000000000001", name: "Admin RingNet", email: "admin@ringnet.com", role: "admin", status: "active", createdAt: "2026-04-10" },
  { id: "00000000-0000-4000-8000-000000000002", name: "Budi Santoso", email: "budi@ringnet.com", role: "pelanggan", status: "active", createdAt: "2026-04-12" },
  { id: "00000000-0000-4000-8000-000000000003", name: "Siti Rahmawati", email: "siti@ringnet.com", role: "mitra", status: "active", createdAt: "2026-04-14" },
  { id: "00000000-0000-4000-8000-000000000004", name: "PT. Net Solusi", email: "billing@netsolusi.id", role: "bisnis", status: "active", createdAt: "2026-04-17" },
];

export const customers = [
  { id: "10000000-0000-4000-8000-000000000001", name: "Budi Santoso", phone: "0812-1234-5678", area: "Jakarta", city: "Jakarta", customerType: "Individu", packageName: "Mega 50Mbps", status: "active", createdAt: "2026-04-10" },
  { id: "10000000-0000-4000-8000-000000000002", name: "Siti Rahmawati", phone: "0813-3456-6789", area: "Bekasi", city: "Bekasi", customerType: "Individu", packageName: "Ultra 100Mbps", status: "active", createdAt: "2026-04-11" },
  { id: "10000000-0000-4000-8000-000000000003", name: "Dewi Lestari", phone: "0811-4567-8901", area: "Tangerang", city: "Tangerang", customerType: "Individu", packageName: "Mega 20Mbps", status: "nonactive", createdAt: "2026-04-12" },
];

export const companies = [
  { id: "20000000-0000-4000-8000-000000000001", name: "PT. Net Solusi", email: "admin@netsolusi.id", phone: "021-1111-2222", area: "Jakarta", city: "Jakarta", status: "active", createdAt: "2026-04-05" },
  { id: "20000000-0000-4000-8000-000000000002", name: "CV. Koneksi Hebat", email: "info@koneksi.id", phone: "021-2222-3333", area: "Bekasi", city: "Bekasi", status: "active", createdAt: "2026-04-08" },
];

export const partners = [
  { id: "30000000-0000-4000-8000-000000000001", name: "PT. Net Solusi", phone: "021-1111-2222", area: "Jakarta", city: "Jakarta", status: "active", createdAt: "2026-04-03" },
  { id: "30000000-0000-4000-8000-000000000002", name: "CV. Koneksi Hebat", phone: "021-2222-3333", area: "Bekasi", city: "Bekasi", status: "active", createdAt: "2026-04-04" },
  { id: "30000000-0000-4000-8000-000000000003", name: "PT. Jaringan Prima", phone: "021-3333-4444", area: "Depok", city: "Depok", status: "nonactive", createdAt: "2026-04-06" },
];

export const leads = [
  { id: "40000000-0000-4000-8000-000000000001", name: "Andi Pratama", customerName: "Andi Pratama", phone: "0812-1111-3333", status: "prospect", mitraId: "30000000-0000-4000-8000-000000000001", partner: { name: "PT. Net Solusi" }, createdAt: "2026-04-10" },
  { id: "40000000-0000-4000-8000-000000000002", name: "Fitri Wijaya", customerName: "Fitri Wijaya", phone: "0813-2222-4444", status: "deal", mitraId: "30000000-0000-4000-8000-000000000002", partner: { name: "CV. Koneksi Hebat" }, createdAt: "2026-04-09" },
  { id: "40000000-0000-4000-8000-000000000003", name: "Indah Lestari", customerName: "Indah Lestari", phone: "0813-3333-5555", status: "lost", mitraId: "30000000-0000-4000-8000-000000000003", partner: { name: "PT. Jaringan Prima" }, createdAt: "2026-04-08" },
];

export const invoices = [
  { id: "50000000-0000-4000-8000-000000000001", noFaktur: "FTR-2026-05031", noInvoice: "INV/2026/05/0631", customerName: "Budi Santoso", serviceType: "Mega 50Mbps", periodMonth: 5, periodYear: 2026, amount: 350000, status: "PAID", dueDate: "2026-05-10", createdAt: "2026-05-01" },
  { id: "50000000-0000-4000-8000-000000000002", noFaktur: "FTR-2026-05030", noInvoice: "INV/2026/05/0630", customerName: "Siti Rahmawati", serviceType: "Ultra 100Mbps", periodMonth: 5, periodYear: 2026, amount: 450000, status: "UNPAID", dueDate: "2026-05-10", createdAt: "2026-05-01" },
  { id: "50000000-0000-4000-8000-000000000003", noFaktur: "FTR-2026-05029", noInvoice: "INV/2026/05/0629", customerName: "Ahmad Yani", serviceType: "Mega 20Mbps", periodMonth: 5, periodYear: 2026, amount: 250000, status: "OVERDUE", dueDate: "2026-04-28", createdAt: "2026-04-29" },
];

export const payments = [
  { id: "60000000-0000-4000-8000-000000000001", referenceNo: "PAY-2026-05001", customerName: "Budi Santoso", invoiceNo: "INV/2026/05/0631", amount: 350000, method: "Transfer Bank", status: "verified", paidAt: "2026-05-01", notes: "Pembayaran Mei" },
  { id: "60000000-0000-4000-8000-000000000002", referenceNo: "PAY-2026-05002", customerName: "Siti Rahmawati", invoiceNo: "INV/2026/05/0630", amount: 450000, method: "Virtual Account", status: "pending", paidAt: "2026-05-02", notes: "Menunggu verifikasi" },
];

export const reports = [
  { id: "70000000-0000-4000-8000-000000000001", title: "Pendapatan Bulanan", category: "Keuangan", period: "Mei 2026", status: "published", generatedAt: "2026-05-01", notes: "Ringkasan revenue bulanan" },
  { id: "70000000-0000-4000-8000-000000000002", title: "Aging Tunggakan", category: "Invoice", period: "Mei 2026", status: "draft", generatedAt: "2026-05-02", notes: "Daftar invoice jatuh tempo" },
];

export const settings = [
  { id: "80000000-0000-4000-8000-000000000001", settingKey: "company_name", settingValue: "MyRingNet ISP", settingGroup: "general", status: "active" },
  { id: "80000000-0000-4000-8000-000000000002", settingKey: "api_base_url", settingValue: "http://localhost:3000/api", settingGroup: "system", status: "active" },
  { id: "80000000-0000-4000-8000-000000000003", settingKey: "timezone", settingValue: "Asia/Jakarta", settingGroup: "system", status: "active" },
];
