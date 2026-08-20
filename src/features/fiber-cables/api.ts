/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface FiberCableItem {
  id: string;
  name: string;
  code?: string;
  coreCapacity: number | string;
  usedCore?: number | string;
  startPoint?: string;
  endPoint?: string;
  lengthMeters?: number;
  status: string;
  createdAt?: string;
  [key: string]: any;
}

export const fiberCableApi = {
  async getList(): Promise<FiberCableItem[]> {
    try {
      const res = await api.get("/fiber-cables/list");
      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((item: any) => ({
          id: item.id || item.cable_id || item.name,
          name: item.name || item.label || "Kabel FO",
          code: item.code || item.cable_code || "-",
          coreCapacity: item.core_capacity || item.coreCapacity || item.core || 24,
          usedCore: item.used_core || item.usedCore || item.used || 0,
          startPoint: item.start_point || item.startPoint || item.from || "-",
          endPoint: item.end_point || item.endPoint || item.to || "-",
          lengthMeters: item.length_meters || item.length || 0,
          status: item.status === true || item.status === "active" ? "active" : "nonactive",
          createdAt: item.created_at || item.createdAt,
        }));
      }
    } catch {
      // fallback to location-point nodes
      try {
        const res = await api.post("/location-point/list", {
          pageSize: 500,
          pageIndex: 0,
          sorting: [],
          columnFilters: [{ id: "type", value: "cable" }],
          globalFilter: "",
        });
        const raw = res.data?.data?.data || res.data?.data || [];
        if (Array.isArray(raw)) {
          return raw.map((item: any) => ({
            id: item.id || item.maps_id,
            name: item.name || "Kabel Backbone",
            code: item.maps_id || "-",
            coreCapacity: 24,
            usedCore: 12,
            startPoint: item.area || "-",
            endPoint: item.city || "-",
            status: item.status || "active",
            createdAt: item.createdAt,
          }));
        }
      } catch {
        // ignore
      }
    }
    return [];
  },

  async create(payload: Record<string, any>) {
    const res = await api.post("/fiber-cables/create", payload);
    return res.data?.data;
  },

  async getCapacities(): Promise<number[]> {
    try {
      const res = await api.get("/fiber-cables/core-capacities");
      return res.data?.data || [6, 12, 24, 48, 96, 144, 288];
    } catch {
      return [6, 12, 24, 48, 96, 144, 288];
    }
  },
};
