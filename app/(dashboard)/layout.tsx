"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import useAuth from "@/hooks/useAuth";

import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Header setSidebarOpen={setSidebarOpen} />
      <main className="px-5 py-6 lg:ml-[264px] lg:px-7">{children}</main>
    </div>
  );
}
