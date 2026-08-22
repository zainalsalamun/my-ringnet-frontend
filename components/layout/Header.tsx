"use client";

import { currency, date } from "@/lib/format";
import { AlertTriangle, Bell, CheckCheck, ChevronDown, Clock, Headphones, LogOut, Menu, ReceiptText, Search, Settings, UserCog, UserPlus, WalletCards, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { authApi } from "@/src/features/auth/api";
import { notificationsApi } from "@/src/features/notifications/api";

type NotificationItem = {
  id: string;
  type: string;
  severity: "danger" | "warning" | "success" | "info";
  title: string;
  message: string;
  amount?: number;
  href?: string;
  createdAt?: string;
  isRead: boolean;
  readAt?: string | null;
  detail?: Record<string, string | number | null | undefined>;
};

const severityStyles = {
  danger: "bg-rose-50 text-rose-600 ring-rose-100",
  warning: "bg-amber-50 text-amber-600 ring-amber-100",
  success: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  info: "bg-indigo-50 text-indigo-600 ring-indigo-100",
};

function NotificationIcon({ item }: { item: NotificationItem }) {
  const icon = item.type.includes("ticket") ? <Headphones size={17} /> : item.type.includes("partner") ? <UserPlus size={17} /> : item.type.includes("invoice") ? <ReceiptText size={17} /> : item.type === "payment" ? <WalletCards size={17} /> : <AlertTriangle size={17} />;
  return <div className={"grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 " + (severityStyles[item.severity] || severityStyles.info)}>{icon}</div>;
}


function formatDetailValue(key: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  if (key.toLowerCase().includes("amount")) return currency(value);
  if (key.toLowerCase().includes("date")) return date(String(value));
  return String(value);
}

function roleLabel(user?: any) {
  if (!user) return "Administrator";
  if (typeof user === "string") {
    const labels: Record<string, string> = {
      super_admin: "Super Administrator",
      superadmin: "Super Administrator",
      admin: "Administrator",
      finance: "Admin Finance",
      admin_finance: "Admin Finance",
      finance_admin: "Admin Finance",
      teknisi: "Teknisi",
      noc: "NOC Engineer",
      pelanggan: "Pelanggan",
      bisnis: "Bisnis",
      mitra: "Mitra Bisnis",
    };
    return labels[user] || (user ? user.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Administrator");
  }

  if (user.position) return user.position;
  if (user.division) {
    const div = String(user.division);
    return div.toLowerCase().startsWith("admin") ? div : `Admin ${div}`;
  }

  const role = String(user.role || "");
  const labels: Record<string, string> = {
    super_admin: "Super Administrator",
    superadmin: "Super Administrator",
    admin: "Administrator",
    finance: "Admin Finance",
    admin_finance: "Admin Finance",
    finance_admin: "Admin Finance",
    teknisi: "Teknisi",
    noc: "NOC Engineer",
    pelanggan: "Pelanggan",
    bisnis: "Bisnis",
    mitra: "Mitra Bisnis",
  };
  return labels[role] || (role ? role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Administrator");
}

function initials(name?: string) {
  const words = String(name || "Admin").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1 && words[0].length >= 2) return words[0].slice(0, 2).toUpperCase();
  return (words[0]?.[0] || "A").toUpperCase();
}

export default function Header({ setSidebarOpen }: { setSidebarOpen?: (val: boolean) => void }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [notificationError, setNotificationError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name || "Admin RingNet";
  const displayRole = roleLabel(user);
  const isMitraUser = user?.role === "mitra" || user?.role === "partner" || user?.role === "pic";

  useEffect(() => {
    if (!user) return;
    if (isMitraUser) return;
    
    // Safely attempt notifications fetch
    notificationsApi.list()
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setItems(data);
        setSelected(null);
        setNotificationError("");
      })
      .catch(() => {
        setItems([]);
        setSelected(null);
      });
  }, [user]);


  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  async function openNotification(item: NotificationItem) {
    const nextItem = { ...item, isRead: true, readAt: item.readAt || new Date().toISOString() };
    setSelected(nextItem);
    if (item.isRead) return;
    setItems((current) => current.map((entry) => entry.id === item.id ? nextItem : entry));
    setNotificationError("");
    try {
      await notificationsApi.markRead(item.id);
    } catch {
      setItems((current) => current.map((entry) => entry.id === item.id ? item : entry));
      setSelected(item);
      setNotificationError("Status baca gagal disimpan. Silakan coba kembali.");
    }
  }

  async function markAllRead() {
    const unreadItems = items.filter((item) => !item.isRead);
    if (!unreadItems.length) return;
    const previousItems = items;
    const now = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt || now })));
    setSelected((current) => current ? { ...current, isRead: true, readAt: current.readAt || now } : current);
    setNotificationError("");
    try {
      await notificationsApi.markAllRead(unreadItems.map((item) => item.id));
    } catch {
      setItems(previousItems);
      setSelected((current) => current ? previousItems.find((item) => item.id === current.id) || current : current);
      setNotificationError("Status baca semua notifikasi gagal disimpan.");
    }
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Keep local logout responsive even if the remote session is already gone.
    }
    logout();
    setProfileOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:ml-[264px] lg:px-7">
      <div className="flex flex-1 items-center gap-4">
        <button onClick={() => setSidebarOpen?.(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"><Menu size={20} /></button>
        <div className="relative hidden w-full max-w-xl md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" placeholder={user?.role === "mitra" ? "Cari pelanggan, tiket, atau invoice..." : "Cari pelanggan, invoice, layanan..."} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div ref={panelRef} className="relative">
          <button onClick={() => setOpen((current) => !current)} className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
            <Bell size={18} />
            {unreadCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(92vw,760px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-black text-slate-950">Notifikasi</h2>
                  <p className="text-xs text-slate-500">{unreadCount ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={markAllRead} disabled={!unreadCount} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"><CheckCheck size={15} /> {unreadCount ? "Tandai semua dibaca" : "Semua dibaca"}</button>
                  <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900"><X size={16} /></button>
                </div>
              </div>

              {notificationError ? <div className="border-b border-rose-100 bg-rose-50 px-5 py-2 text-xs font-semibold text-rose-700">{notificationError}</div> : null}

              <div className="grid max-h-[520px] md:grid-cols-[320px_1fr]">
                <div className="max-h-[520px] overflow-y-auto border-r border-slate-100 p-2">
                  {items.length ? items.map((item) => {
                    const active = selected?.id === item.id;
                    const unread = !item.isRead;
                    return (
                      <button key={item.id} onClick={() => openNotification(item)} className={"flex w-full gap-3 rounded-xl p-3 text-left transition " + (active ? "bg-indigo-50" : unread ? "bg-slate-50/70 hover:bg-slate-100" : "hover:bg-slate-50")}>
                        <NotificationIcon item={item} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                            {unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" /> : null}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">{item.message}</p>
                          <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400"><Clock size={12} /> {date(item.createdAt)}</p>
                        </div>
                      </button>
                    );
                  }) : (
                    <div className="grid min-h-56 place-items-center px-6 text-center">
                      <div>
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"><Bell size={20} /></div>
                        <p className="mt-3 text-sm font-bold text-slate-900">Belum ada notifikasi</p>
                        <p className="mt-1 text-xs text-slate-500">Aktivitas penting akan muncul di sini.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden min-h-[360px] p-5 md:block">
                  {selected ? (
                    <div className="flex h-full flex-col">
                      <div className="flex items-start gap-3">
                        <NotificationIcon item={selected} />
                        <div>
                          <h3 className="text-base font-black text-slate-950">{selected.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{selected.message}</p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-slate-500">Status</span>
                          <span className={selected.isRead ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>{selected.isRead ? "Sudah dibaca" : "Belum dibaca"}</span>
                        </div>
                        {Object.entries(selected.detail || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-500">{key.replace(/([A-Z])/g, " $1")}</span>
                            <span className="text-right font-bold text-slate-900">{formatDetailValue(key, value)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-5">
                        {selected.href ? <Link href={selected.href} onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#6366F1] px-4 text-sm font-bold text-white shadow-sm shadow-indigo-200">Lihat Detail</Link> : null}
                      </div>
                    </div>
                  ) : (
                    <div className="grid h-full min-h-[320px] place-items-center text-center">
                      <div>
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-indigo-500"><Bell size={20} /></div>
                        <p className="mt-3 text-sm font-bold text-slate-900">Pilih notifikasi</p>
                        <p className="mt-1 text-xs text-slate-500">Notifikasi ditandai sudah dibaca setelah dipilih.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div ref={profileRef} className="relative border-l border-slate-200 pl-4">

          <button onClick={() => setProfileOpen((current) => !current)} className="flex items-center gap-3 rounded-xl px-1 py-1.5 text-left transition hover:bg-slate-50">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold uppercase text-white">{initials(displayName)}</div>
            <div className="hidden md:block">
              <p className="max-w-40 truncate text-sm font-bold leading-5 text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{displayRole}</p>
            </div>
            <ChevronDown className={"hidden text-slate-400 transition-transform md:block " + (profileOpen ? "rotate-180" : "")} size={16} />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-base font-black uppercase text-white">{initials(displayName)}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{displayName}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email || "Email belum tersedia"}</p>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online sebagai {displayRole}
                </div>
              </div>

              <div className="p-2">
                <Link href={isMitraUser ? "/mitra/profil" : "/users"} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><UserCog size={17} /></div>
                  User Management
                </Link>
                <Link href={isMitraUser ? "/mitra/profil" : "/pengaturan"} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><Settings size={17} /></div>
                  Pengaturan Akun
                </Link>
              </div>

              <div className="border-t border-slate-100 p-2">
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50"><LogOut size={17} /></div>
                  Keluar dari akun
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
