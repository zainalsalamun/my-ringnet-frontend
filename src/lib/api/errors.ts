import axios from "axios";

export type AppApiError = {
  status?: number;
  title: string;
  message: string;
  raw?: unknown;
};

const DEFAULT_ERROR: AppApiError = {
  title: "Terjadi Kesalahan",
  message: "Permintaan belum berhasil diproses. Silakan coba lagi.",
};

const STATUS_MESSAGES: Record<number, AppApiError> = {
  400: {
    status: 400,
    title: "Request Tidak Valid",
    message: "Data yang dikirim belum sesuai. Periksa kembali form yang diisi.",
  },
  401: {
    status: 401,
    title: "Sesi Berakhir",
    message: "Silakan login ulang untuk melanjutkan.",
  },
  403: {
    status: 403,
    title: "Akses Ditolak",
    message: "Akun Anda belum memiliki akses ke fitur ini.",
  },
  404: {
    status: 404,
    title: "Data Tidak Ditemukan",
    message: "Data atau endpoint yang diminta belum tersedia.",
  },
  422: {
    status: 422,
    title: "Validasi Gagal",
    message: "Beberapa data belum lengkap atau formatnya belum sesuai.",
  },
  500: {
    status: 500,
    title: "Server Bermasalah",
    message: "Server sedang bermasalah. Silakan coba lagi beberapa saat.",
  },
  502: {
    status: 502,
    title: "Backend Tidak Merespons",
    message: "Proxy belum berhasil menghubungi backend. Periksa backend atau koneksi server.",
  },
};

export function toAppApiError(error: unknown): AppApiError {
  if (!axios.isAxiosError(error)) {
    return { ...DEFAULT_ERROR, raw: error };
  }

  const status = error.response?.status;
  const responseData = error.response?.data as { message?: string; error?: string } | undefined;
  const mapped = status ? STATUS_MESSAGES[status] : undefined;

  return {
    ...(mapped || DEFAULT_ERROR),
    status,
    message: responseData?.message || responseData?.error || mapped?.message || DEFAULT_ERROR.message,
    raw: error,
  };
}

export function getApiErrorMessage(error: unknown) {
  return toAppApiError(error).message;
}

