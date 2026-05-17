"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import useAuth, { useAuthStore } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminRestricted = pathname.startsWith("/radius") || pathname === "/users/pop" || pathname.startsWith("/users/pop/");

  useEffect(() => {
    if (user?.role === "admin" && adminRestricted) {
      router.replace("/dashboard");
    }
  }, [adminRestricted, router, user?.role]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Header setSidebarOpen={setSidebarOpen} />
      <main className="px-5 py-6 lg:ml-[264px] lg:px-7">{user?.role === "admin" && adminRestricted ? null : children}</main>
    </div>
  );
}
