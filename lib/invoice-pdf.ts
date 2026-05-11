import { monthName } from "@/lib/format";

type InvoiceLike = {
  id?: string;
  noInvoice?: string;
  noFaktur?: string;
  customerName?: string;
  serviceType?: string;
  periodMonth?: number | string;
  periodYear?: number | string;
  amount?: number | string;
  status?: string;
  dueDate?: string | Date | null;
  createdAt?: string | Date | null;
};

type SettingLike = {
  settingKey?: string;
  settingValue?: string;
};

type CompanyProfile = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
};

type PdfImage = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

const defaultProfile: CompanyProfile = {
  name: "PT Ring Media Nusantara",
  phone: "+6287747963000",
  email: "info@ring.net.id",
  address: "Jl. Wuluh No. 1 Papringan, Nolagaten, Catur Tunggal, Depok, Sleman",
  city: "Sleman",
  province: "Daerah Istimewa Yogyakarta",
};

const money = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.round(value || 0));
const clean = (value?: string | number | null) => String(value ?? "").replace(/[^\x20-\x7E]/g, " ");
const pdfText = (value?: string | number | null) => clean(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const pdfDate = (value?: string | Date | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
};

export function settingsToCompanyProfile(settings: SettingLike[] = []): CompanyProfile {
  const map = new Map(settings.map((item) => [item.settingKey, item.settingValue]));
  return {
    name: map.get("company_name") || defaultProfile.name,
    phone: map.get("company_phone") || defaultProfile.phone,
    email: map.get("company_email") || defaultProfile.email,
    address: map.get("company_address") || defaultProfile.address,
    city: map.get("company_city") || defaultProfile.city,
    province: map.get("company_province") || defaultProfile.province,
  };
}

function text(x: number, y: number, value: string, size = 10, font = "F1") {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET\n`;
}

function line(x1: number, y1: number, x2: number, y2: number) {
  return `${x1} ${y1} m ${x2} ${y2} l S\n`;
}

function rect(x: number, y: number, w: number, h: number, fill = false) {
  return fill ? `q 0.86 g ${x} ${y} ${w} ${h} re f Q\n` : `${x} ${y} ${w} ${h} re S\n`;
}

function image(x: number, y: number, w: number, h: number) {
  return `q ${w} 0 0 ${h} ${x} ${y} cm /Im1 Do Q\n`;
}

function tableCell(x: number, y: number, w: number, h: number, value: string, align: "left" | "center" | "right" = "left", bold = false) {
  const fontSize = 9;
  const approx = value.length * fontSize * 0.48;
  const tx = align === "center" ? x + (w - approx) / 2 : align === "right" ? x + w - approx - 9 : x + 9;
  const ty = y + 7;
  return text(Math.max(x + 5, tx), ty, value, fontSize, bold ? "F2" : "F1");
}

function buildPdf(content: string, logo?: PdfImage) {
  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(content);
  const pageResources = logo
    ? "<< /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 7 0 R >> >>"
    : "<< /Font << /F1 4 0 R /F2 5 0 R >> >>";
  const objects: (string | Uint8Array)[][] = [
    ["<< /Type /Catalog /Pages 2 0 R >>"],
    ["<< /Type /Pages /Kids [3 0 R] /Count 1 >>"],
    [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources ${pageResources} /Contents 6 0 R >>`],
    ["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"],
    ["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"],
    [`<< /Length ${contentBytes.length} >>\nstream\n`, contentBytes, "\nendstream"],
  ];
  if (logo) {
    objects.push([
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`,
      logo.bytes,
      "\nendstream",
    ]);
  }
  const parts: (string | Uint8Array)[] = ["%PDF-1.4\n"];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(byteLength(parts));
    parts.push(`${index + 1} 0 obj\n`, ...object, "\nendobj\n");
  });
  const xrefOffset = byteLength(parts);
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    xref += String(offset).padStart(10, "0") + " 00000 n \n";
  });
  parts.push(xref, `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(parts.map((part) => typeof part === "string" ? part : part.slice().buffer as ArrayBuffer), { type: "application/pdf" });
}

function byteLength(parts: (string | Uint8Array)[]) {
  const encoder = new TextEncoder();
  return parts.reduce((sum, part) => sum + (typeof part === "string" ? encoder.encode(part).length : part.length), 0);
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function loadLogoImage(src = "/assets/logo.png"): Promise<PdfImage | undefined> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return { bytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92)), width: canvas.width, height: canvas.height };
  } catch {
    return undefined;
  }
}

