"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Search, ChevronDown, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function PelangganUsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    // Placeholder fetching, eventually maps to customers API
    api.get("/users?role=pelanggan").then((res) => {
      setData(res.data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch pelanggan", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchData();
      } catch (err) {
        console.error("Failed to delete", err);
        alert("Gagal menghapus pelanggan");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pelanggan</h1>
          <p className="text-sm text-slate-500 mt-1">Dashboard / Pelanggan</p>
        </div>
        <Link 
          href="/users/pelanggan/create" 
          className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span>+</span> Tambah Pelanggan
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau kontak..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option>Semua Area</option>
                <option>Jakarta</option>
                <option>Bekasi</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option>Status</option>
                <option>Aktif</option>
                <option>Nonaktif</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Kontak</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Area</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Paket</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500 text-sm">Loading...</td></tr>
              ) : data.length > 0 ? data.map((user: any, index: number) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">Jakarta</td>
                  <td className="px-6 py-4 text-sm text-slate-500">Mega 50Mbps</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                      Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    Belum ada data pelanggan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-medium text-slate-700">1 - {data.length}</span> dari <span className="font-medium text-slate-700">{data.length}</span> data
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#2563EB] text-white text-sm font-medium flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center justify-center transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center justify-center transition-colors">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center justify-center transition-colors">10</button>
            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
