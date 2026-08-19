"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge, Card, PageHeader, ShimmerBlock, StatCard } from "@/components/ui/AdminUI";
import { useAuthStore } from "@/hooks/useAuth";
import { currency } from "@/lib/format";
import { formatErrorMessage } from "@/lib/error";
import {
  adminService,
  companyService,
  customerService,
  financeService,
  internetServiceService,
  popService,
} from "@/services";
import { Receipt, TrendingUp, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { MitraDashboardPage } from "@/components/pages/MitraPortalPages";

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

function moneyValue(row: any) {
  return Number(row.amount || row.grandTotal || row.total || row.price || row.packagePrice || row.monthlyPrice || 0) || 0;
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
    id: `customer-${row.id || row.customerCode}`,
    noInvoice: row.customerCode || "Pelanggan",
    customerName: row.name || "Pelanggan baru",
    amount: 0,
    status: row.status === false ? "nonactive" : "active",
    createdAt: row.lastActivity || row.createdAt,
  }));

  return [...paymentItems, ...invoiceItems, ...customerItems]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6);
}

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(emptySummary);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);

    Promise.allSettled([
      customerService.getList(),
      companyService.getList(),
      adminService.getList(),
      popService.getList(),
      internetServiceService.getList(),
      financeService.getList(),
    ])
      .then(([custRes, compRes, adminRes, popRes, invRes, finRes]) => {
        const customers = custRes.status === "fulfilled" ? custRes.value : [];
        const companies = compRes.status === "fulfilled" ? compRes.value : [];
        const admins = adminRes.status === "fulfilled" ? adminRes.value : [];
        const pops = popRes.status === "fulfilled" ? popRes.value : [];
        const invoices = invRes.status === "fulfilled" ? invRes.value : [];
        const payments = finRes.status === "fulfilled" ? finRes.value : [];

        const paidInvoices = invoices.filter(invoicePaid);
        const openInvoices = invoices.filter(invoiceOpen);
        const paidPayments = payments.filter((row) => String(row.status || "").toLowerCase().includes("verified") || invoicePaid(row));
        const revenueSource = paidPayments.length ? paidPayments : paidInvoices;
        const pendapatan = revenueSource.reduce((sum, row) => sum + moneyValue(row), 0);
        const tunggakan = openInvoices.reduce((sum, row) => sum + moneyValue(row), 0);
        const pelangganAktif = customers.filter((row) => row.status === "active").length;

        setSummary({
          ...emptySummary,
          totalPelanggan: customers.length,
          totalBisnis: companies.length,
          totalAdmin: admins.length,
          totalPop: pops.length,
          pelangganAktif,
          totalInvoice: invoices.length,
          pendapatan,
          tunggakan,
          popularPackages: buildPopularPackages(customers, companies),
          recentActivities: buildRecentActivities(customers, invoices, paidPayments),
        });
        setError("");
      })
      .catch((err) => {
        setError(formatErrorMessage(err, "Gagal memuat ringkasan dashboard."));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan operasional bisnis, status pelanggan, tagihan, dan pendapatan terkini." />

      {error ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerBlock key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<TrendingUp size={22} />}
            label="Total Pelanggan"
            value={String(summary.totalPelanggan)}
            trend={`${summary.pelangganAktif} pelanggan aktif`}
          />
          <StatCard
            icon={<Wallet size={22} />}
            label="Pendapatan"
            value={currency(summary.pendapatan)}
            trend="Pembayaran billing terverifikasi"
            accent="emerald"
          />
          <StatCard
            icon={<Receipt size={22} />}
            label="Tunggakan"
            value={currency(summary.tunggakan)}
            trend={`${summary.totalInvoice} total faktur diterbitkan`}
            accent="rose"
          />
          <StatCard
            icon={<Users size={22} />}
            label="Akses Panel"
            value={String(summary.totalAdmin)}
            trend={`${summary.totalBisnis} akun bisnis / partner`}
            accent="amber"
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-950">Aktivitas Terkini</h2>
              <p className="text-xs text-slate-500">Transaksi, faktur terbaru, dan pendaftaran pelanggan.</p>
            </div>
            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">Realtime API</span>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerBlock key={i} className="h-14" />
              ))}
            </div>
          ) : !summary.recentActivities.length ? (
            <p className="py-12 text-center text-sm font-semibold text-slate-400">Belum ada aktivitas transaksi.</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {summary.recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-bold text-slate-900">{act.customerName}</p>
                    <p className="text-xs text-slate-500">{act.noInvoice}</p>
                  </div>
                  <div className="text-right">
                    {act.amount > 0 ? (
                      <p className="text-sm font-bold text-slate-900">{currency(act.amount)}</p>
                    ) : null}
                    <Badge value={act.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-950">Paket Layanan Populer</h2>
            <p className="text-xs text-slate-500">Distribusi paket pelanggan & bisnis.</p>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerBlock key={i} className="h-10" />
              ))}
            </div>
          ) : !summary.popularPackages.length ? (
            <p className="py-12 text-center text-sm font-semibold text-slate-400">Belum ada data paket layanan.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {summary.popularPackages.map((pkg) => (
                <div key={pkg.name} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <span className="text-sm font-bold text-slate-800">{pkg.name}</span>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                    {pkg.value} Pelanggan
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === "mitra") {
    return <MitraDashboardPage />;
  }
  return <AdminDashboardPage />;
}
