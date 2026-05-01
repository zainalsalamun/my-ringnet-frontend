"use client";

import Link from 'next/link';
import Image from 'next/image';
import { 
  Home, 
  Users, 
  Megaphone, 
  Globe, 
  Wallet, 
  FileText, 
  Settings,
  ChevronDown,
  HeadphonesIcon
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-[260px] h-screen bg-[#111827] text-slate-300 flex flex-col font-sans overflow-y-auto">
      {/* Logo Area */}
      <div className="p-6 pb-2">
        <div className="flex items-center space-x-3 mb-1">
          <div className="w-8 h-8 relative">
            {/* Fallback to text if image fails */}
            <Image 
              src="/assets/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="w-full h-full bg-blue-500 rounded text-white flex items-center justify-center font-bold text-xs -z-10 absolute inset-0">
              RN
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">MyRingNet</h1>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 ml-11">ISP Management System</p>
      </div>

      {/* Main Menu Button */}
      <div className="px-4 mt-6 mb-4">
        <Link href="/dashboard" className="flex items-center space-x-3 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <Home size={18} />
          <span className="font-medium text-sm">Dashboard</span>
        </Link>
      </div>

      <div className="px-6 mb-2">
        <p className="text-xs font-semibold text-slate-500 tracking-wider">MENU UTAMA</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-white hover:bg-slate-800 transition-colors">
          <Home size={18} className="text-slate-400" />
          <span className="text-sm">Beranda</span>
        </Link>
        
        <div>
          <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
            <div className="flex items-center space-x-3">
              <Users size={18} className="text-slate-400" />
              <span className="text-sm">Pengguna</span>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          <div className="pl-11 pr-4 py-1 space-y-1">
            <Link href="/users/admin" className="block py-1.5 text-sm text-slate-400 hover:text-white transition-colors">Admin</Link>
            <Link href="/users/pelanggan" className="block py-1.5 text-sm text-slate-400 hover:text-white transition-colors">Pelanggan</Link>
            <Link href="/users/mitra" className="block py-1.5 text-sm text-slate-400 hover:text-white transition-colors">Mitra</Link>
          </div>
        </div>

        <Link href="/marketing" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
          <Megaphone size={18} className="text-slate-400" />
          <span className="text-sm">Marketing</span>
        </Link>

        <Link href="/internet-services" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
          <Globe size={18} className="text-slate-400" />
          <span className="text-sm">Layanan Internet</span>
        </Link>

        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
          <div className="flex items-center space-x-3">
            <Wallet size={18} className="text-slate-400" />
            <span className="text-sm">Keuangan</span>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
          <div className="flex items-center space-x-3">
            <FileText size={18} className="text-slate-400" />
            <span className="text-sm">Laporan</span>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
          <div className="flex items-center space-x-3">
            <Settings size={18} className="text-slate-400" />
            <span className="text-sm">Pengaturan</span>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </nav>

      {/* Footer Info Area */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white">RingNet ISP</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Aktif</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">Administrator</p>
          <p className="text-[10px] text-slate-500">Lisensi berlaku hingga<br/>31 Desember 2025</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-white mb-1">Butuh Bantuan?</h4>
          <p className="text-xs text-slate-400 mb-3">Hubungi tim support kami</p>
          <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors">
            <HeadphonesIcon size={16} />
            <span>Hubungi Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
