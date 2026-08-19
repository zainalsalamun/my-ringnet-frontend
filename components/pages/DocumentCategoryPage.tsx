"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Card, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";
import { documentService } from "@/services";
import { formatErrorMessage } from "@/lib/error";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

export function DocumentCategoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [formName, setFormName] = useState("");
  const [editId, setEditId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  function load() {
    setLoading(true);
    documentService
      .getCategories()
      .then((data) => setRows(data))
      .catch((err) => setToast(formatErrorMessage(err, "Gagal memuat kategori.")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast("");
    if (!formName.trim()) return setToast("Nama kategori diperlukan.");

    try {
      if (editId) {
        await documentService.updateCategory(editId, formName);
        setToast("Kategori berhasil diperbarui.");
      } else {
        await documentService.createCategory(formName);
        setToast("Kategori berhasil ditambahkan.");
      }
      setFormName("");
      setEditId("");
      load();
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal menyimpan kategori."));
    }
  }

  function confirmDelete(row: any) {
    setDeleteConfirm(row);
  }

  async function executeDelete() {
    if (!deleteConfirm) return;
    try {
      await documentService.deleteCategory(deleteConfirm.id);
      setToast("Kategori berhasil dihapus.");
      load();
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal menghapus kategori."));
    }
    setDeleteConfirm(null);
  }

  function handleEdit(row: any) {
    setFormName(row.name);
    setEditId(row.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader title="Kategori Dokumen" subtitle="Kelola daftar kategori dinamis untuk modul Dokumen." />
      <Toast message={toast} />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-bold text-slate-900">Hapus Kategori</h3>
              <p className="mb-6 text-sm text-slate-500">
                Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-slate-800">{deleteConfirm.name}</span>? 
                Aksi ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)} 
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  onClick={executeDelete} 
                  className="flex-1 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-600"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Tambah/Edit */}
      <Card className="mb-8 p-6">
        <h3 className="mb-4 text-base font-bold text-slate-800">
          {editId ? "Edit Kategori Dokumen" : "Tambah Kategori Dokumen Baru"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Nama Kategori
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Misal: Surat Kuasa, Izin Lingkungan..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-2">
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(""); setFormName(""); }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
            >
              {editId ? "Simpan Perubahan" : "Tambah Kategori"}
            </button>
          </div>
        </form>
      </Card>

      {/* Table Data */}
      {loading ? (
        <TableSkeleton columns={3} />
      ) : (
        <DataTable
          data={rows}
          columns={[
            {
              key: "name",
              header: "Nama Kategori",
              render: (row) => <span className="font-semibold text-slate-800">{row.name}</span>,
            },
            {
              key: "slug",
              header: "Slug / Pengenal",
              render: (row) => (
                <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                  {row.slug}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Aksi",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(row)}
                    className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Hapus
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

export default DocumentCategoryPage;
