import api from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export const technicalDataApi = {
  listLocationPoints(body: Record<string, unknown>) {
    return api.post(API_ENDPOINTS.technical.locationPointList, body);
  },

  mapMarkers() {
    return api.get(API_ENDPOINTS.technical.mapMarkers);
  },
};