export function createInvoicePdfBlob(invoice: InvoiceLike, profile: CompanyProfile = defaultProfile, logo?: PdfImage) {
  const amount = Number(invoice.amount || 0);
  const dpp = Math.round(amount / 1.11);
  const vat = Math.max(0, amount - dpp);
  const period = `${monthName(invoice.periodMonth)} ${invoice.periodYear || ""}`.trim();
  const desc = invoice.serviceType || "Layanan Internet";
  const rows: [string, string, string, string, string, number][] = [
    ["1", desc, money(dpp), "1", money(dpp), 30],
    ["", `Periode layanan ${period}`, "", "", "", 30],
  ];
  const widths = [42, 220, 78, 44, 92];
  const x0 = 68;
  let y = 610;
  let content = "";

  content += "0 0 0 RG 0.7 w\n";
  if (logo) content += image(72, 755, 130, 88);
  else {
    content += text(72, 785, "RINGNET", 28, "F2");
    content += text(74, 768, "Internet Service Provider", 10, "F2");
  }
  content += rect(68, 720, 340, 40);
  content += text(76, 744, "Kepada :", 10, "F1");
  content += text(76, 729, invoice.customerName || "-", 11, "F2");
  content += text(68, 690, "Tagihan", 12, "F1");
  content += text(68, 675, `Nomor Tagihan : ${invoice.noInvoice || "-"}`, 10, "F1");
  content += text(68, 660, `Tgl Tagihan    : ${period || pdfDate(invoice.createdAt)}`, 10, "F1");
  content += text(68, 645, `Jatuh Tempo    : ${pdfDate(invoice.dueDate)}`, 10, "F1");

  content += rect(x0, y, widths.reduce((a, b) => a + b, 0), 22, true);
  let x = x0;
  ["NO", "Keterangan", "Harga", "Qty", "Sub Total"].forEach((header, index) => {
    content += rect(x, y, widths[index], 22);
    content += tableCell(x, y, widths[index], 22, header, "center", true);
    x += widths[index];
  });
  rows.forEach((row) => {
    const h = row[5];
    y -= h;
    x = x0;
    const cells = row.slice(0, 5) as string[];
    cells.forEach((cell, index) => {
      content += rect(x, y, widths[index], h);
      content += tableCell(x, y, widths[index], h, cell, index === 0 || index === 3 ? "center" : index > 1 ? "right" : "left");
      x += widths[index];
    });
  });
  [["DPP", money(dpp)], ["VAT [Value Added Tax]", money(vat)], ["Total Tagihan", money(amount)]].forEach(([label, value]) => {
    y -= 22;
    content += rect(x0, y, widths[0] + widths[1] + widths[2] + widths[3], 22);
    content += rect(x0 + widths[0] + widths[1] + widths[2] + widths[3], y, widths[4], 22);
    content += tableCell(x0, y, widths[0] + widths[1], 22, label, "left", true);
    content += tableCell(x0 + widths[0] + widths[1] + widths[2] + widths[3], y, widths[4], 22, `Rp ${value}`, "right", true);
  });

  y -= 28;
  content += text(68, y, "Pembayaran ditransfer ke :", 10, "F1");
  content += text(68, y - 15, `${profile.name} Bank Mandiri Bisnis 137-00-7999997-1`, 10, "F2");
  content += text(68, y - 30, "*Apabila sudah melakukan pembayaran via transfer mohon", 10, "F1");
  content += text(68, y - 45, "dikonfirmasikan kepada kami", 10, "F1");
  content += text(430, y - 58, "Bag. Keuangan", 10, "F1");
  if (logo) content += image(405, y - 115, 100, 68);
  else content += text(420, y - 105, "RINGNET", 24, "F2");
  content += line(408, y - 113, 500, y - 113);
  content += text(426, y - 128, "Admin Finance", 10, "F1");

  content += text(230, 42, profile.name, 15, "F2");
  content += text(70, 28, `${profile.address}, ${profile.city}, ${profile.province}  ${profile.phone}  ${profile.email}`, 8, "F1");
  return buildPdf(content, logo);
}

export async function downloadInvoicePdf(invoice: InvoiceLike, settings: SettingLike[] = []) {
  const logo = await loadLogoImage();
  const blob = createInvoicePdfBlob(invoice, settingsToCompanyProfile(settings), logo);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${clean(invoice.noInvoice || "invoice").replace(/[\\/]/g, "-")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
