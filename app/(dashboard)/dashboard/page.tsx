"use client";

import { 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  ChevronDown,
  Eye,
  FileBox,
  CreditCard,
  UserPlus,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const revenueData = [
  { name: 'Des 2024', value: 600000000 },
  { name: 'Jan 2025', value: 800000000 },
  { name: 'Feb 2025', value: 950000000 },
  { name: 'Mar 2025', value: 1100000000 },
  { name: 'Apr 2025', value: 1300000000 },
  { name: 'Mei 2025', value: 1248750000 },
];

const invoiceStatusData = [
  { name: 'Lunas', value: 1987, color: '#22c55e' },
  { name: 'Belum Lunas', value: 435, color: '#f59e0b' },
  { name: 'Terlambat', value: 141, color: '#ef4444' },
];

const recentInvoices = [
  { id: 'INV/2025/05/2631', name: 'Budi Santoso', service: 'Mega 50Mbps', period: 'Mei 2025', amount: 'Rp 350.000', dueDate: '10 Juni 2025', status: 'Lunas' },
  { id: 'INV/2025/05/2630', name: 'Siti Rahmawati', service: 'Ultra 100Mbps', period: 'Mei 2025', amount: 'Rp 450.000', dueDate: '10 Juni 2025', status: 'Belum Lunas' },
  { id: 'INV/2025/05/2629', name: 'Ahmad Yani', service: 'Mega 20Mbps', period: 'Mei 2025', amount: 'Rp 250.000', dueDate: '10 Juni 2025', status: 'Terlambat' },
  { id: 'INV/2025/05/2628', name: 'Dewi Lestari', service: 'Ultra 50Mbps', period: 'Mei 2025', amount: 'Rp 400.000', dueDate: '10 Juni 2025', status: 'Lunas' },
  { id: 'INV/2025/05/2627', name: 'Rudi Hermawan', service: 'Mega 10Mbps', period: 'Mei 2025', amount: 'Rp 200.000', dueDate: '10 Juni 2025', status: 'Belum Lunas' },
];

const activities = [
  { id: 1, type: 'invoice', title: 'Invoice baru dibuat', desc: 'INV/2025/05/2631', time: '2 menit lalu', icon: FileBox, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 2, type: 'payment', title: 'Pembayaran diterima', desc: 'INV/2025/05/2628', time: '15 menit lalu', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 3, type: 'user', title: 'Pelanggan baru', desc: 'Budi Santoso', time: '1 jam lalu', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 4, type: 'change', title: 'Paket diubah', desc: 'Mega 20Mbps → Mega 50Mbps', time: '2 jam lalu', icon: ArrowRightLeft, color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 5, type: 'alert', title: 'Pembayaran tertunda', desc: 'INV/2025/05/2601', time: '3 jam lalu', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan performa bisnis dan operasional ISP Anda</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500">Periode</span>
          <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            <Calendar size={16} className="text-slate-400" />
            <span>01 Mei 2025 - 31 Mei 2025</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Pelanggan</p>
              <h3 className="text-2xl font-bold text-slate-800">1.248</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
              <Users size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-emerald-500 font-semibold mr-2">
              <ArrowUpRight size={14} className="mr-0.5" />
              12.5%
            </span>
            <span className="text-slate-400">dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Invoice</p>
              <h3 className="text-2xl font-bold text-slate-800">2.563</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_4px_10px_rgba(16,185,129,0.3)]">
              <FileText size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-emerald-500 font-semibold mr-2">
              <ArrowUpRight size={14} className="mr-0.5" />
              8.7%
            </span>
            <span className="text-slate-400">dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pendapatan</p>
              <h3 className="text-2xl font-bold text-slate-800">Rp 1.248.750.000</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-[0_4px_10px_rgba(245,158,11,0.3)] flex-shrink-0">
              <span className="font-bold text-lg">Rp</span>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-emerald-500 font-semibold mr-2">
              <ArrowUpRight size={14} className="mr-0.5" />
              15.3%
            </span>
            <span className="text-slate-400">dari bulan lalu</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tunggakan</p>
              <h3 className="text-2xl font-bold text-slate-800">Rp 235.450.000</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-[0_4px_10px_rgba(99,102,241,0.3)] flex-shrink-0">
              <BarChart3 size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-red-500 font-semibold mr-2">
              <ArrowDownRight size={14} className="mr-0.5" />
              4.2%
            </span>
            <span className="text-slate-400">dari bulan lalu</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Pendapatan 6 Bulan Terakhir</h3>
            <button className="flex items-center space-x-1 text-sm text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <span>6 Bulan</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000000}jt`} />
                <Tooltip 
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800">Status Invoice</h3>
            <button className="flex items-center space-x-1 text-sm text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <span>Bulan Ini</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-[240px]">
            <div className="h-[160px] w-[160px] relative -mt-4">
              <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-4 space-y-2">
              {invoiceStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-slate-800">{item.value.toLocaleString('id-ID')}</span>
                    <span className="text-slate-400 w-10 text-right">
                      {((item.value / 2563) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Aktivitas Terbaru</h3>
          </div>
          <div className="space-y-4">
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start">
                  <div className={`w-9 h-9 rounded-full ${act.bg} ${act.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={16} />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="w-full mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 py-2">
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-800">Invoice Terbaru</h3>
          <button className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
            Lihat Semua Invoice
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">No Invoice</th>
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Layanan</th>
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Periode</th>
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tagihan</th>
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Jatuh Tempo</th>
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="pb-3 pt-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-2 text-sm font-medium text-blue-600">{inv.id}</td>
                  <td className="py-3 px-2 text-sm text-slate-800">{inv.name}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{inv.service}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{inv.period}</td>
                  <td className="py-3 px-2 text-sm font-semibold text-slate-800">{inv.amount}</td>
                  <td className="py-3 px-2 text-sm text-slate-600">{inv.dueDate}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 
                      inv.status === 'Belum Lunas' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors inline-flex">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
