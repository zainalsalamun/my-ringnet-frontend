"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge, Card, PageHeader, ShimmerBlock, StatCard } from "@/components/ui/AdminUI";
import { useAuthStore } from "@/hooks/useAuth";
import { currency } from "@/lib/format";
import { BarChart3, Radio, Receipt, TrendingUp, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { MitraDashboardPage } from "@/components/pages/MitraPortalPages";
import { dashboardApi } from "@/src/features/dashboard/api";
import { RadiusDashboard } from "@/components/pages/RadiusDashboard";

const emptySummary = {
  totalPelanggan: 0,
  totalBisnis: 0,
  totalAdmin: 0,
  totalPop: 0,
  pelangganAktif: 0,
  totalInvoice: 0,
  pendapatan: 0,
  tunggakan: 0,
  popularPackages: [] as { name: string; value: number }[],
  recentActivities: [] as any[],
};

function payloadRows(payload: any): any[] {
  const data = payload?.data;
  if (Array.isArray(data?.markers)) return data.markers;
  if (Array.isArray(data?.features)) return data.features;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload?.markers)) return payload.markers;
  if (Array.isArray(payload?.features)) return payload.features;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
}

function payloadTotal(payload: any, rows: any[]) {
  return Number(payload?.meta?.total || payload?.data?.total || payload?.data?.count || payload?.totalDocs || payload?.total || rows.length || 0);
}

function moneyValue(row: any) {
  return Number(row.amount || row.grandTotal || row.total || row.price || row.package_price || row.monthly_fee || 0) || 0;
}

function invoicePaid(row: any) {
  const status = String(row.status || row.paymentStatus || "").toLowerCase();
  return status.includes("paid") || status.includes("lunas") || status.includes("verified");
}

function invoiceOpen(row: any) {
  const status = String(row.status || row.paymentStatus || "").toLowerCase();
  return !invoicePaid(row) && !status.includes("cancel") && !status.includes("void");
}

function packageName(row: any) {
  return String(row.packageName || row.package_name || row.product || row.product_name || row.serviceType || "Belum ada paket");
}

