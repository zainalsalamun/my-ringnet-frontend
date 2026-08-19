"use client";

import { PageHeader } from "@/components/ui/AdminUI";
import { ReactNode } from "react";
import {
  MitraDashboardPage,
  MitraProductsPage,
  MitraCustomersPage,
  MitraFinancePage,
  MitraTicketsPage,
  MitraProfilePage,
  DocumentCards,
  PartnerDocuments,
  LegalPage,
  MitraTechnicalPage,
} from "./mitra";

export { MitraDashboardPage };

const meta: Record<string, [string, string]> = {
  legal: ["POP", "Kelola data dokumen Point of Presence."],
  "syarat-komdigi": ["Syarat dan Ketentuan Komdigi", "Dokumen resmi kepatuhan dan regulasi untuk Mitra."],
  "syarat-operasional": ["Ketentuan Operasional Mitra", "Pedoman operasional yang diterbitkan administrator."],
  pic: ["Data PIC Mitra", "Kelola surat dan dokumen penunjukan PIC."],
  registrasi: ["Data Registrasi Mitra", "Identitas dan status registrasi akun Mitra."],
  ktp: ["Data KTP", "Dokumen identitas PIC Mitra."],
  npwp: ["Data NPWP", "Dokumen perpajakan Mitra."],
  nib: ["Data NIB", "Dokumen Nomor Induk Berusaha."],
  sertifikat: ["Data Sertifikat Standar", "Dokumen sertifikat standar Mitra."],
  pks: ["Data PKS Jasa Jual Kembali", "Dokumen perjanjian kerja sama."],
  "dokumen-pendukung": ["Dokumen Perizinan dan Kerjasama", "Dokumen global yang dikelola oleh Super Admin."],
  tiket: ["Tiket Pelanggan", "Buat dan pantau laporan pelanggan."],
  "cs-online": ["CS Online ke Admin", "Kanal bantuan administrasi dan operasional."],
  "tiket-gangguan": ["Gangguan ke Admin", "Laporkan gangguan teknis."],
  "tiket-layanan": ["PO Layanan ke Admin", "Ajukan kebutuhan layanan ke administrator."],
  "perangkat-aktif": ["Perangkat Aktif", "Router, switch, dan OLT."],
  "perangkat-pasif": ["Perangkat Pasif", "OTB, ODC, ODP, dan kabel."],
  router: ["Router (RO)", "Daftar router upstream Mitra."],
  switch: ["Switch", "Daftar switch jaringan Mitra."],
  olt: ["OLT", "Daftar Optical Line Terminal Mitra."],
  cpe: ["OLT", "Daftar Optical Line Terminal Mitra."],
  sla: ["SLA Pelanggan", "Data kepatuhan SLA pelanggan."],
  otb: ["OTB", "Daftar Optical Termination Box."],
  odc: ["ODC", "Daftar Optical Distribution Cabinet."],
  odp: ["ODP", "Daftar Optical Distribution Point."],
  kabel: ["Kabel", "Daftar kabel infrastruktur FTTH."],
  infrastruktur: ["Map Infrastruktur", "Koordinat infrastruktur jaringan Mitra."],
  produk: ["Produk", "Paket internet yang dapat dipasarkan."],
  pelanggan: ["Data Customer", "Daftar pelanggan yang terhubung ke Mitra."],
  "pendapatan-billing": ["Pencatatan Pendapatan Billing", "Pendapatan dan invoice pelanggan."],
  "kelola-tagihan": ["Kelola Tagihan Pelanggan", "Status penagihan pelanggan Mitra."],
  "berita-acara": ["BA Pelaporan Pendapatan", "Dokumen berita acara rekonsiliasi."],
  "operasional-produk": ["Produk Operasional", "Brosur dan dokumen produk."],
  presales: ["Presales", "Materi pendukung presales."],
  evaluasi: ["Evaluasi Penjualan", "Dokumen evaluasi penjualan Mitra."],
  settings: ["Pengaturan Profil", "PIC, perusahaan, rekening, dokumen, dan paraf digital."],
  profil: ["Profile", "Ringkasan identitas akun Mitra."],
};

export default function MitraPortalSectionPage({ section }: { section: string }) {
  const page = meta[section] || ["Portal Mitra", "Kelola data Mitra."];
  let content: ReactNode;

  if (section === "syarat-komdigi") {
    content = <DocumentCards category="syarat-komdigi" />;
  } else if (section === "syarat-operasional") {
    content = <DocumentCards category="syarat-operasional" />;
  } else if (section === "dokumen-pendukung") {
    content = <DocumentCards category="dokumen-kerjasama,benefit,support-mitra,perizinan-wilayah" />;
  } else if (section === "registrasi" || section === "profil") {
    content = <MitraProfilePage />;
  } else if (section === "settings") {
    content = <MitraProfilePage settings />;
  } else if (section === "legal") {
    content = <LegalPage />;
  } else if (
    ["pic", "ktp", "npwp", "nib", "sertifikat", "pks", "ijin-lokasi", "sewa-menyewa", "lokasi", "kontrak"].includes(
      section
    )
  ) {
    content = <PartnerDocuments section={section} />;
  } else if (["tiket", "cs-online", "tiket-gangguan", "tiket-layanan"].includes(section)) {
    content = <MitraTicketsPage section={section} />;
  } else if (
    ["perangkat-aktif", "perangkat-pasif", "router", "switch", "olt", "cpe", "sla", "otb", "odc", "odp", "kabel", "infrastruktur"].includes(
      section
    )
  ) {
    content = <MitraTechnicalPage section={section} />;
  } else if (section === "produk") {
    content = <MitraProductsPage />;
  } else if (section === "pelanggan") {
    content = <MitraCustomersPage />;
  } else if (["pendapatan-billing", "kelola-tagihan"].includes(section)) {
    content = <MitraFinancePage invoices />;
  } else if (section === "berita-acara") {
    content = (
      <>
        <MitraFinancePage />
        <div className="mt-6">
          <DocumentCards category="berita-acara-pendapatan" />
        </div>
      </>
    );
  } else if (section === "operasional-produk") {
    content = <DocumentCards category="brosur-produk" />;
  } else if (section === "presales") {
    content = <DocumentCards category="presales-mitra" />;
  } else if (section === "evaluasi") {
    content = <DocumentCards category="evaluasi-penjualan" />;
  } else {
    content = (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
        Menu portal belum tersedia.
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={page[0]} subtitle={page[1]} />
      {content}
    </div>
  );
}
