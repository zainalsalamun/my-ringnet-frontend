/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export const technicalDataApi = {
  listLocationPoints(body: Record<string, unknown>) {
    return api.post("/location-point/list", body);
  },

  mapMarkers() {
    return api.get("/location-point/map-markers");
  },

  mapMarkerTypes() {
    return api.get("/location-point/map-marker-types");
  },

  getNodeReport(mapsId: string) {
    return api.get(`/location-point/report/${mapsId}`);
  },

  getSnmpInterfaces(payload?: Record<string, any>) {
    return api.post("/utils/snmp-interfaces", payload || {});
  },
};
