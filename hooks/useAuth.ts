"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string; role: string };

type AuthState = {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => {
    localStorage.setItem("ringnet_token", token);
    localStorage.setItem("ringnet_user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("ringnet_token");
    localStorage.removeItem("ringnet_user");
    set({ token: null, user: null });
  },
  hydrate: () => {
    const token = localStorage.getItem("ringnet_token");
    const saved = localStorage.getItem("ringnet_user");
    set({ token, user: saved ? JSON.parse(saved) : null });
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
