"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { BarChart3, ChevronDown, CircleUserRound, FileCheck2, Headphones, Network, Settings2 } from "lucide-react";
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

export const getMitraMenuGroups = (isAdmin: boolean = false): MenuGroup[] => [
  {
    key: "documents",
    label: "Legal",
    icon: FileCheck2,
    items: isAdmin ? [
      { label: "Data POP", href: "/users/pop" }
    ] : [],
  },
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
      {
        label: "Perangkat Aktif",
        children: [
          { label: "OLT", href: "/mitra/olt" },
          { label: "Router", href: "/mitra/router" },
          { label: "Switch", href: "/mitra/switch" },
        ],
      },
      {
        label: "Perangkat Pasif",
        children: [
          { label: "OTB", href: "/mitra/otb" },
          { label: "ODC", href: "/mitra/odc" },
          { label: "ODP", href: "/mitra/odp" },
          { label: "Kabel", href: "/mitra/kabel" },
        ],
      },
      {
        label: "Map Infrastruktur",
        href: "/mitra/infrastruktur",
      },
      {
        label: "Radius",
        children: [
          { label: "NAS/Router", href: "/radius/nas-router" },
          { label: "Autentikasi", href: "/radius/autentikasi" },
          { label: "Grup Profil", href: "/radius/grup-profil" },
          { label: "Sesi Pengguna", href: "/radius/sesi-pengguna" },
          { label: "Riwayat", href: "/radius/riwayat" },
        ],
      },
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


function MitraSubItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  const isChildActive = item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + "/")) ?? false;
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
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
            const active = pathname === child.href || pathname.startsWith(child.href + "/");
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

export default function MitraSidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen?: boolean; setSidebarOpen?: (value: boolean) => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const menuGroups = useMemo(() => getMitraMenuGroups(false), []);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(menuGroups.map((group) => [group.key, group.items.some((item) => itemIsActive(item, pathname))])));

  useEffect(() => {
    setOpenGroups((prev) => ({
      ...prev,
      ...Object.fromEntries(menuGroups.map((group) => [group.key, prev[group.key] || group.items.some((item) => itemIsActive(item, pathname))]))
    }));
  }, [menuGroups, pathname]);

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
                      {group.items.map((item) => (
                        <MitraSubItem key={`${group.key}-${item.label}`} item={item} pathname={pathname} />
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
