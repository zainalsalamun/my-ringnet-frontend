"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronDown, FileStack, FileText, Globe2, Megaphone, Settings, UserRoundCog, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

const groups = [
  { label: "Marketing Leads", href: "/marketing/leads", icon: Megaphone },
  { label: "List Tagihan", href: "/internet-services", icon: Globe2 },
  { label: "Keuangan", href: "/keuangan", icon: Wallet },
  { label: "Laporan", href: "/laporan", icon: FileText },
];

const userChildren = [
  { label: "User Management", href: "/users" },
  { label: "Pelanggan", href: "/users/pelanggan" },
  { label: "Bisnis / Perusahaan", href: "/users/bisnis" },
  { label: "Mitra Bisnis", href: "/users/mitra" },
];

const settingChildren = [
  { label: "Pengaturan Umum", href: "/pengaturan" },
  { label: "Profil Perusahaan", href: "/pengaturan/profil-perusahaan" },
  { label: "Paket Layanan", href: "/pengaturan/paket-layanan" },
  { label: "Metode Pembayaran", href: "/pengaturan/metode-pembayaran" },
  { label: "Kategori Dokumen", href: "/pengaturan/kategori-dokumen" },
];



export default function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen?: boolean; setSidebarOpen?: (val: boolean) => void }) {
  const pathname = usePathname();
  const userMenuActive = pathname === "/users" || pathname.startsWith("/users/");
  const settingMenuActive = pathname === "/pengaturan" || pathname.startsWith("/pengaturan/");
  const documentMenuActive = pathname.startsWith("/dokumen");
  const [userMenuOpen, setUserMenuOpen] = useState(userMenuActive);
  const [settingMenuOpen, setSettingMenuOpen] = useState(settingMenuActive);

  useEffect(() => {
    setSidebarOpen?.(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {sidebarOpen ? (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen?.(false)} 
        />
      ) : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col bg-[#0F172A] text-slate-300 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white p-1.5 shadow-md shadow-black/20">
            <div className="relative h-11 w-16 overflow-hidden rounded-lg bg-white">
              <Image
                src="/assets/logo-sidebar.png"
                alt="RingNet Internet Service Provider"
                fill
                priority
                sizes="64px"
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-[23px] font-black leading-7 tracking-tight text-white">My<span className="text-indigo-400">Ring</span>Net</h1>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">ISP Management System</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30">
          <BarChart3 size={18} /> Dashboard
        </Link>
      </div>

      <div className="mt-6 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Aplikasi</div>
      <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-4 pb-6">
        <div className={userMenuOpen ? "rounded-xl bg-white/5" : ""}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            className={"flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold transition " + (userMenuActive ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}
          >
            <span className="flex items-center gap-3">
              <UserRoundCog size={18} />
              Pengguna
            </span>
            <ChevronDown size={17} className={"transition-transform " + (userMenuOpen ? "rotate-180 text-slate-300" : "text-slate-500")} />
          </button>
          {userMenuOpen ? (
            <div className="pb-3 pl-[50px] pr-3 pt-1">
              <div className="space-y-1 border-l border-white/10 pl-4">
                {userChildren.map((item) => {
                  const active = item.href === "/users" ? pathname === "/users" : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={"block rounded-lg px-3 py-2 text-sm font-medium transition " + (active ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-200")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        {groups.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={"flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition " + (active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
              <Icon size={17} /> {item.label}
            </Link>
          );
        })}
        <Link href="/dokumen/legalitas" className={"flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition " + (documentMenuActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
          <FileStack size={17} /> Dokumen
        </Link>
        <div className={settingMenuOpen ? "rounded-xl bg-white/5" : ""}>
          <button
            type="button"
            onClick={() => setSettingMenuOpen((open) => !open)}
            className={"flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold transition " + (settingMenuActive ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}
          >
            <span className="flex items-center gap-3">
              <Settings size={18} />
              Pengaturan
            </span>
            <ChevronDown size={17} className={"transition-transform " + (settingMenuOpen ? "rotate-180 text-slate-300" : "text-slate-500")} />
          </button>
          {settingMenuOpen ? (
            <div className="pb-3 pl-[50px] pr-3 pt-1">
              <div className="space-y-1 border-l border-white/10 pl-4">
                {settingChildren.map((item) => {
                  const active = item.href === "/pengaturan" ? pathname === "/pengaturan" : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={"block rounded-lg px-3 py-2 text-sm font-medium transition " + (active ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-200")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </nav>

      <div className="p-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">RingNet ISP</span>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Aktif</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Administrator</p>
          <p className="mt-3 text-[11px] leading-5 text-slate-500">Lisensi berlaku hingga<br />31 Desember 2026</p>
        </div>
      </div>
    </aside>
    </>
  );
}
