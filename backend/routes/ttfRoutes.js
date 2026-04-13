// backend/routes/ttfRoutes.js
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse-fixed";
import fs from "fs";
import path from "path";
import pool from "../config/db.js";

const r = express.Router();

/* --- ensure upload dir exists --- */
const TTF_DIR = path.join(process.cwd(), "uploads/ttf");
fs.mkdirSync(TTF_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TTF_DIR),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* --- Regex BA fleksibel (boleh ada spasi/newline antar slash) --- */
const RX_BA_FLEX =
  /BA-OPNAME\s*\/\s*\d{4}\s*\/\s*\d{2}\s*\/\s*\d{3}\s*\/\s*\d{6}/gi;

/** Utility: normalisasi BA -> hapus semua whitespace (spasi, tab, newline) */
const normalizeBA = (s = "") => String(s).replace(/\s+/g, "");

/* === Upload TTF & simpan BA ke DB === */
r.post("/upload", upload.single("ttf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "File kosong" });

    const buffer = fs.readFileSync(req.file.path);
    const { text = "" } = await pdfParse(buffer);

    // tangkap BA, bersihkan (hilangkan spasi/newline), dedup
    const rawMatches = text.match(RX_BA_FLEX) || [];
    const baList = [...new Set(rawMatches.map((b) => normalizeBA(b)))];

    if (baList.length === 0) {
      return res.json({ ok: false, error: "Tidak ada nomor BA ditemukan." });
    }

    // simpan header TTF, default status = 'proses'
    const [ttfRes] = await pool.query(
      "INSERT INTO ttf (filename, status) VALUES (?, 'proses')",
      [req.file.filename]
    );
    const ttfId = ttfRes.insertId;

    // simpan setiap BA ke ttf_ba (sudah dinormalisasi) & tandai pekerjaan sebagai 'proses'
    for (const ba of baList) {
      await pool.query(
        "INSERT IGNORE INTO ttf_ba (ttf_id, ba_no) VALUES (?, ?)",
        [ttfId, ba]
      );
      // update pekerjaan -> hanya kalau sebelumnya kosong/belum (tidak overwrite yang sudah cair)
      await pool.query(
        `UPDATE pekerjaan
           SET status_cair = 'proses'
         WHERE REPLACE(ba_opname_no, ' ', '') = ?
           AND (status_cair IS NULL OR status_cair = '' OR status_cair = 'belum')`,
        [ba]
      );
    }

    res.json({
      ok: true,
      ttf_id: ttfId,
      message: "TTF berhasil diupload",
      jumlahBA: baList.length,
      nomorBA: baList,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* === List semua TTF === */
r.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.filename, t.uploaded_at, t.status,
              COUNT(b.id) AS jumlah_ba
         FROM ttf t
    LEFT JOIN ttf_ba b ON b.ttf_id = t.id
        GROUP BY t.id
        ORDER BY t.uploaded_at DESC`
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* === BA → status TTF map (untuk dashboard) === */
r.get("/ba-status", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.ba_no, t.status
         FROM ttf_ba b
         JOIN ttf t ON t.id = b.ttf_id`
    );
    const map = {};
    for (const r1 of rows) {
      map[r1.ba_no] = r1.status === "sudah_cair" ? "sudah" : "proses";
    }
    res.json({ ok: true, map });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* === Detail TTF (status_cair: pakai pekerjaan, fallback ke status TTF) === */
r.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         b.ba_no,
         COALESCE(p.no_co, '-')           AS no_co,
         COALESCE(p.nama_toko, '-')       AS nama_toko,
         COALESCE(p.total_harga, 0)       AS total_harga,
         COALESCE(
           p.status_cair,
           CASE WHEN t.status = 'sudah_cair' THEN 'sudah' ELSE 'proses' END
         ) AS status_cair
       FROM ttf_ba b
  LEFT JOIN ttf t ON t.id = b.ttf_id
  LEFT JOIN pekerjaan p 
         ON REPLACE(p.ba_opname_no, ' ', '') = b.ba_no
      WHERE b.ttf_id = ?
      ORDER BY b.id ASC`,
      [req.params.id]
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* === Set Cair (update semua BA dalam TTF) === */
r.patch("/:id/cair", async (req, res) => {
  try {
    const ttfId = req.params.id;

    await pool.query("UPDATE ttf SET status = 'sudah_cair' WHERE id = ?", [
      ttfId,
    ]);

    await pool.query(
      `UPDATE pekerjaan p
        JOIN ttf_ba b 
          ON REPLACE(p.ba_opname_no, ' ', '') = b.ba_no
         SET p.status_cair = 'sudah'
       WHERE b.ttf_id = ?`,
      [ttfId]
    );

    res.json({ ok: true, message: "TTF ditandai sudah cair" });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default r;
