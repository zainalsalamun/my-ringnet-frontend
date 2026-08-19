"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { currency, date } from "@/lib/format";
import { Card, PageHeader, ShimmerBlock, StatCard } from "@/components/ui/AdminUI";
import InfrastructureMap from "@/components/ui/InfrastructureMap";
import { formatErrorMessage } from "@/lib/error";
import { mitraPortalService } from "@/services";
import {
  ArrowRight,
  Banknote,
  Cable,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FilePenLine,
  FileText,
  Handshake,
  Headphones,
  Landmark,
  PackageCheck,
  Percent,
  RadioTower,
  ReceiptText,
  Router,
  Server,
  Ticket,
  TicketCheck,
  Timer,
  UserRoundCheck,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9", "#8b5cf6"];

const tileThemes: Record<string, string> = {
  slate: "from-slate-600 to-slate-800",
  sky: "from-sky-500 to-sky-600",
  emerald: "from-emerald-500 to-emerald-600",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-red-600",
  violet: "from-violet-500 to-purple-600",
  indigo: "from-indigo-500 to-indigo-700",
};

function DashboardTile({
  label,
  value,
  icon,
  theme = "sky",
  href,
  action = "Lihat Detail",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  theme?: string;
  href?: string;
  action?: string;
}) {
  const content = (
    <div className={`group flex min-h-40 flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${tileThemes[theme] || tileThemes.sky} text-white shadow-lg shadow-slate-200`}>
      <div className="flex flex-1 items-start justify-between gap-4 p-5">
        <div>
          <p className="text-2xl font-black tracking-tight">{value}</p>
          <p className="mt-2 text-sm font-black uppercase tracking-wide text-white/90">{label}</p>
        </div>
        <span className="text-white/30 transition group-hover:text-white/50">{icon}</span>
      </div>
      {href ? (
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/10 px-5 py-3 text-xs font-bold">
          <span>{action}</span>
          <ArrowRight size={16} />
        </div>
      ) : null}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function DashboardSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 mt-10 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-600">
      <span className="h-5 w-1 rounded-full bg-indigo-600" />
      {children}
    </h2>
  );
}

function WibClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const label = useMemo(() => {
    if (!now) return "Memuat waktu WIB...";
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .formatToParts(now)
        .map((part) => [part.type, part.value])
    );
    const weekday = parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1);
    return `${weekday}, ${parts.day} ${parts.month} ${parts.year} | ${parts.hour}:${parts.minute}:${parts.second} WIB`;
  }, [now]);

  return (
    <div className="flex items-center gap-2.5 self-start whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 shadow-sm sm:self-auto">
      <Clock3 size={22} className="shrink-0 text-indigo-600" />
      <time className="text-sm font-black tabular-nums xl:text-base">{label}</time>
    </div>
  );
}

