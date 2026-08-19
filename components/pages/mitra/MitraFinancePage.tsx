"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { currency, date } from "@/lib/format";
import { Badge, Card, ShimmerBlock } from "@/components/ui/AdminUI";
import { formatErrorMessage } from "@/lib/error";
import { mitraPortalService } from "@/services";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function Info({ rows }: { rows: any[][] }) {
  return (
    <div className="mt-4 space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2 text-sm">
          <span className="text-slate-500">{label}</span>
          <strong className="text-right text-slate-900">{value || "-"}</strong>
        </div>
      ))}
    </div>
  );
}

export function MitraFinancePage({ invoices = false }: { invoices?: boolean }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetcher = invoices ? mitraPortalService.getInvoices() : mitraPortalService.getFinance();
    fetcher
      .then((res) => setData(res))
      .catch((e) => setError(formatErrorMessage(e, "Gagal memuat data keuangan mitra.")));
  }, [invoices]);

  if (!data && !error) return <ShimmerBlock className="h-80" />;

  if (invoices) {
    const rows = Array.isArray(data) ? data : data?.invoices || [];
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

    return (
      <div className="space-y-6">
        {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <Card className="p-5">
          <h2 className="mb-4 font-black text-slate-950">Daftar Tagihan & Invoice Pelanggan Mitra</h2>
          {!rows.length ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              Belum ada invoice.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Invoice</th>
                      <th className="px-4 py-3 font-bold">Pelanggan</th>
                      <th className="px-4 py-3 font-bold">Periode</th>
                      <th className="px-4 py-3 font-bold">Jumlah</th>
                      <th className="px-4 py-3 font-bold">Jatuh Tempo</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((r: any) => (
                      <tr key={r.id || r.noInvoice} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-bold text-indigo-600">{r.noInvoice || r.noFaktur}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{r.customerName || r.customer?.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.periodMonth && r.periodYear ? `${String(r.periodMonth).padStart(2, "0")}/${r.periodYear}` : "-"}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{currency(r.amount || r.grandTotal)}</td>
                        <td className="px-4 py-3 text-slate-600">{date(r.dueDate)}</td>
                        <td className="px-4 py-3">
                          <Badge value={r.status || "unpaid"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > pageSize ? (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <span className="font-semibold text-slate-500">Halaman {page} dari {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
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

  const s = data?.summary || {};
  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Rincian Rekonsiliasi</h2>
          <Info
            rows={[
              ["Pendapatan Kotor", currency(s.grossRevenue)],
              ["DPP", currency(s.dpp)],
              ["PPN 11%", currency(s.vat)],
              ["BHP USO", currency(s.bhpUso)],
              ["KSO", currency(s.kso)],
              ["Supply Bandwidth", currency(s.bandwidthFee)],
              ["PPH 2.5%", currency(s.withholdingTax)],
              ["Sharing Profit", currency(s.sharingProfit)],
            ]}
          />
        </Card>
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Pendapatan 12 Bulan</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={data?.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => currency(String(v))} />
                <Line dataKey="value" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default MitraFinancePage;
