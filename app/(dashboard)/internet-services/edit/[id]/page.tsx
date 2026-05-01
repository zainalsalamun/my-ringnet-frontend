"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditInternetService() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [formData, setFormData] = useState({
    customer_name: "",
    no_faktur: "",
    no_invoice: "",
    service_type: "",
    period_month: 1,
    period_year: 2025,
    amount: 0,
    status: "UNPAID",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/internet-services/${id}`)
        .then(res => {
          const data = res.data.data;
          setFormData({
            customer_name: data.customerName || "",
            no_faktur: data.noFaktur || "",
            no_invoice: data.noInvoice || "",
            service_type: data.serviceType || "",
            period_month: data.periodMonth || 1,
            period_year: data.periodYear || 2025,
            amount: data.amount ? Number(data.amount) : 0,
            status: data.status || "UNPAID",
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Gagal mengambil data", err);
          alert("Layanan internet tidak ditemukan.");
          router.push("/internet-services");
        });
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/internet-services/${id}`, {
        ...formData,
        period_month: Number(formData.period_month),
        period_year: Number(formData.period_year),
        amount: Number(formData.amount),
      });
      router.push("/internet-services");
    } catch (err) {
      console.error("Gagal mengupdate data", err);
      alert("Gagal mengupdate layanan internet.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Edit Layanan Internet</h1>
        <Link href="/internet-services" className="text-slate-500 hover:text-slate-800">
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelanggan</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.customer_name}
              onChange={e => setFormData({...formData, customer_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No Faktur</label>
              <input 
                required
                type="text" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.no_faktur}
                onChange={e => setFormData({...formData, no_faktur: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No Invoice</label>
              <input 
                required
                type="text" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.no_invoice}
                onChange={e => setFormData({...formData, no_invoice: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Layanan</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.service_type}
              onChange={e => setFormData({...formData, service_type: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
              <input 
                required
                type="number" 
                min="1" max="12"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.period_month}
                onChange={e => setFormData({...formData, period_month: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
              <input 
                required
                type="number" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.period_year}
                onChange={e => setFormData({...formData, period_year: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tagihan (Rp)</label>
              <input 
                required
                type="number" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="UNPAID">UNPAID (Belum Lunas)</option>
                <option value="PAID">PAID (Lunas)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
