// backend/integrations/baParser.js
import fs from "fs";
import pdfParse from "pdf-parse-fixed";

const RX_BA = /BA-OPNAME\/\d{4}\/\d{2}\/\d{3}\/\d{6}/i;
const RX_CO = /\b25[A-Z]\d{7,9}\b/;
const RX_TOKO = /IDM\s+([A-Z0-9 .\-\/]+)\((\w+)\)/i;

function un(s) { return (s || "").toString().trim(); }
function toNumber(numStr = "") {
  const s = String(numStr).replace(/[^\d,.-]/g, "");
  // format ID: 999.000,00 atau 999,000.00 → buang pemisah ribuan, titik/koma akhir jadi desimal.
  const isCommaDecimal = /,\d{2}$/.test(s);
  const clean = isCommaDecimal ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

export async function parseBaPdf(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File BA tidak ditemukan: " + filePath);
  }

  const buf = fs.readFileSync(filePath);
  const parsed = await pdfParse(buf);
  const text = parsed.text || "";
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const ba_no = (text.match(RX_BA) || [])[0]?.toUpperCase() || null;
  const co_no = (text.match(RX_CO) || [])[0]?.toUpperCase() || null;

  // Nama toko & KDTK
  let nama_toko = null, kdtk = null;
  const tokoM = text.match(RX_TOKO);
  if (tokoM) { nama_toko = un(tokoM[1]); kdtk = un(tokoM[2]).toUpperCase(); }

  // ITEMS: cari blok antara header tabel dan "Total"
  // Contoh di PDF kamu: baris header mirip "No. Pekerjaan Nilai Estimasi Nilai Realisasi"
  const startIdx = lines.findIndex(l => /No\.\s*Pekerjaan/i.test(l) || /Pekerjaan\s+Nilai\s+Estimasi/i.test(l));
  const totalIdx = lines.findIndex(l => /^Total\s/i.test(l));
  const itemLines = (startIdx >= 0 && totalIdx > startIdx) ? lines.slice(startIdx + 1, totalIdx) : [];

  const items = [];
  // Pola umum: "1 Tarikan kabel .... 925,000.00 925,000.00"
  const rowRx = /^\s*\d+[.)]?\s*([A-Za-z0-9 ,.\-()\/]+?)\s+([\d.,]+)\s+([\d.,]+)\s*$/;
  for (const raw of itemLines) {
    const m = raw.match(rowRx);
    if (m) {
      const deskripsi = un(m[1]);
      const estimasi = toNumber(m[2]);
      const realisasi = toNumber(m[3]);
      items.push({
        deskripsi,
        qty: 1.00,       // PDF BA jarang kasih qty+unit rapi → kita simpan sebagai item flat
        satuan: "",
        harga: Math.round(realisasi), // pakai nilai realisasi
        estimasi: Math.round(estimasi),
      });
    }
  }

  // Angka ringkasan (fallback pakai Nilai Kuitansi/Invoice kalau ada)
  let total_realisasi = 0;
  let dpp = 0, ppn = 0, pph = 0;

  const kv = (label) => {
    const i = lines.findIndex(l => new RegExp(`^${label}\\b`, "i").test(l));
    if (i >= 0) {
      const m = lines[i].match(/([\d.,]+)\s*$/);
      if (m) return toNumber(m[1]);
    }
    return 0;
  };

  // Total 999,000.00 999,000.00  → ambil angka TERAKHIR
  if (totalIdx >= 0) {
    const m = lines[totalIdx].match(/([\d.,]+)\s*$/);
    if (m) total_realisasi = toNumber(m[1]);
  }
  if (!total_realisasi) {
    total_realisasi = kv("Nilai Kuitansi\\/Invoice") || kv("Nilai Kuitansi") || kv("Nilai Kuitansi/Invoice");
  }

  dpp = kv("Nilai DPP");
  // PPN 0% 0.00 → ambil angka terakhir
  ppn = kv("PPN");
  pph = kv("PPh");

  return {
    ok: true,
    ba_no,
    co_no,
    kdtk,
    nama_toko,
    totals: {
      dpp,
      ppn,
      pph,
      total: total_realisasi,
    },
    items,
    raw: { text },  // buat debug kalau perlu
  };
}

export default { parseBaPdf };
