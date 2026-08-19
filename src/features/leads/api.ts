/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export const leadApi = {
  async getList() {
    const res = await api.get("/leads");
    return res.data?.data || [];
  },

  async getDetail(id: string) {
    const res = await api.get(`/leads/${id}`);
    return res.data?.data;
  },

  async create(body: FormData | Record<string, any>) {
    const res = await api.post("/leads", body);
    return res.data?.data;
  },

  async update(id: string, body: FormData | Record<string, any>) {
    const res = await api.put(`/leads/${id}`, body);
    return res.data?.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/leads/${id}`);
    return res.data?.data;
  },
};
