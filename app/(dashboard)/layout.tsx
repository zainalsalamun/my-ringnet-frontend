"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import useAuth from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />
      <main className="px-5 py-6 lg:ml-[264px] lg:px-7">{children}</main>
    </div>
  );
}
