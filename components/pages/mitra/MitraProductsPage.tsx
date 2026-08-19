"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { currency } from "@/lib/format";
import { Card, ShimmerBlock, StatCard } from "@/components/ui/AdminUI";
import { formatErrorMessage } from "@/lib/error";
import { mitraPortalService } from "@/services";
import { CircleDollarSign, PackageCheck, Router } from "lucide-react";
import { useEffect, useState } from "react";

export function MitraProductsPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    mitraPortalService
      .getProducts()
      .then((res) => setRows(res))
      .catch((e) => setError(formatErrorMessage(e, "Gagal memuat produk mitra.")));
  }, []);

  if (!rows && !error) return <ShimmerBlock className="h-80" />;

  const maxSpeed = Math.max(0, ...(rows || []).map((r) => Number(r.speedMbps || 0)));
  const minPrice = Math.min(...(rows?.length ? rows.map((r) => Number(r.monthlyPrice || 0)) : [0]));

  return (
    <div>
      {error ? (
        <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={<PackageCheck size={22} />} label="Total Paket" value={String(rows?.length || 0)} trend="paket aktif" />
        <StatCard icon={<Router size={22} />} label="Kecepatan Maksimal" value={`${maxSpeed} Mbps`} trend="sesuai paket" accent="emerald" />
        <StatCard icon={<CircleDollarSign size={22} />} label="Harga Mulai" value={currency(minPrice)} trend="per bulan" accent="amber" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(rows || []).map((r) => (
          <Card key={r.id} className="overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
              <PackageCheck size={26} />
              <h2 className="mt-4 text-lg font-black">{r.name}</h2>
              <p className="text-sm text-indigo-100">Up to {r.speedMbps || "-"} Mbps • Dukungan 24/7</p>
            </div>
            <div className="p-5">
              <p className="text-2xl font-black">
                {currency(r.monthlyPrice)}
                <span className="text-xs font-medium text-slate-400">/bulan</span>
              </p>
              <p className="mt-2 text-xs font-bold text-emerald-600">PPN termasuk • Paket aktif</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{r.description || "Paket aktif untuk pelanggan Mitra."}</p>
            </div>
          </Card>
        ))}
      </div>
      {rows?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
          Belum ada produk aktif untuk akun Anda.
        </div>
      ) : null}
    </div>
  );
}
export default MitraProductsPage;
