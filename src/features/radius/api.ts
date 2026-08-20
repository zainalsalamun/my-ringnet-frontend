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
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((item: any) => ({
          id: item.id || item.nas_id || item.nasname || "-",
          name: item.shortname || item.name || item.nasname || "-",
          shortname: item.shortname || item.name || "-",
          type: item.type || "cisco",
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
      // fallback
    }
    return [
      { id: "nas-1", name: "RO-BASABASI-UMY", status: "Aktif", address: "10.107.11.12", targetIp: "10.107.11.12", targetPort: "3799", createdAt: "25 Oktober 2023" },
      { id: "nas-2", name: "RO-MATO-SELOKAN", status: "Aktif", address: "10.107.11.13", targetIp: "10.107.11.13", targetPort: "3799", createdAt: "25 Oktober 2023" },
      { id: "nas-3", name: "RO-DSB-PAPRINGAN", status: "Aktif", address: "103.162.62.7", targetIp: "103.162.62.7", targetPort: "3799", createdAt: "13 Juli 2023" },
      { id: "nas-4", name: "RO-MATO3-PAMELA", status: "Aktif", address: "10.107.11.11", targetIp: "10.107.11.11", targetPort: "3799", createdAt: "25 Oktober 2023" },
      { id: "nas-5", name: "RO-DSB-WIYORO", status: "Aktif", address: "103.162.62.16", targetIp: "103.162.62.16", targetPort: "3799", createdAt: "14 Juli 2023" },
      { id: "nas-6", name: "RO-DSB-KBL", status: "Aktif", address: "103.162.62.21", targetIp: "103.162.62.21", targetPort: "3799", createdAt: "13 Juli 2023" },
      { id: "nas-7", name: "RO-DSB-SCH", status: "Aktif", address: "103.162.62.32", targetIp: "103.162.62.32", targetPort: "3799", createdAt: "06 Juli 2023" },
      { id: "nas-8", name: "RO-TEST", status: "Aktif", address: "10.107.11.10", targetIp: "10.107.11.10", targetPort: "3799", createdAt: "16 Oktober 2023" },
    ];
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
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((item: any) => ({
          id: item.id || item.profile_id || item.name,
          name: item.name || item.groupname || "-",
          groupname: item.groupname || item.name || "-",
          rateLimit: item.rate_limit || item.rateLimit || `${item.download_rate || 10}M/${item.upload_rate || 10}M`,
          downloadRate: item.download_rate || item.downloadRate || "-",
          uploadRate: item.upload_rate || item.uploadRate || "-",
          poolName: item.pool_name || item.poolName || "default-pool",
          sharedUsers: item.shared_users || 1,
          status: item.status === true || item.status === "active" ? "Aktif" : "Non-Aktif",
        }));
      }
    } catch {
      // fallback
    }
    return [
      { id: "prof-1", name: "RIMAX 1 (10 Mbps)", rateLimit: "10M/10M", poolName: "pool-ponjong", sharedUsers: 1, status: "Aktif" },
      { id: "prof-2", name: "RIMAX 2 (20 Mbps)", rateLimit: "20M/20M", poolName: "pool-papringan", sharedUsers: 1, status: "Aktif" },
      { id: "prof-3", name: "RIMAX 3 (30 Mbps)", rateLimit: "30M/30M", poolName: "pool-wiyoro", sharedUsers: 1, status: "Aktif" },
      { id: "prof-4", name: "RIMAX DEDICATED (50 Mbps)", rateLimit: "50M/50M", poolName: "pool-dedicated", sharedUsers: 1, status: "Aktif" },
    ];
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
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((item: any, idx: number) => ({
          id: item.id || `auth-${idx + 1}`,
          customer: `${item.customer_id || item.customerCode || "-"} - ${item.name || item.customerName || "-"}`,
          username: item.username || item.service_username || `${item.customer_id || "user"}@ring.net.id`,
          connectivity: item.status === "active" || item.is_online ? "Terhubung" : "Terputus",
          pop: item.pop?.name || item.pop_name || item.area || "POP Utama",
          ip: item.ip_address || item.ip || "192.168.1.1",
          product: item.package_name || item.product || item.packageName || "RIMAX",
          status: item.status === "active" ? "Aktif" : "Nonaktif",
        }));
      }
    } catch {
      // fallback
    }
    return [
      { id: "auth-14446", status: "Aktif", customer: "100091433 - Taufik Hidayat", username: "91433taufik@ring.net.id", connectivity: "Terhubung", pop: "Banyumili Ponjong", ip: "192.168.83.15", product: "RIMAX 1" },
      { id: "auth-14447", status: "Aktif", customer: "100091434 - Rina Wahyuni", username: "91434rina@ring.net.id", connectivity: "Terhubung", pop: "Banyumili Ponjong", ip: "192.168.83.16", product: "RIMAX 2" },
      { id: "auth-14448", status: "Aktif", customer: "100091435 - Budi Santoso", username: "91435budi@ring.net.id", connectivity: "Terputus", pop: "Papringan Sleman", ip: "192.168.84.20", product: "RIMAX 1" },
      { id: "auth-14449", status: "Aktif", customer: "100091436 - PT Solusi Digital", username: "solusidigital@ring.net.id", connectivity: "Terhubung", pop: "Wiyoro Bantul", ip: "103.162.62.50", product: "DEDICATED" },
    ];
  },

  async getIpPools() {
    try {
      const res = await api.get("/network/ipv4/select-radius");
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  async getBroadbandStatus() {
    try {
      const res = await api.get("/broadband/list-status");
      return res.data?.data;
    } catch {
      return null;
    }
  },
};
