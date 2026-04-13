// backend/routes/baOpnameRoutes.js
import express from "express";
import pool from "../config/db.js";
import { previewFromInbox, applyFromInbox } from "../controllers/baApplyController.js";
import { updateBAStatus } from "../controllers/baOpnameController.js";

const r = express.Router();

/* === List BA (status invoice + status BA + pagination server-side) === */
r.get("/", async (req, res) => {
  try {
    const {
      search = "",
      from = "",
      to = "",
      status = "all",      // printed | not_printed | all
      ba_status = "all",   // has | missing | all   <-- NEW
      page = "1",
      limit = "10",
    } = req.query || {};

    const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset   = (pageNum - 1) * pageSize;

    // Dedup ba_inbox kalau ada duplikat
    const inboxSub = `
      SELECT ba_no, MAX(printed) AS printed, MAX(printed_at) AS printed_at
      FROM ba_inbox
      GROUP BY ba_no
    `;

    const where = [];
    const vals = [];

    // Pencarian, pastikan aman untuk NULL
    if (search) {
      where.push("(COALESCE(p.ba_opname_no,'') LIKE ? OR p.no_co LIKE ? OR p.kode_toko LIKE ? OR p.nama_toko LIKE ?)");
      vals.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (from) { where.push("p.tanggal >= ?"); vals.push(from); }
    if (to)   { where.push("p.tanggal <= ?"); vals.push(to); }

    // Filter status invoice (printed di ba_inbox)
    if (status === "printed") {
      where.push("COALESCE(b.printed,0) = 1");
    } else if (status === "not_printed") {
      where.push("COALESCE(b.printed,0) = 0");
    }

    // Filter Status BA (ketersediaan BA di Gmail)
    // has     : BA no ada & ketemu di Gmail
    // missing : BA no kosong ATAU BA no ada tapi tidak ketemu di Gmail
    if (ba_status === "has") {
      where.push("(p.ba_opname_no IS NOT NULL AND p.ba_opname_no <> '' AND b.ba_no IS NOT NULL)");
    } else if (ba_status === "missing") {
      where.push("(p.ba_opname_no IS NULL OR p.ba_opname_no = '' OR b.ba_no IS NULL)");
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // --- Aggregate: total baris & total nilai (tanpa LIMIT) ---
    const [agg] = await pool.query(
      `
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(COALESCE(p.ba_final_total, p.total_harga)),0) AS total_nilai
      FROM pekerjaan p
      LEFT JOIN (${inboxSub}) b ON b.ba_no = p.ba_opname_no
      ${whereSql}
      `,
      vals
    );

    const total       = Number(agg[0]?.total || 0);
    const total_nilai = Number(agg[0]?.total_nilai || 0);
    const pages       = Math.max(1, Math.ceil(total / pageSize));

    // --- Data halaman ini ---
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        p.ba_opname_no AS ba_no,
        p.no_co        AS co_no,
        p.kode_toko    AS kdtk,
        p.nama_toko,
        COALESCE(p.ba_final_total, p.total_harga) AS total,
        COALESCE(b.printed, 0) AS printed,
        /* NEW: indikator BA ada di Gmail */
        CASE
          WHEN p.ba_opname_no IS NULL OR p.ba_opname_no = '' THEN 0
          WHEN b.ba_no IS NULL THEN 0
          ELSE 1
        END AS in_gmail
      FROM pekerjaan p
      LEFT JOIN (${inboxSub}) b ON b.ba_no = p.ba_opname_no
      ${whereSql}
      ORDER BY p.tanggal DESC, p.id DESC
      LIMIT ? OFFSET ?
      `,
      [...vals, pageSize, offset]
    );

    const page_total = rows.reduce((a, r) => a + Number(r.total || 0), 0);

    res.json({
      ok: true,
      data: rows,
      meta: {
        page: pageNum,
        page_size: pageSize,
        pages,
        total,
        total_nilai,
        page_total,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

r.post("/preview", previewFromInbox);
r.post("/apply",   applyFromInbox);
r.patch("/:id/status", updateBAStatus);

export default r;
