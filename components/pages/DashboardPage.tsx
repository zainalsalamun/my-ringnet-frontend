"use client";

import { ShimmerBlock } from "@/components/ui/AdminUI";
import { useAuthStore } from "@/hooks/useAuth";
import { MitraDashboardPage } from "@/components/pages/MitraPortalPages";
import { RadiusDashboard } from "@/components/pages/RadiusDashboard";

function AdminDashboardPage() {
  return <RadiusDashboard />;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return <div className="space-y-4"><ShimmerBlock className="h-24" /><ShimmerBlock className="h-80" /></div>;
  const isMitra = user.role === "mitra" || user.role === "partner" || user.role === "pic";
  return isMitra ? <MitraDashboardPage /> : <AdminDashboardPage />;
}
