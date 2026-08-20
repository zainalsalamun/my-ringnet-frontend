/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface PrivilegeItem {
  id: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
  [key: string]: any;
}

export const privilegeApi = {
  async getMyPrivileges() {
    try {
      const res = await api.get("/privilege/me");
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  async getRolePrivileges(role: string) {
    try {
      const res = await api.get(`/privilege/role/${role}`);
      return res.data?.data;
    } catch {
      return null;
    }
  },

  async updatePrivilege(role: string, permissions: Record<string, boolean>) {
    try {
      const res = await api.post("/privilege/update", { role, permissions });
      return res.data?.data;
    } catch {
      return null;
    }
  },
};
