import { ROUTES } from "./routes";

export type SidebarItemConfig = {
  label: string;
  href: string;
  dividerAfter?: boolean;
};

export const USER_MENU_ITEMS: SidebarItemConfig[] = [
  { label: "Pelanggan", href: ROUTES.users.customer },
  { label: "Pelanggan Bisnis", href: ROUTES.users.business, dividerAfter: true },
  { label: "Administrator", href: ROUTES.users.admin },
  { label: "Karyawan", href: ROUTES.users.employee },
  { label: "Hak Akses", href: ROUTES.users.privilege },
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

export const SUPER_ADMIN_MITRA_GROUP_KEYS = ["documents", "technical"] as const;

