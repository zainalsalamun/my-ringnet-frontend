/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface PopItem {
  id: string;
  popCode: string;
  name: string;
  area: string;
  city: string;
  coordinate: string;
  picName: string;
  picPhone: string;
  status: string;
  [key: string]: any;
}

export const popService = {
  async getList(): Promise<PopItem[]> {
    try {
      const res = await api.post("/location-point/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [{ id: "type", value: "pop" }],
        globalFilter: "",
      });

      const raw = res.data?.data?.data || res.data?.data || res.data?.rows || (Array.isArray(res.data) ? res.data : []);
      return raw.map((item: any) => ({
        id: item.maps_id || item._id || item.id,
        popCode: item.maps_id || item.code || item.popCode || "-",
        name: item.name || item.title || "-",
        area: item.group || item.area || "-",
        city: item.location?.city || item.city || item.address || "-",
        coordinate: item.coordinate || (item.location?.coordinates ? `${item.location.coordinates[1]}, ${item.location.coordinates[0]}` : "-"),
        picName: item.picName || item.pic_name || item.pic?.name || "-",
        picPhone: item.picPhone || item.pic_phone || item.pic_contact || item.pic?.phone || "-",
        status: item.status || "active",
      }));
    } catch {
      const res = await api.get("/pops");
      return res.data?.data || [];
    }
  },

  async getDetail(id: string) {
    try {
      const res = await api.get("/location-point/report/" + id);
      return res.data?.data?.node || res.data?.data;
    } catch {
      const res = await api.get("/pops/" + id);
      return res.data?.data;
    }
  },

  async delete(id: string) {
    try {
      return await api.delete(`/location-point/delete/${id}`);
    } catch {
      return await api.delete(`/pops/${id}`);
    }
  },

  async create(data: any) {
    try {
      return await api.post("/location-point/create", data);
    } catch {
      return await api.post("/pops", data);
    }
  },

  async update(id: string, data: any) {
    try {
      return await api.put(`/location-point/update/${id}`, data);
    } catch {
      return await api.put(`/pops/${id}`, data);
    }
  },
};
