/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface RadiusNasItem {
  id: string;
  name: string;
  shortname?: string;
  type?: string;
  address?: string;
  targetIp?: string;
  targetPort?: string | number;
  secret?: string;
  server?: string;
  community?: string;
  description?: string;
  status: string;
  createdAt?: string;
  [key: string]: any;
}

export interface BroadbandProfileItem {
  id: string;
  name: string;
  groupname?: string;
  downloadRate?: string | number;
  uploadRate?: string | number;
  rateLimit?: string;
  poolName?: string;
  sharedUsers?: number;
  sessionTimeout?: number;
  idleTimeout?: number;
  price?: number;
  status: string;
  [key: string]: any;
}

export interface BroadbandAuthItem {
  id: string;
  username: string;
  customerName?: string;
  customerCode?: string;
  packageName?: string;
  profileName?: string;
  ipAddress?: string;
  macAddress?: string;
  popName?: string;
  status: string;
  connectivity?: string;
  onlineTime?: string;
  uptime?: string;
  uploadBytes?: number;
  downloadBytes?: number;
  [key: string]: any;
}

export const radiusApi = {
  async getNasList(): Promise<RadiusNasItem[]> {
    try {
      const res = await api.post("/radius-nas/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      if (Array.isArray(raw)) {
        return raw.map((item: any) => ({
          id: item.id || item.nas_id || item.nasname || "-",
          name: item.shortname || item.name || item.nasname || "-",
          shortname: item.shortname || item.name || "-",
          type: item.type || "mikrotik",
          address: item.nasname || item.address || item.targetIp || "-",
          targetIp: item.nasname || item.targetIp || item.address || "-",
          targetPort: item.port || item.targetPort || "3799",
          secret: item.secret || "-",
          server: item.server || "-",
          community: item.community || "-",
          description: item.description || "-",
          status: item.status === true || item.status === "active" ? "Aktif" : "Non-Aktif",
          createdAt: item.created_at || item.createdAt || "-",
        }));
      }
    } catch {
      // ignore
    }
    return [];
  },

  async createNas(payload: Record<string, any>) {
    const res = await api.post("/radius-nas/create", payload);
    return res.data?.data;
  },

  async deleteNas(id: string) {
    const res = await api.delete(`/radius-nas/delete/${id}`);
    return res.data?.data;
  },

  async getProfiles(): Promise<BroadbandProfileItem[]> {
    try {
      const res = await api.post("/broadband-profile/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      if (Array.isArray(raw)) {
        return raw.map((item: any) => ({
          id: item.id || item.profile_id || item.name,
          name: item.name || item.groupname || "-",
          groupname: item.groupname || item.name || "-",
          rateLimit: item.rate_limit || item.rateLimit || `${item.download_rate || 0}M/${item.upload_rate || 0}M`,
          downloadRate: item.download_rate || item.downloadRate || "-",
          uploadRate: item.upload_rate || item.uploadRate || "-",
          poolName: item.pool_name || item.poolName || "default-pool",
          sharedUsers: item.shared_users || 1,
          status: item.status === true || item.status === "active" ? "Aktif" : "Non-Aktif",
        }));
      }
    } catch {
      // ignore
    }
    return [];
  },

  async createProfile(payload: Record<string, any>) {
    const res = await api.post("/broadband-profile/create", payload);
    return res.data?.data;
  },

  async getAuthentications(): Promise<BroadbandAuthItem[]> {
    try {
      const res = await api.post("/broadband/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
      });
      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      if (Array.isArray(raw)) {
        return raw.map((item: any, idx: number) => ({
          id: item.id || `auth-${idx + 1}`,
          customer: `${item.customer_id || item.customerCode || "-"} - ${item.name || item.customerName || "-"}`,
          username: item.username || item.service_username || `${item.customer_id || "user"}@ring.net.id`,
          connectivity: item.status === "active" || item.is_online ? "Terhubung" : "Terputus",
          pop: item.pop?.name || item.pop_name || item.area || "POP Utama",
          ip: item.ip_address || item.ip || "-",
          product: item.package_name || item.product || item.packageName || "-",
          status: item.status === "active" ? "Aktif" : "Nonaktif",
        }));
      }
    } catch {
      // ignore
    }
    return [];
  },

  async createAuthentication(payload: Record<string, any>) {
    try {
      const res = await api.post("/broadband/create", payload);
      return res.data?.data;
    } catch {
      return null;
    }
  },

  async deleteAuthentication(id: string) {
    try {
      const res = await api.delete(`/broadband/delete/${id}`);
      return res.data?.data;
    } catch {
      return null;
    }
  },

  async getIpPools() {
    try {
      const res = await api.get("/network/ipv4/select-radius");
      return res.data?.data || [];
    } catch {
      return [
        { id: "pool-1", name: "pool-broadband-utama", range: "10.10.20.1/24" },
        { id: "pool-2", name: "pool-papringan", range: "10.10.30.1/24" },
        { id: "pool-3", name: "pool-kaliurang", range: "10.10.40.1/24" },
      ];
    }
  },

  async getBroadbandStatus() {
    try {
      const res = await api.get("/broadband/list-status");
      return res.data?.data || null;
    } catch {
      return null;
    }
  },
};