export function MitraDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    mitraPortalService
      .getSummary()
      .then((res) => setData(res))
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat dashboard mitra.")));
  }, []);

  if (!data && !error) {
    return (
      <div className="space-y-5">
        <ShimmerBlock className="h-24" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerBlock key={i} className="h-28" />
          ))}
        </div>
        <ShimmerBlock className="h-80" />
      </div>
    );
  }

  const profile = data?.profile || {};
  const finance = data?.finance || {};
  const tickets = data?.ticketStats || {};
  const remaining = data?.agreementRemainingDays;

  return (
    <div>
      <PageHeader
        title="Dashboard Mitra"
        subtitle={`Selamat datang, ${profile.name || "Mitra"}. Ringkasan operasional dan bisnis Anda.`}
        rightContent={<WibClock />}
      />
      {error ? <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
      {remaining !== null && remaining !== undefined ? (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            remaining < 60 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-indigo-100 bg-indigo-50 text-indigo-800"
          }`}
        >
          <strong>Masa berlaku PKS:</strong> sampai {date(profile.agreementEnd)} ({remaining > 0 ? `${remaining} hari lagi` : "sudah berakhir"}).
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users size={22} />} label="Jumlah Customer" value={String(data?.totals?.customers || 0)} trend={`${data?.totals?.activeCustomers || 0} aktif`} />
        <StatCard icon={<CircleDollarSign size={22} />} label="Pendapatan Kotor" value={currency(finance.grossRevenue)} trend={`${finance.paidInvoiceCount || 0} invoice lunas`} accent="emerald" />
        <StatCard icon={<ReceiptText size={22} />} label="Sharing Profit" value={currency(finance.sharingProfit)} trend={`${finance.profitSharePercent || 0}% bagi hasil`} accent="amber" />
        <StatCard icon={<Headphones size={22} />} label="Total Tiket" value={String(data?.totals?.tickets || 0)} trend={`${tickets.open || 0} tiket terbuka`} accent="rose" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Tren Penjualan Tahunan</h2>
          <p className="text-sm text-slate-500">Pendapatan invoice lunas dalam 12 bulan terakhir.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={data?.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(Number(v) / 1000000)}jt`} />
                <Tooltip formatter={(v) => currency(String(v))} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Proporsi Paket</h2>
          <p className="text-sm text-slate-500">Distribusi paket pelanggan aktif.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={data?.packageDistribution || []} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>
                  {(data?.packageDistribution || []).map((_: any, i: number) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {(data?.packageDistribution || []).map((item: any, i: number) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  {item.name}
                </span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <DashboardSectionTitle>Pencatatan dan Pembukuan Mitra</DashboardSectionTitle>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DashboardTile label="Berita Acara Rekonsiliasi" value="BERITA ACARA" icon={<FilePenLine size={44} />} theme="slate" href="/mitra/berita-acara" action="Cetak / Lihat BA" />
        <DashboardTile label="Jumlah Customer" value={String(data?.totals?.customers || 0)} icon={<Users size={44} />} href="/mitra/pelanggan" />
        <DashboardTile label="Pendapatan Kotor" value={currency(finance.grossRevenue)} icon={<Banknote size={44} />} theme="emerald" href="/mitra/pendapatan-billing" action="Lihat Rincian" />
        <DashboardTile label="DPP" value={currency(finance.dpp)} icon={<Landmark size={44} />} />
        <DashboardTile label="PPN (11%)" value={currency(finance.vat)} icon={<Percent size={44} />} theme="amber" />
        <DashboardTile label={`BHP USO (${finance.bhpUsoPercent || 0}%)`} value={currency(finance.bhpUso)} icon={<RadioTower size={44} />} theme="rose" />
        <DashboardTile label={`KSO (${finance.ksoPercent || 0}%)`} value={currency(finance.kso)} icon={<Handshake size={44} />} theme="violet" />
        <DashboardTile label="Biaya Supply Bandwidth" value={currency(finance.bandwidthFee)} icon={<ReceiptText size={44} />} theme="indigo" />
        <DashboardTile label="Sharing Profit" value={currency(finance.sharingProfit)} icon={<Handshake size={44} />} theme="violet" href="/mitra/berita-acara" action="Lihat Rekonsiliasi" />
        <DashboardTile label="PPH (2.5%)" value={currency(finance.withholdingTax)} icon={<ReceiptText size={44} />} theme="rose" />
      </div>

      <DashboardSectionTitle>Tiketing</DashboardSectionTitle>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DashboardTile label="Total Tiket" value={String(data?.totals?.tickets || 0)} icon={<Ticket size={44} />} theme="slate" href="/mitra/tiket" />
        <DashboardTile label="Tiket Open" value={String(tickets.open || 0)} icon={<FileText size={44} />} theme="rose" href="/mitra/tiket" />
        <DashboardTile label="Tiket Pending" value={String(tickets.pending || 0)} icon={<Timer size={44} />} theme="amber" href="/mitra/tiket" />
        <DashboardTile label="Dalam Penanganan" value={String(tickets.progress || 0)} icon={<Wrench size={44} />} href="/mitra/tiket" />
        <DashboardTile label="Tiket Closed" value={String(tickets.closed || 0)} icon={<TicketCheck size={44} />} theme="emerald" href="/mitra/tiket" />
        <DashboardTile label="Tiket Layanan" value={String(tickets.service || 0)} icon={<Headphones size={44} />} theme="slate" href="/mitra/tiket-layanan" />
      </div>

      <DashboardSectionTitle>Data Teknis</DashboardSectionTitle>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <DashboardTile label="OLT" value={String(data?.assetCounts?.olt || data?.assetCounts?.cpe || 0)} icon={<Server size={44} />} theme="emerald" href="/mitra/olt" />
        <DashboardTile label="Router (RO)" value={String(data?.assetCounts?.router || 0)} icon={<Router size={44} />} href="/mitra/router" />
        <DashboardTile label="Switch" value={String(data?.assetCounts?.switch || 0)} icon={<Server size={44} />} href="/mitra/switch" />
        <DashboardTile label="SLA Pelanggan" value="SLA" icon={<UserRoundCheck size={44} />} theme="slate" href="/mitra/sla" />
      </div>
      <p className="mb-3 mt-7 text-xs font-black uppercase tracking-widest text-indigo-600">Perangkat Pasif</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardTile label="OTB" value={String(data?.assetCounts?.otb || 0)} icon={<PackageCheck size={44} />} theme="amber" href="/mitra/otb" />
        <DashboardTile label="ODC" value={String(data?.assetCounts?.odc || 0)} icon={<Server size={44} />} theme="rose" href="/mitra/odc" />
        <DashboardTile label="ODP" value={String(data?.assetCounts?.odp || 0)} icon={<ClipboardCheck size={44} />} theme="violet" href="/mitra/odp" />
        <DashboardTile label="Kabel" value={String(data?.assetCounts?.cable || 0)} icon={<Cable size={44} />} theme="slate" href="/mitra/kabel" />
      </div>

      <DashboardSectionTitle>Mapping Infrastruktur FTTH</DashboardSectionTitle>
      <InfrastructureMap points={data?.infrastructurePoints || []} />

      <Card className="mt-6 border-l-4 border-l-indigo-600 bg-indigo-50 p-5">
        <h2 className="font-black text-indigo-950">Butuh Bantuan?</h2>
        <p className="mt-2 text-sm leading-6 text-indigo-800">Hubungi tim support MyRingNet untuk bantuan operasional, teknis, atau administrasi.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white">
            WhatsApp: {data?.support?.support_phone || data?.support?.company_phone || "Hubungi administrator"}
          </span>
          <span className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white">
            Email: {data?.support?.support_email || data?.support?.company_email || "Hubungi administrator"}
          </span>
        </div>
      </Card>
    </div>
  );
}
export default MitraDashboardPage;
