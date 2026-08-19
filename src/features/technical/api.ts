/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface TechnicalItem {
  id: string;
  typeKey: string;
  category: "active" | "passive" | "pop";
  assetType: string;
  name: string;
  serialNo: string;
  ipAddress: string;
  location: string;
  coordinate: string;
  status: string;
  [key: string]: any;
}

function technicalKey(row: any) {
  const raw = String(
    row.assetType ||
      row.asset_type ||
      row.markerType ||
      row.marker_type ||
      row.type ||
      row.category ||
      row.jenis ||
      row.name ||
      row.label ||
      ""
  ).toLowerCase();

  if (raw.includes("router") || raw === "ro") return "router";
  if (raw.includes("switch")) return "switch";
  if (raw.includes("olt") || raw.includes("cpe")) return "olt";
  if (raw.includes("otb")) return "otb";
  if (raw.includes("odc")) return "odc";
  if (raw.includes("odp")) return "odp";
  if (raw.includes("closure")) return "closure";
  if (raw.includes("kabel") || raw.includes("cable") || raw.includes("fiber") || raw.includes("fo")) return "kabel";
  if (raw.includes("pop") || raw.includes("location") || raw.includes("maps")) return "pop";
  return "pop";
}

function technicalLabel(type: string) {
  const labels: Record<string, string> = {
    pop: "POP",
    router: "Router",
    switch: "Switch",
    olt: "OLT",
    otb: "OTB",
    odc: "ODC",
    odp: "ODP",
    kabel: "Kabel",
    closure: "Closure",
  };
  return labels[type] || type.toUpperCase();
}

function coordinateFrom(row: any) {
  const coordinate = row.coordinate || row.coordinates || row.latlng || row.latLng;
  if (coordinate) return String(coordinate);
  const lat = row.latitude ?? row.lat;
  const lng = row.longitude ?? row.lng ?? row.long;
  return lat && lng ? `${lat}, ${lng}` : "-";
}

function normalizeTechnicalRow(row: any): TechnicalItem {
  const typeKey = technicalKey(row);
  const isActive = ["router", "switch", "olt"].includes(typeKey);
  const isPassive = ["otb", "odc", "odp", "kabel", "closure"].includes(typeKey);
  return {
    ...row,
    id: String(row.id || row.maps_id || row.mapsId || row.code || row.name || `${typeKey}-${coordinateFrom(row)}`),
    typeKey,
    category: isActive ? "active" : isPassive ? "passive" : "pop",
    assetType: technicalLabel(typeKey),
    name: row.name || row.label || row.title || row.pop_name || row.site_name || "-",
    serialNo: row.serialNo || row.serial_no || row.sn || row.code || row.maps_id || row.mapsId || "-",
    ipAddress: row.ipAddress || row.ip_address || row.ip || "",
    location: row.location || row.address || [row.area, row.city].filter(Boolean).join(" | ") || "-",
    coordinate: coordinateFrom(row),
    status: row.status === true ? "active" : row.status === false ? "nonactive" : row.status || "active",
  };
}

function extractRows(payload: any): any[] {
  const data = payload?.data;
  if (Array.isArray(data?.markers)) return data.markers;
  if (Array.isArray(data?.features)) return data.features;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload?.markers)) return payload.markers;
  if (Array.isArray(payload?.features)) return payload.features;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
}

function uniqueRows(rows: TechnicalItem[]): TechnicalItem[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.id}-${row.typeKey}-${row.coordinate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const technicalApi = {
  async getTechnicalData(): Promise<TechnicalItem[]> {
    const results = await Promise.allSettled([
      api.post("/location-point/list", {
        pageSize: 500,
        pageIndex: 0,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {
          maps_id: true,
          name: true,
          type: true,
          category: true,
          coordinate: true,
          latitude: true,
          longitude: true,
          lat: true,
          lng: true,
          address: true,
          area: true,
          city: true,
          status: true,
          ip_address: true,
          serial_no: true,
        },
        withDeleted: false,
      }),
      api.get("/location-point/map-markers"),
    ]);

    const listPayload = results[0].status === "fulfilled" ? results[0].value.data : null;
    const markerPayload = results[1].status === "fulfilled" ? results[1].value.data : null;

    const merged = [
      ...extractRows(markerPayload),
      ...extractRows(listPayload),
    ].map(normalizeTechnicalRow);

    return uniqueRows(merged);
  },
};
