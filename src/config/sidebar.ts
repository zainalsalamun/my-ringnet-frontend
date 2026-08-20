import { ROUTES } from "./routes";

export type SidebarItemConfig = {
  label: string;
  href: string;
};

export const USER_MENU_ITEMS: SidebarItemConfig[] = [
  { label: "Privilege", href: ROUTES.users.privilege },
  { label: "Employee", href: ROUTES.users.employee },
  { label: "Admin", href: ROUTES.users.admin },
  { label: "Pelanggan", href: ROUTES.users.customer },
  { label: "Pelanggan Bisnis", href: ROUTES.users.business },
];

export const FINANCE_MENU_ITEMS: SidebarItemConfig[] = [
  { label: "Keuangan", href: ROUTES.finance.root },
  { label: "Faktur & Tagihan", href: ROUTES.finance.invoices },
];

export const SETTINGS_MENU_ITEMS: SidebarItemConfig[] = [
  { label: "Pengaturan Umum", href: ROUTES.settings.root },
  { label: "Profil Perusahaan", href: ROUTES.settings.companyProfile },
  { label: "Paket Layanan", href: ROUTES.settings.servicePackages },
  { label: "Metode Pembayaran", href: ROUTES.settings.paymentMethods },
  { label: "Kategori Dokumen", href: ROUTES.settings.documentCategories },
];

export const SUPER_ADMIN_MITRA_GROUP_KEYS = ["documents", "technical", "finance"] as const;

