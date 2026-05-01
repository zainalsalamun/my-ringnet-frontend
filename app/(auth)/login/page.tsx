"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      }, { withCredentials: true });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login gagal, periksa email dan password Anda.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#2563EB]">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-[440px] flex flex-col items-center">
        {/* Logo */}
        <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 p-2">
          {/* Fallback jika gambar belum ada, kita kasih text sementara. Nanti gambar akan diambil dari /assets/logo.png */}
          <div className="relative w-full h-full">
            <Image 
              src="/assets/logo.png" 
              alt="RingNet Logo" 
              fill
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('fallback-logo');
              }}
            />
            <style jsx>{`
              .fallback-logo::after {
                content: 'RN';
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                color: #2563EB;
                font-weight: bold;
                font-size: 2rem;
              }
            `}</style>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">Ringnet Admin</h1>
        <p className="text-sm text-slate-500 mb-8">Silakan masuk ke akun Anda</p>

        <form onSubmit={handleLogin} className="w-full">
          <div className="mb-4">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0d6efd] hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            Masuk
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-400">
          © 2026 Ringnet ISP. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
