/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export function formatErrorMessage(error: unknown, fallback: string = "Terjadi kesalahan saat memproses data."): string {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as any;

    if (responseData?.message && typeof responseData.message === "string") {
      return responseData.message;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors.map((e: any) => e.message || String(e)).join(", ");
    }

    if (status === 401) {
      return "Sesi login Anda telah berakhir atau tidak valid. Silakan login kembali.";
    }

    if (status === 403) {
      return "Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.";
    }

    if (status === 404) {
      return "Data atau layanan yang diminta tidak ditemukan di server (404).";
    }

    if (status === 422) {
      return responseData?.message || "Data formulir tidak valid. Mohon periksa kembali input Anda.";
    }

    if (status && status >= 500) {
      return "Terjadi kendala pada server backend (500). Tim teknis sedang menanganinya.";
    }

    if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      return "Gagal terhubung ke server backend. Periksa koneksi internet atau status backend.";
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
