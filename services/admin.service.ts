/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface AdminUserItem {
  id: string;
  adminId?: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  position?: string;
  division?: string;
  status?: string;
  createdAt?: string;
  lastLogin?: string;
}

export const adminService = {
  async getList(): Promise<AdminUserItem[]> {
    try {
      const res = await api.post("/admin/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {
          admin_id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          status: true,
          division: true,
          position: true,
          last_login: true,
        },
        withDeleted: false,
      });

      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || res.data?.list || [];
      return raw
        .map((item: any) => {
          const isSuper = item.super === true || item.role === "super_admin" || String(item.position || "").toLowerCase().includes("super");
          return {
            id: String(item.admin_id || item.adminId || item.id || item._id || ""),
            adminId: item.admin_id || item.adminId,
            name: item.name || item.username || "-",
            username: item.username || "",
            email: item.email || item.username || "",
            phone: item.phone || "",
            role: isSuper ? "super_admin" : item.role || "admin",
            position: item.position || (isSuper ? "Super Admin" : "Administrator"),
            division: item.division || (isSuper ? "Management" : "Operational"),
            status: item.status === true || item.status === "active" ? "active" : "nonactive",
            createdAt: item.created_at || item.createdAt,
            lastLogin: item.last_login || item.lastLogin,
          };
        })
        .filter((row: AdminUserItem) => row.id);
    } catch {
      const res = await api.get("/users?limit=500");
      const raw = res.data?.data || [];
      return raw.map((item: any) => ({
        id: String(item.id || item._id || ""),
        name: item.name || "-",
        username: item.username || item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        role: item.role || "admin",
        position: item.position || "Administrator",
        division: item.division || "Operational",
        status: item.status || "active",
        createdAt: item.createdAt,
        lastLogin: item.lastLogin,
      }));
    }
  },

  async getListForSelect(): Promise<any[]> {
    try {
      const res = await api.post("/admin/list", {
        pageSize: 100,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      return res.data?.data?.data || res.data?.data || res.data?.rows || [];
    } catch {
      return this.getList();
    }
  },

  async getUsersByRole(role: string): Promise<any[]> {
    const res = await api.get(`/users?role=${role}`);
    return res.data?.data || [];
  },

  async getDetail(id: string) {
    try {
      const res = await api.get(`/admin/read/${id}`);
      return res.data?.data;
    } catch {
      const res = await api.get(`/users/${id}`);
      return res.data?.data;
    }
  },

  async toggleStatus(id: string) {
    return api.patch("/admin/change-status", { id });
  },

  async create(payload: any) {
    try {
      return await api.post("/admin/create", payload);
    } catch {
      return await api.post("/users", payload);
    }
  },

  async update(id: string, payload: any) {
    try {
      return await api.patch("/admin/update", { selectedAdminId: id, ...payload });
    } catch {
      return await api.put(`/users/${id}`, payload);
    }
  },

  async deleteUser(id: string) {
    try {
      return await api.delete(`/admin/delete/${id}`);
    } catch {
      return await api.delete(`/users/${id}`);
    }
  },

  async getNotifications() {
    const res = await api.get("/dashboard/notifications");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async markNotificationRead(id: string) {
    return api.post(`/dashboard/notifications/${encodeURIComponent(id)}/read`);
  },

  async markAllNotificationsRead(notificationIds: string[]) {
    return api.post("/dashboard/notifications/read-all", { notificationIds });
  },

  async logout() {
    return api.get("/admin/logout");
  },
};
