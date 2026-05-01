"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Page() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/internet-services").then((res) => {
      setData(res.data.data || []);
    }).catch(err => {
      console.error("Failed to fetch internet services", err);
    });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Layanan Internet</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
          + Tambah Layanan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600">No Invoice</th>
              <th className="p-4 font-semibold text-slate-600">Nama</th>
              <th className="p-4 font-semibold text-slate-600">Periode</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
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
                    item.status === 'Lunas' ? 'bg-green-100 text-green-700' : 
                    item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status || 'Unknown'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
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
