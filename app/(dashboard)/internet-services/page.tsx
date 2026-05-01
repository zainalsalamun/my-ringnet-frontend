"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";

export default function Page() {
  const [data, setData] = useState([]);

  const fetchData = () => {
    api.get("/internet-services").then((res) => {
      setData(res.data.data || []);
    }).catch(err => {
      console.error("Failed to fetch internet services", err);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await api.delete(`/internet-services/${id}`);
        fetchData();
      } catch (err) {
        console.error("Failed to delete", err);
        alert("Gagal menghapus data");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Layanan Internet</h1>
        <Link 
          href="/internet-services/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          + Tambah Layanan
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600">No Invoice</th>
              <th className="p-4 font-semibold text-slate-600">Nama</th>
              <th className="p-4 font-semibold text-slate-600">Periode</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((item: any) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{item.noInvoice}</td>
                <td className="p-4 text-slate-600">{item.customerName}</td>
                <td className="p-4 text-slate-600">{item.periodMonth}/{item.periodYear}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status || 'UNPAID'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link 
                    href={`/internet-services/edit/${item.id}`}
                    className="inline-flex p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Belum ada data layanan internet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