function buildPopularPackages(customers: any[], partners: any[]) {
  const byPackage = new Map<string, number>();
  [...customers, ...partners].forEach((row) => {
    const name = packageName(row);
    if (!name || name === "-") return;
    byPackage.set(name, (byPackage.get(name) || 0) + 1);
  });
  return Array.from(byPackage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
}

function buildRecentActivities(customers: any[], invoices: any[], payments: any[]) {
  const invoiceItems = invoices.slice(0, 4).map((row) => ({
    id: `invoice-${row.id || row.noInvoice || row.noFaktur}`,
    noInvoice: row.noInvoice || row.noFaktur || "Invoice",
    customerName: row.customerName || row.customer?.name || row.name || "Tagihan pelanggan",
    amount: moneyValue(row),
    status: row.status || "invoice",
    createdAt: row.createdAt || row.created_at || row.updatedAt || row.updated_at,
  }));
  const paymentItems = payments.slice(0, 3).map((row) => ({
    id: `payment-${row.id || row.referenceNo || row.invoiceNo}`,
    noInvoice: row.referenceNo || row.invoiceNo || "Pembayaran",
    customerName: row.customerName || row.name || "Pembayaran masuk",
    amount: moneyValue(row),
    status: row.status || "payment",
    createdAt: row.paidAt || row.createdAt || row.created_at,
  }));
  const customerItems = customers.slice(0, 3).map((row) => ({
    id: `customer-${row.id || row.customer_id}`,
    noInvoice: row.customerCode || row.customer_id || "Pelanggan",
    customerName: row.name || row.username || "Pelanggan baru",
    amount: 0,
    status: row.status === false ? "nonactive" : "active",
    createdAt: row.createdAt || row.created_at,
  }));

  return [...paymentItems, ...invoiceItems, ...customerItems]
    .filter((item) => item.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
}

function AdminDashboardPage({ initialTab = "overview" }: { initialTab?: "overview" | "radius" }) {
  const [activeTab, setActiveTab] = useState<"overview" | "radius">(initialTab);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.getBootstrapData()
      .then((results) => {
        const [
          customersRes,
          partnersRes,
          adminsRes,
          popsRes,
          invoicesRes,
          paymentsRes,
        ] = results;

        const customerPayload = customersRes.status === "fulfilled" ? customersRes.value.data : null;
        const partnerPayload = partnersRes.status === "fulfilled" ? partnersRes.value.data : null;
        const adminPayload = adminsRes.status === "fulfilled" ? adminsRes.value.data : null;
        const popPayload = popsRes.status === "fulfilled" ? popsRes.value.data : null;
        const invoicePayload = invoicesRes.status === "fulfilled" ? invoicesRes.value.data : null;
        const paymentPayload = paymentsRes.status === "fulfilled" ? paymentsRes.value.data : null;

        const customers = payloadRows(customerPayload);
        const partners = payloadRows(partnerPayload);
        const admins = payloadRows(adminPayload);
        const pops = payloadRows(popPayload);
        const invoices = payloadRows(invoicePayload);
        const payments = payloadRows(paymentPayload);

        const paidPayments = payments.filter(invoicePaid);
        const pelangganAktif = customers.filter((row) => row.status === "active" || row.status === true).length;
        const pendapatan = paidPayments.reduce((sum, row) => sum + moneyValue(row), 0);
        const tunggakan = invoices.filter(invoiceOpen).reduce((sum, row) => sum + moneyValue(row), 0);
        const failedCoreCount = results.filter((result) => result.status === "rejected").length;

        setSummary({
          ...emptySummary,
          totalPelanggan: payloadTotal(customerPayload, customers),
          totalBisnis: payloadTotal(partnerPayload, partners),
          totalAdmin: payloadTotal(adminPayload, admins),
          totalPop: payloadTotal(popPayload, pops),
          pelangganAktif,
          totalInvoice: payloadTotal(invoicePayload, invoices),
          pendapatan,
          tunggakan,
          popularPackages: buildPopularPackages(customers, partners),
          recentActivities: buildRecentActivities(customers, invoices, paidPayments),
        });
        setError(failedCoreCount ? `${failedCoreCount} endpoint utama belum tersedia/bermasalah, dashboard menampilkan data yang berhasil dimuat.` : "");
      })
      .catch(() => {
        dashboardApi.getSummaryFallback()
          .then((res) => {
            setSummary({ ...emptySummary, ...res.data.data });
            setError("");
          })
          .catch(() => setError("Gagal memuat dashboard dari API."));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Dashboard" subtitle="Ringkasan performa bisnis, operasional ISP, dan monitoring server Radius." />

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition ${
              activeTab === "overview"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 size={15} />
            Ringkasan Bisnis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("radius")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition ${
              activeTab === "radius"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Radio size={15} />
            Dashboard Radius
          </button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      {/* Render Radius Dashboard if tab is radius */}
      {activeTab === "radius" ? (
        <RadiusDashboard />
      ) : (
        <>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-5">
                  <div className="flex items-center gap-4">
                    <ShimmerBlock className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <ShimmerBlock className="h-3 w-28" />
                      <ShimmerBlock className="h-8 w-36" />
                      <ShimmerBlock className="h-3 w-32" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={<Users size={22} />} label="Total Pelanggan" value={String(summary.totalPelanggan)} trend={`${summary.pelangganAktif} pelanggan aktif`} />
              <StatCard icon={<Receipt size={22} />} label="Total Invoice" value={String(summary.totalInvoice)} trend="Faktur & tagihan dari API" accent="emerald" />
              <StatCard icon={<Wallet size={22} />} label="Pendapatan" value={currency(summary.pendapatan)} trend="Pembayaran verified/lunas" accent="amber" />
              <StatCard icon={<TrendingUp size={22} />} label="Tunggakan" value={currency(summary.tunggakan)} trend="Invoice belum lunas" accent="rose" />
            </div>
          )}

          {!loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pelanggan Bisnis / Mitra</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{summary.totalBisnis}</p>
                <p className="mt-1 text-sm text-slate-500">Akun bisnis dan mitra terdaftar.</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">User Panel</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{summary.totalAdmin}</p>
                <p className="mt-1 text-sm text-slate-500">Admin dan employee aktif di sistem.</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">POP / Infrastruktur</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{summary.totalPop}</p>
                <p className="mt-1 text-sm text-slate-500">Titik jaringan yang sudah terdata.</p>
              </Card>
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <Card className="p-5">
              <h2 className="mb-4 font-bold text-slate-950">Aktivitas Terbaru</h2>
              {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <ShimmerBlock key={index} className="h-16 rounded-lg" />)}</div> : (
                <div className="space-y-4">
                  {summary.recentActivities.length ? summary.recentActivities.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><div><p className="font-semibold text-slate-800">{item.noInvoice}</p><p className="text-sm text-slate-500">{item.customerName} - {currency(item.amount)}</p></div><Badge value={item.status} /></div>) : <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">Belum ada aktivitas invoice.</div>}
                </div>
              )}
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 font-bold text-slate-950">Paket Terlaris</h2>
              {loading ? <ShimmerBlock className="h-64 rounded-xl" /> : (
                <div className="space-y-3">
                  {summary.popularPackages.length ? summary.popularPackages.map((item) => (
                    <div key={item.name} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">{item.value}</span>
                      </div>
                    </div>
                  )) : <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">Belum ada data paket.</div>}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage({ initialTab = "overview" }: { initialTab?: "overview" | "radius" }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <div className="space-y-4"><ShimmerBlock className="h-24" /><ShimmerBlock className="h-80" /></div>;
  return user.role === "mitra" ? <MitraDashboardPage /> : <AdminDashboardPage initialTab={initialTab} />;
}
