"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { BarChart3, BookOpenCheck, ChevronDown, CircleUserRound, FileCheck2, Headphones, Network, PackageCheck, ReceiptText, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

type MenuGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  items: MenuItem[];
};

const itemIsActive = (item: MenuItem, pathname: string) => item.href === pathname || item.children?.some((child) => child.href === pathname) === true;

const menuGroups: MenuGroup[] = [
  {
    key: "terms",
    label: "Syarat dan Ketentuan",
    icon: BookOpenCheck,
    items: [
      { label: "Komdigi", href: "/mitra/syarat-komdigi" },
      { label: "Operasional Mitra", href: "/mitra/syarat-operasional" },
    ],
  },
  {
    key: "documents",
    label: "Dokumen Persyaratan",
    icon: FileCheck2,
    items: [
      { label: "Data PIC Mitra", href: "/mitra/pic" },
      { label: "Data Registrasi Mitra", href: "/mitra/registrasi" },
      { label: "Data KTP", href: "/mitra/ktp" },
      { label: "Data NPWP", href: "/mitra/npwp" },
      { label: "Data NIB", href: "/mitra/nib" },
      { label: "Data Sertifikat Standar", href: "/mitra/sertifikat" },
      { label: "Data PKS Jasa Jual Kembali", href: "/mitra/pks" },
    ],
  },
  { key: "support-documents", label: "Dokumen Perizinan dan Kerjasama", icon: FileCheck2, href: "/mitra/dokumen-pendukung", items: [] },
  {
    key: "tickets",
    label: "Tiketing",
    icon: Headphones,
    items: [
      { label: "Tiket Pelanggan", href: "/mitra/tiket" },
      { label: "CS Online ke Admin", href: "/mitra/cs-online" },
      { label: "Gangguan ke Admin", href: "/mitra/tiket-gangguan" },
      { label: "PO Layanan ke Admin", href: "/mitra/tiket-layanan" },
    ],
  },
  {
    key: "technical",
    label: "Data Teknis",
    icon: Network,
    items: [
      { label: "Perangkat Aktif", children: [
        { label: "Router (RO)", href: "/mitra/router" },
        { label: "Switch", href: "/mitra/switch" },
        { label: "CPE / User", href: "/mitra/cpe" },
      ] },
      { label: "Perangkat Logic", children: [
        { label: "GenieACS Management", href: "/mitra/genieacs" },
        { label: "Cacti / MRTG", href: "/mitra/monitoring" },
        { label: "SLA Pelanggan", href: "/mitra/sla" },
      ] },
      { label: "Perangkat Pasif", children: [
        { label: "OTB", href: "/mitra/otb" },
        { label: "ODC", href: "/mitra/odc" },
        { label: "ODP", href: "/mitra/odp" },
        { label: "Tiang", href: "/mitra/tiang" },
        { label: "Kabel", href: "/mitra/kabel" },
      ] },
      { label: "Map Infrastruktur", href: "/mitra/infrastruktur" },
    ],
  },
  {
    key: "finance",
    label: "Pencatatan & Pembukuan",
    icon: ReceiptText,
    items: [
      { label: "Produk", href: "/mitra/produk" },
      { label: "Data Customer", href: "/mitra/pelanggan" },
      { label: "Pencatatan Pendapatan Billing", href: "/mitra/pendapatan-billing" },
      { label: "Kelola Tagihan Pelanggan", href: "/mitra/kelola-tagihan" },
      { label: "BA Pelaporan Pendapatan", href: "/mitra/berita-acara" },
    ],
  },
  {
    key: "operational",
    label: "Operasional",
    icon: PackageCheck,
    items: [
      { label: "Produk", href: "/mitra/operasional-produk" },
      { label: "Presales", href: "/mitra/presales" },
      { label: "Evaluasi Penjualan", href: "/mitra/evaluasi" },
    ],
  },
  {
    key: "account",
    label: "Akun",
    icon: Settings2,
    items: [
      { label: "Pengaturan Profil", href: "/mitra/settings" },
      { label: "Profile", href: "/mitra/profil" },
    ],
  },
];

export default function MitraSidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen?: boolean; setSidebarOpen?: (value: boolean) => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(menuGroups.map((group) => [group.key, group.items.some((item) => itemIsActive(item, pathname))])));

  useEffect(() => setSidebarOpen?.(false), [pathname, setSidebarOpen]);

  return (
    <>
      {sidebarOpen ? <button aria-label="Tutup menu" className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen?.(false)} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col bg-[#0F172A] text-slate-300 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-5 pb-5 pt-6">
          <div className="relative h-12 w-16 overflow-hidden rounded-xl border border-white/10 bg-white">
            <Image src="/assets/logo-sidebar.png" alt="MyRingNet" fill priority sizes="64px" className="object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">My<span className="text-indigo-400">Ring</span>Net</h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Portal Mitra</p>
          </div>
        </div>

        <div className="px-4">
          <Link href="/dashboard" className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold ${pathname === "/dashboard" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <BarChart3 size={18} /> Dashboard
          </Link>
        </div>

        <div className="mt-6 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Menu Mitra</div>
        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {menuGroups.map((group) => {
            const Icon = group.icon;
            const active = group.href === pathname || group.items.some((item) => itemIsActive(item, pathname));
            const open = openGroups[group.key];
            if (group.href) {
              return <Link key={group.key} href={group.href} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{group.label}</Link>;
            }
            return (
              <div key={group.key} className={open ? "rounded-xl bg-white/5" : ""}>
                <button type="button" onClick={() => setOpenGroups((current) => ({ ...current, [group.key]: !open }))} className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition ${active ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                  <span className="flex items-center gap-3"><Icon size={18} /> {group.label}</span>
                  <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? (
                  <div className="pb-3 pl-[50px] pr-3 pt-1">
                    <div className="space-y-1 border-l border-white/10 pl-3">
                      {group.items.map((item) => item.href ? <Link key={`${group.key}-${item.label}`} href={item.href} className={`block rounded-lg px-3 py-2 text-xs font-medium leading-5 transition ${pathname === item.href ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}`}>{item.label}</Link> : (
                        <div key={`${group.key}-${item.label}`} className="pb-1 pt-2 first:pt-0">
                          <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600">{item.label}</p>
                          {item.children?.map((child) => <Link key={child.href} href={child.href} className={`block rounded-lg px-3 py-1.5 text-xs font-medium leading-5 transition ${pathname === child.href ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}`}>{child.label}</Link>)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white"><CircleUserRound size={18} /><span className="truncate text-sm font-bold">{user?.name || "Mitra RingNet"}</span></div>
            <p className="mt-1 text-xs text-slate-500">Reseller / Mitra Aktif</p>
          </div>
        </div>
      </aside>
    </>
  );
}
