// backend/routes/invoiceRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";
import pool from "../config/db.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Folder uploads: /backend/uploads (relatif terhadap file routes ini)
const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");

/* =========================
   Helpers (opsional)
   ========================= */
function colCharsToPx(widthChars) {
  const w = (widthChars ?? 8.43);
  return Math.floor(w * 7 + 5);
}
function pointsToPx(points) {
  return Math.round(points * (96 / 72));
}

// Cari file ttd.* yang valid (jpg/jpeg/png)
function findSignatureFile() {
  const candidates = ["ttd.jpg", "ttd.jpeg", "ttd.png"];
  for (const name of candidates) {
    const p = path.join(UPLOADS_DIR, name);
    if (fs.existsSync(p)) return p;
  }
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const f = files.find((x) => /^ttd(\.|$)/i.test(x));
    if (f) return path.join(UPLOADS_DIR, f);
  } catch {}
  return null;
}

const router = express.Router();

/* =========================================================
   Helper: terbilang & tanggal
   ========================================================= */
function terbilang(n) {
  n = Math.floor(Number(n || 0));
  const s = ["", "Satu","Dua","Tiga","Empat","Lima","Enam","Tujuh","Delapan","Sembilan","Sepuluh","Sebelas"];
  const w = (x)=>{
    if (x < 12) return s[x];
    if (x < 20) return w(x-10) + " Belas";
    if (x < 100) return w(Math.floor(x/10)) + " Puluh " + w(x%10);
    if (x < 200) return "seratus " + w(x-100);
    if (x < 1000) return w(Math.floor(x/100)) + " Ratus " + w(x%100);
    if (x < 2000) return "seribu " + w(x-1000);
    if (x < 1_000_000) return w(Math.floor(x/1000)) + " Ribu " + w(x%1000);
    if (x < 1_000_000_000) return w(Math.floor(x/1_000_000)) + " Juta " + w(x%1_000_000);
    return "Milyar+";
  };
  return w(n).replace(/\s+/g," ").trim();
}
const fmtTanggalID = (d = new Date()) =>
  d.toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });

/* =========================================================
   PREVIEW: ambil data sesuai BA list (ikut printed)
   ========================================================= */
