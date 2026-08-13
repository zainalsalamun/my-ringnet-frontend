"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MitraAiChat from "@/components/ui/MitraAiChat";
import useAuth, { useAuthStore } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminRestricted = pathname.startsWith("/radius")
    || pathname === "/users/pop"
    || pathname.startsWith("/users/pop/")
    || pathname === "/laporan"
    || pathname.startsWith("/laporan/")
    || pathname === "/users/new";
  const mitraRestricted = user?.role === "mitra" && pathname !== "/dashboard" && !pathname.startsWith("/mitra/");

  useEffect(() => {
    if (user?.role === "admin" && adminRestricted) {
      router.replace("/dashboard");
    }
    if (mitraRestricted) router.replace("/dashboard");
  }, [adminRestricted, mitraRestricted, router, user?.role]);

  if (!hydrated) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" /><p className="mt-4 text-sm font-bold text-slate-500">Memuat portal MyRingNet...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Header setSidebarOpen={setSidebarOpen} />
      <main className="px-5 py-6 lg:ml-[264px] lg:px-7">{(user?.role === "admin" && adminRestricted) || mitraRestricted ? null : children}</main>
      {["mitra", "admin", "super_admin", "superadmin"].includes(user?.role || "") ? <MitraAiChat /> : null}
    </div>
  );
}
