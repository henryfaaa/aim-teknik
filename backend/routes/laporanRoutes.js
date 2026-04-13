// backend/routes/laporanRoutes.js
import express from "express";
import pool from "../config/db.js";
import ExcelJS from "exceljs";

const r = express.Router();

/* =========================================
 * Helper: Normalisasi Status Cair
 * ========================================= */
const derivedStatusSql = `
  CASE 
    WHEN p.status_cair = 'sudah' OR t.status = 'sudah_cair' THEN 'sudah'
    WHEN p.status_cair = 'proses' OR t.status = 'proses' THEN 'proses'
    ELSE 'belum'
  END
`;

function buildDateFilter(q, params) {
  const where = [];
  if (q.from) { where.push("p.tanggal >= ?"); params.push(q.from); }
  if (q.to)   { where.push("p.tanggal <= ?"); params.push(q.to); }
  return where.length ? "WHERE " + where.join(" AND ") : "";
}

/* === SUMMARY (ringkasan angka dashboard laporan) ===
   GET /api/laporan/summary?from=YYYY-MM-DD&to=YYYY-MM-DD */
r.get("/summary", async (req, res) => {
  try {
    const params = [];
    const baseWhere = buildDateFilter(req.query, params);

    // total pekerjaan & nilai
    const [a] = await pool.query(
      `SELECT COUNT(*) total_pekerjaan, COALESCE(SUM(p.total_harga),0) total_nilai
         FROM pekerjaan p
         ${baseWhere}`, params);

    // ba coverage (exclude yang sudah cair supaya sama seperti kartu BA)
    const [b] = await pool.query(
      `SELECT
          SUM(CASE WHEN TRIM(REPLACE(p.ba_opname_no,' ','')) <> '' THEN 1 ELSE 0 END) as with_ba,
          SUM(CASE WHEN TRIM(REPLACE(p.ba_opname_no,' ','')) = '' THEN 1 ELSE 0 END) as without_ba
        FROM pekerjaan p
        LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
        LEFT JOIN ttf    t ON t.id = b.ttf_id
        ${baseWhere} AND (${derivedStatusSql}) <> 'sudah'`, params);

    // nominal pencairan (pakai derived status)
    const [c] = await pool.query(
      `SELECT
          SUM(CASE WHEN ${derivedStatusSql}='belum'  THEN p.total_harga ELSE 0 END) AS belum,
          SUM(CASE WHEN ${derivedStatusSql}='proses' THEN p.total_harga ELSE 0 END) AS proses,
          SUM(CASE WHEN ${derivedStatusSql}='sudah'  THEN p.total_harga ELSE 0 END) AS sudah
        FROM pekerjaan p
        LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
        LEFT JOIN ttf    t ON t.id = b.ttf_id
        ${baseWhere}`, params);

    const out = {
      total_pekerjaan: Number(a[0]?.total_pekerjaan || 0),
      total_nilai: Number(a[0]?.total_nilai || 0),
      ba: {
        with_ba: Number(b[0]?.with_ba || 0),
        without_ba: Number(b[0]?.without_ba || 0),
      },
      pencairan: {
        belum: Number(c[0]?.belum || 0),
        proses: Number(c[0]?.proses || 0),
        sudah: Number(c[0]?.sudah || 0),
      },
    };
    out.pencairan.total = out.pencairan.belum + out.pencairan.proses + out.pencairan.sudah;
    res.json({ ok: true, data: out });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* === DETAIL (table) ===
   GET /api/laporan/detail?from&to&status=all|belum|proses|sudah&has_ba=all|ada|tidak&search=&page=1&limit=20 */
r.get("/detail", async (req, res) => {
  try {
    const q = req.query;
    const page = Math.max(1, parseInt(q.page || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "20", 10)));
    const offset = (page - 1) * limit;

    const params = [];
    const where = [];
    if (q.from) { where.push("p.tanggal >= ?"); params.push(q.from); }
    if (q.to)   { where.push("p.tanggal <= ?"); params.push(q.to); }
    if (q.status && q.status !== "all") {
      where.push(`${derivedStatusSql} = ?`);
      params.push(q.status);
    }
    if (q.has_ba && q.has_ba !== "all") {
      if (q.has_ba === "ada")
        where.push("TRIM(REPLACE(p.ba_opname_no,' ','')) <> '' AND p.ba_opname_no IS NOT NULL");
      if (q.has_ba === "tidak")
        where.push("(TRIM(REPLACE(p.ba_opname_no,' ','')) = '' OR p.ba_opname_no IS NULL)");
    }
    if (q.search) {
      const s = `%${q.search}%`;
      where.push("(p.no_co LIKE ? OR p.nama_toko LIKE ? OR p.kode_toko LIKE ? OR p.ba_opname_no LIKE ?)");
      params.push(s, s, s, s);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    const sqlBase = `
      FROM pekerjaan p
      LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
      LEFT JOIN ttf    t ON t.id = b.ttf_id
      ${whereSql}
    `;

    const [rows] = await pool.query(
      `SELECT 
          p.tanggal, 
          p.no_co, 
          p.ba_opname_no, 
          p.kode_toko, 
          p.nama_toko,
          GROUP_CONCAT(pi.deskripsi SEPARATOR '; ') AS pekerjaan,
          p.total_harga, 
          ${derivedStatusSql} AS status_cair
       FROM pekerjaan p
       LEFT JOIN pekerjaan_item pi ON pi.pekerjaan_id = p.id
       LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
       LEFT JOIN ttf t ON t.id = b.ttf_id
       ${whereSql}
       GROUP BY p.id
       ORDER BY p.tanggal ASC, p.id ASC`,
      params
    );

    const [cnt] = await pool.query(`SELECT COUNT(*) total ${sqlBase}`, params);
    const total = Number(cnt[0]?.total || 0);

    res.json({
      ok: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* === AGGREGASI: per-bulan ===
   GET /api/laporan/agg/bulan?from&to */
r.get("/agg/bulan", async (req, res) => {
  try {
    const params = [];
    const baseWhere = buildDateFilter(req.query, params);

    const [rows] = await pool.query(
      `SELECT 
          p.id,
          p.tanggal, 
          p.no_co, 
          p.ba_opname_no, 
          p.kode_toko, 
          p.nama_toko,
          p.total_harga, 
          ${derivedStatusSql} AS status_cair
       FROM pekerjaan p
       LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
       LEFT JOIN ttf t ON t.id = b.ttf_id
       ${baseWhere}
       ORDER BY p.tanggal DESC, p.id DESC`,
      params
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* === AGGREGASI: per-toko ===
   GET /api/laporan/agg/toko?from&to&limit=20 */
r.get("/agg/toko", async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit || "20", 10)));
    const params = [];
    const baseWhere = buildDateFilter(req.query, params);

    const [rows] = await pool.query(
      `SELECT p.kode_toko, p.nama_toko,
              COUNT(*) AS cnt,
              COALESCE(SUM(p.total_harga),0) AS total,
              SUM(CASE WHEN ${derivedStatusSql}='sudah' THEN p.total_harga ELSE 0 END) AS cair
         FROM pekerjaan p
         LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
         LEFT JOIN ttf    t ON t.id = b.ttf_id
         ${baseWhere}
         GROUP BY p.kode_toko, p.nama_toko
         ORDER BY total DESC
         LIMIT ?`, [...params, limit]);

    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* =========================================
 * Header Excel CV AIM TEKNIK (polished)
 * ========================================= */
/* =========================================
 * Header Excel CV AIM TEKNIK (versi elegan & rapi)
 * ========================================= */
async function renderExcelHeader(ws, wb) {
  try {
    const path = (await import("path")).default;
    const { fileURLToPath } = await import("url");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const logoPath = path.join(__dirname, "../uploads/logo.png");

    const logoId = wb.addImage({ filename: logoPath, extension: "png" });
    ws.addImage(logoId, { tl: { col: 1, row: 1.5 }, ext: { width: 85, height: 85 } });
  } catch {
    console.warn("⚠️ Logo tidak ditemukan, lanjut tanpa logo.");
  }

  const blue = "1F4E78";
  const gray = "666666";

  // CV. AIM TEKNIK
  ws.mergeCells("C2:F2");
  ws.getCell("C2").value = "CV. AIM TEKNIK";
  ws.getCell("C2").font = { bold: true, size: 20, color: { argb: blue } };
  ws.getCell("C2").alignment = { vertical: "middle", horizontal: "left" };

  // Subtitle
  ws.mergeCells("C3:F3");
  ws.getCell("C3").value = "CIVIL, ELECTRICAL & GENERAL CONTRACTOR";
  ws.getCell("C3").font = { bold: true, size: 12, color: { argb: blue } };

  // Alamat
  ws.mergeCells("C4:F4");
  ws.getCell("C4").value = "Jalan Raya Serang Cikupa";
  ws.getCell("C4").font = { size: 11, color: { argb: gray } };

  ws.mergeCells("C5:F5");
  ws.getCell("C5").value = "Mulya Asri Blok J8/26, Sukamulya, Cikupa, Tangerang – 15710";
  ws.getCell("C5").font = { size: 11, color: { argb: gray } };

  ws.mergeCells("C6:F6");
  ws.getCell("C6").value = "Telp: 082213986759   |   Email: aimteknik13@gmail.com";
  ws.getCell("C6").font = { size: 11, color: { argb: gray } };

  // Garis pemisah tipis
  for (let c = 2; c <= 6; c++) {
    ws.getCell(7, c).border = { bottom: { style: "thin", color: { argb: "BBBBBB" } } };
  }

  // Proporsi tinggi baris biar seimbang
  ws.getRow(2).height = 24;
  ws.getRow(3).height = 18;
  ws.getRow(4).height = 16;
  ws.getRow(5).height = 16;
  ws.getRow(6).height = 16;
  ws.getRow(7).height = 6;
}


/* =========================================
 * Export Laporan Umum
 * ========================================= */
r.post("/export", async (req, res) => {
  try {
    const { type = "detail", params = {} } = req.body || {};
    const q = params; // 🔧 supaya q.has_ba, q.status, q.search kebaca
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(type.toUpperCase());
    await renderExcelHeader(ws, wb);

    const toIDR = (n) =>
      Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

    /* === DETAIL === */
    if (type === "detail") {
      const p = [];
      const where = [];

      if (q.from) { where.push("p.tanggal >= ?"); p.push(q.from); }
      if (q.to)   { where.push("p.tanggal <= ?"); p.push(q.to); }
      if (q.status && q.status !== "all") {
        where.push(`${derivedStatusSql} = ?`);
        p.push(q.status);
      }
      if (q.has_ba && q.has_ba !== "all") {
        if (q.has_ba === "ada")
          where.push("TRIM(REPLACE(p.ba_opname_no,' ','')) <> '' AND p.ba_opname_no IS NOT NULL");
        if (q.has_ba === "tidak")
          where.push("(TRIM(REPLACE(p.ba_opname_no,' ','')) = '' OR p.ba_opname_no IS NULL)");
      }
      if (q.search) {
        const s = `%${q.search}%`;
        where.push("(p.no_co LIKE ? OR p.nama_toko LIKE ? OR p.kode_toko LIKE ? OR p.ba_opname_no LIKE ?)");
        p.push(s, s, s, s);
      }

      const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

      const [rows] = await pool.query(
        `SELECT p.tanggal, p.no_co, p.ba_opname_no, p.kode_toko, p.nama_toko,
                p.total_harga, ${derivedStatusSql} AS status_cair
         FROM pekerjaan p
         LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
         LEFT JOIN ttf t ON t.id = b.ttf_id
         ${whereSql}
         ORDER BY p.tanggal ASC, p.id ASC`,
        p
      );

      ws.addRow([]);
      ws.mergeCells("B9", "H9");
      ws.getCell("B9").value = "LAPORAN DETAIL PEKERJAAN";
      ws.getCell("B9").font = { bold: true, size: 13 };
      ws.getCell("B9").alignment = { horizontal: "center" };

      ws.addRow([
        "Tanggal", "No CO", "BA Opname", "KDTK",
        "Nama Toko", "Total (Rp)", "Status Cair"
      ]);
      styleHeaderRow(ws.lastRow);

      ws.columns = [
        { width: 12 },
        { width: 16 },
        { width: 36 },
        { width: 10 },
        { width: 28 },
        { width: 16 },
        { width: 12 },
      ];

      rows.forEach((r, i) =>
        addDataRow(ws, [
          r.tanggal,
          r.no_co,
          r.ba_opname_no || "-",
          r.kode_toko,
          r.nama_toko,
          `Rp ${toIDR(r.total_harga)}`,
          r.status_cair,
        ], i)
      );
    }

    /* === PER BULAN === */
    else if (type === "bulan") {
  const p = [];
  const baseWhere = buildDateFilter(q || {}, p); // pakai helper existing

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(p.tanggal,'%Y-%m') AS Bulan,
            COUNT(*) AS Jumlah,
            COALESCE(SUM(p.total_harga),0) AS Total,
            SUM(CASE WHEN ${derivedStatusSql}='sudah' THEN p.total_harga ELSE 0 END) AS SudahCair
     FROM pekerjaan p
     LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
     LEFT JOIN ttf    t ON t.id = b.ttf_id
     ${baseWhere}
     GROUP BY Bulan
     ORDER BY Bulan ASC`,
    p
  );

  ws.addRow([]);
  ws.mergeCells("A9", "D9");
  ws.getCell("A9").value = "LAPORAN PER BULAN";
  ws.getCell("A9").font = { bold: true, size: 13 };
  ws.getCell("A9").alignment = { horizontal: "center" };

  ws.addRow(["Bulan", "Jumlah", "Total (Rp)", "Sudah Cair (Rp)"]);
  styleHeaderRow(ws.lastRow);

  ws.columns = [
    { width: 14 }, // Bulan
    { width: 11 }, // Jumlah
    { width: 20 }, // Total
    { width: 22 }, // Sudah Cair
  ];

  const toIDR = (n) => Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });
  rows.forEach((r, i) =>
    addDataRow(ws, [
      r.Bulan,
      r.Jumlah,
      `Rp ${toIDR(r.Total)}`,
      `Rp ${toIDR(r.SudahCair)}`,
    ], i)
  );
}

    /* === PER TOKO === */
    /* === PER TOKO === */
else if (type === "toko") {
  const p = [];
  const where = [];

  // tanggal
  if (q.from) { where.push("p.tanggal >= ?"); p.push(q.from); }
  if (q.to)   { where.push("p.tanggal <= ?"); p.push(q.to); }

  // status cair
  if (q.status && q.status !== "all") {
    where.push(`${derivedStatusSql} = ?`);
    p.push(q.status);
  }

  // status BA (ada / tidak)
  if (q.has_ba && q.has_ba !== "all") {
    if (q.has_ba === "ada") {
      where.push("TRIM(REPLACE(p.ba_opname_no,' ','')) <> '' AND p.ba_opname_no IS NOT NULL");
    } else if (q.has_ba === "tidak") {
      where.push("(TRIM(REPLACE(p.ba_opname_no,' ','')) = '' OR p.ba_opname_no IS NULL)");
    }
  }

  // search teks
  if (q.search) {
    const s = `%${q.search}%`;
    where.push("(p.no_co LIKE ? OR p.nama_toko LIKE ? OR p.kode_toko LIKE ? OR p.ba_opname_no LIKE ?)");
    p.push(s, s, s, s);
  }

  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

  const [rows] = await pool.query(
    `SELECT p.kode_toko AS KDTK, p.nama_toko AS NamaToko,
            COUNT(*) AS Jumlah,
            COALESCE(SUM(p.total_harga),0) AS Total,
            SUM(CASE WHEN ${derivedStatusSql}='sudah' THEN p.total_harga ELSE 0 END) AS SudahCair
     FROM pekerjaan p
     LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
     LEFT JOIN ttf t ON t.id = b.ttf_id
     ${whereSql}
     GROUP BY KDTK, NamaToko
     ORDER BY Total DESC`,
    p
  );

  ws.addRow([]);
  ws.mergeCells("A9", "F9");
  ws.getCell("A9").value = "LAPORAN PER TOKO";
  ws.getCell("A9").font = { bold: true, size: 13 };
  ws.getCell("A9").alignment = { horizontal: "center" };

  ws.addRow(["KDTK", "Nama Toko", "Jumlah", "Total (Rp)", "Sudah Cair (Rp)"]);
  styleHeaderRow(ws.lastRow);

  ws.columns = [
    { width: 10 },
    { width: 30 },
    { width: 10 },
    { width: 18 },
    { width: 20 },
  ];

  rows.forEach((r, i) =>
    addDataRow(ws, [
      r.KDTK,
      r.NamaToko,
      r.Jumlah,
      `Rp ${Number(r.Total || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`,
      `Rp ${Number(r.SudahCair || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`,
    ], i)
  );
}


    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=LAPORAN_${type}_${Date.now()}.xlsx`);
    await wb.xlsx.write(res);
    res.end();

  } catch (e) {
    console.error("EXPORT ERROR:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});


/* =========================================
 * EXPORT BY TOKO (Centang Manual)
 * body: { toko_ids:[kode_toko,...], from?, to? }
 * ========================================= */
r.post("/export-by-toko", async (req, res) => {
  try {
    const { toko_ids = [], from, to } = req.body || {};
    if (!Array.isArray(toko_ids) || toko_ids.length === 0)
      return res.status(400).json({ ok: false, error: "Pilih minimal satu toko" });

    const params = [...toko_ids];
    let where = `p.kode_toko IN (${toko_ids.map(() => "?").join(",")})`;
    if (from) { where += " AND p.tanggal >= ?"; params.push(from); }
    if (to)   { where += " AND p.tanggal <= ?"; params.push(to); }

    const [rows] = await pool.query(
      `SELECT p.tanggal, p.no_co, p.ba_opname_no, p.kode_toko, p.nama_toko,
              GROUP_CONCAT(pi.deskripsi SEPARATOR '; ') AS pekerjaan,
              p.total_harga
       FROM pekerjaan p
       LEFT JOIN pekerjaan_item pi ON pi.pekerjaan_id = p.id
       LEFT JOIN ttf_ba b ON REPLACE(p.ba_opname_no,' ','') = b.ba_no
       LEFT JOIN ttf t ON t.id = b.ttf_id
       WHERE ${where}
       GROUP BY p.id
       ORDER BY p.tanggal ASC, p.id ASC`, params);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("LAPORAN");
    await renderExcelHeader(ws, wb);

    ws.addRow([]);
    ws.mergeCells("A9", "F9");
    ws.getCell("A9").value = "LAPORAN TOKO TERPILIH";
    ws.getCell("A9").font = { bold: true, size: 13 };
    ws.getCell("A9").alignment = { horizontal: "center" };

    ws.addRow(["No", "No CO", "Nama Toko", "Pekerjaan", "No BA Opname", "Total Harga"]);
    styleHeaderRow(ws.lastRow);

    rows.forEach((r, i) => addDataRow(ws, [
      i + 1,
      r.no_co,
      r.nama_toko,
      r.pekerjaan || "-",
      r.ba_opname_no || "-",
      `Rp ${Number(r.total_harga || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`,
    ], i));

    ws.columns = [
      { width: 5  }, // No
      { width: 16 }, // No CO
      { width: 26 }, // Nama Toko
      { width: 50 }, // Pekerjaan
      { width: 26 }, // BA
      { width: 18 }, // Total
    ];

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=LAPORAN_TOKO_TERPILIH_${Date.now()}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error("EXPORT BY TOKO ERR:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* =========================================
 * Helper styling tabel Excel
 * ========================================= */
function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F81BD" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    };
  });
}

function addDataRow(ws, values, index) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  });
  if (index % 2 === 1) {
    row.eachCell((c) => (c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F2F2F2" } }));
  }
}

export default r;
