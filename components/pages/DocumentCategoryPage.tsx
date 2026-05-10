"use client";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Card, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";

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
    api.get("/document-categories")
      .then(res => setRows(res.data.data))
      .catch(() => setToast("Gagal memuat kategori."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast("");
    if (!formName.trim()) return setToast("Nama kategori diperlukan.");
    
    try {
      if (editId) {
        await api.put(`/document-categories/${editId}`, { name: formName });
        setToast("Kategori berhasil diperbarui.");
      } else {
        await api.post("/document-categories", { name: formName });
        setToast("Kategori berhasil ditambahkan.");
      }
      setFormName("");
      setEditId("");
      load();
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menyimpan kategori.");
    }
  }

  function confirmDelete(row: any) {
    setDeleteConfirm(row);
  }

  async function executeDelete() {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/document-categories/${deleteConfirm.id}`);
      setToast("Kategori berhasil dihapus.");
      load();
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menghapus kategori.");
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

      {/* Delete Confirmation Modal */}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Create/Edit */}
        <div className="lg:col-span-1">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-bold text-slate-800">{editId ? "Edit Kategori" : "Tambah Kategori"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-500">Nama Kategori</span>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Surat Kuasa"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <div className="flex gap-2">
                <button type="submit" className="h-10 flex-1 rounded-lg bg-indigo-600 font-semibold text-white transition hover:bg-indigo-700">
                  Simpan
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(""); setFormName(""); }} className="h-10 rounded-lg border border-slate-200 px-4 font-semibold text-slate-600 hover:bg-slate-50">
                    Batal
                  </button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Data List */}
        <div className="lg:col-span-2">
          {loading ? <TableSkeleton columns={2} /> : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold tracking-wide text-slate-500">
                      <th className="px-5 py-4">Nama Kategori</th>
                      <th className="px-5 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {rows.length === 0 ? (
                      <tr><td colSpan={2} className="px-5 py-8 text-center text-slate-400">Belum ada kategori.</td></tr>
                    ) : rows.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 text-slate-900 font-bold">{row.name}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(row)} className="text-xs font-semibold text-indigo-600 hover:underline">Edit</button>
                            <span className="text-slate-300">|</span>
                            <button onClick={() => confirmDelete(row)} className="text-xs font-semibold text-rose-600 hover:underline">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