router.post("/preview", async (req, res) => {
  try {
    const { ba_list = [] } = req.body || {};
    if (!Array.isArray(ba_list) || ba_list.length === 0) {
      return res.status(400).json({ ok:false, error:"ba_list kosong" });
    }

    const ph = ba_list.map(()=>"?").join(",");

    const [rows] = await pool.query(
      `
      SELECT 
        MIN(p.id) as id,              -- ambil id terkecil biar unik
        p.tanggal,
        p.no_co,
        p.kode_toko,
        p.nama_toko,
        p.ba_opname_no,
        MAX(p.total_harga) as total_harga, -- pastikan cuma 1 total
        COALESCE(MAX(b.printed), 0) AS printed
      FROM pekerjaan p
      LEFT JOIN ba_inbox b ON b.ba_no = p.ba_opname_no
      WHERE p.ba_opname_no IN (${ph})
      GROUP BY p.ba_opname_no, p.tanggal, p.no_co, p.kode_toko, p.nama_toko
      ORDER BY p.tanggal, id
      `,
      ba_list
    );

    console.log("[PREVIEW] rows =", rows.length);

    const total = rows.reduce((a,b)=> a + Number(b.total_harga||0), 0);
    res.json({ ok:true, rows, total, mode:"invoice" });

  } catch (e) {
    console.error("PREVIEW ERR:", e);
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
});


/* =========================================================
   EXPORT (dinamis, tabel di tengah, footer ikut geser)
   =========================================================
   STRUKTUR TEMPLATE:
   - "INVOICE" : merge A10:G10 (di template)
   - Header tabel baris 11:
       A11: No
       B11: No CO
       C11: Kode Toko
       D11: Nama Toko
       E11: Pekerjaan
       F11: No BA
       G11: Total Harga
   - Data mulai baris 12 (A..G)
   - Baris "JUMLAH TOTAL": label MERGE A..F, nilai di G
   - "Terbilang :" di B, kalimat MERGE C..G
   - Footer kolom F:
       F{dateRow}      : "Kota, Tanggal"
       F{signTop..top+3}: area tanda tangan (4 baris)
       F{nameRow}      : Nama TTD (bold)
       F{companyRow}   : "CV. AIM TEKNIK" (bold)
   ========================================================= */
router.post("/export", async (req, res) => {
  try {
    const { ba_list = [], mark_printed = false, kota_footer = "Tangerang" } = req.body || {};

    // 🔎 LOG #1
    console.log("[EXPORT] hit", {
      ba_list: Array.isArray(ba_list) ? ba_list : [],
      mark_printed: !!mark_printed,
      count: Array.isArray(ba_list) ? ba_list.length : 0
    });

    // Sanitasi biar rapi
    const BA = (Array.isArray(ba_list) ? ba_list : []).map(x => String(x).trim());
    if (BA.length === 0) {
      return res.status(400).json({ ok: false, error: "ba_list kosong" });
    }

    // 1) Ambil data pekerjaan (pakai ba_final_total kalau ada)
    const placeholders = BA.map(() => "?").join(",");
    const [rows] = await pool.query(
      `
      SELECT p.id, p.tanggal, p.no_co, p.kode_toko, p.nama_toko,
             p.ba_opname_no,
             COALESCE(p.ba_final_total, p.total_harga) AS total_harga,
             (
               SELECT GROUP_CONCAT(
                 TRIM(
                   CONCAT(
                     i.deskripsi,
                     CASE WHEN COALESCE(i.qty,0) <> 0 THEN CONCAT(
                       ' (',
                       CASE
                         WHEN i.qty = FLOOR(i.qty)
                           THEN CAST(FLOOR(i.qty) AS CHAR)
                         ELSE TRIM(TRAILING '0' FROM TRIM(TRAILING '.' FROM CAST(i.qty AS CHAR)))
                       END,
                       CASE WHEN TRIM(COALESCE(i.satuan,'')) <> '' 
                         THEN CONCAT(' ', i.satuan) 
                         ELSE '' 
                       END,
                       ')'
                     ) ELSE '' END
                   )
                 )
                 ORDER BY i.urut SEPARATOR ' + '
               )
               FROM pekerjaan_item i 
               WHERE i.pekerjaan_id = p.id
             ) AS deskripsi
      FROM pekerjaan p
      WHERE p.ba_opname_no IN (${placeholders})
      ORDER BY p.tanggal, p.id
      `,
      BA
    );

    console.log(
      "[EXPORT] SELECT rows =",
      Array.isArray(rows) ? rows.length : 0
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ ok:false, error:"Data tidak ditemukan" });
    }

    // 2) Baca template
    const templatePath = path.resolve(__dirname, "..", "templates", "invoice_template.xlsx");
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ ok:false, error:"Template invoice tidak ditemukan" });
    }
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);
    const ws = wb.worksheets[0];

    // 3) Konstanta layout
    const MONEY_FMT  = '"Rp "#,##0';
    const TITLE_ROW  = 10;   // "INVOICE" (A10:G10)
    const HEADER_ROW = 11;   // judul kolom
    const DATA_START = 12;   // baris data pertama

    // Kolom (1-based index)
    const COL = { NO:1, NOC:2, KDTK:3, NAMA:4, PEK:5, BA:6, TOTAL:7 };

    const alignC = { vertical:"middle", horizontal:"center" };
    const alignL = { vertical:"middle", horizontal:"left" };
    const alignR = { vertical:"middle", horizontal:"right" };
    const thinBorder = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };

    // Merge aman
    const safeMerge = (ref) => {
      try { ws.mergeCells(ref); }
      catch(e) { if (!/already merged/i.test(String(e.message))) throw e; }
    };

    // 4) Header: INVOICE & header kolom
    ws.getCell(`A${TITLE_ROW}`).alignment = alignC; // A10 sudah merge A10:G10 di template
    ws.getCell(`A${TITLE_ROW}`).font      = { bold:true };

    for (let c = 1; c <= 7; c++) {
      const cell = ws.getCell(HEADER_ROW, c);
      cell.alignment = alignC;
      cell.font = { bold:true };
    }

    // 5) Isi tabel (mulai row 12)
    let r = DATA_START;
    rows.forEach((it, idx) => {
      const row = ws.insertRow(r, [
        idx + 1,                         // A: No
        it.no_co || "-",                 // B: No CO
        it.kode_toko || "-",             // C: KDTK
        it.nama_toko || "-",             // D: Nama Toko
        it.deskripsi || "-",             // E: Pekerjaan (gabungan item)
        it.ba_opname_no || "-",          // F: No BA
        Number(it.total_harga || 0)      // G: Total
      ]);

      row.getCell(COL.NO).alignment    = alignC;
      row.getCell(COL.NOC).alignment   = alignL;
      row.getCell(COL.KDTK).alignment  = alignC;
      row.getCell(COL.NAMA).alignment  = alignL;
      row.getCell(COL.PEK).alignment   = alignL;
      row.getCell(COL.BA).alignment    = alignL;
      row.getCell(COL.TOTAL).alignment = alignR;
      row.getCell(COL.TOTAL).numFmt    = MONEY_FMT;

      for (let c = 1; c <= 7; c++) row.getCell(c).border = thinBorder;

      row.height = 18;
      r++;
    });

    // 6) JUMLAH TOTAL (persis di bawah data)
    const lastDataRow = r - 1;
    const totalRow    = lastDataRow + 1;

    safeMerge(`A${totalRow}:F${totalRow}`);
    ws.getCell(`A${totalRow}`).value     = "JUMLAH TOTAL";
    ws.getCell(`A${totalRow}`).alignment = alignL;
    ws.getCell(`A${totalRow}`).font      = { bold:true };

    ws.getCell(`G${totalRow}`).value     = { formula: `SUM(G${DATA_START}:G${lastDataRow})` };
    ws.getCell(`G${totalRow}`).numFmt    = MONEY_FMT;
    ws.getCell(`G${totalRow}`).alignment = alignR;
    ws.getCell(`G${totalRow}`).font      = { bold:true };

    for (let c = 1; c <= 7; c++) ws.getCell(totalRow, c).border = thinBorder;

    // 7) Terbilang
    const terbilangRow = totalRow + 1;
    const grand = rows.reduce((a,b)=> a + Number(b.total_harga || 0), 0);

    ws.getCell(`B${terbilangRow}`).value     = "Terbilang :";
    ws.getCell(`B${terbilangRow}`).font      = { bold:true };
    ws.getCell(`B${terbilangRow}`).alignment = alignL;

    safeMerge(`C${terbilangRow}:G${terbilangRow}`);
    ws.getCell(`C${terbilangRow}`).value     = terbilang(grand) + " rupiah";
    ws.getCell(`C${terbilangRow}`).alignment = alignL;

    // 8) Footer: tanggal & TTD
    const gapAfterTerbilang = 1;
    const dateRow = terbilangRow + 1 + gapAfterTerbilang;

    // Tanggal
    ws.getCell(`F${dateRow}`).value     = `${kota_footer}, ${fmtTanggalID(new Date())}`;
    ws.getCell(`F${dateRow}`).alignment = { vertical: "middle", horizontal: "center" };

    // Area TTD: 4 baris
    const signRows = 4;
    const signTop  = dateRow + 1;
    for (let rr = signTop; rr < signTop + signRows; rr++) ws.getRow(rr).height = 18;

    // Sisipkan gambar TTD (jika ada)
    const ttdPath = findSignatureFile();
    if (ttdPath) {
      const ext  = ttdPath.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      const imgId = wb.addImage({ buffer: fs.readFileSync(ttdPath), extension: ext });

      // Kolom F = index 5 (0-based); sedikit padding
      ws.addImage(imgId, {
        tl:  { col: 5 + 0.20, row: (signTop - 1) + 0.10 },
        ext: { width: 180, height: 95 },
      });
    }

    // Nama & perusahaan
    const nameRow = signTop + signRows;
    ws.getCell(`F${nameRow}`).value     = "BINAJI";
    ws.getCell(`F${nameRow}`).alignment = { vertical: "middle", horizontal: "center" };
    ws.getCell(`F${nameRow}`).font      = { bold: true };

    const companyRow = nameRow + 1;
    ws.getCell(`F${companyRow}`).value     = "CV. AIM TEKNIK";
    ws.getCell(`F${companyRow}`).alignment = { vertical: "middle", horizontal: "center" };
    ws.getCell(`F${companyRow}`).font      = { bold: true };

    // 9) Tandai printed (cukup sekali saja, GA dobel)
    if (mark_printed) {
      const p2 = BA.map(()=>"?").join(",");
      const [upd] = await pool.query(
        `UPDATE ba_inbox
         SET printed=1, printed_at=NOW()
         WHERE TRIM(ba_no) IN (${p2})`,
        BA
      );

      console.log("[EXPORT] UPDATE ba_inbox affectedRows =", (upd && typeof upd.affectedRows !== "undefined") ? upd.affectedRows : null);

      // (opsional) cek hasil
      const [after] = await pool.query(
        `SELECT ba_no, printed, printed_at
         FROM ba_inbox
         WHERE TRIM(ba_no) IN (${p2})`,
        BA
      );
      console.log("[EXPORT] AFTER UPDATE rows =", (Array.isArray(after) ? after.length : 0));
      console.table(after);
    }

    // 10) Kirim file
    const outName = `INVOICE_${Date.now()}.xlsx`;
    res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${outName}"`);
    console.log("[EXPORT] streaming xlsx for BA =", BA);
    await wb.xlsx.write(res);
    res.end();

  } catch (e) {
    console.error("EXPORT ERR:", e);
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
});

export default router;
