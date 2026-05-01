"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function CreatePelangganPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    area: "",
    customerType: "Individu",
    notes: "",
    role: "pelanggan",
  });
  
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend expects User payload for now.
      await api.post("/users", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: "password123", // Default password for newly created user
      });
      router.push("/users/pelanggan");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menambahkan pelanggan.";
      setErrorDialog({ isOpen: true, message: msg });
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header & Breadcrumb */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Pelanggan</h1>
          <p className="text-sm text-slate-500 mt-1">Dashboard / Pelanggan / Tambah</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-sm font-bold text-slate-800 mb-6">Informasi Pelanggan</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Nama Lengkap</label>
                <input 
                  required
                  type="text" 
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">No Telepon</label>
                <input 
                  type="text" 
                  placeholder="0812-3456-7890"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Area</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 appearance-none"
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                >
                  <option value="">Pilih area</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bekasi">Bekasi</option>
                  <option value="Depok">Depok</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Kota</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 appearance-none"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                >
                  <option value="">Pilih kota</option>
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Bekasi Barat">Bekasi Barat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Tipe Pelanggan</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 appearance-none"
                  value={formData.customerType}
                  onChange={e => setFormData({...formData, customerType: e.target.value})}
                >
                  <option value="Individu">Individu</option>
                  <option value="Perusahaan">Perusahaan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Catatan tambahan (opsional)</label>
                <textarea 
                  rows={4}
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-10">
            <Link 
              href="/users/pelanggan"
              className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* Error Dialog Modal */}
      {errorDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Gagal Menyimpan</h3>
            <p className="text-slate-600 text-center text-sm mb-6">
              {errorDialog.message}
            </p>
            <button 
              onClick={() => setErrorDialog({ isOpen: false, message: "" })}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
