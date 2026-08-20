"use client";

import { PageHeader, ShimmerBlock } from "@/components/ui/AdminUI";
import { useAuthStore } from "@/hooks/useAuth";
import { MitraDashboardPage } from "@/components/pages/MitraPortalPages";
import { RadiusDashboard } from "@/components/pages/RadiusDashboard";

function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Radius"
        subtitle="Monitoring real-time server Radius, router NAS, sesi pengguna online, dan profil bandwidth."
      />
      <RadiusDashboard />
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return <div className="space-y-4"><ShimmerBlock className="h-24" /><ShimmerBlock className="h-80" /></div>;
  return user.role === "mitra" ? <MitraDashboardPage /> : <AdminDashboardPage />;
}
