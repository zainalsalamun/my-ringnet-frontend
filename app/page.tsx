"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuthStore } from "@/hooks/useAuth";
import { formatErrorMessage } from "@/lib/error";
import { authService } from "@/services";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Lock, RadioTower, User, UserPlus, Wifi } from "lucide-react";
import Link from "next/link";

type DekadataLoginData = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  authToken?: string;
  jwt?: string;
  user?: {
    user?: string;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
    admin_id?: string | number;
    id?: string | number;
    [key: string]: unknown;
  };
  admin?: Record<string, unknown>;
  data?: any;
  message?: string;
  [key: string]: unknown;
};

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved =
        window.localStorage.getItem("ringnet_saved_login_user") ||
        window.localStorage.getItem("ringnet_saved_login_email") ||
        "";
      if (saved) {
        setUsername(saved);
        setRememberLogin(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanUsername = username.trim();

      const resData = (await authService.login({
        username: cleanUsername,
        password,
      })) as DekadataLoginData;

      if (rememberLogin) {
        window.localStorage.setItem("ringnet_saved_login_user", cleanUsername);
        window.localStorage.setItem("ringnet_saved_login_email", cleanUsername);
      } else {
        window.localStorage.removeItem("ringnet_saved_login_user");
        window.localStorage.removeItem("ringnet_saved_login_email");
      }

      const token =
        resData?.data?.token ||
        resData?.token ||
        resData?.authToken ||
        resData?.data?.accessToken ||
        resData?.accessToken ||
        resData?.data?.authToken ||
        resData?.data?.jwt ||
        resData?.jwt;

      let userData =
        resData?.data?.user ||
        resData?.data?.admin ||
        resData?.user ||
        resData?.admin ||
        resData?.data;

      if (!token) {
        const message = typeof resData?.message === "string" ? resData.message : "Token autentikasi tidak ditemukan.";
        throw new Error(message);
      }

      try {
        const meData = await authService.getMe(token);
        if (meData) {
          userData = meData.user || meData.admin || meData;
        }
      } catch {
        // Fallback to userData from login response
      }

      if (userData && typeof userData === "object" && "user" in userData && !("name" in userData)) {
        userData = {
          ...userData,
          name: String(userData.user || cleanUsername),
          username: cleanUsername,
          role: "admin",
        };
      }

      setSession(token, userData || { username: cleanUsername });
      router.push("/dashboard");
    } catch (err: any) {
      logout();
      setError(formatErrorMessage(err, "Login gagal. Periksa username dan password Anda."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            My<span className="text-indigo-300">Ring</span>Net
          </h1>
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
            <span className="mb-2 block text-sm font-semibold text-slate-700">Username atau Email</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="username atau email@ringnet.com"
                required
                className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                required
                className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={rememberLogin}
              onChange={(event) => setRememberLogin(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Simpan data login
          </label>
          <button disabled={loading} className="mt-6 h-11 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-70">
            {loading ? "Memproses..." : "Masuk"}
          </button>
          <Link href="/register-mitra" className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 text-sm font-bold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100">
            <UserPlus size={17} /> Daftar sebagai Reseller / Mitra
          </Link>
          <p className="mt-6 text-center text-xs text-slate-400">© 2026 MyRingNet. All rights reserved.</p>
        </form>
      </section>
    </main>
  );
}
