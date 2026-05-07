"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/lib/api";
import { Badge, Card, PageHeader, ShimmerBlock, StatCard } from "@/components/ui/AdminUI";
import { currency } from "@/lib/format";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Receipt, TrendingUp, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

const emptySummary = {
  totalPelanggan: 0,
  totalInvoice: 0,
  pendapatan: 0,
  tunggakan: 0,
  revenue: [] as { month: string; value: number }[],
  invoiceStatus: [
    { name: "Lunas", value: 0, color: "#22c55e" },
    { name: "Belum Lunas", value: 0, color: "#f59e0b" },
    { name: "Terlambat", value: 0, color: "#ef4444" },
  ],
  popularPackages: [] as { name: string; value: number }[],
  recentActivities: [] as any[],
};

export default function DashboardPage() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(emptySummary);
  const [error, setError] = useState("");

  useEffect(() => {
    setReady(true);
    setLoading(true);
    api.get("/dashboard/summary")
      .then((res) => {
        setSummary({ ...emptySummary, ...res.data.data });
        setError("");
      })
      .catch(() => {
        setSummary(emptySummary);
        setError("Gagal memuat dashboard. Pastikan backend aktif dan sesi login valid.");
      })
      .finally(() => setLoading(false));
  }, []);

  const hasPieData = summary.invoiceStatus.some((item) => Number(item.value) > 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan performa bisnis dan operasional ISP Anda." />
      {error ? <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}

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
          <StatCard icon={<Users size={22} />} label="Total Pelanggan" value={String(summary.totalPelanggan)} trend="Data real database" />
          <StatCard icon={<Receipt size={22} />} label="Total Invoice" value={String(summary.totalInvoice)} trend="Data real database" accent="emerald" />
          <StatCard icon={<Wallet size={22} />} label="Pendapatan" value={currency(summary.pendapatan)} trend="Invoice berstatus lunas" accent="amber" />
          <StatCard icon={<TrendingUp size={22} />} label="Tunggakan" value={currency(summary.tunggakan)} trend="Invoice belum lunas" accent="rose" />
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Pendapatan 6 Bulan Terakhir</h2>
            <span className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">6 bulan</span>
          </div>
          <div className="h-80">
            {loading || !ready ? <ShimmerBlock className="h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => String(Number(v) / 1000000) + "jt"} />
                  <Tooltip formatter={(value) => currency(String(value))} />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-950">Status Invoice</h2>
          <div className="h-64">
            {loading || !ready ? <ShimmerBlock className="h-full rounded-xl" /> : hasPieData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.invoiceStatus} innerRadius={62} outerRadius={95} paddingAngle={4} dataKey="value">
                    {summary.invoiceStatus.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="grid h-full place-items-center rounded-xl bg-slate-50 text-sm text-slate-500">Belum ada invoice</div>}
          </div>
          <div className="space-y-2">
            {summary.invoiceStatus.map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
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
          <div className="h-64">
            {loading || !ready ? <ShimmerBlock className="h-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.popularPackages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
