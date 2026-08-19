"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { currency } from "@/lib/format";
import { Badge, Card, ShimmerBlock } from "@/components/ui/AdminUI";
import { formatErrorMessage } from "@/lib/error";
import { mitraPortalService } from "@/services";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function MitraCustomersPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    mitraPortalService
      .getCustomers()
      .then((res) => setRows(res))
      .catch((e) => setError(formatErrorMessage(e, "Gagal memuat data pelanggan mitra.")));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows || []).filter((r) =>
      !q ||
      [r.customerCode, r.name, r.phone, r.email, r.area, r.city, r.packageName].some((val) =>
        String(val || "").toLowerCase().includes(q)
      )
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage]);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-slate-950">Daftar Pelanggan Mitra</h2>
            <p className="text-xs text-slate-500">
              Menampilkan {paginated.length} dari {filtered.length} pelanggan terhubung.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari ID, nama, paket..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {rows === null ? (
          <ShimmerBlock className="h-72" />
        ) : !paginated.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Data pelanggan tidak ditemukan.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">ID</th>
                    <th className="px-4 py-3 font-bold">Nama</th>
                    <th className="px-4 py-3 font-bold">Kontak</th>
                    <th className="px-4 py-3 font-bold">Area</th>
                    <th className="px-4 py-3 font-bold">Paket</th>
                    <th className="px-4 py-3 font-bold">Tunggakan</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-indigo-600">{r.customerCode || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.phone || "-"}
                        {r.email ? <p className="text-xs text-slate-400">{r.email}</p> : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{r.area || r.city || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.packageName || "-"}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{currency(r.outstandingAmount || 0)}</td>
                      <td className="px-4 py-3">
                        <Badge value={r.status || "active"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > pageSize ? (
              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-500">
                  Halaman {page} dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="rounded-lg bg-slate-50 px-3 py-1.5 font-black text-slate-700">{page}</span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}
export default MitraCustomersPage;
