"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { BarChart3, ChevronDown, Settings, UserRoundCog, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import MitraSidebar, { getMitraMenuGroups } from "@/components/layout/MitraSidebar";

type SidebarItem = {
  label: string;
  href?: string;
  children?: SidebarItem[];
};

const userChildren: SidebarItem[] = [
  { label: "User Management", href: "/users" },
  { label: "Pelanggan", href: "/users/pelanggan" },
  { label: "Pelanggan Bisnis", href: "/users/bisnis" },
];




const settingChildren = [
  { label: "Pengaturan Umum", href: "/pengaturan" },
  { label: "Profil Perusahaan", href: "/pengaturan/profil-perusahaan" },
  { label: "Paket Layanan", href: "/pengaturan/paket-layanan" },
  { label: "Metode Pembayaran", href: "/pengaturan/metode-pembayaran" },
  { label: "Kategori Dokumen", href: "/pengaturan/kategori-dokumen" },
];

const financeChildren = [
  { label: "Keuangan", href: "/keuangan" },
  { label: "Faktur & Tagihan", href: "/internet-services" },
];

const superAdminMenuGroups = getMitraMenuGroups([], true).filter((group) =>
  ["documents", "technical", "finance"].includes(group.key),
);


function isItemActive(item: SidebarItem, pathname: string): boolean {
  if (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) return true;
  return item.children?.some((child) => isItemActive(child, pathname)) ?? false;
}

function SidebarSubItem({ item, pathname }: { item: SidebarItem; pathname: string }) {
  const isChildActive = item.children?.some((child) => isItemActive(child, pathname)) ?? false;
  const [open, setOpen] = useState<boolean>(isChildActive);

  useEffect(() => {
    if (!isChildActive) return;
    const timer = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [isChildActive]);

  if (item.href) {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
        className={`block rounded-lg px-3 py-2 text-xs font-medium leading-5 transition ${
          active ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        }`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="py-0.5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs font-semibold transition ${
          isChildActive ? "text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        }`}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180 text-indigo-400" : ""}`}
        />
      </button>
      {open ? (
        <div className="my-1 ml-2 space-y-0.5 border-l border-white/10 pl-2.5">
          {item.children?.map((child) => {
            if (!child.href) return <SidebarSubItem key={child.label} item={child} pathname={pathname} />;
            const active = isItemActive(child, pathname);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`block rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  active ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen?: boolean; setSidebarOpen?: (val: boolean) => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const userMenuActive = pathname === "/users" || pathname.startsWith("/users/");
  const financeMenuActive = pathname === "/keuangan" || pathname.startsWith("/keuangan/") || pathname === "/internet-services" || pathname.startsWith("/internet-services/");
  const settingMenuActive = pathname === "/pengaturan" || pathname.startsWith("/pengaturan/");
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(userMenuActive);
  const [financeMenuOpen, setFinanceMenuOpen] = useState<boolean>(financeMenuActive);
  const [settingMenuOpen, setSettingMenuOpen] = useState<boolean>(settingMenuActive);
  const [mitraOpenGroups, setMitraOpenGroups] = useState<Record<string, boolean>>({});
  const visibleUserChildren = userChildren.filter((item) => !(user?.role === "super_admin" && item.href === "/users/mitra"));

  useEffect(() => {
    setSidebarOpen?.(false);
  }, [pathname, setSidebarOpen]);

  if (user?.role === "mitra") return <MitraSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;

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
          <div className="min-w-0 flex-1">
            <h1 className="text-[23px] font-black leading-7 tracking-tight text-white">My<span className="text-indigo-400">Ring</span>Net</h1>
            <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium leading-4 text-slate-500">ISP Management System</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <Link href="/dashboard" className={"flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold " + (pathname === "/dashboard" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/30" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
          <BarChart3 size={18} /> Dashboard
        </Link>
      </div>

      <div className="mt-6 px-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">Menu Utama</div>
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
                {visibleUserChildren.map((item) => {
                  if (!item.href) return null;
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

        <div className={financeMenuOpen ? "rounded-xl bg-white/5" : ""}>
          <button
            type="button"
            onClick={() => setFinanceMenuOpen((open) => !open)}
            className={"flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold transition " + (financeMenuActive ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}
          >
            <span className="flex items-center gap-3">
              <Wallet size={18} />
              Keuangan
            </span>
            <ChevronDown size={17} className={"transition-transform " + (financeMenuOpen ? "rotate-180 text-slate-300" : "text-slate-500")} />
          </button>
          {financeMenuOpen ? (
            <div className="pb-3 pl-[50px] pr-3 pt-1">
              <div className="space-y-1 border-l border-white/10 pl-4">
                {financeChildren.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
        {/* Data Teknis, Legal, & Pembukuan */}
        {superAdminMenuGroups.map((group) => {
          const Icon = group.icon;
          const active = group.href === pathname || group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/") || item.children?.some(c => pathname === c.href));
          const open = mitraOpenGroups[group.key] ?? active;
          if (group.href) {
            return <Link key={`mitra-${group.key}`} href={group.href} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={18} />{group.label}</Link>;
          }
          return (
            <div key={`mitra-${group.key}`} className={open ? "rounded-xl bg-white/5" : ""}>
              <button type="button" onClick={() => setMitraOpenGroups((current) => ({ ...current, [group.key]: !open }))} className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition ${active ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <span className="flex items-center gap-3"><Icon size={18} /> {group.label}</span>
                <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open ? (
                <div className="pb-3 pl-[50px] pr-3 pt-1">
                  <div className="space-y-1 border-l border-white/10 pl-3">
                    {group.items.map((item) => (
                      <SidebarSubItem key={`mitra-${group.key}-${item.label}`} item={item} pathname={pathname} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

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
            <span className="text-sm font-bold text-white">RingNet ISP</span>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Aktif</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Administrator</p>
        </div>
      </div>
    </aside>


    </>
  );
}
