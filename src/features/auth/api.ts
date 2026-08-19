import api from "@/lib/api";

export const authApi = {
  async login(payload: { username?: string; email?: string; password?: string }) {
    const res = await api.post("/admin/login", payload);
    return res.data;
  },

  async getMe(token?: string) {
    const res = await api.get("/admin/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data?.data;
  },

  async registerMitra(body: FormData) {
    const res = await api.post("/auth/register-mitra", body);
    return res.data?.data;
  },
};
