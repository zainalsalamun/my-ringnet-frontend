"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { date } from "@/lib/format";
import { Card, ShimmerBlock, TextInput } from "@/components/ui/AdminUI";
import { useAuthStore } from "@/hooks/useAuth";
import { formatErrorMessage } from "@/lib/error";
import { documentService, mitraPortalService } from "@/services";
import { Download, ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API || "").replace(/\/api\/?$/, "");
const fileUrl = (path?: string) => (path ? `${API_ORIGIN}${path}` : "#");

const docCategory: Record<string, string> = {
  pic: "pic-mitra",
  ktp: "ktp-mitra",
  npwp: "npwp-mitra",
  nib: "nib-mitra",
  sertifikat: "sertifikat-mitra",
  pks: "pks-mitra",
};

export function DocumentCards({ category }: { category: string }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetcher = isAdmin
      ? documentService.getDocuments(category)
      : mitraPortalService.getContentDocuments(category);

    fetcher
      .then((r) => setRows(r))
      .catch((e) => setError(formatErrorMessage(e, "Gagal memuat dokumen.")));
  }, [category, isAdmin]);

  if (!rows && !error) return <ShimmerBlock className="h-72" />;

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(rows || []).map((row) => (
          <Card key={row.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText size={22} />
              </span>
              {row.createdAt ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                  {date(row.createdAt)}
                </span>
              ) : null}
            </div>
            <h2 className="mt-4 font-black text-slate-950">{row.name}</h2>
            <p className="mt-1 text-xs font-semibold text-indigo-600">{row.documentNo || row.category?.name || "Dokumen resmi"}</p>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
              {row.description || "Dokumen diterbitkan dan dikelola melalui sistem MyRingNet."}
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={fileUrl(row.filePath)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-500"
              >
                <ExternalLink size={14} /> Lihat
              </a>
              <a
                href={fileUrl(row.filePath)}
                download
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Download size={15} />
              </a>
            </div>
          </Card>
        ))}
        {rows?.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Belum ada dokumen pada kategori ini.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PartnerDocuments({ section }: { section: string }) {
  const category = docCategory[section] || section;
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", documentNo: "", description: "", expiredDate: "" });
  const [file, setFile] = useState<File | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const load = useCallback(() => {
    const fetcher = isAdmin
      ? documentService.getDocuments(category)
      : mitraPortalService.getContentDocuments(category);

    return fetcher
      .then((r) => setRows(r))
      .catch((e) => setError(formatErrorMessage(e, "Gagal memuat dokumen.")));
  }, [category, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Pilih file dokumen terlebih dahulu.");
    setError("");
    setMessage("");

    const body = new FormData();
    Object.entries({ ...form, categorySlug: category }).forEach(([k, v]) => {
      if (v) body.append(k, v);
    });
    body.append("file", file);

    try {
      if (isAdmin) {
        await documentService.uploadDocument(body);
      } else {
        await mitraPortalService.uploadDocument(body);
      }
      setMessage("Dokumen berhasil ditambahkan.");
      setForm({ name: "", documentNo: "", description: "", expiredDate: "" });
      setFile(null);
      await load();
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal mengunggah dokumen."));
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Hapus dokumen ini?")) return;
    try {
      if (isAdmin) {
        await documentService.deleteDocument(id);
      } else {
        await mitraPortalService.deleteDocument(id);
      }
      await load();
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menghapus dokumen."));
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="font-black text-slate-950">Tambah Data</h2>
        {error ? <div className="mb-4 mt-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        {message ? <div className="mb-4 mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}

        <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextInput
            label={section === "pic" ? "Nama PIC" : "Nama Dokumen"}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput label="Nomor Surat / Dokumen" value={form.documentNo} onChange={(e) => setForm({ ...form, documentNo: e.target.value })} />
          <TextInput label="Keterangan" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextInput type="date" label="Masa Berlaku" value={form.expiredDate} onChange={(e) => setForm({ ...form, expiredDate: e.target.value })} />
          <label className="md:col-span-2 xl:col-span-3">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Berkas Dokumen</span>
            <input required type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900" />
          </label>
          <div className="flex items-end">
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-500">
              <Upload size={16} /> Tambah Data
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-black text-slate-950">Daftar Dokumen</h2>
        {rows === null ? (
          <ShimmerBlock className="h-72" />
        ) : !rows.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Belum ada dokumen yang diunggah.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">No</th>
                  <th className="px-4 py-3 font-bold">Tanggal</th>
                  <th className="px-4 py-3 font-bold">Nomor Surat</th>
                  <th className="px-4 py-3 font-bold">{section === "pic" ? "Nama" : "Dokumen"}</th>
                  <th className="px-4 py-3 font-bold">Keterangan</th>
                  <th className="px-4 py-3 font-bold">Dokumen</th>
                  <th className="px-4 py-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-600">{date(r.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-700">{r.documentNo || "-"}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.description || "-"}</td>
                    <td className="px-4 py-3">
                      <a target="_blank" rel="noreferrer" href={fileUrl(r.filePath)} className="font-bold text-indigo-600 hover:underline">
                        Lihat
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.partnerId || r.popId ? (
                        <button onClick={() => remove(r.id)} className="text-rose-600 hover:text-rose-700">
                          <Trash2 size={17} />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function LegalPage() {
  const menus = [
    { label: "Data PIC", description: "Nama, KTP, no.telp", href: "/mitra/pic" },
    { label: "Ijin Lokasi", description: "", href: "/mitra/ijin-lokasi" },
    { label: "Perjanjian Sewa Menyewa", description: "", href: "/mitra/sewa-menyewa" },
    { label: "Data Lokasi", description: "alamat, titik koordinat, foto", href: "/mitra/lokasi" },
    { label: "Kontrak", description: "", href: "/mitra/kontrak" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      {menus.map((menu) => (
        <Link key={menu.href} href={menu.href}>
          <Card className="flex h-32 flex-col items-center justify-center p-4 text-center transition hover:border-indigo-500 hover:bg-indigo-50">
            <FileText size={32} className="mb-3 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-700">{menu.label}</h3>
            {menu.description && <p className="mt-1 text-[11px] font-medium text-slate-500">{menu.description}</p>}
          </Card>
        </Link>
      ))}
    </div>
  );
}
export default PartnerDocuments;
