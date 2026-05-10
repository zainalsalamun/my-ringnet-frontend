"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/lib/api";
import Link from "next/link";
import { Card, DataTable, PageHeader, TableSkeleton, SelectInput } from "@/components/ui/AdminUI";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Calendar, Download, Eye, FileText, Upload, Users, FileBadge } from "lucide-react";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

export function useDocumentCategories() {
  const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([]);
  useEffect(() => {
    api.get("/document-categories").then(res => setCategories(res.data.data)).catch(() => {});
  }, []);
  return categories;
}

function useDocuments(categoryId?: string) {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const endpoint = categoryId && categoryId !== "SEMUA" ? `/documents?categoryId=${categoryId}` : "/documents";

  useEffect(() => {
    setLoading(true);
    setToast("");
    api.get(endpoint)
      .then((res) => setRows(res.data.data))
      .catch(() => {
        setRows([]);
        setToast("Gagal memuat data. Pastikan backend aktif dan sesi login valid.");
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

  async function remove(row: any, successMessage: string) {
    try {
      await api.delete("/documents/" + row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast(successMessage);
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menghapus dokumen.");
    }
  }

  return { rows, toast, remove, loading };
}

// ─── Dynamic Category Badge ───
function CategoryBadge({ category }: { category: any }) {
  if (!category) return <span className="text-slate-400">-</span>;
  return (
    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
      {category.name}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Document List Page with Tabs ───
export function DocumentListPage({ categorySlug }: { categorySlug?: string } = {}) {
  const [activeTab, setActiveTab] = useState<string>("SEMUA");
  const categories = useDocumentCategories();
  const { rows, toast, remove, loading } = useDocuments(activeTab);

  const tabs = [
    { label: "Semua", value: "SEMUA" },
    ...categories.map(c => ({ label: c.name, value: c.id }))
  ];

  return (
    <div>
      <PageHeader title="Daftar Dokumen" subtitle="Kelola seluruh dokumen perusahaan dan mitra." actionHref={`/dokumen/legalitas/new`} actionLabel="Tambah" />
      <Toast message={toast} />
      
      {/* Category Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === tab.value ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton columns={5} /> :
      <DataTable
        data={rows}
        editBasePath={`/dokumen/legalitas`}
        onDelete={(row) => remove(row, "Dokumen berhasil dihapus.")}
        columns={[
          { key: "name", header: "Nama", render: (row: any) => (
            <Link href={`/dokumen/legalitas/${row.id}`} className="font-semibold text-indigo-600 hover:underline">
              {row.name}
            </Link>
          )},
          { key: "documentNo", header: "Nomor", render: (row: any) => <span className="text-slate-600">{row.documentNo || "-"}</span> },
          { key: "category", header: "Kategori", render: (row: any) => <CategoryBadge category={row.category} /> },
          { key: "partnerName", header: "Mitra", render: (row: any) => <span className="text-slate-600">{row.partnerName || row.partner?.name || "-"}</span> },
          { key: "expiredDate", header: "Expired Date", render: (row: any) => <span className="text-slate-600">{formatDate(row.expiredDate)}</span> },
        ]}
      />
      }
    </div>
  );
}

// ─── View / Detail Dokumen Page ───
export function LegalitasViewPage({ id, backHref }: { id: string; backHref?: string }) {
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get("/documents/" + id)
      .then((res) => setDoc(res.data.data))
      .catch(() => setError("Gagal memuat dokumen."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Detail Dokumen" subtitle="Memuat..." />
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="shimmer h-8 w-64 rounded-lg" />
            <div className="shimmer h-4 w-48 rounded" />
            <div className="shimmer mt-4 h-[500px] w-full rounded-xl" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div>
        <PageHeader title="Detail Dokumen" subtitle="Dokumen tidak ditemukan." />
        <Card className="p-8 text-center">
          <p className="text-sm text-rose-600 font-semibold">{error || "Dokumen tidak ditemukan."}</p>
          <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={16} /> Kembali
          </button>
        </Card>
      </div>
    );
  }

  const apiBase = (process.env.NEXT_PUBLIC_API || "").replace(/\/api\/?$/, "");
  const pdfUrl = apiBase + doc.filePath;
  const resolvedBackHref = backHref || `/dokumen/legalitas`;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={resolvedBackHref}
          className="mb-3 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">{doc.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Detail dan preview dokumen</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nama</p>
              <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{doc.name}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <FileBadge size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nomor</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{doc.documentNo || "-"}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expired Date</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{formatDate(doc.expiredDate)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dibuat</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{formatDate(doc.createdAt)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Card className="flex-1 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Kategori</p>
              <div className="mt-1"><CategoryBadge category={doc.category} /></div>
            </div>
          </div>
        </Card>
        {doc.partner ? (
          <Card className="flex-1 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-600">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mitra</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{doc.partner.name}</p>
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Eye size={16} className="text-slate-400" />
            Preview Dokumen
          </div>
          <div className="flex gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Eye size={14} /> Buka Tab Baru
            </a>
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-600"
            >
              <Download size={14} /> Download
            </a>
          </div>
        </div>
        <div className="bg-slate-100 p-1">
          {pdfUrl.toLowerCase().match(/\.(jpeg|jpg|png)$/) ? (
            <div className="flex min-h-[500px] items-center justify-center rounded-lg bg-white p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pdfUrl} alt={doc.name} className="max-h-[700px] max-w-full rounded-md object-contain shadow-sm border border-slate-100" />
            </div>
          ) : (
            <iframe
              src={pdfUrl + "#toolbar=1&navpanes=0"}
              title={"Preview: " + doc.name}
              className="h-[700px] w-full rounded-lg border-0 bg-white"
            />
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Tambah / Edit Dokumen Form Page ───
export function LegalitasFormPage({ edit = false, id, category }: { edit?: boolean; id?: string; category?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", documentNo: "", expiredDate: "", partnerId: "", categoryId: "" });
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categories = useDocumentCategories();
  const [partnerOptions, setPartnerOptions] = useState<{ label: string; value: string }[]>([]);
  const [isPartnerDoc, setIsPartnerDoc] = useState(false);
  const [hasExpiredDate, setHasExpiredDate] = useState(false);

  useEffect(() => {
    api.get("/partners?limit=100")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setPartnerOptions(data.map((item: any) => ({ label: item.name, value: item.id })));
      })
      .catch(() => setPartnerOptions([]));
  }, []);

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/documents/" + id).then((res) => {
      const data = res.data.data;
      
      let formattedDate = "";
      if (data.expiredDate) {
        const d = new Date(data.expiredDate);
        formattedDate = d.toISOString().split('T')[0];
        setHasExpiredDate(true);
      } else {
        setHasExpiredDate(false);
      }

      setForm({
        name: data.name || "",
        documentNo: data.documentNo || "",
        expiredDate: formattedDate,
        partnerId: data.partnerId || "",
        categoryId: data.categoryId || ""
      });
      if (data.partnerId) setIsPartnerDoc(true);
      if (data.filePath) setFileName(data.filePath.split("/").pop() || "");
    }).catch(() => setError("Gagal memuat data dokumen."));
  }, [edit, id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(selected.type)) {
        setError("Hanya file PDF, JPG, atau PNG yang diizinkan.");
        return;
      }
      setFile(selected);
      setFileName(selected.name);
      setError("");
    }
  }

  async function submit() {
    setError("");
    if (!form.name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!form.categoryId) {
      setError("Kategori dokumen wajib dipilih.");
      return;
    }
    if (!edit && !file) {
      setError("Berkas dokumen wajib diunggah.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("categoryId", form.categoryId);
      if (form.documentNo) formData.append("documentNo", form.documentNo);
      
      if (hasExpiredDate && form.expiredDate) {
        formData.append("expiredDate", form.expiredDate);
      } else {
        formData.append("expiredDate", "");
      }
      
      if (isPartnerDoc && form.partnerId) {
        formData.append("partnerId", form.partnerId);
      } else if (edit && !isPartnerDoc) {
        formData.append("partnerId", "");
      }
      if (file) {
        formData.append("file", file);
      }

      if (edit) {
        await api.put("/documents/" + id, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      router.push("/dokumen/legalitas");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan dokumen.");
    }
  }

  return (
    <div>
      <PageHeader title={(edit ? "Edit" : "Tambah") + ` Dokumen`} subtitle={`Upload dokumen perusahaan atau mitra.`} />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            
            {/* Kategori */}
            <div className="lg:col-span-2">
              <SelectInput
                label="Kategori*"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                options={[{ label: "Pilih kategori...", value: "" }, ...categories.map(cat => ({ label: cat.name, value: cat.id }))]}
              />
            </div>

            {/* Nama */}
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Nama<span className="text-rose-500">*</span></span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Masukkan Nama"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            {/* Nomor */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Nomor</span>
              <input
                type="text"
                value={form.documentNo}
                onChange={(e) => setForm({ ...form, documentNo: e.target.value })}
                placeholder="Contoh: 001/SK/2026"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            {/* Expired Date */}
            <div className="block">
              <div className="mb-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHasExpiredDate(!hasExpiredDate)}
                  className={"relative h-6 w-11 shrink-0 rounded-full transition-colors " + (hasExpiredDate ? "bg-indigo-500" : "bg-slate-300")}
                >
                  <span className={"absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " + (hasExpiredDate ? "translate-x-5" : "")} />
                </button>
                <span className="text-sm font-semibold text-slate-700">Ada Expired Date?</span>
              </div>
              {hasExpiredDate && (
                <input
                  type="date"
                  value={form.expiredDate}
                  onChange={(e) => setForm({ ...form, expiredDate: e.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              )}
            </div>

            {/* Dokumen Mitra toggle */}
            <div className="flex items-center gap-3 lg:col-span-2">
              <button
                type="button"
                onClick={() => setIsPartnerDoc(!isPartnerDoc)}
                className={"relative h-6 w-11 rounded-full transition-colors " + (isPartnerDoc ? "bg-indigo-500" : "bg-slate-300")}
              >
                <span className={"absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " + (isPartnerDoc ? "translate-x-5" : "")} />
              </button>
              <span className="text-sm font-medium text-slate-700">Dokumen milik Mitra</span>
            </div>

            {/* Pilih Mitra */}
            {isPartnerDoc ? (
              <div className="lg:col-span-2">
                <SelectInput
                  label="Mitra*"
                  value={form.partnerId}
                  onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                  options={[{ label: "Pilih mitra...", value: "" }, ...partnerOptions]}
                />
              </div>
            ) : null}

            {/* File Upload */}
            <div className="lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Berkas (PDF/JPG/PNG)<span className="text-rose-500">*</span></span>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-indigo-400 hover:bg-indigo-50/40"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf,.png,image/png,.jpg,.jpeg,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {fileName ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                    <FileText className="text-indigo-500" size={36} />
                    <p className="text-sm font-semibold text-slate-800">{fileName}</p>
                    <p className="text-xs text-slate-500">Klik untuk mengganti berkas</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-200">
                      <Upload size={20} />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-emerald-600">+ Pilih Berkas</p>
                    <p className="text-xs text-slate-400">Format didukung: PDF, JPG, PNG</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => router.back()} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</button>
            <button className="h-10 rounded-lg bg-emerald-500 px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-600">Simpan</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
