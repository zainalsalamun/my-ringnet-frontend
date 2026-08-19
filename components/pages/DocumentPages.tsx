"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { Card, DataTable, PageHeader, TableSkeleton, SelectInput } from "@/components/ui/AdminUI";
import { formatErrorMessage } from "@/lib/error";
import { documentService, partnerService } from "@/services";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Download, Eye, FileText, Upload } from "lucide-react";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

export function useDocumentCategories() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  useEffect(() => {
    documentService
      .getCategories()
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);
  return categories;
}

function useDocuments(categoryId?: string) {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const categoryParam = categoryId && categoryId !== "SEMUA" ? categoryId : undefined;

  useEffect(() => {
    setLoading(true);
    setToast("");
    documentService
      .getDocuments(categoryParam)
      .then((data) => setRows(data))
      .catch((err) => {
        setRows([]);
        setToast(formatErrorMessage(err, "Gagal memuat data. Pastikan backend aktif dan sesi login valid."));
      })
      .finally(() => setLoading(false));
  }, [categoryParam]);

  async function remove(row: any, successMessage: string) {
    try {
      await documentService.deleteDocument(row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast(successMessage);
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal menghapus dokumen."));
    }
  }

  return { rows, toast, remove, loading };
}

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

export function DocumentListPage({ categorySlug }: { categorySlug?: string } = {}) {
  const [activeTab, setActiveTab] = useState<string>(categorySlug || "SEMUA");
  const categories = useDocumentCategories();
  const { rows, toast, remove, loading } = useDocuments(activeTab);

  const tabs = [
    { label: "Semua", value: "SEMUA" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <div>
      <PageHeader title="Daftar Dokumen" subtitle="Kelola seluruh dokumen perusahaan dan mitra." actionHref="/dokumen/legalitas/new" actionLabel="Tambah" />
      <Toast message={toast} />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <DataTable
          data={rows}
          editBasePath="/dokumen/legalitas"
          onDelete={(row) => remove(row, "Dokumen berhasil dihapus.")}
          columns={[
            {
              key: "name",
              header: "Nama",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <FileText className="text-slate-400" size={16} />
                  <span className="font-semibold text-slate-800">{row.name}</span>
                </div>
              ),
            },
            {
              key: "documentNo",
              header: "Nomor Surat",
              render: (row) => row.documentNo || "-",
            },
            {
              key: "category",
              header: "Kategori",
              render: (row) => <CategoryBadge category={row.category} />,
            },
            {
              key: "owner",
              header: "Pemilik",
              render: (row) => (
                <span className="text-xs text-slate-600">
                  {row.partner ? `Mitra: ${row.partner.name}` : "Perusahaan"}
                </span>
              ),
            },
            {
              key: "file",
              header: "Dokumen",
              render: (row) => {
                if (!row.filePath) return <span className="text-slate-400">-</span>;
                const fileUrl = `${(process.env.NEXT_PUBLIC_API || "").replace("/api", "")}${row.filePath}`;
                return (
                  <div className="flex items-center gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      <Eye size={14} /> Lihat
                    </a>
                    <a
                      href={fileUrl}
                      download
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}

export function GenericDocumentPage({
  categorySlug,
  title,
  subtitle,
}: {
  categorySlug: string;
  title: string;
  subtitle: string;
}) {
  const { rows, toast, remove, loading } = useDocuments(categorySlug);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} actionHref={`/dokumen/${categorySlug}/new`} actionLabel="Tambah" />
      <Toast message={toast} />

      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <DataTable
          data={rows}
          editBasePath={`/dokumen/${categorySlug}`}
          onDelete={(row) => remove(row, `${title} berhasil dihapus.`)}
          columns={[
            {
              key: "name",
              header: "Nama",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <FileText className="text-slate-400" size={16} />
                  <span className="font-semibold text-slate-800">{row.name}</span>
                </div>
              ),
            },
            {
              key: "documentNo",
              header: "Nomor Dokumen",
              render: (row) => row.documentNo || "-",
            },
            {
              key: "owner",
              header: "Pemilik",
              render: (row) => (
                <span className="text-xs text-slate-600">
                  {row.partner ? `Mitra: ${row.partner.name}` : "Perusahaan"}
                </span>
              ),
            },
            {
              key: "expiredDate",
              header: "Masa Berlaku",
              render: (row) => formatDate(row.expiredDate),
            },
            {
              key: "file",
              header: "Berkas",
              render: (row) => {
                if (!row.filePath) return <span className="text-slate-400">-</span>;
                const fileUrl = `${(process.env.NEXT_PUBLIC_API || "").replace("/api", "")}${row.filePath}`;
                return (
                  <div className="flex items-center gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      <Eye size={14} /> Lihat
                    </a>
                    <a
                      href={fileUrl}
                      download
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}

export function LegalitasFormPage({
  edit = false,
  id,
  category,
}: {
  edit?: boolean;
  id?: string;
  category?: string;
}) {
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
    partnerService
      .getList()
      .then((data) => {
        setPartnerOptions(data.map((item: any) => ({ label: item.name, value: item.id })));
      })
      .catch(() => setPartnerOptions([]));
  }, []);

  useEffect(() => {
    if (!edit || !id) return;
    documentService
      .getDocumentDetail(id)
      .then((data) => {
        if (!data) return;
        let formattedDate = "";
        if (data.expiredDate) {
          const d = new Date(data.expiredDate);
          formattedDate = d.toISOString().split("T")[0];
          setHasExpiredDate(true);
        } else {
          setHasExpiredDate(false);
        }

        setForm({
          name: data.name || "",
          documentNo: data.documentNo || "",
          expiredDate: formattedDate,
          partnerId: data.partnerId || "",
          categoryId: data.categoryId || "",
        });
        if (data.partnerId) setIsPartnerDoc(true);
        if (data.filePath) setFileName(data.filePath.split("/").pop() || "");
      })
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat data dokumen.")));
  }, [edit, id]);

  useEffect(() => {
    if (edit || !category || form.categoryId || !categories.length) return;
    const matchedCategory = categories.find((item) => item.slug === category);
    if (matchedCategory) {
      setForm((current) => ({ ...current, categoryId: matchedCategory.id }));
    }
  }, [categories, category, edit, form.categoryId]);

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
    if (isPartnerDoc && !form.partnerId) {
      setError("Mitra wajib dipilih untuk dokumen milik mitra.");
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

      if (edit && id) {
        await documentService.updateDocument(id, formData);
      } else {
        await documentService.uploadDocument(formData);
      }

      router.push(category ? `/dokumen/${category}` : "/dokumen/legalitas");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan dokumen."));
    }
  }

  return (
    <div>
      <PageHeader title={(edit ? "Edit" : "Tambah") + " Dokumen"} subtitle="Upload dokumen perusahaan atau mitra." />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-6"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <SelectInput
                label="Kategori*"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                options={[{ label: "Pilih kategori...", value: "" }, ...categories.map((cat) => ({ label: cat.name, value: cat.id }))]}
              />
            </div>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Nama<span className="text-rose-500">*</span>
              </span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Masukkan Nama"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Nomor Surat / Dokumen</span>
              <input
                value={form.documentNo}
                onChange={(e) => setForm({ ...form, documentNo: e.target.value })}
                placeholder="Nomor Surat (opsional)"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiredDate}
                  onChange={(e) => setHasExpiredDate(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-slate-700">Memiliki Masa Berlaku / Kedaluwarsa</span>
              </label>

              {hasExpiredDate && (
                <div className="mt-3 grid gap-2">
                  <span className="text-xs font-medium text-slate-500">Tanggal Kedaluwarsa</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.expiredDate}
                      onChange={(e) => setForm({ ...form, expiredDate: e.target.value })}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPartnerDoc}
                  onChange={(e) => {
                    setIsPartnerDoc(e.target.checked);
                    if (!e.target.checked) setForm({ ...form, partnerId: "" });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-slate-700">Dokumen Milik Mitra / Reseller</span>
              </label>

              {isPartnerDoc && (
                <div className="mt-3 grid gap-2">
                  <SelectInput
                    label="Pilih Mitra*"
                    value={form.partnerId}
                    onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                    options={[{ label: "Pilih mitra...", value: "" }, ...partnerOptions]}
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Unggah Berkas Dokumen {!edit && <span className="text-rose-500">*</span>}
              </span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/20"
              >
                <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-semibold text-slate-700">{fileName ? fileName : "Klik untuk memilih file dokumen"}</p>
                <p className="mt-1 text-xs text-slate-400">Mendukung format PDF, JPG, atau PNG (Maksimal 10MB)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => router.push(category ? `/dokumen/${category}` : "/dokumen/legalitas")}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
              Simpan Dokumen
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export const LegalitasPage = () => <DocumentListPage />;
export const MouPage = () => <GenericDocumentPage categorySlug="mou" title="MoU" subtitle="Dokumen Memorandum of Understanding (MoU)." />;
export const PksPage = () => <GenericDocumentPage categorySlug="pks" title="PKS" subtitle="Dokumen Perjanjian Kerja Sama (PKS)." />;
export const SuratKeputusanPage = () => <GenericDocumentPage categorySlug="surat-keputusan" title="Surat Keputusan" subtitle="Dokumen Surat Keputusan (SK) resmi." />;
export const NibPage = () => <GenericDocumentPage categorySlug="nib" title="NIB" subtitle="Dokumen Nomor Induk Berusaha (NIB)." />;
export const NikNpwpPage = () => <GenericDocumentPage categorySlug="nik-npwp" title="NIK & NPWP" subtitle="Dokumen identitas NIK dan NPWP." />;
export const LegalitasMitraPage = () => <GenericDocumentPage categorySlug="legalitas-mitra" title="Legalitas Mitra" subtitle="Kelola seluruh dokumen legalitas mitra." />;
export const LegalitasMitraFormPage = (props: any) => <LegalitasFormPage {...props} category="legalitas-mitra" />;
export const LegalitasViewPage = (props: any) => <LegalitasFormPage {...props} edit={true} />;

