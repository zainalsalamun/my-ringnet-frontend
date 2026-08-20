import { RadiusDashboard } from "@/components/pages/RadiusDashboard";
import { PageHeader } from "@/components/ui/AdminUI";

export default function DashboardsRadiusPage() {
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
