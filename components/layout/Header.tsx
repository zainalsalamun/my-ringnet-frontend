import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-4 flex-1">
        <button className="text-slate-500 hover:text-slate-700 lg:hidden">
          <Menu size={20} />
        </button>
        
        <div className="relative max-w-md w-full hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Cari pelanggan, invoice, layanan..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-medium text-slate-400">Ctrl + K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
            3
          </span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <button className="flex items-center space-x-3 text-left">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
            {/* Fallback avatar */}
            <span className="text-sm font-semibold text-slate-600">AR</span>
            {/* Real avatar can go here with next/image */}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">Admin RingNet</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <ChevronDown size={16} className="text-slate-400 hidden md:block ml-1" />
        </button>
      </div>
    </header>
  );
}
