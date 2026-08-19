"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { date } from "@/lib/format";
import { Badge, Card, StatCard, TextInput } from "@/components/ui/AdminUI";
import { formatErrorMessage } from "@/lib/error";
import { mitraPortalService } from "@/services";
import { Headphones, PackageCheck, ReceiptText, Router } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API || "").replace(/\/api\/?$/, "");
const fileUrl = (path?: string) => (path ? `${API_ORIGIN}${path}` : "#");

export function MitraTicketsPage({ section }: { section: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const kind =
    section === "tiket"
      ? "customer"
      : section === "tiket-gangguan"
      ? "disruption"
      : section === "tiket-layanan"
      ? "service"
      : "support";

  const [form, setForm] = useState({
    title: "",
    description: "",
    reportType: "Gangguan",
    priority: "normal",
    customerId: "",
  });

  const load = () =>
    Promise.all([mitraPortalService.getTickets(), mitraPortalService.getCustomers()]).then(([a, b]) => {
      setRows(a);
      setCustomers(b);
    });

  useEffect(() => {
    load().catch((err) => setError(formatErrorMessage(err, "Gagal memuat tiket.")));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const body = new FormData();
    Object.entries({ ...form, ticketKind: kind }).forEach(([k, v]) => body.append(k, v));
    if (attachment) body.append("attachment", attachment);

    try {
      await mitraPortalService.createTicket(body);
      setMessage("Tiket berhasil dikirim ke admin.");
      setForm({ title: "", description: "", reportType: "Gangguan", priority: "normal", customerId: "" });
      setAttachment(null);
      await load();
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal membuat tiket."));
    }
  }

  const filtered = rows.filter((r) => (section === "tiket" ? r.ticketKind === "customer" : r.ticketKind === kind));
  const stat = (status?: string) => (status ? filtered.filter((r) => r.status === status).length : filtered.length);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<Headphones size={20} />} label="Total" value={String(stat())} trend="semua tiket" />
        <StatCard icon={<ReceiptText size={20} />} label="Open" value={String(stat("open"))} trend="menunggu" accent="rose" />
        <StatCard icon={<Router size={20} />} label="Diproses" value={String(stat("progress"))} trend="penanganan" accent="amber" />
        <StatCard icon={<PackageCheck size={20} />} label="Closed" value={String(stat("closed"))} trend="selesai" accent="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Buat Tiket Baru</h2>
          {error ? <div className="mb-4 mt-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          {message ? <div className="mb-4 mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}

          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Pelanggan Terdampak</span>
              <select
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500"
              >
                <option value="">Umum / tidak terkait pelanggan</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerCode} - {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Jenis Laporan</span>
              <select
                value={form.reportType}
                onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500"
              >
                {["Gangguan", "Komplain", "Upgrade Layanan", "Maintenance", "Penarikan Kabel", "Lain-Lain"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>

            <TextInput required label="Nama Gangguan / Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Detail</span>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Lampiran (opsional)</span>
              <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm" />
            </label>

            <button type="submit" className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-500">
              Kirim Tiket
            </button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-black text-slate-950">Daftar Tiket</h2>
          {!filtered.length ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              Belum ada tiket pada kategori ini.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">No Tiket</th>
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-4 py-3 font-bold">Jenis</th>
                    <th className="px-4 py-3 font-bold">Gangguan</th>
                    <th className="px-4 py-3 font-bold">Mulai</th>
                    <th className="px-4 py-3 font-bold">Lampiran</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-indigo-600">{r.ticketNo}</td>
                      <td className="px-4 py-3 text-slate-700">{r.customer?.name || "Umum"}</td>
                      <td className="px-4 py-3 text-slate-600">{r.reportType || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.title}</td>
                      <td className="px-4 py-3 text-slate-600">{date(r.startedAt || r.createdAt)}</td>
                      <td className="px-4 py-3">
                        {r.attachmentPath ? (
                          <a href={fileUrl(r.attachmentPath)} target="_blank" rel="noreferrer" className="font-bold text-indigo-600 hover:underline">
                            Lihat
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge value={r.status || "open"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
export default MitraTicketsPage;
