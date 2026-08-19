"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export type User = {
  id?: string;
  admin_id?: string | number;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  position?: string;
  division?: string;
  phone?: string;
  image?: string;
  status?: boolean | string;
  [key: string]: any;
};

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setSession: (token, user) => {
    const normalizedUser: User = {
      ...user,
      id: String(user.id || user.admin_id || ""),
      name: user.name || user.username || "User",
      email: user.email || (user.username && user.username.includes("@") ? user.username : ""),
      role: user.role || user.position || "admin",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("ringnet_token", token);
      localStorage.setItem("ringnet_user", JSON.stringify(normalizedUser));
    }
    set({ token, user: normalizedUser, hydrated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ringnet_token");
      localStorage.removeItem("ringnet_user");
    }
    set({ token: null, user: null, hydrated: true });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("ringnet_token");
    const saved = localStorage.getItem("ringnet_user");
    let user: User | null = null;
    try {
      user = saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("ringnet_user");
    }
    set({ token, user, hydrated: true });
  },
}));

export default function useAuth() {
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    const token = localStorage.getItem("ringnet_token");
    if (!token) router.replace("/");
  }, [hydrate, router]);
}

