export const currency = (value: number | string = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const date = (value?: string | Date | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const monthName = (month?: number | string) => {
  const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return names[Number(month || 1) - 1] || "-";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractArrayData<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.list)) return payload.list;
  if (payload.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.data)) return payload.data.data;
    if (Array.isArray(payload.data.rows)) return payload.data.rows;
    if (Array.isArray(payload.data.items)) return payload.data.items;
    if (Array.isArray(payload.data.list)) return payload.data.list;
  }
  return [];
}

