import api from "@/src/lib/api/client";

export const resourcesApi = {
  list(endpoint: string) {
    return api.get(endpoint);
  },

  remove(endpoint: string, id: string) {
    return api.delete(`${endpoint}/${id}`);
  },
};
