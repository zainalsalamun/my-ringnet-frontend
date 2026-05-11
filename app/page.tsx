"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Lock, Mail, RadioTower, Wifi } from "lucide-react";

function getLoginErrorMessage(err: any) {
  if (!err.response) {
    return "Server tidak merespons. Pastikan backend aktif dan koneksi API benar.";
  }

  const status = err.response.status;
  const rawMessage = String(err.response?.data?.message || "").toLowerCase();

  if (rawMessage.includes("wrong password") || rawMessage.includes("password salah")) {
    return "Password salah. Masukkan password yang sesuai untuk akun ini.";
  }

  if (rawMessage.includes("user not found") || rawMessage.includes("email tidak terdaftar")) {
    return "Email tidak terdaftar. Periksa kembali alamat email Anda.";
  }

  if (status === 401) {
    return "Email atau password tidak sesuai. Periksa kembali data login Anda.";
  }

  if (status === 404) {
    return "Akun tidak ditemukan. Pastikan email sudah terdaftar.";
  }

  if (status >= 500) {
    return "Server sedang bermasalah. Coba beberapa saat lagi atau hubungi administrator.";
  }

  return err.response?.data?.message || "Login gagal. Periksa email dan password Anda.";
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const [email, setEmail] = useState("admin@ringnet.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      setSession(res.data.data.token, res.data.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      logout();
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My<span className="text-indigo-300">Ring</span>Net</h1>
          <p className="mt-2 text-sm text-indigo-100">ISP Management System</p>
        </div>
        <div className="relative mx-auto grid aspect-square w-[560px] max-w-full place-items-center rounded-full bg-white/5">
          <div className="absolute h-80 w-80 rounded-full border border-white/10" />
          <RadioTower className="absolute bottom-20 left-24 text-indigo-200" size={160} strokeWidth={1.2} />
          <Wifi className="absolute right-32 top-28 text-indigo-200" size={96} strokeWidth={1.4} />
          <div className="absolute bottom-24 right-24 h-44 w-44 rounded-2xl bg-white/15 shadow-2xl backdrop-blur" />
          <div className="absolute bottom-16 right-44 h-64 w-28 rounded-t-2xl bg-indigo-300/30 shadow-2xl backdrop-blur" />
        </div>
        <p className="text-sm text-indigo-100">Kelola pelanggan, tagihan, mitra, dan layanan internet dari satu dashboard.</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/80">
          <h2 className="text-2xl font-bold text-slate-950">Selamat Datang</h2>
          <p className="mt-2 text-sm text-slate-500">Silakan masuk untuk melanjutkan.</p>
          {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </label>
          <button disabled={loading} className="mt-6 h-11 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-70">{loading ? "Memproses..." : "Masuk"}</button>
          <p className="mt-6 text-center text-xs text-slate-400">© 2026 MyRingNet. All rights reserved.</p>
        </form>
      </section>
    </main>
  );
}
